import React from 'react';
import { StyledButton } from './styled';
import { OpenInNew } from '@mui/icons-material';
import { Tooltip, Typography } from '@mui/material';
import useApi from '../../../hooks/api';
import { useStatus } from '../../../contexts/status';
interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    linkText: string;
    fileId: string;
    downloadEnabled?: boolean;
}
const LinkButton = ({ linkText, fileId, downloadEnabled }: Props) => {
    const { callApi } = useApi();
    const { setStatus } = useStatus();

    // If there was no authentication on the server, this big function would be unnecessary.
    const handleDownload = async (fileId: string) => {
        try {
            // 1. Send a GET request to the file endpoint with the auth header
            const response = await callApi({ url: `/api/chat/files/${fileId}`, responseType: 'blob' });

            if (!response) {
                return setStatus({
                    type: 'error',
                    message: 'Error downloading file'
                });
            }

            // 2. Check the response status
            if (response.status !== 200) {
                setStatus({
                    type: 'error',
                    message: response.statusText
                });
            }

            // 3. Extract the filename from the Content-Disposition header
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'file.csv'; // default filename
            if (contentDisposition) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            // 4. Create a Blob URL from the response data
            const url = window.URL.createObjectURL(response.data);

            // 5. Create a new <a> element and set its href to the Blob URL and its download attribute to the filename
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);

            // 6. Append the <a> element to the body and programmatically click it to start the download
            document.body.appendChild(link);
            link.click();

            // 7. Remove the <a> element from the body after the download has started
            document.body.removeChild(link);
        } catch (error) {
            setStatus({
                type: 'error',
                message: `${error}`
            });
        }
    };

    const renderButton = () => (
        <StyledButton
            variant='text'
            color='info'
            endIcon={<OpenInNew />}
            onClick={() => {
                if (!downloadEnabled) return;
                handleDownload(fileId);
            }}
        >
            <Typography sx={{ fontFamily: 'Noto Sans, sans-serif' }}>{linkText}</Typography>
        </StyledButton>
    );
    if (downloadEnabled) return renderButton();
    return (
        <Tooltip title='You do not have permission to download this file.' placement='top'>
            {renderButton()}
        </Tooltip>
    );
};

export default LinkButton;
