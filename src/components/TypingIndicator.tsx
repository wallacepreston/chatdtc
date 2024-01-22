import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Stack } from '@mui/material';
import theme from '../theme';

const typingAnimation = keyframes`
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
`;

const IndicatorDot = styled.span<{ delay: string; color?: string }>`
    display: inline-block;
    width: 4px;
    height: 4px;
    background-color: ${props => props.color || theme.palette.grey[400]};
    border-radius: 50%;
    margin-right: 2.5px;
    animation: ${typingAnimation} 1.5s infinite ease-in-out;
    animation-delay: ${props => props.delay};
`;

const StackContainer = styled(Stack)`
    width: 2.5em;
`;

const TypingIndicator = () => {
    return (
        <StackContainer direction='row' justifyContent='center' alignItems='center'>
            <IndicatorDot delay='0s' />
            <IndicatorDot delay='.2s' />
            <IndicatorDot delay='.4s' />
        </StackContainer>
    );
};

export default TypingIndicator;
