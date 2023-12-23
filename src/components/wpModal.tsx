import { Modal, Typography } from '@mui/material';
import { StyledModalBox } from './styled';

const WpModal = ({
    open,
    onClose,
    title,
    children
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby='modal-modal-title'
            aria-describedby='modal-modal-description'
        >
            <StyledModalBox>
                <Typography id='modal-modal-title' variant='h6' component='h2'>
                    {title}
                </Typography>
                <div id='modal-modal-description' style={{ marginTop: '12px' }}>
                    {children}
                </div>
            </StyledModalBox>
        </Modal>
    );
};

export default WpModal;
