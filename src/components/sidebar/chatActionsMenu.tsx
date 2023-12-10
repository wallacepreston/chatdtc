import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { DeleteOutline, Edit, MoreHoriz } from '@mui/icons-material';
import { ListItemIcon, ListItemText } from '@mui/material';
import theme from '../../theme';

const ChatActionsMenu = () => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const options = [
        {
            title: 'Rename',
            handleClick: () => handleClose(),
            icon: <Edit fontSize='small' />
        },
        {
            title: 'Delete',
            handleClick: () => handleClose(),
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
