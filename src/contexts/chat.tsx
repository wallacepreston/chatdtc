import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuthHeader, useAuthUser } from 'react-auth-kit';
import { UserState } from './user';
import { useStatus } from './status';

export interface Category {
    id: number;
    Title: string;
    Description?: string;
}

export interface Run {
    Created_At: string;
    Updated_At: string;
    Status: string | null;
}

export interface Chat {
    Thread_OpenAI_id: string;
    Winery_id?: string;
    SamAccountName?: string;
    Created_Date?: Date;
    Last_Modified_Date?: Date;
    Title?: string;
    Deleted?: boolean;
    Deleted_Date?: Date;
    Public?: boolean;
    Downloads_Public?: boolean;
    Share_Date?: Date;
    User?: UserState;
    Category?: Category;
    Runs: Run[];
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
    const auth = useAuthUser();
    const isAuthenticated = Boolean(auth());
    const authHeader = useAuthHeader();
    const { setStatus } = useStatus();

    const [chats, setChats] = useState([]);

    const getChats = async () => {
        try {
            const res = await axios.get(`${REACT_APP_API_URL}/api/chat/getChats`, {
                headers: { Authorization: authHeader() }
            });
            setChats(res.data);
        } catch (err) {
            console.log(err);
            setStatus({ type: 'error', message: 'Error getting Chats' });
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        getChats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const value = {
        chats,
        getChats
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
