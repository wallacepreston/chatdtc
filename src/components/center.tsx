import React, { useState, useEffect, useRef } from 'react';
import { Stack, Typography, IconButton } from '@mui/material';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import PresentationButton from './presentationButton';
import useApi from '../hooks/api';
import { Suggestion, getCategories } from '../util/helpers';
import theme from '../theme';

const DownIcon = ArrowDownwardRoundedIcon;
const Button = PresentationButton;

const Center = (props: { footerHeight: number; setInput: (input: string) => void }) => {
    const { data: suggestedThreads, callApiLazy } = useApi();
    const scrollDiv = useRef<HTMLDivElement>(null);

    const [width, setWidth] = useState<number>(window.innerWidth);
    const [scrolledToBottom, setScrolledToBottom] = useState<boolean>(true);

    const smoothScrollToBottom = () => {
        if (scrollDiv.current) {
            scrollDiv.current.scrollTo({
                top: scrollDiv.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    const handleDivScroll = (e: any) => {
        const bottom: boolean = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
        if (bottom !== scrolledToBottom) {
            setScrolledToBottom(bottom);
        }
    };

    useEffect(() => {
        callApiLazy({ url: '/api/chat/suggested', method: 'get' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const suggestionCategories = getCategories(suggestedThreads || []);

    useEffect(() => {
        if (width < 1000) {
            setScrolledToBottom(false);
        } else {
            setScrolledToBottom(true);
        }
    }, [width]);

    const height = () => {
        if (width > 1000) {
            return 'calc(100% - ' + props.footerHeight + 'px)';
        } else {
            return 'calc(100% - ' + props.footerHeight + 'px - 40px)';
        }
    };

    useEffect(() => {
        const updateWidth = () => {
            setWidth(window.innerWidth);
        };

        window.addEventListener('resize', updateWidth);

        return () => window.removeEventListener('resize', updateWidth);
    }, [width]);

    const handlePresentationButtonClick = (content: string) => {
        props.setInput(content);
    };

    const handleDirection = () => {
        if (width > 1000) {
            return 'row';
        } else {
            return 'column';
        }
    };

    const handleWidth = () => {
        if (width > 1000) {
            return '720px';
        } else {
            return '100%';
        }
    };

    const handleTop = () => {
        if (width > 1000) {
            return '0px';
        } else {
            return '40px';
        }
    };

    const renderColumn = (category: string) => {
        if (!suggestedThreads) return null;
        const threads = (suggestedThreads as Suggestion[])
            .filter((thread: Suggestion) => thread.Category === category)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        return (
            <div id='examples' style={{ width: width > 1000 ? 'calc(100% / 3)' : 'auto' }}>
                {/* {width > 1000 && <TipsAndUpdates sx={{ color: 'black' }} />} */}
                <Typography
                    variant='h6'
                    sx={{
                        textAlign: 'center',
                        color: 'black',
                        fontFamily: 'Noto Sans, sans-serif',
                        fontSize: '1rem',
                        mt: '0.5rem',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    {/* {width < 1000 && <TipsAndUpdates fontSize='small' sx={{ color: 'black', mr: '5px' }} />} */}{' '}
                    {category}
                </Typography>
                {threads.map(thread => (
                    <Button
                        handleClick={() => handlePresentationButtonClick(thread.Message_Content)}
                        clickable
                        content={thread.Summary}
                    />
                ))}
            </div>
        );
    };

    return (
        <div
            id='Center'
            ref={scrollDiv}
            onScroll={handleDivScroll}
            style={{
                width: '100%',
                height: height(),
                display: 'flex',
                justifyContent: 'center',
                overflowY: 'auto',
                position: 'relative',
                top: handleTop()
            }}
        >
            <Stack direction='column' justifyContent='space-between' spacing={10} pb={1}>
                <Stack
                    id='non-active'
                    direction='column'
                    display='flex'
                    alignItems='center'
                    spacing={1}
                    sx={{ maxWidth: '768px' }}
                >
                    <Typography
                        variant='h5'
                        id='main-title'
                        sx={{
                            textAlign: 'center',
                            color: 'black',
                            fontFamily: 'Noto Sans, sans-serif',
                            fontWeight: '400',
                            fontSize: '2.25rem'
                        }}
                    >
                        ChatDTC by WinePulse
                    </Typography>
                    <Typography
                        variant='h5'
                        sx={{
                            textAlign: 'center',
                            color: 'black',
                            fontFamily: 'Noto Sans, sans-serif'
                        }}
                    >
                        How can I help you today?
                    </Typography>
                    <Typography
                        variant='h5'
                        sx={{
                            textAlign: 'center',
                            color: 'black',
                            fontFamily: 'Noto Sans, sans-serif',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingBottom: '1rem'
                        }}
                    >
                        Ask me questions about your data.
                    </Typography>
                </Stack>
                <Stack
                    id='non-active'
                    direction='column'
                    display='flex'
                    justifyContent='center'
                    alignItems='center'
                    spacing={1}
                    sx={{ maxWidth: '768px' }}
                >
                    <Typography
                        variant='h5'
                        sx={{
                            textAlign: 'center',
                            color: 'black',
                            fontFamily: 'Noto Sans, sans-serif',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingBottom: '1rem'
                        }}
                    >
                        <br />
                        Sample Questions:
                    </Typography>

                    <div id='presentation'>
                        <Stack
                            direction={handleDirection()}
                            display='flex'
                            textAlign='center'
                            spacing={2}
                            width={handleWidth()}
                        >
                            {suggestionCategories.map(category => renderColumn(category))}
                        </Stack>
                    </div>
                </Stack>
            </Stack>
            {!scrolledToBottom && (
                <IconButton
                    onClick={smoothScrollToBottom}
                    sx={{
                        position: 'fixed',
                        bottom: `${props.footerHeight + 20}px`,
                        right: '25px',
                        width: '26px',
                        height: '26px',
                        bgcolor: theme.palette.grey[300],
                        border: `1px solid ${theme.palette.grey[300]}`,
                        '&:hover': { bgcolor: theme.palette.grey[300] }
                    }}
                >
                    <DownIcon fontSize='small' sx={{ color: '#B7B8C3' }} />
                </IconButton>
            )}
        </div>
    );
};

export default Center;
