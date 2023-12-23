import React from 'react';
import Icon from '../icon';
import { Grid, Typography } from '@mui/material';
import { OpenInNew, ThumbDownOffAlt, ThumbUpOffAlt, ContentPaste } from '@mui/icons-material';
import { useAuthHeader } from 'react-auth-kit';
import axios from 'axios';
import { useStatus } from '../../contexts/status';
import { LinkButton } from '../styled';
import theme from '../../theme';
import ReactMarkdown from 'react-markdown';
import { ChatType } from '../../pages/ChatPage';
import { useUser } from '../../contexts/user';
import { Chat } from '../../contexts/chat';
import MessageActionIcon from './MessageActionIcon';
import useClipboard from '../../hooks/useClipboard';
import useApi from '../../hooks/api';

export interface Message {
    Role: 'user' | 'assistant';
    Content_Value: string;
    fileIds?: string[];
    Annotations?: {
        File_OpenAI_id: string;
    }[];
    Message_OpenAI_id?: string;
    Feedback?: string;
}

export interface ChatMessageProps {
    message: Message;
    showIcon: boolean;
    chatType: ChatType;
    thread: Chat;
    getMessages: () => void;
}

const ChatMessage = (props: ChatMessageProps) => {
    const { message, showIcon, thread, chatType, getMessages } = props;
    const { copyToClipboard } = useClipboard();
    const { callApi } = useApi();
    const { Role: role } = message;
    const { user } = useUser();
    const { SamAccountName } = user;
    const isOwnedByUser = SamAccountName === thread?.SamAccountName;

    const userTitle = isOwnedByUser ? 'You' : `${thread?.User?.FirstName} ${thread?.User?.LastName}`;
    const fileIds = message.Annotations?.map(annotation => annotation.File_OpenAI_id);

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

    const handleCopy = () => {
        copyToClipboard({
            textContent: message.Content_Value
        });
    };

    const handleFeedback = async (feedback: 'like' | 'dislike') => {
        try {
            const res = await callApi({
                url: `/api/message/${message.Message_OpenAI_id}/feedback`,
                method: 'post',
                body: {
                    feedback
                }
            });
            if (res.status !== 'success') {
                setStatus({
                    type: 'error',
                    message: 'Error submitting feedback'
                });
                return;
            }
            setStatus({
                type: 'success',
                message: `Message ${feedback}d. Thank you for your feedback!`
            });
            getMessages();
        } catch (error) {
            setStatus({
                type: 'error',
                message: 'Error submitting feedback'
            });
        }
    };

    const renderContent = () => {
        const content: string[] = message.Content_Value.split('\n');
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
                            <div
                                key={`${index}-${i}`}
                                style={{
                                    borderRadius: '10px',
                                    color: 'black',
                                    fontFamily: 'Noto Sans, sans-serif',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.8',
                                    paddingLeft: '1rem',
                                    maxWidth: '100%'
                                }}
                            >
                                <ReactMarkdown>{part}</ReactMarkdown>
                            </div>
                        );
                    } else if (i % 3 === 1) {
                        // this part is the link text
                        const linkText = part;
                        const fileId = fileIds ? fileIds[linkIndex] : '';
                        linkIndex++;
                        return (
                            <LinkButton
                                key={`${index}-${i}`}
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
                        <Icon role={showIcon ? role : 'empty'} thread={thread} />
                    </Grid>
                    <Grid item>
                        <Typography variant='h6' fontWeight={'bold'}>
                            {role === 'user' ? userTitle : 'ChatDTC'}
                        </Typography>
                    </Grid>
                </Grid>
            )}
            <Grid
                container
                direction={role === 'assistant' ? 'row' : 'row-reverse'}
                spacing={2}
                sx={{
                    width: '100%'
                }}
            >
                <Grid item xs={10}>
                    <div
                        style={{
                            backgroundColor:
                                role === 'assistant' ? theme.palette.primary.light : theme.palette.grey[200],
                            borderRadius: '10px',
                            marginBottom: '15px',
                            marginTop: '15px',
                            padding: '1rem'
                        }}
                    >
                        {renderContent()}
                    </div>
                </Grid>
                <Grid item xs={2}>
                    <Grid
                        container
                        direction='row'
                        justifyContent={role === 'assistant' ? 'start' : 'end'}
                        alignItems='flex-end'
                        height='100%'
                        paddingBottom='8px'
                        spacing={1}
                    >
                        <MessageActionIcon icon={ContentPaste} onClick={handleCopy} />
                        {chatType === 'form' && role === 'assistant' && (
                            <>
                                {/* TODO - show as selected whichever one is selected */}
                                <MessageActionIcon
                                    icon={ThumbUpOffAlt}
                                    onClick={() => handleFeedback('like')}
                                    selected={message.Feedback === 'like'}
                                />
                                <MessageActionIcon
                                    icon={ThumbDownOffAlt}
                                    onClick={() => handleFeedback('dislike')}
                                    selected={message.Feedback === 'dislike'}
                                />
                            </>
                        )}
                    </Grid>
                </Grid>
            </Grid>
        </div>
    );
};

export default ChatMessage;
