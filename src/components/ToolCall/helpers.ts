import { isBefore, isAfter } from 'date-fns';
import { Run, ToolCall } from '../../contexts/chat';
import { TOOL_CALL_FUNCTION_MAP } from '../../constants/toolCalls';
import { Message } from '../ChatMessage';

export const NO_DESCRIPTION_AVAILABLE = '(no description available)';

export const renderToolCallDescription = (toolCall: Partial<ToolCall>) => {
    const { FunctionName } = toolCall;
    const parsedArguments = JSON.parse(toolCall.Arguments || '{}');
    const functionDescription = TOOL_CALL_FUNCTION_MAP[FunctionName as keyof typeof TOOL_CALL_FUNCTION_MAP];
    let fullDescription = '';

    if (!FunctionName || !TOOL_CALL_FUNCTION_MAP[FunctionName as keyof typeof TOOL_CALL_FUNCTION_MAP])
        return NO_DESCRIPTION_AVAILABLE;

    switch (FunctionName) {
        case undefined:
            fullDescription = NO_DESCRIPTION_AVAILABLE;
            break;
        case 'tagCustomersCommerce7Internal':
            const numCustomers = parsedArguments?.objectCount;
            if (!numCustomers || !parsedArguments.tagName) return 'Tag Customers in Commerce7';
            const sOrNoS = numCustomers === 1 ? '' : 's';

            fullDescription = `Tag ${numCustomers} customer${sOrNoS} in Commerce7, with Tag Name "${decodeURI(
                parsedArguments.tagName
            )}"`;
            break;
        case 'tagOrdersCommerce7Internal':
            const numOrders = parsedArguments?.objectCount;
            if (!numOrders || !parsedArguments.tagName) return 'Tag Orders in Commerce7';
            const sOrNoSOrders = numOrders === 1 ? '' : 's';

            fullDescription = `Tag ${numOrders} order${sOrNoSOrders} in Commerce7, with Tag Name "${decodeURI(
                parsedArguments.tagName
            )}"`;
            break;
        case 'createOrderTagInCommerce7':
            fullDescription = `Create new Order Tag in Commerce7, called "${decodeURI(parsedArguments.tagName)}"`;
            break;
        case 'createCustomerTagInCommerce7':
            fullDescription = `Create new Customer Tag in Commerce7, called "${decodeURI(parsedArguments.tagName)}"`;
            break;
        default:
            fullDescription = `${functionDescription}`;
    }

    return fullDescription;
};

export const getCompletedToolCalls = (runs: Run[]): ToolCall[] => {
    return runs.reduce((acc: ToolCall[], run) => {
        if (run.ToolCalls) {
            run.ToolCalls.forEach(toolCall => {
                if (toolCall.Status === 'completed' || toolCall.Status === 'declined') {
                    acc.push(toolCall);
                }
            });
        }
        return acc;
    }, []);
};

export const getToolCallsForMessage = (
    completedToolCalls: ToolCall[],
    message: Message,
    nextMessage: Message | undefined
): ToolCall[] => {
    return completedToolCalls.filter(toolCall => {
        return (
            isAfter(new Date(toolCall.Updated_At), new Date(message.Created_Date || Date.now())) &&
            isBefore(new Date(toolCall.Updated_At), new Date(nextMessage?.Created_Date || Date.now()))
        );
    });
};
