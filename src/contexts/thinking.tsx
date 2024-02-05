import React, { ReactNode, createContext, useContext, useEffect } from 'react';
import { useState } from 'react';
import socket from '../util/socket';

type ChatThinkingState = {
    [chat_id: string]: { isThinking: boolean; lastUpdated: number };
};

let thinkingChats: ChatThinkingState = {};

const ThinkingContext = createContext({
    thinkingChats,
    setThinkingChats: (thinkingChats: ChatThinkingState) => {},
    setChatThinking: (chat_id: string, isThinking: boolean, now: number) => {}
});

interface Props {
    children?: ReactNode;
}

const ThinkingProvider = ({ children }: Props) => {
    const [thinkingChats, setThinkingChats] = useState<ChatThinkingState>({});

    const setChatThinking = (chat_id: string, isThinking: boolean, now: number) => {
        if (isThinking) {
        }
        setThinkingChats(prevState => {
            return { ...prevState, [chat_id]: { isThinking, lastUpdated: now } };
        });
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            // Cleanup entries older than 20 seconds
            const currentTime = Date.now();

            setThinkingChats(prevState => {
                const updatedChats = { ...prevState };

                for (const chat_id in updatedChats) {
                    const diff = currentTime - updatedChats[chat_id].lastUpdated;
                    const isExpired = diff > 20000;

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
            setChatThinking(data.chat_id, false, Date.now());
        });
        return () => {
            socket.off('runComplete');
        };
    }, []);

    useEffect(() => {
        socket.on('loadingMessage', (data: { chat_id: string; content: string }) => {
            setChatThinking(data.chat_id, true, Date.now());
        });
        return () => {
            socket.off('loadingMessage');
        };
    }, []);

    return (
        <ThinkingContext.Provider value={{ thinkingChats, setThinkingChats, setChatThinking }}>
            {children}
        </ThinkingContext.Provider>
    );
};

const useThinking = () => {
    return useContext(ThinkingContext);
};

export { ThinkingProvider, useThinking };
