import { Button } from '@mui/material';
import styled from 'styled-components';

export const StyledButton = styled(Button)`
    text-transform: none;
    margin-left: 1rem;
    border-radius: 5px;
    justify-content: left;
    &:hover {
        text-decoration: underline;
    }
`;
