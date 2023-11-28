import React from 'react';
import Icon from './icon';
import { Button, Grid, IconButton, Typography } from '@mui/material';
import { OpenInNew } from '@mui/icons-material';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { useAuthHeader } from 'react-auth-kit';
import axios from 'axios';
import { useStatus } from '../contexts/status';
import { LinkButton } from './styled';
import wpTheme from '../wpTheme';

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    fileIds?: string[];
}

export interface ChatMessageProps {
    message: Message;
    key: number;
    handleMessageWidth: () => string;
    width: number;
    showIcon: boolean;
}

const ChatMessage = (props: ChatMessageProps) => {
    const { message, key, handleMessageWidth, width, showIcon } = props;
    const { role } = message;

    const authHeader = useAuthHeader();

    const { setStatus } = useStatus();

    // If there was no authentication on the server, this big function would be unnecessary.
    const handleDownload = async (fileId: string) => {
        try {
            // 1. Send a GET request to the file endpoint with the auth header
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/chat/files/${fileId}`, {
                headers: { Authorization: authHeader() },
                responseType: 'blob' // specify the response type
            });

            // 2. Check the response status
            if (response.status !== 200) {
                setStatus({
                    type: 'error',
                    message: 'HTTP error ' + response.status
                });
            }

            // 3. Extract the filename from the Content-Disposition header
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'file.csv'; // default filename
            if (contentDisposition) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            // 4. Create a Blob URL from the response data
            const url = window.URL.createObjectURL(response.data);

            // 5. Create a new <a> element and set its href to the Blob URL and its download attribute to the filename
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);

            // 6. Append the <a> element to the body and programmatically click it to start the download
            document.body.appendChild(link);
            link.click();

            // 7. Remove the <a> element from the body after the download has started
            document.body.removeChild(link);
        } catch (error) {
            setStatus({
                type: 'error',
                message: 'HTTP error ' + error
            });
        }
    };

    const copyIcon = width > 1000 && (
        <IconButton
            onClick={() => {
                navigator.clipboard.writeText(message.content);
            }}
            sx={{
                color: wpTheme.palette.grey[400],
                mt: '26px',
                width: '25px',
                height: '25px',
                borderRadius: '7px',
                '&:hover': { color: '#D9D9E3' }
            }}
        >
            <ContentPasteIcon sx={{ fontSize: '15px' }} />
        </IconButton>
    );

    const renderContent = () => {
        const content: string[] = message.content.split('\n');
        if (role === 'user') {
            return content;
        } else {
            let linkIndex = 0;

            return content.map((line, index) => {
                // split the line into parts based on the regex
                const parts = line.split(/\[(.*?)\]\((sandbox:\/.*?)\)/g);

                // map over the parts and convert any links into JSX
                return parts.map((part, i) => {
                    if (i % 3 === 0) {
                        // this part is not a link
                        return (
                            <Typography
                                key={index}
                                variant='body1'
                                sx={{
                                    borderRadius: '10px',
                                    color: 'black',
                                    fontFamily: 'Noto Sans, sans-serif',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.8',
                                    pl: '1rem',
                                    maxWidth: '100%'
                                }}
                            >
                                {part}
                            </Typography>
                        );
                    } else if (i % 3 === 1) {
                        // this part is the link text
                        const linkText = part;
                        const fileId = message.fileIds ? message.fileIds[linkIndex] : '';
                        linkIndex++;
                        return (
                            <LinkButton
                                variant='text'
                                color='info'
                                endIcon={<OpenInNew />}
                                onClick={() => handleDownload(fileId)}
                            >
                                <Typography sx={{ fontFamily: 'Noto Sans, sans-serif' }}>{linkText}</Typography>
                            </LinkButton>
                        );
                    } else {
                        return null;
                        // we don't need to return anything for the other parts
                    }
                });
            });
        }
    };
    return (
        <div
            key={key}
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: role === 'user' ? 'flex-end' : 'flex-start',
                marginTop: '10px'
            }}
        >
            {showIcon && (
                <Grid
                    container
                    direction={role === 'assistant' ? 'row' : 'row-reverse'}
                    justifyContent='flex-start'
                    alignItems='center'
                    spacing={2}
                >
                    <Grid item>
                        <Icon role={showIcon ? role : 'empty'} />
                    </Grid>
                    <Grid item>
                        <Typography variant='body2'>{role === 'user' ? 'You' : 'Assistant'}</Typography>
                    </Grid>
                </Grid>
            )}
            <Grid
                container
                direction={role === 'assistant' ? 'row' : 'row-reverse'}
                spacing={1}
                sx={{
                    width: handleMessageWidth()
                }}
            >
                <Grid item xs={11}>
                    <div
                        style={{
                            backgroundColor: role === 'user' ? '#e4edf6' : '#cfcfcf',
                            borderRadius: '10px',
                            marginBottom: '15px',
                            marginTop: '15px',
                            padding: '1rem'
                        }}
                    >
                        {renderContent()}
                    </div>
                </Grid>
                <Grid item xs={1}>
                    {copyIcon}
                </Grid>
            </Grid>
        </div>
    );
};

export default ChatMessage;
