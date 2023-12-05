import { useAuthHeader } from 'react-auth-kit';
import WpModal from './wpModal';
import { REACT_APP_API_URL } from '../constants/api';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button, FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import { useUser } from '../contexts/user';
import { LoadingButton } from '@mui/lab';

interface Group {
    SamAccountName: string;
    SamGroupName: string;
}

const SelectWineryModal = () => {
    const authHeader = useAuthHeader();
    const { user, setUser } = useUser();
    const { selectedWinery } = user;
    console.log({ selectedWinery });
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (event: any) => {
        setSelectedGroup(event.target.value as string);
    };

    const handleChooseWinery = async () => {
        setLoading(true);
        const res = await axios.post(
            `${REACT_APP_API_URL}/api/auth/winery`,
            { selectedWinery: selectedGroup },
            {
                headers: {
                    Authorization: authHeader()
                }
            }
        );
        console.log({ res });
        setUser({
            ...user,
            selectedWinery: res.data.user.SelectedWinery
        });
        setLoading(false);
        // update winery context to include new winery
    };

    // get list of wineries using /api/auth/me
    useEffect(() => {
        if (selectedWinery) {
            return;
        }
        const getUserData = async () => {
            const res = await axios.get(`${REACT_APP_API_URL}/api/auth/me`, {
                headers: {
                    Authorization: authHeader()
                }
            });
            console.log({ res });
            const groups = res?.data?.user?.Groups;
            if (groups) {
                // get the list of groups from the response
                console.log({ groups });
                setGroups(groups);
            }
        };
        getUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedWinery]);
    // once selectedWinery is set, close modal

    if (!selectedWinery) {
        return (
            <WpModal title='Please Select a Winery' open={!selectedWinery} onClose={() => {}}>
                <p>You have not selected a winery yet. Please select a winery from the list below.</p>
                <FormControl fullWidth>
                    <InputLabel id='demo-simple-select-label'>Winery</InputLabel>
                    <Grid container direction='column' alignItems='left' spacing={2}>
                        <Grid item xs={12} md={12}>
                            <Select
                                labelId='demo-simple-select-label'
                                id='demo-simple-select'
                                value={selectedGroup}
                                label='Winery'
                                onChange={handleChange}
                                sx={{
                                    width: '100%'
                                }}
                            >
                                {groups.map(group => {
                                    return <MenuItem value={group.SamGroupName}>{group.SamGroupName}</MenuItem>;
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
