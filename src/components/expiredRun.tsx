import { Box, Grid, Typography } from '@mui/material';
import theme from '../theme';
import { ExpiredRunStatus } from '../pages/ChatPage';

interface ExpiredRunMessageProps {
    status: ExpiredRunStatus | null;
}

const ExpiredRunMessage = ({ status }: ExpiredRunMessageProps) => {
    const isOpenAiIssue = status === 'failed';

    const statusForDisplay = status === 'cancelled' ? 'been cancelled' : status;

    return (
        <Grid
            container
            spacing={2}
            sx={{
                width: '100%'
            }}
        >
            <Grid item xs={10}>
                <div
                    style={{
                        backgroundColor: theme.palette.primary.light,
                        borderRadius: '10px',
                        marginBottom: '15px',
                        marginTop: '15px',
                        padding: '1rem'
                    }}
                >
                    <Box sx={{ p: 2 }}>
                        <Typography>
                            I'm sorry, {isOpenAiIssue ? 'OpenAI ran into an issue, and ' : ''}the chat has{' '}
                            {statusForDisplay}. Please enter a new message or create a new chat to continue.
                        </Typography>
                    </Box>
                </div>
            </Grid>
        </Grid>
    );
};

export default ExpiredRunMessage;
