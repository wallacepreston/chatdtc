import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { DeleteOutline, Edit, MoreHoriz } from '@mui/icons-material';
import { ListItemIcon, ListItemText } from '@mui/material';
import theme from '../../theme';
import useApi from '../../hooks/api';
import { useStatus } from '../../contexts/status';
import { useChats } from '../../contexts/chat';
import { useNavigate } from 'react-router-dom';

interface ChatActionsProps {
    chatId: string;
}

const ChatActionsMenu = ({ chatId }: ChatActionsProps) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const { callApi } = useApi();
    const { setStatus } = useStatus();
    const { getChats } = useChats();
    const navigate = useNavigate();

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDelete = async () => {
        try {
            const resp = await callApi({ url: `/api/chat/${chatId}`, method: 'delete' });

            if (resp?.status !== 'success') {
                setStatus({
                    type: 'error',
                    message: 'Error deleting chat'
                });
                return;
            }

            getChats();
            handleClose();
            navigate('/');

            setStatus({
                type: 'success',
                message: 'Chat deleted successfully'
            });
        } catch (error) {
            setStatus({
                type: 'error',
                message: 'Error deleting chat'
            });
            handleClose();
        }
    };

    const options = [
        {
            title: 'Delete',
            handleClick: () => handleDelete(),
            icon: <DeleteOutline fontSize='small' />,
            color: theme.palette.error.main
        }
    ];

    return (
        <div>
            <IconButton
                aria-label='more'
                id='chat-actions-button'
                aria-controls={open ? 'chat-actions-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup='true'
                onClick={handleClick}
            >
                <MoreHoriz />
            </IconButton>
            <Menu
                id='chat-actions-menu'
                MenuListProps={{
                    'aria-labelledby': 'chat-actions-button'
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                sx={{
                    transform: 'translateY(-10px)',
                    '& .MuiMenu-paper': {
                        border: '1px solid #d3d4d5',
                        width: '20ch'
                    }
                }}
            >
                {options.map(option => (
                    <MenuItem key={option.title} onClick={option.handleClick}>
                        <ListItemIcon sx={{ color: option.color }}>{option.icon}</ListItemIcon>
                        <ListItemText sx={{ color: option.color }}>{option.title}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
};

export default ChatActionsMenu;
