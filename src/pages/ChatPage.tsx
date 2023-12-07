/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable array-callback-return */
import React, { useState, useEffect, useRef } from 'react';
import { CircularProgress, IconButton, Stack } from '@mui/material';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import Footer from '../components/footer';
import SideBar from '../components/sideBar';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthHeader } from 'react-auth-kit';
import io from 'socket.io-client';
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
import ChatMessage from '../components/chatMessage';
import { CHAT_DTC_TITLE, MAX_USER_MESSAGES, REACT_APP_API_URL } from '../constants/api';

import type { Message as ChatMessageProps } from '../components/chatMessage';
import useApi from '../hooks/api';
import { useUser } from '../contexts/user';

const socket = io(REACT_APP_API_URL as string);

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

const ChatPage = () => {
    const { id } = useParams<{ id: string }>();
    const authHeader = useAuthHeader();
    const navigate = useNavigate();

    const scrollDiv = useRef<HTMLDivElement>(null);

    /* IMPORTANT: messages are stored from the oldest to the newest
        [0] is the oldest message, [length - 1] is the newest message */
    const [messages, setMessages] = useState<ChatMessageProps[]>([]);
    const [footerHeight, setFooterHeight] = useState<number>(0);
    const [height, setHeight] = useState<string>('calc(100vh - 64px)');
    const [width, setWidth] = useState<number>(window.innerWidth);
    const [title, setTitle] = useState<string>('');
    const [scrolledToBottom, setScrolledToBottom] = useState<boolean>(true);
    const { thinking, setThinking } = useThinking();
    const userMessages = messages.filter(message => message.role === 'user');
    const messageCount = userMessages.length;
    const isOverMaxMessages = messageCount >= MAX_USER_MESSAGES;
    const { callApi } = useApi();
    const { user } = useUser();
    const { Last_Winery_id: lastWineryId } = user;

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
        // on page reload, we don't have our user data on first render, so don't even try to get messages yet
        if (!lastWineryId) {
            return;
        }

        const foundThread = await callApi({ url: `/api/chat/${id}`, method: 'get' });

        // if the user doesn't have access to this thread
        if (!foundThread || (lastWineryId && foundThread.Winery_id !== lastWineryId)) {
            navigate('/');
        }

        const res = await axios.get(`${REACT_APP_API_URL}/api/chat/getMessagesByChatID/${id}`, {
            headers: { Authorization: authHeader() }
        });
        const data = res.data;
        setMessages(data.reverse());
    };

    // at the beginning, get all messages
    useEffect(() => {
        getMessages();
    }, [id, lastWineryId]);

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
    }, [title]);

    const scrollToBottom = () => {
        if (scrollDiv.current) {
            scrollDiv.current.scrollTo({
                top: scrollDiv.current.scrollHeight,
                behavior: 'auto'
            });
            setTimeout(() => {
                if (scrollDiv.current) {
                    scrollDiv.current.scrollTo({
                        top: scrollDiv.current.scrollHeight,
                        behavior: 'auto'
                    });
                }
            }, 100);
        }
    };

    const smoothScrollToBottom = () => {
        if (scrollDiv.current) {
            scrollDiv.current.scrollTo({
                top: scrollDiv.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    const handleDivScroll = (e: any) => {
        const bottom: boolean = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
        if (bottom !== scrolledToBottom) {
            setScrolledToBottom(bottom);
        }
    };

    // when page is loaded, scroll to the bottom of the page
    useEffect(() => {
        scrollToBottom();
    }, [width]);

    useEffect(() => {
        socket.on('runComplete', (data: { chat_id: string }) => {
            setThinking(false);
        });
        socket.on('newMessage', (data: { chat_id: string }) => {
            if (data.chat_id === id) {
                getMessages();
                if (scrolledToBottom) {
                    scrollToBottom();
                }
            }
        });

        socket.on('chatgptResChunk', (data: { chat_id: string; content: string }) => {
            if (data.chat_id === id) {
                setMessages(messages => {
                    if (scrolledToBottom) {
                        scrollToBottom();
                    }
                    if (messages[messages.length - 1]?.role === 'user') {
                        return [...messages, { role: 'assistant', content: data.content }];
                    }
                    return [...messages.slice(0, -1), { role: 'assistant', content: data.content }];
                });
            }
        });

        socket.on('resError', (data: { chat_id: string; error: unknown }) => {
            if (data.chat_id === id) {
                setMessages(messages => {
                    if (scrolledToBottom) {
                        scrollToBottom();
                    }
                    if (messages[messages.length - 1]?.role === 'user') {
                        return [...messages, { role: 'assistant', content: 'Error: ' + data.error }];
                    }
                    return [...messages.slice(0, -1), { role: 'assistant', content: 'Error: ' + data.error }];
                });
            }
        });
    }, [socket]);

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

    const handleMessageWidth = () => {
        if (width < 1000) {
            return 'calc(100% - 40px)';
        } else {
            return '80%';
        }
    };

    let prevRole: 'user' | 'assistant' | null = null;

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
                            const showIcon = prevRole !== message.role;
                            prevRole = message.role;
                            return (
                                <ChatMessage
                                    key={index}
                                    message={message}
                                    handleMessageWidth={handleMessageWidth}
                                    width={width}
                                    showIcon={showIcon}
                                />
                            );
                        })}
                        {thinking && <CircularProgress color='inherit' />}
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
                        newInput=''
                        openModal={() => {}}
                        isOverMaxMessages={isOverMaxMessages}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
