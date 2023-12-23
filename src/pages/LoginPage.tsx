import React, { useEffect, useState } from 'react';
import { Stack, Typography, TextField, Button, Snackbar, Alert, IconButton } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import Visibility from '@mui/icons-material/VisibilityOutlined';
import VisibilityOff from '@mui/icons-material/VisibilityOffOutlined';
import axios from 'axios';
import { useSignIn } from 'react-auth-kit';
import { useNavigate } from 'react-router-dom';
import { CHAT_DTC_TITLE, REACT_APP_API_URL } from '../constants/api';
import { useUser } from '../contexts/user';
import { LockPerson } from '@mui/icons-material';

const LoginPage = () => {
    const signIn = useSignIn();
    const navigate = useNavigate();
    const { setUser } = useUser();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [incorrectPwdError, setIncorrectPwdError] = useState(false);
    const [emailNotRegisteredError, setUsernameNotRegisteredError] = useState(false);
    const [serverError, setServerError] = useState(false);
    const [emailNotVerifiedError, setUsernameNotVerifiedError] = useState(false);
    const [unknownError, setUnknownError] = useState(false);

    useEffect(() => {
        document.title = `Log in to ${CHAT_DTC_TITLE}`;
    }, []);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setUsername(value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setPassword(value);
    };

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await axios.post(`${REACT_APP_API_URL}/api/auth/login`, { username, password });
        if (res.data.message === 'Login successful') {
            if (
                signIn({
                    token: res.data.token,
                    expiresIn: 28800,
                    tokenType: 'Bearer',
                    authState: {
                        email: res.data.user.Email,
                        username: res.data.user.SamAccountName
                    }
                })
            ) {
                setUser(res?.data?.user);
                navigate('/');
            } else {
                console.log('Login failed');
                setUnknownError(true);
            }
        } else if (res.data.message === 'User not registered') {
            setUsernameNotRegisteredError(true);
        } else if (res.data.message === 'Incorrect password') {
            setIncorrectPwdError(true);
        } else if (res.data.message === 'Server error') {
            setServerError(true);
        } else {
            setUnknownError(true);
        }
    };

    const handleAlertClose = () => {
        setUsernameNotRegisteredError(false);
        setIncorrectPwdError(false);
        setServerError(false);
        setUsernameNotVerifiedError(false);
        setUnknownError(false);
    };

    return (
        <div
            id='LoginPage'
            style={{
                width: '100vw',
                height: '100vh',
                backgroundColor: 'white',
                display: 'flex',
                justifyContent: 'center'
            }}
        >
            <form autoComplete='off' onSubmit={handleConfirm}>
                <Stack
                    spacing={2}
                    direction='column'
                    textAlign='center'
                    alignItems='center'
                    sx={{ width: '100%', maxWidth: '350px', mt: '270px' }}
                >
                    <Typography variant='h3' sx={{ mb: '10px', pointerEvents: 'none', fontSize: '3rem' }}>
                        <LockPerson />
                    </Typography>
                    <Typography
                        variant='h4'
                        sx={{ fontFamily: 'Noto Sans, sans-serif', letterSpacing: '-1px', width: '350px', mb: '20px' }}
                    >
                        <b>Welcome back</b>
                    </Typography>
                    <ThemeProvider theme={theme}>
                        <TextField
                            id='username'
                            autoComplete='on'
                            value={username}
                            onChange={handleEmailChange}
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
            <Snackbar open={incorrectPwdError} autoHideDuration={8000} onClose={handleAlertClose}>
                <Alert onClose={handleAlertClose} severity='error' variant='filled'>
                    Incorrect password
                </Alert>
            </Snackbar>
            <Snackbar open={emailNotRegisteredError} autoHideDuration={8000} onClose={handleAlertClose}>
                <Alert onClose={handleAlertClose} severity='error' variant='filled'>
                    Email not registered
                </Alert>
            </Snackbar>
            <Snackbar open={serverError} autoHideDuration={8000} onClose={handleAlertClose}>
                <Alert onClose={handleAlertClose} severity='error' variant='filled'>
                    Server error
                </Alert>
            </Snackbar>
            <Snackbar open={emailNotVerifiedError} autoHideDuration={8000} onClose={handleAlertClose}>
                <Alert onClose={handleAlertClose} severity='error' variant='filled'>
                    Email not verified
                </Alert>
            </Snackbar>
            <Snackbar open={unknownError} autoHideDuration={8000} onClose={handleAlertClose}>
                <Alert onClose={handleAlertClose} severity='error' variant='filled'>
                    Unknown error
                </Alert>
            </Snackbar>
        </div>
    );
};

export default LoginPage;
