import { Box, Checkbox, Divider, FormControlLabel, FormGroup, Typography } from '@mui/material';
import { ToolCall } from '../../contexts/chat';
import { useStatus } from '../../contexts/status';
import useApi from '../../hooks/api';
import WpModal from '../wpModal';
import { useState } from 'react';

interface ToolCallProps {
    toolCalls: ToolCall[];
    runId: string;
}
const ToolCalls = ({ toolCalls, runId }: ToolCallProps) => {
    const { callApi } = useApi();
    const { setStatus } = useStatus();
    const [open, setOpen] = useState(true);
    console.log('>>>>>>>>> toolCalls', toolCalls);

    const handleClose = () => {
        setOpen(false);
    };

    const handleToolCall = async () => {
        try {
            // compile a list of Call_OpenAI_ids to send to the backend
            const callIds = toolCalls.map(toolCall => toolCall.Call_OpenAI_id);
            const response = await callApi({
                url: `/api/runs/${runId}/toolCalls/`,
                method: 'post',
                exposeError: true,
                body: {
                    // TODO - also conditionally call with 'declined' if the user clicks 'decline'?
                    action: 'completed',
                    callIds
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
        }
    };
    return (
        <div>
            {/* TODO - better UI for the different action options  */}
            {/* <Button sx={{ fontSize: '2rem' }} onClick={handleToolCall}>
                {toolCall.FunctionName}
            </Button> */}
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
                                    control={<Checkbox />}
                                    label={toolCall.FunctionName}
                                    onClick={handleToolCall}
                                />
                            );
                        })}
                    </FormGroup>
                </Box>
            </WpModal>
        </div>
    );
};

export default ToolCalls;
