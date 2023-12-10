import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { DeleteOutline, Edit, MoreHoriz } from '@mui/icons-material';
import { Button, Grid, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';
import theme from '../../theme';
import useApi from '../../hooks/api';
import { useStatus } from '../../contexts/status';
import { useChats } from '../../contexts/chat';
import { useNavigate } from 'react-router-dom';
import WpModal from '../wpModal';

interface ChatActionsProps {
    chatId: string;
    handleRename: () => void;
}

const ChatActionsMenu = ({ chatId, handleRename }: ChatActionsProps) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
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

    const handleEdit = () => {
        handleRename();
        handleClose();
    };

    const handleOpenDeleteModal = () => {
        handleClose();
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        setDeleteModalOpen(false);
        handleDelete();
    };

    const options = [
        {
            title: 'Rename',
            handleClick: () => handleEdit(),
            icon: <Edit fontSize='small' />
        },
        {
            title: 'Delete',
            handleClick: () => handleOpenDeleteModal(),
            icon: <DeleteOutline fontSize='small' />,
            color: theme.palette.error.main
        }
    ];

    return (
        <div>
            <WpModal title='Delete Chat' open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <Grid
                    item
                    xs={12}
                    md={12}
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}
                >
                    <Stack>
                        <Typography>
                            This will <b>delete</b> this chat. Are you sure you want to continue?
                        </Typography>
                        <br />
                        <Stack direction='row' display='flex' justifyContent='space-evenly'>
                            <Button variant='outlined' color='primary' onClick={() => setDeleteModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant='contained' color='error' onClick={handleConfirmDelete}>
                                Delete
                            </Button>
                        </Stack>
                    </Stack>
                </Grid>
            </WpModal>
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
