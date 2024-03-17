import { useAuthHeader, useAuthUser } from 'react-auth-kit';
import WpModal from './wpModal';
import { REACT_APP_API_URL } from '../constants/api';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button, FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import { useUser } from '../contexts/user';
import { LoadingButton } from '@mui/lab';
import { useChats } from '../contexts/chat';
import { useNavigate } from 'react-router-dom';
import { useStatus } from '../contexts/status';

const SelectWineryModal = () => {
    const authHeader = useAuthHeader();
    const { user, setUser, getUser } = useUser();
    const { Last_Winery_id: lastWineryId } = user;
    const auth = useAuthUser();
    const isAuthenticated = Boolean(auth());
    const { setStatus } = useStatus();
    const [chosenWineryId, setChosenWineryId] = useState('');
    const [loading, setLoading] = useState(false);
    const { getChats } = useChats();
    const navigate = useNavigate();

    const wineries = user.WineriesChatDTC;

    const handleChange = (event: any) => {
        setChosenWineryId(event.target.value as string);
    };

    const handleChooseWinery = async () => {
        setLoading(true);
        const res = await axios.post(
            `${REACT_APP_API_URL}/api/auth/winery`,
            { lastWineryId: chosenWineryId },
            {
                headers: {
                    Authorization: authHeader()
                }
            }
        );
        // assuming all went well, get the chats again
        await getChats();

        setUser({
            ...user,
            LastWinery: res.data.user.LastWinery,
            Last_Winery_id: res.data.user.Last_Winery_id
        });
        navigate('/');
        setLoading(false);
        const wineryName = res.data.user.LastWinery.Winery_Name;
        setStatus({ type: 'success', message: `Switched winery to ${wineryName}` });
        // update winery context to include new winery
    };

    // get list of wineries using /api/auth/me
    useEffect(() => {
        if (lastWineryId) {
            return;
        }

        const Authorization = authHeader();

        if (!Authorization) {
            return;
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastWineryId]);
    // once lastWineryId is set, close modal

    const handleCancel = () => {
        getUser();
        setStatus({ type: 'info', message: 'Selected Winery not changed' });
    };

    if (!lastWineryId) {
        return (
            <WpModal title='Please Select a Winery' open={!lastWineryId && isAuthenticated} onClose={handleCancel}>
                <FormControl fullWidth>
                    <InputLabel id='demo-simple-select-label'>Winery</InputLabel>
                    <Grid container direction='column' alignItems='left' spacing={2}>
                        <Grid item xs={12} md={12}>
                            <Select
                                labelId='demo-simple-select-label'
                                id='demo-simple-select'
                                value={chosenWineryId}
                                label='Winery'
                                onChange={handleChange}
                                sx={{
                                    width: '100%'
                                }}
                            >
                                {wineries?.map(group => {
                                    return (
                                        <MenuItem key={group.Winery_id} value={group.Winery_id}>
                                            {group.Winery_Name}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </Grid>
                        <Grid
                            item
                            xs={12}
                            md={12}
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end'
                            }}
                        >
                            <Grid container gap={2} direction='row' justifyContent='flex-end'>
                                <Button variant='outlined' color='primary' onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <LoadingButton
                                    disabled={!chosenWineryId}
                                    loading={loading}
                                    variant='contained'
                                    color='primary'
                                    onClick={handleChooseWinery}
                                >
                                    Save
                                </LoadingButton>
                            </Grid>
                        </Grid>
                    </Grid>
                </FormControl>
            </WpModal>
        );
    }

    return null;
};

export default SelectWineryModal;
