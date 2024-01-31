import { Alert, AlertColor, Box, Button, Grid, Snackbar, Typography } from '@mui/material';
import { Notification } from '../../contexts/user';

interface Props {
    notification: Notification;
    handleAcknowledge: (id: number) => Promise<void>;
}
const NotificationItem = ({ notification, handleAcknowledge }: Props) => {
    const handleClose = () => {
        handleAcknowledge(notification.id);
    };

    // default type to banner, and make it case insensitive
    let notificationType = notification.Type || 'banner';
    notificationType = notificationType.toLowerCase();

    const bannerAlert = (
        <Snackbar
            open={true}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center'
            }}
        >
            <Alert
                onClose={handleClose}
                severity={(notification.Severity as AlertColor | undefined) || 'info'}
                sx={{ width: '100%' }}
            >
                {notification.Content}
            </Alert>
        </Snackbar>
    );

    const modalAlert = (
        <Snackbar
            open={true}
            sx={{ height: '100%' }}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center'
            }}
        >
            <Alert severity={(notification.Severity as AlertColor | undefined) || 'info'} sx={{ width: '100%' }}>
                <Box sx={{ width: '350px' }}>
                    <Typography id='modal-modal-title'>Notification</Typography>
                    <div id='modal-modal-description' style={{ marginTop: '12px' }}>
                        {notification.Content}
                    </div>
                </Box>

                <Grid container gap={2} mt={2} direction='row' justifyContent='flex-end'>
                    <Button variant='outlined' color='primary' onClick={handleClose}>
                        OK
                    </Button>
                </Grid>
            </Alert>
        </Snackbar>
    );

    switch (notificationType) {
        case 'modal': {
            return modalAlert;
        }
        default: {
            return bannerAlert;
        }
    }
};

export default NotificationItem;
