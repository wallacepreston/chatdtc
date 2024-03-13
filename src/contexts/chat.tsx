import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuthUser } from 'react-auth-kit';
import { UserState } from './user';
import { useStatus } from './status';
import useApi from '../hooks/api';

export interface Category {
    id: number;
    Title: string;
    Description?: string;
}

export interface ToolCall {
    Call_OpenAI_id: string;
    Run_OpenAI_id: string;
    Thread_OpenAI_id: string;
    ActorSamAccountName?: string;
    CallType: string;
    FunctionName: string;
    Arguments: string;
    Status: string | null;
    Created_At: string;
    Updated_At: string;
}

export interface Run {
    Created_At: string;
    Updated_At: string;
    Status: string | null;
    Run_OpenAI_id: string;
    ToolCalls?: ToolCall[];
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

interface Props {
    children?: React.ReactNode;
}

export const ChatProvider = ({ children }: Props) => {
    const auth = useAuthUser();
    const isAuthenticated = Boolean(auth());
    const { setStatus } = useStatus();
    const { callApi } = useApi();

    const [chats, setChats] = useState([]);

    const getChats = async () => {
        try {
            const res = await callApi({ url: '/api/chat/getChats', method: 'get', exposeError: true });

            if (!res) {
                return;
            }

            const data = res.data;
            if (!data || !data.length) {
                return;
            }

            setChats(data);
        } catch (err) {
            console.log('???? err:', err);
            // Please select the winery about which you would like to chat
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
