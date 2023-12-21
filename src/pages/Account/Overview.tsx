import { InfoOutlined } from '@mui/icons-material';
import { Grid, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '../../contexts/user';

const LinkWithNoDecoration = styled(Link)`
    font-weight: bold;
    color: inherit;
`;

const Overview = () => {
    const { user } = useUser();
    const { balance } = user;
    const isNegative = Number(balance) < 0;

    return (
        <Grid container gap={2} direction='column'>
            <Grid item>
                <Typography variant='h5'>Billing Overview</Typography>
            </Grid>
            <Grid item>
                <Grid container alignItems='center' gap={1}>
                    <Typography variant='h6'>Credit Balance</Typography>{' '}
                    <Tooltip
                        title={
                            <>
                                Your credit balance will be consumed as you use the API. Visit the{' '}
                                <LinkWithNoDecoration to='/account/billing/history'>History</LinkWithNoDecoration> page
                                to view a breakdown of your consumption.
                            </>
                        }
                    >
                        <InfoOutlined sx={{ fontSize: '16px' }} />
                    </Tooltip>
                </Grid>
            </Grid>
            <Grid item>
                <Typography variant='h4' color={isNegative ? 'error' : ''}>
                    ${balance}
                </Typography>
            </Grid>
        </Grid>
    );
};

export default Overview;
