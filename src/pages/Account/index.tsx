import { Link, useParams, Navigate } from 'react-router-dom';
import { Tabs, Tab, Typography, Divider } from '@mui/material';
import { useState } from 'react';
import styled from 'styled-components';
import Overview from './Overview';
import History from './History';

const AccountPageElem = styled.div`
    & > * {
        padding-left: 32px;
    }
`;

const ContentElem = styled.div`
    padding: 32px;
`;

function AccountPage() {
    const [width] = useState<number>(window.innerWidth);
    const baseUrl = '/account/billing';

    const { tab = 'overview' } = useParams();

    const tabs = {
        overview: {
            component: <Overview />
        },
        history: {
            component: <History />
        }
    };

    const allowedTabs = Object.keys(tabs);

    if (!allowedTabs.includes(tab)) {
        return <Navigate to={`${baseUrl}/overview`} />;
    }

    const handleMainWidth = () => {
        if (width > 1000) {
            return 'calc(100vw - 260px)';
        } else {
            return '100vw';
        }
    };
    return (
        <AccountPageElem
            id='main'
            style={{
                width: handleMainWidth(),
                overflowY: 'auto'
            }}
        >
            <Typography
                variant='h4'
                style={{
                    marginTop: width > 1000 ? '' : '40px',
                    padding: '16px 0 0 32px'
                }}
            >
                Billing Settings
            </Typography>
            <Tabs value={tab}>
                <Tab label='Overview' value='overview' component={Link} to={`${baseUrl}/overview`} />
                <Tab label='History' value='history' component={Link} to={`${baseUrl}/history`} />
            </Tabs>
            <Divider />
            <ContentElem>{tabs[tab as 'overview' | 'history']?.component}</ContentElem>
        </AccountPageElem>
    );
}

export default AccountPage;
