import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useAuthHeader } from 'react-auth-kit';
import { REACT_APP_API_URL } from '../constants/api';
import axios from 'axios';

interface UserState {
    selectedWinery: string | null;
}

const UserContext = createContext({
    user: { selectedWinery: null } as UserState,
    setUser: (user: UserState) => {}
});

interface Props {
    children?: ReactNode;
}

const UserProvider = ({ children }: Props) => {
    const authHeader = useAuthHeader();
    const [user, setUser] = useState<UserState>({ selectedWinery: null });

    useEffect(() => {
        const getUserData = async () => {
            const Authorization = authHeader();
            if (!Authorization) {
                return;
            }
            const res = await axios.get(`${REACT_APP_API_URL}/api/auth/me`, {
                headers: {
                    Authorization
                }
            });
            const selectedWinery = res?.data?.user?.SelectedWinery;
            if (selectedWinery) {
                // get the list of groups from the response
                setUser({
                    ...user,
                    selectedWinery
                });
            }
        };
        getUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

const useUser = () => {
    return useContext(UserContext);
};

export { UserProvider, useUser };
