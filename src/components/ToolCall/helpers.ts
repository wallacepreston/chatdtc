// import { TOOL_CALL_FUNCTION_MAP } from '../../constants/toolCalls';
import { ToolCall } from '../../contexts/chat';

export const TOOL_CALL_FUNCTION_MAP = {
    getCustomerTagsInCommerce7: 'Get Available Tags for Customers in Commerce7',
    tagCustomersCommerce7: 'Tag Customers in Commerce7',
    createCustomerTagInCommerce7: 'Create Customer Tag in Commerce7'
};

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
        case 'tagCustomersCommerce7':
            const numCustomers = parsedArguments?.customerNumbers?.length;
            if (!numCustomers || !parsedArguments.tagName) return 'Tag Customers in Commerce7';
            const sOrNoS = numCustomers === 1 ? '' : 's';

            fullDescription = `Tag ${numCustomers} customer${sOrNoS} in Commerce7, with Tag Name "${parsedArguments.tagName}"`;
            break;
        case 'createCustomerTagInCommerce7':
            fullDescription = `Create new Customer Tag in Commerce7, called "${parsedArguments.tagName}"`;
            break;
        default:
            fullDescription = `${functionDescription}`;
    }

    return fullDescription;
};
