import React, { useEffect, useState } from 'react';
import WpModal from '../../wpModal';
import { Button, FormControlLabel, FormGroup, Grid, Stack, Switch, Typography } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { useStatus } from '../../../contexts/status';
import { REACT_APP_CLIENT_URL } from '../../../constants/api';
import useApi from '../../../hooks/api';
import { useChats } from '../../../contexts/chat';
import useClipboard from '../../../hooks/useClipboard';

interface ShareModalProps {
    open: boolean;
    handleClose: () => void;
    chatId: string;
}
const ShareModal = ({ open, handleClose, chatId }: ShareModalProps) => {
    const { setStatus } = useStatus();
    const { copyToClipboard } = useClipboard();
    const { callApi } = useApi();
    const { getChats } = useChats();
    const [isShared, setIsShared] = useState<boolean>(false);
    const [downloadsPublic, setDownloadsPublic] = useState<boolean>(true);

    const url = `${REACT_APP_CLIENT_URL}/share/${chatId}`;

    const getChat = async () => {
        const foundThread = await callApi({ url: `/api/chat/${chatId}`, method: 'get' });
        if (foundThread) {
            setDownloadsPublic(foundThread.Downloads_Public);
        }
    };

    useEffect(() => {
        if (open) getChat();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleShare = async () => {
        try {
            // set visibility to public
            const resp = await callApi({
                url: `/api/chat/${chatId}`,
                method: 'patch',
                body: { public: true, downloadsPublic }
            });

            if (resp?.status !== 'success') {
                setStatus({
                    type: 'error',
                    message: 'Error sharing chat'
                });
                return;
            }

            getChats();
        } catch (error) {
            setStatus({ type: 'error', message: 'Error sharing chat' });
        }

        copyToClipboard({
            textContent: url,
            successMessage: 'Link copied to clipboard.',
            errorMessage: 'Unable to copy chat link to clipboard. Please copy the link.'
        });
        setIsShared(true);
    };
    return (
        <WpModal title='Share link to Chat' open={open} onClose={handleClose}>
            <Grid
                item
                xs={12}
                md={12}
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}
            >
                <Stack>
                    <Typography>
                        <b>Anyone</b> with the URL will be able to view the shared chat.
                    </Typography>
                    {isShared && (
                        <>
                            <Typography sx={{ textAlign: 'center' }}>
                                <b>Share Link:</b>
                            </Typography>
                            <Typography sx={{ fontSize: '.8em' }}>{url}</Typography>
                        </>
                    )}
                    <br />
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={downloadsPublic}
                                    onChange={() => {
                                        setDownloadsPublic(!downloadsPublic);
                                        setIsShared(false);
                                    }}
                                    name='downloadsPublic'
                                />
                            }
                            label='Allow anyone to download files from this chat'
                        />
                    </FormGroup>
                    <br />
                    <Stack direction='row' display='flex' justifyContent='space-evenly'>
                        <Button variant='outlined' color='primary' onClick={handleClose}>
                            Cancel
                        </Button>
                        {isShared ? (
                            <Button variant='contained' color='primary' onClick={handleClose}>
                                Close
                            </Button>
                        ) : (
                            <Button
                                variant='contained'
                                color='primary'
                                onClick={handleShare}
                                startIcon={<ContentCopy />}
                            >
                                Copy Link & Share
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Grid>
        </WpModal>
    );
};

export default ShareModal;
