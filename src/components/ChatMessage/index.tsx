import React from 'react';
import Icon from '../icon';
import { Grid, Typography } from '@mui/material';
import { ThumbDownOffAlt, ThumbUpOffAlt, ContentPaste } from '@mui/icons-material';
import { useStatus } from '../../contexts/status';
import theme from '../../theme';
import ReactMarkdown from 'react-markdown';
import { ChatType } from '../../pages/ChatPage';
import { useUser } from '../../contexts/user';
import { Chat } from '../../contexts/chat';
import MessageActionIcon from './MessageActionIcon';
import useClipboard from '../../hooks/useClipboard';
import useApi from '../../hooks/api';
import LinkButton from './LinkButton';

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
    width: number;
}

const ChatMessage = (props: ChatMessageProps) => {
    const { message, showIcon, thread, chatType, getMessages, width } = props;
    const { copyToClipboard } = useClipboard();
    const { callApi } = useApi();
    const { Role: role } = message;
    const { user } = useUser();
    const { SamAccountName } = user;
    const threadIsOwnedByUser = SamAccountName === thread?.SamAccountName;

    // three cases: (1) form, (2) share view and I own it, (3) share view and I don't own it
    const fileIsDownloadableByUser = chatType === 'form' || threadIsOwnedByUser;
    // if it's share view, we need to check if it's public.
    const downloadEnabled = fileIsDownloadableByUser || thread.Downloads_Public;

    const userTitle = threadIsOwnedByUser ? 'You' : `${thread?.User?.FirstName} ${thread?.User?.LastName}`;
    const fileIds = message.Annotations?.map(annotation => annotation.File_OpenAI_id);

    const { setStatus } = useStatus();

    const handleCopy = () => {
        copyToClipboard({
            textContent: message.Content_Value
        });
    };

    const handleFeedback = async (feedback: 'like' | 'dislike') => {
        try {
            const feedbackRes = await callApi({
                url: `/api/message/${message.Message_OpenAI_id}/feedback`,
                method: 'post',
                body: {
                    feedback
                }
            });

            if (!feedbackRes) {
                return setStatus({
                    type: 'error',
                    message: 'Error submitting feedback'
                });
            }
            const { data } = feedbackRes;

            if (data.status !== 'success') {
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
        if (message.Annotations?.length) {
            console.log('>>>> message.Annotations', message.Annotations);
        }
        const content: string[] = message.Content_Value.split('\n');
        if (role === 'user') {
            return content;
        } else {
            let linkIndex = 0;

            return content.map((line, index) => {
                // split the line into parts based on the regex
                const parts = line.split(/\[(.*?)\]\((sandbox:\/.*?)\)/g);
                // console.log('>>>> parts', parts);
                // console.log('>>>> parts.length', parts.length);

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
                                fileId={fileId}
                                linkText={linkText}
                                downloadEnabled={downloadEnabled}
                            />
                        );
                    } else {
                        return null;
                        // we don't need to return anything for the other parts
                    }
                });
            });
        }
    };

    const handleDirectionFeedback = () => {
        if (width < 1000) return 'column';
        if (role === 'assistant') return 'row';
        else return 'row-reverse';
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
                direction={handleDirectionFeedback()}
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
