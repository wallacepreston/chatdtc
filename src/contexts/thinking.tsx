import React, { ReactNode, createContext, useContext } from 'react';
import { useState } from 'react';

const ThinkingContext = createContext({
    thinking: false,
    setThinking: (thinking: boolean) => {}
});

interface Props {
    children?: ReactNode;
}

const ThinkingProvider = ({ children }: Props) => {
    const [thinking, setThinking] = useState(false);

    return <ThinkingContext.Provider value={{ thinking, setThinking }}>{children}</ThinkingContext.Provider>;
};

const useThinking = () => {
    return useContext(ThinkingContext);
};

export { ThinkingProvider, useThinking };
