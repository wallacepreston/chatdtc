import * as React from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { Typography } from '@mui/material';

interface LinearBufferProps {
    loadingMessage: string;
}

const LinearBuffer = ({ loadingMessage }: LinearBufferProps) => {
    const [progress, setProgress] = React.useState(0);
    const [buffer, setBuffer] = React.useState(10);

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
            <Box sx={{ maxWidth: '40%' }}>
                <Typography variant='body2' color='text.secondary'>
                    {loadingMessage}
                </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, ml: 1 }}>
                <LinearProgress variant='buffer' value={progress} valueBuffer={buffer} color='primary' />{' '}
            </Box>
        </Box>
    );
};

export default LinearBuffer;
