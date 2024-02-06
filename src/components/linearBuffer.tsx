import * as React from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { useThinking } from '../contexts/thinking';

interface LinearBufferProps {
    id: string;
}

const LinearBuffer = ({ id }: LinearBufferProps) => {
    const [buffer, setBuffer] = React.useState(10);
    const { thinkingChats } = useThinking();
    const progress = thinkingChats[id]?.progress || 0;

    const progressRef = React.useRef(() => {});
    React.useEffect(() => {
        progressRef.current = () => {
            if (progress === 100) {
                setBuffer(10);
            } else {
                const diff = Math.random() * 10;
                const diff2 = Math.random() * 10;
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
        <Box sx={{ display: 'flex', alignItems: 'center', height: '15px' }}>
            <Box sx={{ flexGrow: 1, ml: 1 }}>
                <LinearProgress variant='buffer' value={progress} valueBuffer={buffer} color='primary' />{' '}
            </Box>
        </Box>
    );
};

export default LinearBuffer;
