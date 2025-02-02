import { Button, Tooltip } from '@mui/material';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import theme from '../../../theme';
import { Chat } from '../../../contexts/chat';
import ChatRenameForm from '../chatRenameForm';
import ChatActionsMenu from '../chatActionsMenu';
import TypingIndicator from '../../TypingIndicator';
import { useThinking } from '../../../contexts/thinking';

interface ChatItemProps {
    chat: Chat;
    hoverInactive: string;
    sidebarColor: string;
}
const ChatItem = ({ chat, hoverInactive, sidebarColor }: ChatItemProps) => {
    const { id: activeChatId } = useParams();
    const [editingChat, setEditingChat] = React.useState<boolean>(false);
    const title = chat.Title?.replaceAll('"', '');
    const chat_id = chat.Thread_OpenAI_id;
    const isActiveChat = chat.Thread_OpenAI_id === activeChatId;
    const hoverActive = theme.palette.grey[300];
    const { thinkingChats } = useThinking();
    const isTyping = Boolean(thinkingChats[chat_id]?.progress);

    const showTypingIcon = !isActiveChat && isTyping;
    const showOverlay = isActiveChat || showTypingIcon;

    const handleBackground = () => {
        const color = isActiveChat ? hoverActive : sidebarColor;
        const percent = showOverlay ? '50%' : '100%';
        const background = `linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, ${color} ${percent}`;

        return background;
    };

    return (
        <Tooltip
            title={title}
            placement='right'
            enterDelay={600}
            slotProps={{
                popper: {
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 8]
                            }
                        }
                    ]
                }
            }}
        >
            <div
                id='chatBtn'
                key={chat.Thread_OpenAI_id}
                style={{
                    width: '244px',
                    height: '40px',
                    marginBottom: '5px',
                    marginLeft: '16px'
                }}
            >
                <Link to={`/c/${chat.Thread_OpenAI_id}`} style={{ textDecoration: 'none' }}>
                    <Button
                        key={chat.Thread_OpenAI_id}
                        variant='text'
                        color='info'
                        sx={{
                            textTransform: 'none',
                            height: '40px',
                            width: '244px',
                            borderRadius: '5px',
                            justifyContent: 'left',
                            bgcolor: isActiveChat ? hoverActive : sidebarColor,
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            '&:hover': {
                                bgcolor: isActiveChat ? hoverActive : hoverInactive
                            }
                        }}
                    >
                        <div
                            style={{
                                fontSize: '0.8rem',
                                fontFamily: 'Noto Sans, sans-serif'
                            }}
                        >
                            {editingChat && isActiveChat ? (
                                <ChatRenameForm chat={chat} setEditingChat={setEditingChat} />
                            ) : (
                                title
                            )}
                        </div>
                    </Button>
                </Link>
                <div
                    style={{
                        width: showOverlay ? '90px' : '70px',
                        height: '40px',
                        position: 'relative',
                        bottom: '40px',
                        left: showOverlay ? '154px' : '174px',
                        borderTopRightRadius: '5px',
                        borderBottomRightRadius: '5px',
                        background: handleBackground(),
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        pointerEvents: !isActiveChat ? 'none' : 'auto'
                    }}
                >
                    {isActiveChat && <ChatActionsMenu chat={chat} handleRename={() => setEditingChat(true)} />}
                    {showTypingIcon && <TypingIndicator />}
                </div>
            </div>
        </Tooltip>
    );
};

export default ChatItem;
