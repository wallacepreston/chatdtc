import { Box, Button, Checkbox, Divider, FormControlLabel, FormGroup, Typography } from '@mui/material';
import { ToolCall } from '../../contexts/chat';
import { useStatus } from '../../contexts/status';
import useApi from '../../hooks/api';
import WpModal from '../wpModal';
import { useEffect, useState } from 'react';

interface ToolCallProps {
    toolCalls: ToolCall[];
    runId: string;
}
const ToolCalls = ({ toolCalls, runId }: ToolCallProps) => {
    const { callApi } = useApi();
    const { setStatus } = useStatus();
    const [open, setOpen] = useState(true);
    const [toolCallsToSubmit, setToolCallsToSubmit] = useState<ToolCall[]>([]);

    useEffect(() => {
        setOpen(true);
    }, [runId]);

    useEffect(() => {
        const toolCallsDefaultedToDeclined = toolCalls.map(toolCall => {
            return { ...toolCall, Status: 'declined' };
        });
        setToolCallsToSubmit(toolCallsDefaultedToDeclined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const handleToolCall = async () => {
        try {
            // compile a list of Call_OpenAI_ids to send to the backend
            const response = await callApi({
                url: `/api/runs/${runId}/toolCalls/`,
                method: 'post',
                exposeError: true,
                body: {
                    toolCalls: toolCallsToSubmit
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
                message: 'Tool call executed successfully'
            });
        } catch (error) {
            setStatus({
                type: 'error',
                message: 'Error executing tool call'
            });
        } finally {
            handleClose();
        }
    };
    return (
        <div>
            <WpModal title='Recommended Actions' open={open} onClose={handleClose}>
                <Box sx={{ p: 2 }}>
                    <Typography color='text.secondary' variant='body2'>
                        Based on the conversation, we recommend the following actions that need confirmation to be
                        executed.
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
                                    control={<Checkbox onClick={() => handleToggleToolCall(toolCall.Call_OpenAI_id)} />}
                                    label={toolCall.FunctionName}
                                />
                            );
                        })}
                    </FormGroup>
                </Box>
                <Box sx={{ p: 2 }}>
                    <Button sx={{ textTransform: 'none' }} onClick={handleToolCall}>
                        Execute These Actions
                    </Button>
                </Box>
                <Divider light />
                <Box sx={{ p: 2 }}>
                    <Typography gutterBottom variant='body2'>
                        <b>NOTE:</b> These actions will be executed immediately.
                    </Typography>
                </Box>
            </WpModal>
        </div>
    );
};

export default ToolCalls;
