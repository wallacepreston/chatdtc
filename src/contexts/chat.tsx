import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuthHeader } from 'react-auth-kit';

export interface Chat {
    title: string;
    wineryName: string;
    id: string;
}

type Chats = Chat[];

const ChatContext = createContext({
    chats: [] as Chats,
    getChats: () => {}
});
export const useChats = () => {
    return useContext(ChatContext);
};

const REACT_APP_API_URL = process.env.REACT_APP_API_URL;
interface Props {
    children?: React.ReactNode;
}

export const ChatProvider = ({ children }: Props) => {
    const authHeader = useAuthHeader();

    const [chats, setChats] = useState([]);

    const getChats = async () => {
        try {
            const res = await axios.get(`${REACT_APP_API_URL}/api/chat/getChats`, {
                headers: { Authorization: authHeader() }
            });
            setChats(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getChats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const value = {
        chats,
        getChats
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
