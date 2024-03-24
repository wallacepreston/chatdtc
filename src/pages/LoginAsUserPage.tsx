import { useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { useSignIn } from 'react-auth-kit';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/user';
import { useStatus } from '../contexts/status';
import axios from 'axios';
import { REACT_APP_API_URL } from '../constants/api';

const LoginAsUserPage = () => {
    const signIn = useSignIn();
    const navigate = useNavigate();
    const { setUser, setNotifications } = useUser();
    const { setStatus } = useStatus();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    useEffect(() => {
        const loginAsUser = async () => {
            const loginRes = await axios({
                url: `${REACT_APP_API_URL}/api/auth/me`,
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!loginRes) {
                setStatus({ type: 'error', message: 'Error with Login' });
                return;
            }

            const { data } = loginRes;

            if (!data || !data.message) {
                setStatus({ type: 'error', message: 'Error with Login' });
            } else if (data.message === 'User data retrieved') {
                if (
                    signIn({
                        token: token as string,
                        expiresIn: 28800,
                        tokenType: 'Bearer',
                        authState: {
                            email: data.user.Email,
                            username: data.user.SamAccountName
                        }
                    })
                ) {
                    setUser(data?.user);
                    setNotifications(data?.notifications);
                    navigate('/');
                } else {
                    console.log('Login failed');
                    setStatus({ type: 'error', message: 'Error with Login' });
                }
            }
        };
        loginAsUser();
    }, [navigate, setNotifications, setStatus, setUser, signIn, token]);

    return <CircularProgress />;
};

export default LoginAsUserPage;
