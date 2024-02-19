/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable array-callback-return */
import React, { useState, useEffect, useRef } from 'react';
import { differenceInMinutes } from 'date-fns';
import { IconButton, Stack } from '@mui/material';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import Footer from '../components/footer';
import SideBar from '../components/sidebar';
import ExpiredRunMessage from '../components/expiredRun';

import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthHeader } from 'react-auth-kit';
import Topper from '../components/topper';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import cpp from 'highlight.js/lib/languages/cpp';
import java from 'highlight.js/lib/languages/java';
import csharp from 'highlight.js/lib/languages/csharp';
import php from 'highlight.js/lib/languages/php';
import sql from 'highlight.js/lib/languages/sql';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import markdown from 'highlight.js/lib/languages/markdown';
import bash from 'highlight.js/lib/languages/bash';
import lua from 'highlight.js/lib/languages/lua';
import ruby from 'highlight.js/lib/languages/ruby';
import r from 'highlight.js/lib/languages/r';
import go from 'highlight.js/lib/languages/go';
import c from 'highlight.js/lib/languages/c';
import 'highlight.js/styles/atom-one-dark.css';
import { useThinking } from '../contexts/thinking';
import ChatMessage from '../components/ChatMessage';
import { CHAT_DTC_TITLE, MAX_USER_MESSAGES, REACT_APP_API_URL } from '../constants/api';

import type { Message } from '../components/ChatMessage';
import useApi from '../hooks/api';
import { useUser } from '../contexts/user';
import { Chat } from '../contexts/chat';
import LinearBuffer from '../components/linearBuffer';
import { useStatus } from '../contexts/status';
import socket from '../util/socket';
import ToolCalls from '../components/ToolCall';
import { getCompletedToolCalls, getToolCallsForMessage } from '../components/ToolCall/helpers';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('java', java);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('php', php);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('css', css);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('dockerfile', dockerfile);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('lua', lua);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('r', r);
hljs.registerLanguage('go', go);
hljs.registerLanguage('c', c);

const DownIcon = ArrowDownwardRoundedIcon;

export type ChatType = 'form' | 'share';

export const EXPIRED_RUN_STATUSES = ['failed', 'cancelled', 'expired'] as const;

export type ExpiredRunStatus = (typeof EXPIRED_RUN_STATUSES)[number];

