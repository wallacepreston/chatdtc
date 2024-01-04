import { Box } from '@mui/material';
import styled from 'styled-components';

export const StyledModalBox = styled(Box)`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 400px;
    max-width: 500px;
    background-color: #fff;
    box-shadow: 0px 0px 24px rgba(0, 0, 0, 0.15); /* Assuming '24' is the blur radius and the color is black with 15% opacity */
    padding: 16px; /* Assuming '4' is a spacing unit equivalent to 16px */
`;
