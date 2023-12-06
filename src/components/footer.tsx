import React, { useState, useEffect } from 'react';
import { Typography, TextField, IconButton, Stack, Tooltip } from '@mui/material';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import axios from 'axios';
import { useAuthHeader } from 'react-auth-kit';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { useThinking } from '../contexts/thinking';
import { REACT_APP_API_URL } from '../constants/api';

const socket = io(REACT_APP_API_URL as string);

const Footer = (props: {
    setHeight: (height: number) => void;
    newInput: string;
    openModal: () => void;
    isOverMaxMessages: boolean;
}) => {
    const authHeader = useAuthHeader();
    const navigate = useNavigate();

    const [input, setInput] = useState<string>('');
    const [height, setHeight] = useState<number>(0);
    const [pasteHandler, setPasteHandler] = useState<boolean>(false);
    const [canSubmit, setCanSubmit] = useState<boolean>(true);
    const [width, setWidth] = useState<number>(window.innerWidth);
    const { setThinking } = useThinking();

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
            const value = props.newInput.slice(0, props.newInput.length - 1);
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
        setThinking(true);
        const message = input.trim();
        setTimeout(() => setInput(''), 1);

        const chatPathRegex = /^\/c\/(.*)$/;

        if (message === '') return;

        try {
            setCanSubmit(false);

            if (window.location.pathname === '/') {
                socket.on('newChat', (data: { chat_id: string }) => {
                    navigate(`/c/${data.chat_id}`);
                });

                const res = await axios.post(
                    `${REACT_APP_API_URL}/api/chat/createMessage`,
                    { message: { role: 'user', content: message }, chat_id: undefined },
                    { headers: { Authorization: authHeader() } }
                );

                if (window.location.pathname.match(chatPathRegex)) return;

                const { chat_id } = res.data;
                navigate(`/c/${chat_id}`);
            } else if (window.location.pathname.match(chatPathRegex)) {
                const chat_id = window.location.pathname.split('/')[2];
                await axios.post(
                    `${REACT_APP_API_URL}/api/chat/createMessage`,
                    { message: { role: 'user', content: message }, chat_id },
                    { headers: { Authorization: authHeader() } }
                );
            }
        } catch (err) {
            console.log(err);
        } finally {
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
        const textField = (
            <TextField
                id='input'
                autoFocus
                disabled={props.isOverMaxMessages}
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
                    backgroundColor: '#d9d9d9',
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
                                color: '#5A5B6B',
                                position: 'absolute',
                                bottom: '9px',
                                right: '15px',
                                width: '30px',
                                height: '30px',
                                borderRadius: '10px',
                                '&:hover': { backgroundColor: '#cfcfcf' }
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

        if (props.isOverMaxMessages) {
            return (
                <Tooltip title='You have reached the maximum number of messages for this chat.'>{textField}</Tooltip>
            );
        } else {
            return textField;
        }
    };

    return (
        <div
            id='Footer'
            style={{
                position: 'absolute',
                bottom: '0px',
                width: handleChangeWidth(),
                borderTop: handleBorderTop()
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
                            gap: '10px'
                        }}
                    >
                        {renderTextField()}
                    </div>
                    <Typography
                        variant='body2'
                        sx={{
                            color: '#C5C5D2',
                            fontFamily: 'Noto Sans, sans-serif',
                            fontSize: '12px',
                            mb: '15px',
                            textAlign: 'center'
                        }}
                    >
                        Powered by OpenAI. Developed by WinePulse.
                    </Typography>
                </Stack>
            </form>
        </div>
    );
};

export default Footer;
