import React, { useState, useEffect } from 'react';
import { Avatar } from '@mui/material';
import { useAuthUser } from 'react-auth-kit';

const Icon = (props: { role: 'user' | 'assistant' | 'empty' }) => {
    const auth = useAuthUser();

    const [userEmail] = useState<string>(auth()!.email?.[0].toUpperCase());
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
            return '/assets/logowinepulse.png';
        } else if (props.role === 'empty') {
            return '/assets/empty.png';
        }
    };

    const handleBackground = () => {
        if (props.role === 'user') {
            return '#3f51b5';
        } else if (props.role === 'assistant') {
            return '#10A37F';
        } else {
            return 'transparent';
        }
    };

    return (
        <div id='Icon'>
            <Avatar
                sx={{
                    background: handleBackground(),
                    borderRadius: '5px',
                    width: '30px',
                    height: '30px'
                }}
                src={handleSrc()}
            >
                {props.role === 'user' ? userEmail : ''}
            </Avatar>
        </div>
    );
};

export default Icon;
