import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    Divider,
    FormControlLabel,
    FormGroup,
    Grid,
    Typography,
    Stack
} from '@mui/material';
import { ToolCall } from '../../contexts/chat';
import { useStatus } from '../../contexts/status';
import useApi from '../../hooks/api';
import WpModal from '../wpModal';
import { useEffect, useState } from 'react';
import theme from '../../theme';
import { Clear, Done } from '@mui/icons-material';
import { TOOL_CALL_FUNCTION_MAP } from '../../constants/toolCalls';

interface ToolCallProps {
    toolCalls: ToolCall[];
    runId: string;
    getMessages: () => void;
}

const ToolCalls = ({ toolCalls, runId, getMessages }: ToolCallProps) => {
    const { callApi } = useApi();
    const { setStatus } = useStatus();
    const [open, setOpen] = useState(false);
    const [toolCallsToSubmit, setToolCallsToSubmit] = useState<ToolCall[]>([]);

    const allDeclined = toolCallsToSubmit.every(toolCall => toolCall.Status === 'declined');

    useEffect(() => {
        setOpen(false);
    }, [runId]);

    useEffect(() => {
        const toolCallsDefaultedToDeclined = toolCalls.map(toolCall => {
            return { ...toolCall, Status: 'declined' };
        });
        setToolCallsToSubmit(toolCallsDefaultedToDeclined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toolCalls, runId]);

    const handleClose = () => {
        setOpen(false);
    };

    const handleToggleToolCall = (callId: string) => {
        const newToolCalls = toolCallsToSubmit.map(toolCall => {
            if (toolCall.Call_OpenAI_id === callId) {
                return { ...toolCall, Status: toolCall.Status === 'declined' ? 'completed' : 'declined' };
            }
            return toolCall;
        });
        setToolCallsToSubmit(newToolCalls);
    };

    const handleDeclineAll = () => {
        setToolCallsToSubmit(_prevToolCalls => {
            const newToolCalls = toolCallsToSubmit.map(toolCall => {
                return { ...toolCall, Status: 'declined' };
            });
            handleToolCall(newToolCalls);
            getMessages();
            return newToolCalls;
        });
    };

    const handleToolCall = async (passedToolCalls?: ToolCall[]) => {
        try {
            // compile a list of Call_OpenAI_ids to send to the backend
            const response = await callApi({
                url: `/api/runs/${runId}/toolCalls/`,
                method: 'post',
                exposeError: true,
                body: {
                    // prefer the var passed in, but if not there, use the state
                    toolCalls: passedToolCalls || toolCallsToSubmit
                }
            });
            if (!response) {
                return;
            }
            const { data } = response;
            if (data?.status !== 'success') {
                return setStatus({
                    type: 'error',
                    message: 'Error executing tool call'
                });
            }
            setStatus({
                type: 'success',
                message: 'Action decisions saved successfully'
            });
        } catch (error) {
            setStatus({
                type: 'error',
                message: 'Error executing tool call'
            });
        } finally {
            handleClose();
            getMessages();
        }
    };

    const warningAlert = (
        <Box sx={{ p: 2 }}>
            <Alert severity='warning'>
                <b>NOTE:</b> These actions will be executed immediately.
            </Alert>
        </Box>
    );

    return (
        <div>
            <WpModal title='Requested Actions' open={open} onClose={handleClose}>
                <Box sx={{ p: 2 }}>
                    <Typography gutterBottom variant='body2'>
                        The following actions will be taken:
                    </Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                    <Stack spacing={1}>
                        {toolCallsToSubmit.map(toolCall => {
                            return (
                                <Chip
                                    key={toolCall.Call_OpenAI_id}
                                    label={
                                        TOOL_CALL_FUNCTION_MAP[
                                            toolCall.FunctionName as keyof typeof TOOL_CALL_FUNCTION_MAP
                                        ]
                                    }
                                    avatar={toolCall.Status === 'completed' ? <Done /> : <Clear />}
                                    variant='outlined'
                                    color={toolCall.Status === 'completed' ? 'success' : 'info'}
                                />
                            );
                        })}
                    </Stack>
                </Box>
                <Box sx={{ p: 2 }}>
                    <Grid
                        container
                        spacing={2}
                        sx={{
                            p: 2
                        }}
                    >
                        <Grid item xs={6}>
                            <Button
                                sx={{ textTransform: 'none' }}
                                variant='contained'
                                color='primary'
                                onClick={() => handleToolCall()}
                            >
                                Execute These Actions
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                sx={{ textTransform: 'none' }}
                                variant='outlined'
                                color='error'
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
                <Divider light />
                <Box sx={{ p: 2 }}>{warningAlert}</Box>
            </WpModal>
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
                                Based on the conversation, we recommend the following actions that need confirmation to
                                be executed.
                            </Typography>
                        </Box>
                        <Divider light />
                        <Box sx={{ p: 2 }}>
                            <Typography gutterBottom variant='body2'>
                                Select actions to execute:
                            </Typography>
                            <FormGroup>
                                {toolCalls.map(toolCall => {
                                    return (
                                        <FormControlLabel
                                            key={toolCall.Call_OpenAI_id}
                                            control={
                                                <Checkbox
                                                    onClick={() => handleToggleToolCall(toolCall.Call_OpenAI_id)}
                                                />
                                            }
                                            label={
                                                TOOL_CALL_FUNCTION_MAP[
                                                    toolCall.FunctionName as keyof typeof TOOL_CALL_FUNCTION_MAP
                                                ]
                                            }
                                        />
                                    );
                                })}
                            </FormGroup>
                        </Box>
                        <Grid
                            container
                            spacing={2}
                            sx={{
                                p: 2
                            }}
                        >
                            <Grid item xs={6}>
                                <Button
                                    sx={{ textTransform: 'none' }}
                                    variant='contained'
                                    color='primary'
                                    onClick={() => setOpen(true)}
                                    disabled={allDeclined}
                                >
                                    Execute These Actions
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button
                                    sx={{ textTransform: 'none' }}
                                    variant='outlined'
                                    color='error'
                                    onClick={handleDeclineAll}
                                >
                                    Take no Action
                                </Button>
                            </Grid>
                        </Grid>
                    </div>
                </Grid>
            </Grid>
        </div>
    );
};

export default ToolCalls;
