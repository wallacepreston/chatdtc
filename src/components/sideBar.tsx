import React, { useEffect } from 'react';
import { AppBar, Toolbar, Button, Stack, Typography, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useAuthUser, useSignOut } from 'react-auth-kit';
import { Link, useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { useStatus } from '../contexts/status';
import { REACT_APP_API_URL } from '../constants/api';
import { useUser } from '../contexts/user';
import { AccountCircle, Business } from '@mui/icons-material';
import { useChats } from '../contexts/chat';
import theme from '../theme';

const socket = io(REACT_APP_API_URL as string);

const SideBar = () => {
    const auth = useAuthUser();
    const navigate = useNavigate();
    const signOut = useSignOut();
    const { setStatus } = useStatus();
    const { user, setUser } = useUser();
    const { chats, getChats } = useChats();
    const { id: activeChatId } = useParams();

    const authData = auth()!;

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleOpenProfileMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
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
            handleClose();
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

    const handleChangeWinery = () => {
        handleClose();
        setUser({
            ...user,
            Last_Winery_id: null
        });
    };

    const sidebarColor = theme.palette.grey[100];
    const hoverInactive = theme.palette.grey[200];
    const hoverActive = theme.palette.grey[300];

    return (
        <div id='SideBar'>
            <AppBar
                position='static'
                sx={{ bgcolor: sidebarColor, height: '100vh', width: '260px', position: 'fixed', zIndex: '100' }}
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
                        <Link to='/'>
                            <img
                                src='/assets/logowinepulse.png'
                                alt='logo'
                                style={{ width: '70px', height: '70px', marginTop: '20px' }}
                            />
                        </Link>
                        <Typography variant='h6' sx={{ color: 'black' }}>
                            {user.LastWinery?.Winery_Name || 'No Winery Selected'}
                        </Typography>
                        {user.LastWinery?.Last_Sync_Date && (
                            <div style={{ color: 'black', marginTop: '0px' }}>
                                Last synced: {user.LastWinery?.Last_Sync_Date}
                            </div>
                        )}
                        <Button
                            variant='outlined'
                            color='info'
                            sx={{
                                textTransform: 'none',
                                height: '46px',
                                width: '244px',
                                mt: '100px',
                                borderRadius: '5px',
                                justifySelf: 'center'
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
                        <div
                            id='chat-list-container'
                            style={{ marginTop: '20px', overflowY: 'auto', height: 'calc(100% - 179px)' }}
                        >
                            <Stack>
                                {chats.map(chat => {
                                    const title = chat.title?.replaceAll('"', '');
                                    return (
                                        <div
                                            id='chatBtn'
                                            style={{ width: '244px', height: '40px', marginBottom: '5px' }}
                                        >
                                            <Link to={`/c/${chat.id}`}>
                                                <Button
                                                    key={chat.id}
                                                    variant='text'
                                                    color='info'
                                                    sx={{
                                                        textTransform: 'none',
                                                        height: '40px',
                                                        width: '244px',
                                                        borderRadius: '5px',
                                                        justifyContent: 'left',
                                                        bgcolor: chat.id === activeChatId ? hoverActive : sidebarColor,
                                                        textOverflow: 'ellipsis',
                                                        overflow: 'hidden',
                                                        whiteSpace: 'nowrap',
                                                        '&:hover': {
                                                            bgcolor:
                                                                chat.id === activeChatId ? hoverActive : hoverInactive
                                                        }
                                                    }}
                                                    startIcon={
                                                        <ChatBubbleOutlineRoundedIcon
                                                            fontSize='small'
                                                            sx={{ ml: '7px' }}
                                                        />
                                                    }
                                                >
                                                    <Typography
                                                        sx={{ fontSize: '0.8rem', fontFamily: 'Noto Sans, sans-serif' }}
                                                    >
                                                        {title}
                                                    </Typography>
                                                </Button>
                                            </Link>
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
                                                        chat.id === activeChatId ? hoverActive : sidebarColor
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
                                borderTop: `1px solid ${theme.palette.info.main}`,
                                width: '240px',
                                justifySelf: 'center'
                            }}
                        >
                            <Button
                                id='profile-button'
                                aria-controls={open ? 'profile-menu' : undefined}
                                aria-haspopup='true'
                                aria-expanded={open ? 'true' : undefined}
                                onClick={handleOpenProfileMenu}
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
                                    '&:hover': { bgcolor: hoverInactive }
                                }}
                                startIcon={<AccountCircle fontSize='small' sx={{ ml: '11px' }} />}
                            >
                                {authData.username}
                            </Button>
                            <Menu
                                id='profile-menu'
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                MenuListProps={{
                                    'aria-labelledby': 'profile-button'
                                }}
                            >
                                <MenuItem onClick={handleChangeWinery}>
                                    <ListItemIcon>
                                        <Business fontSize='small' sx={{ ml: '11px' }} />
                                    </ListItemIcon>
                                    Switch Winery
                                </MenuItem>
                                <MenuItem onClick={handleLogOut}>
                                    <ListItemIcon>
                                        <LogoutRoundedIcon fontSize='small' sx={{ ml: '11px' }} />
                                    </ListItemIcon>
                                    <ListItemText>Log out</ListItemText>
                                </MenuItem>
                            </Menu>
                        </div>
                    </Stack>
                </Toolbar>
            </AppBar>
        </div>
    );
};

export default SideBar;
