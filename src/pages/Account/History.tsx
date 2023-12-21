import React, { useEffect } from 'react';
import useApi from '../../hooks/api';
import { Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

interface BillingLineItem {
    id: number;
    User_Id: string;
    Winery_Id: string;
    Thread_OpenAI_id: string;
    Debit?: number;
    Credit?: number;
    Notes?: string;
    Created_At: string;
    Updated_At: string;
}

const History = () => {
    const { data, loading, callApiLazy } = useApi();

    useEffect(() => {
        callApiLazy({ url: '/api/billing/line-items' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    console.log('>>> data.billingRows', data?.billingRows);
    console.log('>>> data.billingBalance', data?.billingBalance);

    const renderAmount = (row: BillingLineItem) => {
        const isDebit = row.Debit !== undefined;
        const amountToShow = row.Debit || row.Credit;
        return (
            <Typography color='error'>
                {isDebit && '-'}
                {amountToShow}
            </Typography>
        );
    };

    return (
        <Grid container gap={2} direction='column'>
            <Grid item>
                <Typography variant='h5'>Billing History</Typography>
            </Grid>
            <Grid item>
                <Table sx={{ minWidth: 650 }} size='small' aria-label='a dense table'>
                    <TableHead>
                        <TableRow>
                            <TableCell key='Thread'>Thread</TableCell>
                            <TableCell align='right' key='Amount'>
                                Amount
                            </TableCell>
                            <TableCell align='right' key='Notes'>
                                Notes
                            </TableCell>
                            <TableCell align='right' key='Time'>
                                Time
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.billingRows?.map((row: BillingLineItem) => (
                            <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component='th' scope='row'>
                                    {row.Thread_OpenAI_id}
                                </TableCell>
                                <TableCell align='right'>{renderAmount(row)}</TableCell>
                                <TableCell align='right'>{row.Notes}</TableCell>
                                <TableCell align='right'>{row.Updated_At}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Grid>
        </Grid>
    );
};

export default History;
