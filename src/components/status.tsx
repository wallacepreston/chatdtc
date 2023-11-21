import React from 'react';
import { useStatus } from '../contexts/status';
import { Alert, Snackbar } from '@mui/material';

function Status() {
  const { status, setStatus } = useStatus()
  const {
    type,
    message
  } = status;

  const handleClose = (event?: Event | React.SyntheticEvent<any, Event>, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setStatus({
      type: null,
      message: null
    });
  };

  return (
    <Snackbar open={type !== null} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{vertical: 'top', horizontal: 'right'}}>
            <Alert onClose={handleClose} severity={type || 'error'} variant='filled'>
                {message}
            </Alert>
        </Snackbar>
  );
}

export default Status;
