import { TOOL_CALL_FUNCTION_MAP } from '../../../constants/toolCalls';
import { ToolCall } from '../../../contexts/chat';
import { renderToolCallDescription } from '../helpers';

describe('renderToolCallDescription', () => {
    describe('tagCustomersCommerce7', () => {
        it('should handle 1 customer with a tagName', () => {
            const toolCall: Partial<ToolCall> = {
                FunctionName: 'tagCustomersCommerce7',
                Arguments: JSON.stringify({ customerNumbers: ['1'], tagName: 'test' })
            };

            expect(renderToolCallDescription(toolCall)).toBe('Tag 1 customer in Commerce7, with Tag Name "test"');
        });
        it('should handle 3 customers with a tagName', () => {
            const toolCall: Partial<ToolCall> = {
                FunctionName: 'tagCustomersCommerce7',
                Arguments: JSON.stringify({ customerNumbers: ['1', '2', '3'], tagName: 'test' })
            };

            expect(renderToolCallDescription(toolCall)).toBe('Tag 3 customers in Commerce7, with Tag Name "test"');
        });
        it('0 customers with a tagName: Should just return function description', () => {
            const toolCall: Partial<ToolCall> = {
                FunctionName: 'tagCustomersCommerce7',
                Arguments: JSON.stringify({ customerNumbers: [], tagName: 'test' })
            };

            expect(renderToolCallDescription(toolCall)).toBe('Tag Customers in Commerce7');
        });
    });

    describe('createCustomerTagInCommerce7', () => {
        it('should handle `test` tagName', () => {
            const toolCall: Partial<ToolCall> = {
                FunctionName: 'createCustomerTagInCommerce7',
                Arguments: JSON.stringify({ tagName: 'test' })
            };

            expect(renderToolCallDescription(toolCall)).toBe('Create new Customer Tag in Commerce7, called "test"');
        });
    });

    it('all other cases: Should return function map description', () => {
        const toolCall: Partial<ToolCall> = {
            FunctionName: 'getCustomerTagsInCommerce7',
            Arguments: JSON.stringify({})
        };

        expect(renderToolCallDescription(toolCall)).toBe(
            TOOL_CALL_FUNCTION_MAP['getCustomerTagsInCommerce7' as keyof typeof TOOL_CALL_FUNCTION_MAP]
        );
    });
    describe('edge cases', () => {
        it('should handle empty arguments', () => {
            const toolCall: Partial<ToolCall> = {
                FunctionName: 'tagCustomersCommerce7',
                Arguments: JSON.stringify({})
            };

            expect(renderToolCallDescription(toolCall)).toBe('Tag Customers in Commerce7');
        });

        it('should handle null arguments', () => {
            const toolCall: Partial<ToolCall> = {
                FunctionName: 'tagCustomersCommerce7',
                Arguments: JSON.stringify(null)
            };

            expect(renderToolCallDescription(toolCall)).toBe('Tag Customers in Commerce7');
        });

        it('should handle undefined FunctionName', () => {
            const toolCall: Partial<ToolCall> = {
                FunctionName: undefined,
                Arguments: JSON.stringify({ customerNumbers: ['1', '2', '3'], tagName: 'test' })
            };

            expect(renderToolCallDescription(toolCall)).toBe('(no description available)');
        });

        it('should handle non-existent FunctionName', () => {
            const toolCall: Partial<ToolCall> = {
                FunctionName: 'nonExistentFunction',
                Arguments: JSON.stringify({ customerNumbers: ['1', '2', '3'], tagName: 'test' })
            };

            expect(renderToolCallDescription(toolCall)).toBe('(no description available)');
        });
    });
});
