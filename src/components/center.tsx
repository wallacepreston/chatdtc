import React, { useState, useEffect, useRef } from 'react';
import { Stack, Typography, IconButton } from '@mui/material';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import PresentationButton from './presentationButton';
import useApi from '../hooks/api';
import { Suggestion, getCategories } from '../util/helpers';

const DownIcon = ArrowDownwardRoundedIcon;
const Button = PresentationButton;

const Center = (props: { footerHeight: number; setInput: (input: string) => void }) => {
    const { data: suggestedThreads, callApi } = useApi();
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
        callApi({ url: '/api/chat/suggested', method: 'get' });
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

    const handleMT = () => {
        if (width < 1000) {
            return '30px';
        } else {
            return '20vh';
        }
    };

    const handleMB = () => {
        if (width > 1000) {
            return '4rem';
        } else {
            return '2.5rem';
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
        const threads = (suggestedThreads as Suggestion[]).filter((thread: Suggestion) => thread.Category === category);

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
            <Stack
                id='non-active'
                direction='column'
                display='flex'
                alignItems='center'
                spacing={-1}
                sx={{ maxWidth: '768px' }}
            >
                <Typography
                    variant='h4'
                    id='main-title'
                    sx={{
                        textAlign: 'center',
                        color: 'black',
                        fontFamily: 'Noto Sans, sans-serif',
                        fontWeight: '800',
                        fontSize: '2.25rem',
                        mt: handleMT(),
                        mb: handleMB()
                    }}
                >
                    ChatDTC by WinePulse
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
            {!scrolledToBottom && (
                <IconButton
                    onClick={smoothScrollToBottom}
                    sx={{
                        position: 'fixed',
                        bottom: `${props.footerHeight + 20}px`,
                        right: '25px',
                        width: '26px',
                        height: '26px',
                        bgcolor: '#545661',
                        border: '1px solid #656770',
                        '&:hover': { bgcolor: '#545661' }
                    }}
                >
                    <DownIcon fontSize='small' sx={{ color: '#B7B8C3' }} />
                </IconButton>
            )}
        </div>
    );
};

export default Center;
