import React, { useState, useEffect } from 'react';
import { Avatar } from '@mui/material';
import { useUser } from '../contexts/user';

const Icon = (props: { role: 'user' | 'assistant' | 'empty' }) => {
    const { user } = useUser();

    const renderInitials = (firstName?: string, lastName?: string) => {
        if (firstName && lastName) {
            return firstName[0].toUpperCase() + lastName[0].toUpperCase();
        } else {
            return '';
        }
    };

    const firstName = user?.FirstName;
    const lastName = user?.LastName;
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
            return '/assets/logowinepulse-icon.png';
        } else if (props.role === 'empty') {
            return '/assets/empty.png';
        }
    };

    const handleBackground = () => {
        if (props.role === 'user') {
            return '#cfcfcf';
        } else if (props.role === 'assistant') {
            return '#E4EDF6';
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
