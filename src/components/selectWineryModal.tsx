import { useAuthHeader, useAuthUser } from 'react-auth-kit';
import WpModal from './wpModal';
import { REACT_APP_API_URL } from '../constants/api';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import { useUser } from '../contexts/user';
import { LoadingButton } from '@mui/lab';
import { useChats } from '../contexts/chat';
import { useNavigate } from 'react-router-dom';

const SelectWineryModal = () => {
    const authHeader = useAuthHeader();
    const { user, setUser } = useUser();
    const { Last_Winery_id: lastWineryId } = user;
    const auth = useAuthUser();
    const isAuthenticated = Boolean(auth());
    const [chosenWineryId, setChosenWineryId] = useState('');
    const [loading, setLoading] = useState(false);
    const { getChats } = useChats();
    const navigate = useNavigate();

    const wineries = user.Wineries;

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

    if (!lastWineryId) {
        return (
            <WpModal title='Please Select a Winery' open={!lastWineryId && isAuthenticated} onClose={() => {}}>
                <p>Please select a winery about which to have a conversation.</p>
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
                                    return <MenuItem value={group.Winery_id}>{group.Winery_Name}</MenuItem>;
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
                </FormControl>
            </WpModal>
        );
    }

    return null;
};

export default SelectWineryModal;
