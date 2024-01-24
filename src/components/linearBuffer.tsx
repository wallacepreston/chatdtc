import * as React from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { io } from 'socket.io-client';
import { REACT_APP_API_URL } from '../constants/api';

interface LinearBufferProps {
    id: string;
}

const LinearBuffer = ({ id }: LinearBufferProps) => {
    const socket = io(REACT_APP_API_URL as string);
    const [progress, setProgress] = React.useState(0);
    const [buffer, setBuffer] = React.useState(10);
    const [loadingMessage, setLoadingMessage] = React.useState<string>('');

    socket.on('loadingMessage', (data: { chat_id: string; content: string }) => {
        if (data.chat_id === id) {
            setLoadingMessage(data.content);
        }
    });

    socket.on('newMessage', (data: { chat_id: string; content: string }) => {
        if (data.chat_id === id) {
            setProgress(0);
        }
    });

    // anytime loadingMessage changes, set progress to 10 more than it was before
    React.useEffect(() => {
        setProgress(prevProgress => (prevProgress >= 100 ? 0 : prevProgress + 10));
    }, [loadingMessage]);

    const progressRef = React.useRef(() => {});
    React.useEffect(() => {
        progressRef.current = () => {
            if (progress > 100) {
                setProgress(0);
                setBuffer(10);
            } else {
                const diff = Math.random() * 10;
                const diff2 = Math.random() * 10;
                // setProgress(progress + diff);
                setBuffer(progress + diff + diff2);
            }
        };
    });

    React.useEffect(() => {
        const timer = setInterval(() => {
            progressRef.current();
        }, 500);

        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '' }}>
            <Box sx={{ flexGrow: 1, ml: 1 }}>
                <LinearProgress variant='buffer' value={progress} valueBuffer={buffer} color='primary' />{' '}
            </Box>
        </Box>
    );
};

export default LinearBuffer;
