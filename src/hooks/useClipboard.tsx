import { useStatus } from '../contexts/status';

const useClipboard = () => {
    const { setStatus } = useStatus();
    const copyToClipboard = async ({
        textContent: text,
        successMessage,
        errorMessage
    }: {
        textContent: string;
        successMessage?: string;
        errorMessage?: string;
    }) => {
        try {
            await navigator.clipboard.writeText(text);
            setStatus({ type: 'success', message: successMessage || 'Text copied to clipboard.' });
        } catch (error) {
            setStatus({ type: 'error', message: 'Unable to copy chat link to clipboard. Please copy the link.' });
        }
    };

    return { copyToClipboard };
};

export default useClipboard;
