import { AlertColor } from '@mui/material';
import React, { ReactNode, createContext, useContext, useState } from 'react';

interface StatusState {
    type: AlertColor | null;
    message: string | null;
}

const StatusContext = createContext({
    status: { type: null, message: null } as StatusState,
    setStatus: (status: StatusState) => {}
});

interface Props {
    children?: ReactNode;
}

const StatusProvider = ({ children }: Props) => {
    const [status, setStatus] = useState<StatusState>({ type: null, message: null });

    return <StatusContext.Provider value={{ status, setStatus }}>{children}</StatusContext.Provider>;
};

const useStatus = () => {
    return useContext(StatusContext);
};

export { StatusProvider, useStatus };
