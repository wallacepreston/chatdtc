import React, { useEffect, useRef } from 'react';
import { Chat, useChats } from '../../contexts/chat';
import { StyledTextField } from './styled';
import useApi from '../../hooks/api';
import { useStatus } from '../../contexts/status';

interface ChatRenameFormProps {
    chat: Chat;
    setEditingChat: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatRenameForm = ({ chat, setEditingChat }: ChatRenameFormProps) => {
    const [title, setTitle] = React.useState(chat.title?.replaceAll('"', ''));
    const { getChats } = useChats();
    const { callApi } = useApi();
    const { setStatus } = useStatus();

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!inputRef.current) return;
        inputRef.current.focus();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // actual update
        await callApi({ url: `/api/chat/${chat.id}`, method: 'patch', body: { title } });

        // reset everything
        setEditingChat(false);
        inputRef.current?.blur();
        getChats();

        setStatus({ type: 'success', message: 'Chat renamed successfully' });
    };
    return (
        <form onSubmit={handleSubmit}>
            <StyledTextField
                inputRef={inputRef}
                variant='standard'
                value={title}
                onChange={e => setTitle(e.target.value)}
                size='small'
            />
        </form>
    );
};

export default ChatRenameForm;
