import { differenceInMinutes } from 'date-fns';
import { Button } from '@mui/material';
import { ToolCall } from '../../contexts/chat';
import { useStatus } from '../../contexts/status';
import useApi from '../../hooks/api';

interface ToolCallProps {
    toolCall: ToolCall;
}
const ToolCallComponent = ({ toolCall }: ToolCallProps) => {
    const { callApi } = useApi();
    const { setStatus } = useStatus();
    console.log('>>>>>>>>> toolCall', toolCall);
    if (toolCall.Status !== 'requires_action') {
        return null;
    }

    // if toolCall.Created_At is more than 10 minutes ago, show a message that the tool call has expired
    const createdAt = new Date(toolCall.Created_At);
    const now = new Date();

    if (differenceInMinutes(now, createdAt) > 10) {
        return null;
    }

    const handleToolCall = async () => {
        try {
            const response = await callApi({
                url: `/api/runs/toolCalls/${toolCall.Call_OpenAI_id}`,
                method: 'patch',
                exposeError: true,
                body: {
                    action: 'completed'
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
            {/* TODO - better UI for  */}
            <Button sx={{ fontSize: '2rem' }} onClick={handleToolCall}>
                {toolCall.FunctionName}
            </Button>
        </div>
    );
};

export default ToolCallComponent;
