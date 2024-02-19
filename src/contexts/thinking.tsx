import React, { ReactNode, createContext, useCallback, useContext, useEffect } from 'react';
import { useState } from 'react';
import socket from '../util/socket';

type ChatThinkingState = {
    [chat_id: string]: { progress: number; lastUpdated: number };
};

let thinkingChats: ChatThinkingState = {};

const ThinkingContext = createContext({
    thinkingChats,
    setThinkingChats: (thinkingChats: ChatThinkingState) => {},
    addChatThinking: (chat_id: string, progress: number, now: number) => {},
    removeChatThinking: (chat_id: string) => {}
});

interface Props {
    children?: ReactNode;
}

const ThinkingProvider = ({ children }: Props) => {
    const [thinkingChats, setThinkingChats] = useState<ChatThinkingState>({});

    const removeChatThinking = useCallback(
        (chat_id: string) => {
            const updatedChats = { ...thinkingChats };
            delete updatedChats[chat_id];
            setThinkingChats(updatedChats);
        },
        [thinkingChats]
    );

    const addChatThinking = (chat_id: string, progress: number, now: number) => {
        setThinkingChats(prevState => {
            return { ...prevState, [chat_id]: { progress, lastUpdated: Date.now() } };
        });
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            // Cleanup entries older than 15 seconds
            const currentTime = Date.now();

            setThinkingChats(prevState => {
                const updatedChats = { ...prevState };

                for (const chat_id in updatedChats) {
                    const diff = currentTime - updatedChats[chat_id].lastUpdated;
                    const isExpired = diff > 15000;

                    if (isExpired) {
                        delete updatedChats[chat_id];
                    }
                }

                return updatedChats;
            });
        }, 10000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        socket.on('runComplete', (data: { chat_id: string }) => {
            removeChatThinking(data.chat_id);
        });
        return () => {
            socket.off('runComplete');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        socket.on('loadingMessage', (data: { chat_id: string; content: string }) => {
            addChatThinking(data.chat_id, Number(data.content), Date.now());
        });
        return () => {
            socket.off('loadingMessage');
        };
    }, []);

    useEffect(() => {
        socket.on('newMessage', (data: { chat_id: string; content: string }) => {
            addChatThinking(data.chat_id, 10, Date.now());
        });
        return () => {
            socket.off('newMessage');
        };
    }, []);

    useEffect(() => {
        socket.on('requiresAction', (data: { chat_id: string }) => {
            removeChatThinking(data.chat_id);
        });
        return () => {
            socket.off('requiresAction');
        };
    }, [removeChatThinking]);

    return (
        <ThinkingContext.Provider value={{ thinkingChats, setThinkingChats, addChatThinking, removeChatThinking }}>
            {children}
        </ThinkingContext.Provider>
    );
};

const useThinking = () => {
    return useContext(ThinkingContext);
};

export { ThinkingProvider, useThinking };
