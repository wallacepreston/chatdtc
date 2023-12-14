import React, { useState, useEffect } from 'react';
import { Avatar } from '@mui/material';
import theme from '../theme';
import { Chat } from '../contexts/chat';

export interface IconProps {
    role: 'user' | 'assistant' | 'empty';
    thread: Chat;
}
const Icon = (props: IconProps) => {
    const renderInitials = (firstName?: string, lastName?: string) => {
        if (firstName && lastName) {
            return firstName[0].toUpperCase() + lastName[0].toUpperCase();
        } else {
            return '';
        }
    };

    const firstName = props.thread?.User?.FirstName;
    const lastName = props.thread?.User?.LastName;
    const initials = renderInitials(firstName, lastName);

    const [width, setWidth] = useState<number>(window.innerWidth);

    useEffect(() => {
        const updateWidth = () => {
            setWidth(window.innerWidth);
        };

        window.addEventListener('resize', updateWidth);

        return () => window.removeEventListener('resize', updateWidth);
    }, [width]);

    const handleSrc = () => {
        if (props.role === 'user') {
            return '';
        } else if (props.role === 'assistant') {
            return '/assets/logochatdtc-icon.png';
        } else if (props.role === 'empty') {
            return '/assets/empty.png';
        }
    };

    const handleBackground = () => {
        if (props.role === 'user') {
            return theme.palette.grey[200];
        } else if (props.role === 'assistant') {
            return theme.palette.primary.light;
        } else {
            return 'transparent';
        }
    };

    return (
        <div id='Icon'>
            <Avatar
                sx={{
                    background: handleBackground(),
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    fontSize: '1rem',
                    color: 'black',
                    fontWeight: 'bold'
                }}
                src={handleSrc()}
            >
                {props.role === 'user' ? initials : ''}
            </Avatar>
        </div>
    );
};

export default Icon;
