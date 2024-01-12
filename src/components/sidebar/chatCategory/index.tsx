import { Button, Collapse, Grid, Stack, Typography } from '@mui/material';
import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CustomChatCategory } from '..';
import ChatItem from './chatItem';
import theme from '../../../theme';

interface ChatCategoryProps {
    category: CustomChatCategory;
    hoverInactive: string;
    sidebarColor: string;
}

const ChatCategory = ({ category, hoverInactive, sidebarColor }: ChatCategoryProps) => {
    const [expanded, setExpanded] = React.useState(true);
    const verticallyCentered = { display: 'flex', justifyContent: 'center' };
    return (
        <Stack sx={{ margin: '8px 0' }}>
            {/* Category name collapse bar */}
            <Button
                onClick={() => setExpanded(!expanded)}
                sx={{
                    borderRadius: '5px',
                    height: '20px',
                    margin: '8px 0 16px 8px',
                    paddingLeft: '4px',
                    textTransform: 'none'
                }}
            >
                <Grid container direction='row' justifyContent='space-between' alignItems='center'>
                    {/* collapse bar: icon and title */}
                    <Grid item>
                        <Grid container spacing={1} direction='row' justifyContent='space-between' alignItems='center'>
                            <Grid item sx={verticallyCentered}>
                                <Typography
                                    sx={{ fontSize: '.8em', color: theme.palette.grey[600], fontWeight: 900 }}
                                    color='primary'
                                >
                                    {category.name}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item sx={verticallyCentered}>
                        <ExpandMoreIcon
                            sx={{
                                transform: !expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                marginLeft: 'auto',
                                fontSize: '1em',
                                color: theme.palette.grey[600]
                            }}
                        />
                    </Grid>
                </Grid>
            </Button>
            <Collapse in={expanded}>
                <Stack>
                    {category.chats.map(chat => (
                        <ChatItem
                            key={chat.Thread_OpenAI_id}
                            chat={chat}
                            hoverInactive={hoverInactive}
                            sidebarColor={sidebarColor}
                        />
                    ))}
                </Stack>
            </Collapse>
        </Stack>
    );
};

export default ChatCategory;
