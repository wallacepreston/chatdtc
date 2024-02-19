import theme from '../../theme';

interface MessageBoxProps {
    children: React.ReactNode;
    role: string;
}

const MessageBox = ({ children, role }: MessageBoxProps) => {
    return (
        <div
            style={{
                backgroundColor: role === 'assistant' ? theme.palette.primary.light : theme.palette.grey[200],
                borderRadius: '10px',
                marginBottom: '15px',
                marginTop: '15px',
                padding: '1rem'
            }}
        >
            {children}
        </div>
    );
};

export default MessageBox;
