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
    Admin?: boolean;
    balance?: number; // their BillingBalance.Balance amount, or zero if they have no BillingBalance record
}

const UserContext = createContext({
    user: { Last_Winery_id: null } as UserState,
    setUser: (user: UserState) => {},
    getUser: () => {}
});

interface Props {
    children?: ReactNode;
}

const UserProvider = ({ children }: Props) => {
    const authHeader = useAuthHeader();
    const [user, setUser] = useState<UserState>({ Last_Winery_id: null });

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
    };

    useEffect(() => {
        getUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <UserContext.Provider value={{ user, setUser, getUser }}>{children}</UserContext.Provider>;
};

const useUser = () => {
    return useContext(UserContext);
};

export { UserProvider, useUser };
