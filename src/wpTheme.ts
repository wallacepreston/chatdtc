import { createTheme, Theme } from '@mui/material/styles';

let wpTheme: Theme = createTheme({
    palette: {
        primary: {
            main: '#00A67E'
        },
        secondary: {
            main: '#1A7F64'
        },
        error: {
            main: '#D00E17'
        },
        info: {
            main: '#000000'
        }
    }
});

wpTheme = createTheme(wpTheme, {
    // Custom colors created with augmentColor go here
    palette: {
        salmon: wpTheme.palette.augmentColor({
            color: {
                main: '#FF5733'
            },
            name: 'salmon'
        })
    }
});

export default wpTheme;
