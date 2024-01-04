import React from 'react';
import { StyledButton } from './styled';
import { OpenInNew } from '@mui/icons-material';
import { Tooltip, Typography } from '@mui/material';
interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    linkText: string;
    fileId: string;
    handleDownload: (fileId: string) => void;
    downloadEnabled?: boolean;
}
const LinkButton = ({ linkText, fileId, handleDownload, downloadEnabled }: Props) => {
    const renderButton = () => (
        <StyledButton
            variant='text'
            color='info'
            endIcon={<OpenInNew />}
            onClick={() => {
                if (!downloadEnabled) return;
                handleDownload(fileId);
            }}
        >
            <Typography sx={{ fontFamily: 'Noto Sans, sans-serif' }}>{linkText}</Typography>
        </StyledButton>
    );
    if (downloadEnabled) return renderButton();
    return (
        <Tooltip title='You do not have permission to download this file.' placement='top'>
            {renderButton()}
        </Tooltip>
    );
};

export default LinkButton;
