import React, { useEffect, useState } from 'react';
import { Stack, Typography, TextField, Button, IconButton } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import Visibility from '@mui/icons-material/VisibilityOutlined';
import VisibilityOff from '@mui/icons-material/VisibilityOffOutlined';
import { useSignIn } from 'react-auth-kit';
import { useNavigate } from 'react-router-dom';
import { CHAT_DTC_TITLE } from '../constants/api';
import { useUser } from '../contexts/user';
import { LockPerson } from '@mui/icons-material';
import useApi from '../hooks/api';
import { useStatus } from '../contexts/status';

const LoginPage = () => {
    const signIn = useSignIn();
    const navigate = useNavigate();
    const { setUser } = useUser();
    const { setStatus } = useStatus();
    const { callApi } = useApi();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        document.title = `Log in to ${CHAT_DTC_TITLE}`;
    }, []);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setUsername(value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setPassword(value);
    };

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        const loginRes = await callApi({
            url: `/api/auth/login`,
            body: { username, password },
            method: 'POST'
        });

        if (!loginRes) {
            setStatus({ type: 'error', message: 'Error with Login' });
            return;
        }

        const { data } = loginRes;

        if (!data || !data.message) {
            setStatus({ type: 'error', message: 'Error with Login' });
        } else if (data.message === 'Login successful') {
            if (
                signIn({
                    token: data.token,
                    expiresIn: 28800,
                    tokenType: 'Bearer',
                    authState: {
                        email: data.user.Email,
                        username: data.user.SamAccountName
                    }
                })
            ) {
                setUser(data?.user);
                navigate('/');
            } else {
                console.log('Login failed');
                setStatus({ type: 'error', message: 'Error with Login' });
            }
        } else if (data.message === 'Incorrect username or password') {
            setStatus({ type: 'error', message: 'Incorrect username or password' });
        } else if (data.message === 'Server error') {
            setStatus({ type: 'error', message: 'Server error' });
        } else {
            setStatus({ type: 'error', message: 'Error with Login' });
        }
    };

    return (
        <div
            id='LoginPage'
            style={{
                width: '100vw',
                height: '100dvh',
                backgroundColor: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <form autoComplete='on' onSubmit={handleConfirm}>
                <Stack
                    spacing={2}
                    direction='column'
                    textAlign='center'
                    alignItems='center'
                    sx={{ width: '100%', maxWidth: '350px' }}
                >
                    <Typography variant='h3' sx={{ mb: '10px', pointerEvents: 'none', fontSize: '3rem' }}>
                        <LockPerson />
                    </Typography>
                    <Typography
                        variant='h4'
                        sx={{ fontFamily: 'Noto Sans, sans-serif', letterSpacing: '-1px', width: '350px', mb: '20px' }}
                    >
                        <b>Update Password</b>
                    </Typography>
                    <ThemeProvider theme={theme}>
                        <TextField
                            id='username'
                            autoComplete='on'
                            value={username}
                            onChange={handleUsernameChange}
                            type='text'
                            label='Username'
                            variant='outlined'
                            color='primary'
                            sx={{ width: 'calc(100% - 20px)' }}
                        />
                        <TextField
                            id='password'
                            autoComplete='on'
                            value={password}
                            onChange={handlePasswordChange}
                            type={showPassword ? 'text' : 'password'}
                            label='Password'
                            variant='outlined'
                            color='primary'
                            sx={{ width: 'calc(100% - 20px)' }}
                            InputProps={{
                                endAdornment: (
                                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? (
                                            <VisibilityOff fontSize='small' />
                                        ) : (
                                            <Visibility fontSize='small' />
                                        )}
                                    </IconButton>
                                )
                            }}
                        />
                        <Button
                            variant='contained'
                            type='submit'
                            color='primary'
                            sx={{
                                width: 'calc(100% - 20px)',
                                height: '50px',
                                top: '10px'
                            }}
                        >
                            Continue
                        </Button>
                        {/* <Typography variant='body2' sx={{ fontFamily: 'Noto Sans, sans-serif', position: 'relative', top: '10px' }}>
                            Don't have an account?{' '}
                            <Link color='primary' href='/auth/signup' sx={{ textDecoration: 'none' }}>
                                Sign up
                            </Link>
                        </Typography> */}
                    </ThemeProvider>
                </Stack>
            </form>
        </div>
    );
};

export default LoginPage;
