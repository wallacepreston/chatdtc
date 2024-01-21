import React, { useState, useEffect } from 'react';
import { Typography, TextField, IconButton, Stack, Tooltip, Button } from '@mui/material';
import { InfoOutlined, SendOutlined as SendOutlinedIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThinking } from '../contexts/thinking';
import theme from '../theme';
import { ChatType } from '../pages/ChatPage';
import useApi from '../hooks/api';
import { useChats } from '../contexts/chat';
import { useStatus } from '../contexts/status';

const Footer = (props: {
    setHeight: (height: number) => void;
    smoothScrollToBottom?: () => void;
    newInput: string;
    openModal: () => void;
    isOverMaxMessages: boolean;
    insufficientBalance: boolean;
    requiresToolCallAction?: boolean;
    type: ChatType;
}) => {
    const navigate = useNavigate();

    const [input, setInput] = useState<string>('');
    const [height, setHeight] = useState<number>(0);
    const [pasteHandler, setPasteHandler] = useState<boolean>(false);
    const [canSubmit, setCanSubmit] = useState<boolean>(true);
    const [width, setWidth] = useState<number>(window.innerWidth);
    const { addChatThinking, removeChatThinking } = useThinking();
    const { callApi } = useApi();
    const { getChats } = useChats();
    const { setStatus } = useStatus();

    const genericError = {
        type: 'error' as const,
        message: 'Error creating chat. Please reload the page and try again.'
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (value.length < input.length) {
            setPasteHandler(true);
            setTimeout(() => setPasteHandler(false), 100);
        }
        setInput(value);
    };

    useEffect(() => {
        if (props.newInput !== '') {
            const value = props.newInput;
            setInput(value);
        }
    }, [props]);

    useEffect(() => {
        const updateWidth = () => {
            setWidth(window.innerWidth);
        };

        window.addEventListener('resize', updateWidth);

        return () => window.removeEventListener('resize', updateWidth);
    }, [width]);

    const handleEnter = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && e.shiftKey === false) {
            handleSubmit();
        } else if (e.key === 'Enter' && e.shiftKey === true) {
            setInput(input + '\n');
        } else {
            return;
        }
    };

    const getFooterHeight = () => {
        const footer = document.getElementById('Footer');
        if (footer) {
            return footer.clientHeight;
        } else {
            return 0;
        }
    };

    useEffect(() => {
        const newHeight = getFooterHeight();
        if (newHeight !== height) {
            setHeight(newHeight);
            props.setHeight(newHeight);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input, pasteHandler]);

    const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
        e?.preventDefault();
        if (canSubmit === false) return;
        const message = input.trim();
        setTimeout(() => setInput(''), 1);

        const chatPathRegex = /^\/c\/(.*)$/;

        if (message === '') return;

        try {
            setCanSubmit(false);

            if (window.location.pathname === '/') {
                // instead, call api to create a new chat and then navigate to it
                const threadRes = await callApi({
                    url: '/api/chat',
                    method: 'post',
                    body: { message: { role: 'user', content: message }, chat_id: undefined },
                    exposeError: true
                });
                if (!threadRes) {
                    return;
                }
                const { data: threadData } = threadRes;

                if (!threadData) {
                    return setStatus(genericError);
                }

                const { thread } = threadData;

                navigate(`/c/${thread.Thread_OpenAI_id}`);

                const createMessageRes = await callApi({
                    url: '/api/chat/createMessage',
                    method: 'post',
                    body: { message: { role: 'user', content: message }, chat_id: thread.Thread_OpenAI_id },
                    exposeError: true
                });

                if (!createMessageRes) {
                    return;
                }
                const {
                    data: { chat_id }
                } = createMessageRes;

                addChatThinking(chat_id, 10, Date.now());
                getChats();

                if (window.location.pathname.match(chatPathRegex)) return;

                navigate(`/c/${chat_id}`);
            } else if (window.location.pathname.match(chatPathRegex)) {
                const chat_id = window.location.pathname.split('/')[2];
                const createMessageRes = await callApi({
                    url: '/api/chat/createMessage',
                    method: 'post',
                    body: { message: { role: 'user', content: message }, chat_id },
                    exposeError: true
                });

                if (!createMessageRes) {
                    return;
                }
                const { data: messageData } = createMessageRes;
                getChats();

                if (!messageData) {
                    removeChatThinking(chat_id);
                    return;
                }
                addChatThinking(chat_id, 10, Date.now());
            }
        } catch (err) {
            console.log(err);
            setCanSubmit(true);
        } finally {
            if (props.smoothScrollToBottom) {
                props.smoothScrollToBottom();
            }
            setCanSubmit(true);
            return;
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        if (pasteHandler === false) {
            setPasteHandler(true);
            setTimeout(() => setPasteHandler(false), 100);
        } else {
            e.preventDefault();
            return;
        }
    };

    const handleChangeWidth = () => {
        if (width < 1000) {
            return '100vw';
        } else {
            return 'calc(100vw - 260px)';
        }
    };

    const handleMT = () => {
        if (width < 1000) {
            return '0px';
        } else {
            return '32px';
        }
    };

    const handleBorderTop = () => {
        if (width < 1000) {
            return '2px solid hsla(0,0%,100%,.2)';
        } else {
            return '';
        }
    };

    const renderTextField = () => {
        if (props.type === 'share') {
            return (
                <Stack
                    direction='row'
                    alignItems='center'
                    justifyContent='center'
                    sx={{ width: '100%', display: 'flex' }}
                >
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={() => navigate('/auth')}
                        sx={{
                            textTransform: 'none',
                            mb: '10px'
                        }}
                    >
                        <Typography variant='body2' sx={{ fontFamily: 'Noto Sans, sans-serif' }}>
                            Try ChatDTC
                        </Typography>
                    </Button>
                </Stack>
            );
        }
        const textField = (
            <TextField
                id='input'
                autoFocus
                disabled={props.isOverMaxMessages || props.requiresToolCallAction}
                placeholder='Send a message...'
                variant='outlined'
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleEnter}
                onPaste={handlePaste}
                sx={{
                    maxWidth: '768px',
                    width: '90%',
                    position: 'relative',
                    backgroundColor: '#f1f1f1',
                    borderRadius: '5px',
                    color: 'black',
                    minHeight: '46px',
                    fontFamily: 'Noto Sans, sans-serif',
                    mb: '10px',
                    mt: '10px',
                    boxShadow: '0px 0px 1px 1px #343541',
                    '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                        borderWidth: 'inherit'
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: 'inherit'
                    },
                    '& .MuiInputBase-input': {
                        fontSize: '16px',
                        lineHeight: '1',
                        width: 'calc(100% - 40px)'
                    }
                }}
                InputProps={{
                    style: {
                        color: 'black'
                    },
                    endAdornment: (
                        <IconButton
                            type='submit'
                            disabled={props.isOverMaxMessages}
                            sx={{
                                color: theme.palette.grey[400],
                                position: 'absolute',
                                bottom: '9px',
                                right: '15px',
                                width: '30px',
                                height: '30px',
                                borderRadius: '10px',
                                '&:hover': { backgroundColor: theme.palette.grey[300] }
                            }}
                        >
                            <SendOutlinedIcon fontSize='small' />
                        </IconButton>
                    )
                }}
                multiline
                maxRows={8}
            />
        );

        const toolTipMessages = {
            isOverMaxMessages: 'You have reached the maximum number of messages for this chat.',
            requiresToolCallAction:
                'There is a recommended action to be taken on this chat.  Please select an action before proceeding.'
        };

        // loop over the messages and return the first one that is true
        for (const [key, value] of Object.entries(toolTipMessages)) {
            if (props[key as keyof typeof toolTipMessages]) {
                return (
                    <Tooltip title={value} placement='top'>
                        {textField}
                    </Tooltip>
                );
            }
        }

        return textField;
    };

    return (
        <div
            id='Footer'
            style={{
                position: 'absolute',
                bottom: '0px',
                width: handleChangeWidth(),
                borderTop: handleBorderTop(),
                backgroundColor: 'white'
            }}
        >
            <form autoComplete='off' style={{ width: '100%', height: '100%', display: 'flex' }} onSubmit={handleSubmit}>
                <Stack
                    direction='column'
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                    sx={{ width: '100%', height: '100%', mt: handleMT() }}
                >
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px'
                        }}
                    >
                        {renderTextField()}
                        <Tooltip
                            title={
                                <Typography sx={{ textAlign: 'center', fontSize: '12px' }}>
                                    Not sure what to ask? <br />
                                    Check out{' '}
                                    <a
                                        href='https://winepulse.super.site/chatdtc-help-center'
                                        target='_blank'
                                        rel='noreferrer'
                                    >
                                        our Help Center
                                    </a>
                                </Typography>
                            }
                            placement='top'
                        >
                            <InfoOutlined sx={{ fontSize: '18px' }} />
                        </Tooltip>
                    </div>
                    <Typography
                        variant='body2'
                        sx={{
                            color: theme.palette.grey[400],
                            fontFamily: 'Noto Sans, sans-serif',
                            fontSize: '12px',
                            mb: '15px',
                            textAlign: 'center'
                        }}
                    >
                        Powered by AI. Developed by WinePulse.
                    </Typography>
                </Stack>
            </form>
        </div>
    );
};

export default Footer;
