import React, { useEffect } from 'react';
import '../App.css';
import { Typography, Button, Stack, Avatar } from '@mui/material';
import { useAuthUser } from 'react-auth-kit';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const auth = useAuthUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (auth()) {
            navigate('/');
        }
    });
    return (
        <div id='AuthPage' className='centered'>
            <Stack
                display='flex'
                justifyContent='center'
                textAlign='center'
                sx={{ position: 'relative', bottom: '30px' }}
            >
                <Stack direction='row' display='flex' justifyContent='center'>
                    <Avatar
                        sx={{
                            width: '10rem',
                            height: '10rem'
                        }}
                        src='/assets/logochatdtc-icon.png'
                    />
                </Stack>
                <Typography
                    variant='h4'
                    sx={{ fontFamily: 'Noto Sans, sans-serif', letterSpacing: '-1px', width: '350px', mb: '20px' }}
                >
                    <b>Welcome to ChatDTC</b>
                </Typography>
                <Typography variant='body1' sx={{ color: 'black', fontFamily: 'Noto Sans, sans-serif', mb: '10px' }}>
                    Log in with your WinePulse account to continue
                </Typography>
                <Stack direction='row' display='flex' justifyContent='center' sx={{ mt: '5px' }}>
                    <Button
                        variant='contained'
                        color='primary'
                        sx={{
                            textTransform: 'none',
                            top: '10px',
                            color: 'white',
                            height: '35px',
                            ml: '10px'
                        }}
                        href='/auth/login'
                    >
                        <Typography variant='body2' sx={{ fontFamily: 'Noto Sans, sans-serif' }}>
                            Log in
                        </Typography>
                    </Button>
                    {/* <Button
                        variant='contained'
                        sx={{ textTransform: 'none', bgcolor: '#00A67E', borderRadius: '0.25rem', height: '35px', ml: '10px', '&:hover': { backgroundColor: '#1A7F64' } }}
                        href='/auth/signup'>
                        <Typography variant='body2' sx={{ fontFamily: 'Noto Sans, sans-serif', color: 'black' }}>
                            Sign up
                        </Typography>
                    </Button> */}
                </Stack>
            </Stack>
        </div>
    );
};

export default AuthPage;
