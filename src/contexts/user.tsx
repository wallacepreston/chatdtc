import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useAuthHeader } from 'react-auth-kit';
import { REACT_APP_API_URL } from '../constants/api';
import axios from 'axios';

export interface Winery {
    Winery_id: string;
    Winery_Name?: string;
    Last_Sync_Date?: string;
    OpenAI_model?: string;
    POS_Name?: string;
}

export interface UserState {
    Last_Winery_id: string | null;
    Created?: string;
    Email?: string;
    FirstName?: string;
    FullName?: string;
    Wineries?: Winery[];
    LastWinery?: { [key: string]: any };
    LastModified?: string;
    LastName?: string;
    SamAccountName?: string;
    UserRole?: string;
    Default_Winery_id?: string;
    Sys_Admin?: boolean;
    balance?: number; // their BillingBalance.Balance amount, or zero if they have no BillingBalance record
}

export interface Notification {
    id: number;
    Severity?: string;
    Type?: string;
    Content?: string;
    Active?: boolean;
    Effective_Start_Date?: Date;
    Effective_End_Date?: Date | null;
    Created_Date?: Date;
    Updated_Date?: Date;
}

const UserContext = createContext({
    user: { Last_Winery_id: null } as UserState,
    setUser: (user: UserState) => {},
    getUser: () => {},
    notifications: [] as Notification[],
    setNotifications: (notifications: Notification[]) => {}
});

interface Props {
    children?: ReactNode;
}

const UserProvider = ({ children }: Props) => {
    const authHeader = useAuthHeader();
    const [user, setUser] = useState<UserState>({ Last_Winery_id: null });
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const getUser = async () => {
        const Authorization = authHeader();
        if (!Authorization) {
            return;
        }
        const res = await axios.get(`${REACT_APP_API_URL}/api/auth/me`, {
            headers: {
                Authorization
            }
        });
        const userData = res?.data?.user;
        if (userData) {
            // get the list of groups from the response
            setUser(userData);
        }
        const notifications = res?.data?.notifications;
        if (notifications?.length) {
            // set the notifications in the context
            setNotifications(notifications);
        }
    };

    useEffect(() => {
        getUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, getUser, notifications, setNotifications }}>
            {children}
        </UserContext.Provider>
    );
};

const useUser = () => {
    return useContext(UserContext);
};

export { UserProvider, useUser };
