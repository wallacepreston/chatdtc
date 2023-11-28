import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { ThemeProvider } from '@mui/material/styles';
import wpTheme from '../wpTheme';
import axios from 'axios';
import { useAuthHeader, useSignOut } from 'react-auth-kit';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { useStatus } from '../contexts/status';
import { REACT_APP_API_URL } from '../constants/api';
import { Image } from '@mui/icons-material';

const socket = io(REACT_APP_API_URL as string);

const SideBar = (props: { activeChat?: string }) => {
    const authHeader = useAuthHeader();
    const navigate = useNavigate();
    const signOut = useSignOut();
    const { setStatus } = useStatus();

    const [chats, setChats] = useState<any[]>([]);
    // const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);

    const getChats = async () => {
        try {
            const res = await axios.get(`${REACT_APP_API_URL}/api/chat/getChats`, {
                headers: { Authorization: authHeader() }
            });
            setChats(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        socket.on('updatedChats', () => {
            getChats();
        });

        // Clean up function
        return () => {
            socket.off('updatedChats');
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]);

    useEffect(() => {
        getChats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNewChat = () => {
        navigate('/');
    };

    const handleLogOut = () => {
        try {
            signOut();
            navigate('/auth');
            setStatus({
                type: 'success',
                message: 'You have been successfully logged out.'
            });
        } catch (error) {
            if (error instanceof Error)
                setStatus({
                    type: 'error',
                    message: error?.message || 'Problem logging out. Please refresh the page and try again.'
                });
        }
    };

    // const handleClearConversations = async () => {
    //     if (!deleteConfirmation) {
    //         setDeleteConfirmation(true);
    //         return;
    //     } else {
    //         setDeleteConfirmation(false);
    //         await axios.delete(`${REACT_APP_API_URL}/api/chat/deleteAllChatsByUserID`, { headers: { Authorization: authHeader() } });
    //         navigate('/');
    //     }
    // };

    return (
        <div id='SideBar'>
            <AppBar
                position='static'
                sx={{ bgcolor: '#cfcfcf', height: '100vh', width: '260px', position: 'fixed', zIndex: '100' }}
            >
                <Toolbar sx={{ width: '100%', height: '100%', position: 'relative', right: '25px' }}>
                    <Stack
                        direction='column'
                        display='flex'
                        alignItems='center'
                        justifyContent='space-between'
                        spacing={2}
                        sx={{ width: '100%', height: '100%' }}
                    >
                        <img
                            src='/assets/logowinepulse.png'
                            alt='logo'
                            style={{ width: '70px', height: '70px', marginTop: '20px' }}
                        />
                        <Typography variant='h6' sx={{ color: 'black' }}>
                            Winery Name
                        </Typography>
                        <Button
                            variant='outlined'
                            color='info'
                            sx={{
                                textTransform: 'none',
                                height: '46px',
                                width: '244px',
                                mt: '100px',
                                borderRadius: '5px',
                                borderColor: '#555559',
                                justifySelf: 'center',
                                '&:hover': { borderColor: '#555559' }
                            }}
                            id='new-chat-button'
                            onClick={handleNewChat}
                        >
                            <AddIcon fontSize='small' sx={{ position: 'relative', right: '70px', bottom: '1px' }} />
                            <Typography
                                sx={{
                                    fontSize: '0.83rem',
                                    fontFamily: 'Noto Sans, sans-serif',
                                    position: 'relative',
                                    right: '60px'
                                }}
                            >
                                New chat
                            </Typography>
                        </Button>
                        <div style={{ marginTop: '20px', overflowY: 'auto', height: 'calc(100% - 179px)' }}>
                            <Stack>
                                {chats.map(chat => {
                                    const title = chat.title?.replaceAll('"', '');
                                    return (
                                        <div
                                            id='chatBtn'
                                            style={{ width: '244px', height: '40px', marginBottom: '5px' }}
                                        >
                                            <Button
                                                key={chat._id}
                                                variant='text'
                                                color='info'
                                                sx={{
                                                    textTransform: 'none',
                                                    height: '40px',
                                                    width: '244px',
                                                    borderRadius: '5px',
                                                    justifyContent: 'left',
                                                    bgcolor: title === props.activeChat ? '#bcbcbc' : '#cfcfcf',
                                                    textOverflow: 'ellipsis',
                                                    overflow: 'hidden',
                                                    whiteSpace: 'nowrap',
                                                    '&:hover': {
                                                        bgcolor: title === props.activeChat ? '#bcbcbc' : '#c6c6c6'
                                                    }
                                                }}
                                                startIcon={
                                                    <ChatBubbleOutlineRoundedIcon fontSize='small' sx={{ ml: '7px' }} />
                                                }
                                                href={`/c/${chat.id}`}
                                            >
                                                <Typography
                                                    sx={{ fontSize: '0.8rem', fontFamily: 'Noto Sans, sans-serif' }}
                                                >
                                                    {title}
                                                </Typography>
                                            </Button>
                                            <div
                                                style={{
                                                    width: '70px',
                                                    height: '40px',
                                                    position: 'relative',
                                                    bottom: '40px',
                                                    left: '174px',
                                                    borderTopRightRadius: '5px',
                                                    borderBottomRightRadius: '5px',
                                                    background: `linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, ${
                                                        title === props.activeChat
                                                            ? '#bcbcbc'
                                                            : 'rgba(207, 207, 207, 1)'
                                                    } 100%)`,
                                                    pointerEvents: 'none'
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </Stack>
                        </div>
                        <div
                            style={{
                                borderTop: '1px solid #4D4D4F',
                                width: '240px',
                                justifySelf: 'center'
                            }}
                        >
                            <Button
                                variant='text'
                                color='info'
                                sx={{
                                    textTransform: 'none',
                                    height: '40px',
                                    width: '244px',
                                    mb: '10px',
                                    mt: '5px',
                                    borderRadius: '5px',
                                    justifyContent: 'left',
                                    '&:hover': { bgcolor: '#bcbcbc' }
                                }}
                                startIcon={<LogoutRoundedIcon fontSize='small' sx={{ ml: '11px' }} />}
                                onClick={handleLogOut}
                            >
                                <Typography sx={{ fontSize: '0.83rem', fontFamily: 'Noto Sans, sans-serif' }}>
                                    Log out
                                </Typography>
                            </Button>
                        </div>
                    </Stack>
                </Toolbar>
            </AppBar>
        </div>
    );
};

export default SideBar;
