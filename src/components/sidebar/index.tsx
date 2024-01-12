import React, { useEffect } from 'react';
import { AppBar, Toolbar, Button, Stack, Typography, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useAuthUser, useSignOut } from 'react-auth-kit';
import { Link, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { useStatus } from '../../contexts/status';
import { REACT_APP_API_URL } from '../../constants/api';
import { useUser } from '../../contexts/user';
import { AccountCircle, Business, StarOutline } from '@mui/icons-material';
import { Chat, useChats } from '../../contexts/chat';
import theme from '../../theme';
import ChatCategory from './chatCategory';

const socket = io(REACT_APP_API_URL as string);

export interface CustomChatCategory {
    name: string;
    icon: React.ReactNode;
    chats: Chat[];
}

// helper used in component below
const getCustomChatCategories = (chats: Chat[]): CustomChatCategory[] => {
    const chatsWithCategories = chats.filter(chat => !!chat.Category);
    const uniqueTitles = new Set();
    chatsWithCategories.forEach(chat => {
        if (!chat.Category) return;
        uniqueTitles.add(chat.Category.Title);
    });
    const chatCategoryNames = Array.from(uniqueTitles as Set<string>);

    const categorizedChats = chatCategoryNames.map(categoryName => {
        const chatsInCategory = chats.filter(chat => chat.Category?.Title === categoryName);
        return {
            name: categoryName,
            icon: <StarOutline fontSize='small' color='primary' />,
            chats: chatsInCategory
        };
    });

    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const last7DaysChats = chats.filter(
        chat => !chat.Category && new Date(chat.Runs[0]?.Created_At).getTime() >= oneWeekAgo
    );
    const last30DaysChats = chats.filter(
        chat =>
            !chat.Category &&
            new Date(chat.Runs[0]?.Created_At).getTime() < oneWeekAgo &&
            new Date(chat.Runs[0]?.Created_At).getTime() >= oneMonthAgo
    );
    const olderChats = chats.filter(
        chat => !chat.Category && new Date(chat.Runs[0]?.Created_At).getTime() < oneMonthAgo
    );

    return [
        ...categorizedChats,
        {
            name: 'Previous 7 days',
            icon: <StarOutline fontSize='small' color='primary' />,
            chats: last7DaysChats
        },
        {
            name: '7 to 30 days ago',
            icon: <StarOutline fontSize='small' color='primary' />,
            chats: last30DaysChats
        },
        {
            name: 'More than 30 days ago',
            icon: <StarOutline fontSize='small' color='primary' />,
            chats: olderChats
        }
    ];
};

const SideBar = () => {
    const auth = useAuthUser();
    const navigate = useNavigate();
    const signOut = useSignOut();
    const { setStatus } = useStatus();
    const { user, setUser } = useUser();
    const { chats, getChats } = useChats();
    const { Last_Winery_id: lastWineryId } = user;

    const customChatCategories = getCustomChatCategories(chats);

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
        try {
            socket.on('updatedChats', (data: { Winery_id: string }) => {
                // TODO - check if this is my winery before getting chats
                if (data?.Winery_id === lastWineryId) getChats();
            });
        } catch (error) {
            setStatus({
                type: 'error',
                message: "Couldn't fetch updated chats. Please refresh the page and try again."
            });
        }

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

    return (
        <div id='SideBar'>
            <AppBar
                position='static'
                sx={{ bgcolor: sidebarColor, height: '100dvh', width: '260px', position: 'fixed', zIndex: '100' }}
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
                                src='/assets/logochatdtc.png'
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
                            style={{ marginTop: 0, overflowY: 'auto', height: 'calc(100% - 179px)' }}
                        >
                            {customChatCategories.map(category => (
                                <ChatCategory
                                    key={category.name}
                                    category={category}
                                    hoverInactive={hoverInactive}
                                    sidebarColor={sidebarColor}
                                />
                            ))}
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
                                {authData?.username}
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
