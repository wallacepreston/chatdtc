import { Box, Button, Checkbox, Divider, FormControlLabel, FormGroup, Grid, Typography } from '@mui/material';
import { ToolCall } from '../../contexts/chat';
import { useStatus } from '../../contexts/status';
import useApi from '../../hooks/api';
import { useEffect, useState } from 'react';
import { TOOL_CALLS_THAT_REQUIRE_CONFIRMATION, TOOL_CALL_FUNCTION_MAP } from '../../constants/toolCalls';
import { useThinking } from '../../contexts/thinking';
import { renderToolCallDescription } from './helpers';
import MessageBox from '../ChatMessage/MessageBox';

interface ToolCallProps {
    toolCalls: ToolCall[];
    runId: string;
    getMessages: () => void;
    chat_id: string;
}

const ToolCalls = ({ toolCalls, runId, getMessages, chat_id }: ToolCallProps) => {
    const { callApi } = useApi();
    const { setStatus } = useStatus();
    const [toolCallsToSubmit, setToolCallsToSubmit] = useState<ToolCall[]>([]);
    const { addChatThinking } = useThinking();

    // filter out the tool calls that don't need confirmation.
    const toolCallsToConfirm = toolCalls.filter(toolCall =>
        TOOL_CALLS_THAT_REQUIRE_CONFIRMATION.includes(
            toolCall.FunctionName as (typeof TOOL_CALLS_THAT_REQUIRE_CONFIRMATION)[number]
        )
    );
    const toolCallsNoConfirmationNeeded = toolCalls.filter(
        toolCall =>
            !TOOL_CALLS_THAT_REQUIRE_CONFIRMATION.includes(
                toolCall.FunctionName as (typeof TOOL_CALLS_THAT_REQUIRE_CONFIRMATION)[number]
            )
    );

    const allDeclined = toolCallsToSubmit.every(toolCall => toolCall.Status === 'declined');

    useEffect(() => {
        const toolCallsDefaultedToDeclined = toolCallsToConfirm.map(toolCall => {
            return { ...toolCall, Status: 'declined' };
        });
        setToolCallsToSubmit(toolCallsDefaultedToDeclined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [runId]);

    const handleToggleToolCall = (callId: string) => {
        const newToolCalls = toolCallsToSubmit.map(toolCall => {
            if (toolCall.Call_OpenAI_id === callId) {
                return { ...toolCall, Status: toolCall.Status === 'declined' ? 'completed' : 'declined' };
            }
            return toolCall;
        });
        setToolCallsToSubmit(newToolCalls);
    };

    const handleDeclineAll = async () => {
        const response = await callApi({
            url: `/api/runs/${runId}/`,
            method: 'delete',
            exposeError: true
        });
        if (!response) {
            return;
        }
        const { data } = response;

        if (data?.status !== 'success') {
            return setStatus({
                type: 'error',
                message: 'Error declining tool call'
            });
        }

        getMessages();
    };

    const handleToolCall = async () => {
        try {
            addChatThinking(chat_id, 10, Date.now());

            // any that don't need confirmation, we can just mark as completed so that Assistant will call them
            const noConfirmationNeeded = toolCallsNoConfirmationNeeded.map(toolCall => {
                return { ...toolCall, Status: 'completed' };
            });

            const allToolCalls = [...toolCallsToSubmit, ...noConfirmationNeeded];

            // compile a list of Call_OpenAI_ids to send to the backend
            const response = await callApi({
                url: `/api/runs/${runId}/toolCalls/`,
                method: 'post',
                exposeError: true,
                body: {
                    // prefer the var passed in, but if not there, use the state
                    toolCalls: allToolCalls
                }
            });
            if (!response) {
                return;
            }
            const { data } = response;
            if (data?.status !== 'success') {
                return setStatus({
                    type: 'error',
                    message: 'Error saving actions.'
                });
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: 'Error saving actions.'
            });
        } finally {
            getMessages();
        }
    };

    return (
        <div>
            <Grid
                container
                spacing={2}
                sx={{
                    width: '100%'
                }}
            >
                <Grid item xs={10}>
                    <MessageBox role='assistant'>
                        <Box sx={{ p: 2 }}>
                            <Typography>
                                Based on your input, we need your approval before performing the following actions.
                            </Typography>
                        </Box>
                        <Divider light />
                        <Box sx={{ p: 2 }}>
                            <Typography gutterBottom variant='body2'>
                                Approve the following actions:
                            </Typography>
                            <FormGroup>
                                {toolCallsToConfirm.map(toolCall => {
                                    return (
                                        <>
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
                                            <Typography variant='body2' color='textSecondary'>
                                                {renderToolCallDescription(toolCall)}
                                            </Typography>
                                        </>
                                    );
                                })}
                            </FormGroup>
                        </Box>
                        <Grid
                            container
                            spacing={2}
                            gap={2}
                            sx={{
                                p: 4
                            }}
                        >
                            <Button
                                sx={{ textTransform: 'none' }}
                                variant='contained'
                                color='primary'
                                onClick={() => handleToolCall()}
                                disabled={allDeclined}
                            >
                                Approve
                            </Button>
                            <Button
                                sx={{ textTransform: 'none' }}
                                variant='outlined'
                                color='error'
                                onClick={handleDeclineAll}
                            >
                                Decline
                            </Button>
                        </Grid>
                    </MessageBox>
                </Grid>
            </Grid>
        </div>
    );
};

export default ToolCalls;
