import React, { useState, useEffect } from 'react';
import { Button, Typography } from '@mui/material';

const PresentationButton = (props: {
    content: string;
    clickable?: boolean;
    handleClick?: (content: string) => void;
}) => {
    const [width, setWidth] = useState<number>(window.innerWidth);

    useEffect(() => {
        const updateWidth = () => {
            setWidth(window.innerWidth);
        };

        window.addEventListener('resize', updateWidth);

        return () => window.removeEventListener('resize', updateWidth);
    }, [width]);

    const sx = () => {
        if (width > 1000) {
            if (props.clickable) {
                return {
                    color: 'black',
                    bgcolor: '#fff',
                    '&:hover': { bgcolor: '#e6e6e6' },
                    boxShadow: '0px 0px 1px 1px #e6e6e6',
                    border: '1px solid #d9d9e3',
                    maxWidth: '28rem',
                    width: '100%',
                    mt: '15px'
                };
            } else {
                return {
                    color: 'black',
                    bgcolor: '#fff',
                    '&:hover': { bgcolor: '#fff' },
                    pointerEvents: 'none',
                    boxShadow: '0px 0px 1px 1px #e6e6e6',
                    border: '1px solid #d9d9e3',
                    maxWidth: '28rem',
                    width: '100%',
                    mt: '15px'
                };
            }
        } else {
            if (props.clickable) {
                return {
                    color: 'black',
                    bgcolor: '#fff',
                    '&:hover': { bgcolor: '#e6e6e6' },
                    boxShadow: '0px 0px 1px 1px #e6e6e6',
                    border: '1px solid #d9d9e3',
                    maxWidth: '28rem',
                    width: '90%',
                    mt: '15px'
                };
            } else {
                return {
                    color: 'black',
                    bgcolor: '#fff',
                    '&:hover': { bgcolor: '#fff' },
                    pointerEvents: 'none',
                    boxShadow: '0px 0px 1px 1px #e6e6e6',
                    border: '1px solid #d9d9e3',
                    maxWidth: '28rem',
                    width: '90%',
                    mt: '15px'
                };
            }
        }
    };

    const handleClick = () => {
        if (props.clickable === undefined) props.clickable = false;
        if (!props.clickable) return;
        if (!props.handleClick) return;
        props.handleClick(props.content);
    };

    return (
        <div id='PresentationButton'>
            <Button variant='contained' sx={sx()} onClick={handleClick}>
                <Typography
                    variant='h6'
                    sx={{
                        padding: '0.7rem 0rem',
                        fontFamily: 'Noto Sans, sans-serif',
                        fontSize: '0.8rem',
                        lineHeight: '1.25rem',
                        textTransform: 'none'
                    }}
                >
                    {props.content}
                </Typography>
            </Button>
        </div>
    );
};

export default PresentationButton;
