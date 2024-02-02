import { Box, Grid, Typography } from '@mui/material';
import theme from '../theme';

const ExpiredRunMessage = () => {
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
                            I'm sorry, OpenAI ran into an issue, and the chat has expired. Please enter a new message or
                            create a new chat to continue.
                        </Typography>
                    </Box>
                </div>
            </Grid>
        </Grid>
    );
};

export default ExpiredRunMessage;
