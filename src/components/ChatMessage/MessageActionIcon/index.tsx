import React from 'react';
import { ContentPaste } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import theme from '../../../theme';

interface Props {
    icon: typeof ContentPaste;
    onClick: () => void;
}

const MessageActionIcon = (props: Props) => {
    return (
        <IconButton
            onClick={props.onClick}
            sx={{
                color: theme.palette.grey[400],
                mt: '26px',
                width: '25px',
                height: '25px',
                borderRadius: '7px',
                '&:hover': { color: '#D9D9E3' }
            }}
        >
            <props.icon sx={{ fontSize: '15px' }} />
        </IconButton>
    );
};

export default MessageActionIcon;