const ChatPage = () => {
    const { id } = useParams<{ id: string }>();
    const authHeader = useAuthHeader();
    const navigate = useNavigate();

    const scrollDiv = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [footerHeight, setFooterHeight] = useState<number>(0);
    const [height, setHeight] = useState<string>('calc(100dvh - 64px)');
    const [width, setWidth] = useState<number>(window.innerWidth);
    const [title, setTitle] = useState<string>('');
    const [scrolledToBottom, setScrolledToBottom] = useState<boolean>(true);
    const [thread, setThread] = useState<Chat>({ Thread_OpenAI_id: '', Winery_id: '', Runs: [] });
    const { thinkingChats, removeChatThinking } = useThinking();
    const userMessages = messages.filter(message => message.Role === 'user');
    const assistantMessages = messages.filter(message => message.Role === 'assistant');
    const messageCount = userMessages.length;
    const isOverMaxMessages = messageCount >= MAX_USER_MESSAGES;
    const { callApi } = useApi();
    const { user } = useUser();
    const { Last_Winery_id: lastWineryId } = user;
    const { setStatus } = useStatus();
    const { balance } = user;
    const insufficientBalance = !assistantMessages.length && (!balance || balance < 3);

    const lastRun = thread?.Runs?.[0];

    // Handle expired based on date (for if the user doesn't refresh the page)
    const now = new Date();
    const isExpiredBasedOnDate = (date: string) => {
        return differenceInMinutes(now, new Date(date)) > 10;
    };

    const isExpiredFromDate = isExpiredBasedOnDate(lastRun?.Updated_At);

    const lastRunStatus = lastRun?.Status === 'requires_action' && isExpiredFromDate ? 'expired' : lastRun?.Status;
    const lastRunExpired = EXPIRED_RUN_STATUSES.includes(lastRunStatus as ExpiredRunStatus);
    const thinking = id ? Boolean(thinkingChats[id]?.progress) : false;

    // find if we have any runs with toolCalls that need user action
    const validRun = thread.Runs?.find(run => {
        // are there toolCalls in this run?
        if (!run.ToolCalls?.length) {
            return false;
        }
        // are there toolCalls in this run that need user action?
        return run.ToolCalls.some(toolCall => {
            const requiresAction = toolCall.Status === 'requires_action';

            const isNotExpired = !isExpiredBasedOnDate(toolCall.Created_At);

            return requiresAction && isNotExpired;
        });
    });

    // check if any of the runs have toolCalls that need user action
    const validToolCalls = validRun?.ToolCalls?.filter(toolCall => toolCall.Status === 'requires_action');

    const requiresToolCallAction = !lastRunExpired && !!(validRun && validToolCalls?.length);

    useEffect(() => {
        const updateWidth = () => {
            setWidth(window.innerWidth);
        };

        window.addEventListener('resize', updateWidth);

        return () => window.removeEventListener('resize', updateWidth);
    }, [width]);

    const handleHeightChange = (footeHeight: number) => {
        setFooterHeight(footeHeight);
    };

    useEffect(() => {
        if (width > 1000) {
            setHeight('calc(100% - ' + footerHeight + 'px)');
        } else {
            setHeight('calc(100% - ' + footerHeight + 'px - 40px)');
        }
    }, [footerHeight, width]);

    const getMessages = async () => {
        const chatRes = await callApi({ url: `/api/chat/${id}`, method: 'get' });

        if (!chatRes) {
            setStatus({
                type: 'error',
                message: 'Error getting chat'
            });
            return;
        }

        const { data: foundThread } = chatRes;

        if (!foundThread) {
            navigate('/');
            return;
        }

        setThread(foundThread);

        const isAdmin = user.Admin;

        const notUserWinery = lastWineryId && foundThread?.Winery_id !== lastWineryId;

        // if the user doesn't have access to this thread
        if (!isAdmin && notUserWinery) {
            navigate('/');
            return;
        }

        setMessages(foundThread.Messages);
    };

    // at the beginning, get all messages
    useEffect(() => {
        getMessages();
    }, [id, thinking]);

    const getTitle = async () => {
        const res = await axios.get(`${REACT_APP_API_URL}/api/chat/getChatTitleByID/${id}`, {
            headers: { Authorization: authHeader() }
        });
        const data = res.data;
        if (data === 'Chat not found') {
            navigate('/');
        }
        setTitle(data);
    };

    useEffect(() => {
        setTimeout(() => {
            getTitle();
        }, 100);
        if (title !== document.title) {
            document.title = title + ' | ' + CHAT_DTC_TITLE;
        }
    }, [title, id]);

    const scrollToBottom = () => {
        if (scrollDiv.current) {
            setTimeout(() => {
                if (scrollDiv.current) {
                    scrollDiv.current.scrollTo({
                        top: scrollDiv.current.scrollHeight,
                        behavior: 'auto'
                    });
                }
            }, 300);
        }
    };

    const smoothScrollToBottom = () => {
        if (scrollDiv.current) {
            setTimeout(() => {
                if (scrollDiv.current) {
                    scrollDiv.current.scrollTo({
                        top: scrollDiv.current.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            }, 300);
        }
    };

    useEffect(() => {
        if (validToolCalls) {
            smoothScrollToBottom();
        }
    }, [validToolCalls]);

    const handleDivScroll = (e: any) => {
        const bottom: boolean = Math.abs(e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight) < 1;
        if (bottom !== scrolledToBottom) {
            setScrolledToBottom(bottom);
        }
    };

    const loadingListenerForChatPage = (data: { chat_id: string; content: string }) => {
        if (data.chat_id === id) {
            scrollToBottom();
        }
    };

    // when page is loaded, scroll to the bottom of the page
    useEffect(() => {
        smoothScrollToBottom();
    }, [width, id, thinking]);

    useEffect(() => {
        socket.on('newMessage', async (data: { chat_id: string }) => {
            if (data.chat_id === id) {
                await getMessages();
                scrollToBottom();
            }
        });

        socket.on('runComplete', async (data: { chat_id: string }) => {
            if (data.chat_id === id) {
                await getMessages();
                removeChatThinking(data.chat_id);
                smoothScrollToBottom();
            }
        });

        socket.on('chatgptResChunk', (data: { chat_id: string; content: string }) => {
            if (data.chat_id === id) {
                setMessages(messages => {
                    scrollToBottom();
                    if (messages[messages.length - 1]?.Role === 'user') {
                        return [...messages, { Role: 'assistant', Content_Value: data.content }];
                    }
                    return [...messages.slice(0, -1), { Role: 'assistant', Content_Value: data.content }];
                });
            }
        });

        socket.on('loadingMessage', loadingListenerForChatPage);

        socket.on('resError', (data: { chat_id: string; error: unknown }) => {
            if (data.chat_id === id) {
                setStatus({ type: 'error', message: 'There was an error with the chat. Please reload the page.' });
                removeChatThinking(id);
                scrollToBottom();
            }
        });
        return () => {
            socket.off('runComplete');
            socket.off('newMessage');
            socket.off('chatgptResChunk');
            socket.removeListener('loadingMessage', loadingListenerForChatPage);
            socket.off('resError');
        };
    }, [socket, id]);

    useEffect(() => {
        hljs.highlightAll();
    }, [messages, socket]);

    const handleWidthSide = () => {
        if (width < 1000) {
            return '0px';
        } else {
            return '260px';
        }
    };

    const handleWidthMain = () => {
        if (width < 1000) {
            return '100vw';
        } else {
            return 'calc(100vw - 260px)';
        }
    };

    let prevRole: 'user' | 'assistant' | null = null;

    if (!id) {
        return <div>Chat not found</div>;
    }

    const renderAlertState = () => {
        // should only ever return ONE of these

        if (thinking) {
            return <LinearBuffer id={id} />;
        }
        if (lastRunExpired) {
            return <ExpiredRunMessage status={lastRunStatus as ExpiredRunStatus} />;
        }
        // if (insufficientBalance) {
        //     return <div>Insufficient balance</div>;
        // }
        if (requiresToolCallAction) {
            return (
                <ToolCalls
                    toolCalls={validToolCalls}
                    runId={validRun.Run_OpenAI_id}
                    getMessages={getMessages}
                    chat_id={id}
                />
            );
        }
    };

    // get all thread.Runs.ToolCalls that are completed
    const completedToolCalls = getCompletedToolCalls(thread.Runs);

    return (
        <div id='ChatPage' style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center' }}>
            <div id='side' style={{ width: handleWidthSide(), height: '100%' }}>
                {width > 1000 && <SideBar />}
            </div>
            {width < 1000 && <Topper chatTitle={title} />}
            <div
                id='main'
                style={{
                    width: handleWidthMain(),
                    height: height,
                    overflowY: 'auto',
                    marginTop: width > 1000 ? '' : '40px',
                    padding: '0px 20px 0px 20px'
                }}
                ref={scrollDiv}
                onScroll={handleDivScroll}
            >
                <div id='center' style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <Stack direction='column' sx={{ width: '100%', height: '100%', maxWidth: '728px' }}>
                        {messages.map((message, index) => {
                            const showIcon = prevRole !== message.Role;
                            prevRole = message.Role;

                            // get the "in between" toolCalls: completed toolCalls that have an Updated_At date after the message.Created_At date but before the next message.Created_At date
                            const toolCallsForMessage = getToolCallsForMessage(
                                completedToolCalls,
                                message,
                                messages[index + 1]
                            );

                            return (
                                <ChatMessage
                                    key={index}
                                    message={message}
                                    showIcon={showIcon}
                                    chatType='form'
                                    thread={thread}
                                    getMessages={getMessages}
                                    width={width}
                                    toolCalls={toolCallsForMessage}
                                />
                            );
                        })}
                        {renderAlertState()}
                    </Stack>
                    {!scrolledToBottom && (
                        <IconButton
                            onClick={smoothScrollToBottom}
                            sx={{
                                position: 'fixed',
                                bottom: `${footerHeight + 20}px`,
                                right: '25px',
                                width: '26px',
                                height: '26px',
                                bgcolor: '#fff',
                                border: '1px solid #d9d9e3',
                                '&:hover': { bgcolor: '#e6e6e6' }
                            }}
                        >
                            <DownIcon fontSize='small' sx={{ color: '#B7B8C3' }} />
                        </IconButton>
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Footer
                        setHeight={handleHeightChange}
                        smoothScrollToBottom={smoothScrollToBottom}
                        newInput=''
                        openModal={() => {}}
                        isOverMaxMessages={isOverMaxMessages}
                        insufficientBalance={insufficientBalance}
                        requiresToolCallAction={requiresToolCallAction}
                        type='form'
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
