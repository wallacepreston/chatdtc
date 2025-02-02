/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable array-callback-return */
import React, { useState, useEffect } from 'react';
import { Divider, Stack, Typography } from '@mui/material';
import Footer from '../components/footer';
import { useParams, useNavigate } from 'react-router-dom';
import 'highlight.js/styles/atom-one-dark.css';
import ChatMessage from '../components/ChatMessage';
import { CHAT_DTC_TITLE } from '../constants/api';

import type { Message as ChatMessageProps } from '../components/ChatMessage';
import useApi from '../hooks/api';
import { useUser } from '../contexts/user';
import { Chat } from '../contexts/chat';
import { getCompletedToolCalls, getToolCallsForMessage } from '../components/ToolCall/helpers';
import { useFeatureFlags } from '../contexts/featureFlags';

const SharePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<ChatMessageProps[]>([]);
    const [footerHeight, setFooterHeight] = useState<number>(0);
    const [height, setHeight] = useState<string>('calc(100vh - 64px)');
    const [width, setWidth] = useState<number>(window.innerWidth);
    const [title, setTitle] = useState<string>('');
    const [thread, setThread] = useState<Chat>({ Thread_OpenAI_id: '', Winery_id: '', Runs: [] });
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const featureFlags = useFeatureFlags();
    const MAX_USER_MESSAGES = Number(featureFlags.Max_User_Messages);

    const userMessages = messages.filter(message => message.Role === 'user');
    const messageCount = userMessages.length;
    const isOverMaxMessages = messageCount >= MAX_USER_MESSAGES;
    const { callApi } = useApi();
    const { user } = useUser();
    const { Last_Winery_id: lastWineryId } = user;

    const updateTitle = (title: string) => {
        if (!title) return;
        title = title.replaceAll('"', '');
        setTitle(title);
    };

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
        const threadRes = await callApi({ url: `/api/chat/${id}`, method: 'get' });

        if (!threadRes) {
            return;
        }

        const { data: foundThread } = threadRes;

        if (!foundThread) {
            navigate('/');
            return;
        }
        setThread(foundThread);

        const isPublic = foundThread?.Public;

        const notUserWinery = !isPublic && lastWineryId && foundThread?.Winery_id !== lastWineryId;

        // if the user doesn't have access to this thread
        if (notUserWinery) {
            navigate('/');
            return;
        }

        document.title = foundThread.Title + ' | ' + CHAT_DTC_TITLE;
        updateTitle(foundThread.Title);
        setLastUpdated(foundThread.Last_Modified_Date);

        setMessages(foundThread.Messages);
    };

    // at the beginning, get all messages
    useEffect(() => {
        getMessages();
    }, [id, lastWineryId]);

    let prevRole: 'user' | 'assistant' | null = null;

    // get all thread.Runs.ToolCalls that are completed
    const completedToolCalls = getCompletedToolCalls(thread.Runs);

    return (
        <div id='ChatPage' style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center' }}>
            <div
                id='main'
                style={{
                    width: '100vw',
                    height: height,
                    overflowY: 'auto',
                    marginTop: width > 1000 ? '' : '40px',
                    padding: '0px 20px 0px 20px'
                }}
            >
                <div id='center' style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <Stack direction='column' sx={{ width: '100%', height: '100%', maxWidth: '728px' }}>
                        <Typography variant='h4' fontWeight={'bold'} align='center' mt='20px'>
                            {title}
                        </Typography>
                        <Typography variant='h6' align='center' mb='20px'>
                            {new Date(lastUpdated).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}{' '}
                        </Typography>
                        <Divider />
                        {messages?.map((message, index) => {
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
                                    chatType='share'
                                    thread={thread}
                                    getMessages={getMessages}
                                    width={width}
                                    toolCalls={toolCallsForMessage}
                                />
                            );
                        })}
                    </Stack>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Footer
                        setHeight={handleHeightChange}
                        newInput=''
                        openModal={() => {}}
                        isOverMaxMessages={isOverMaxMessages}
                        insufficientBalance={false}
                        type='share'
                    />
                </div>
            </div>
        </div>
    );
};

export default SharePage;
