import { createTheme, Theme } from '@mui/material/styles';

let theme: Theme = createTheme({
    palette: {
        primary: {
            main: '#142F44', // dark blue
            light: '#e4edf6' // light blue
        },
        secondary: {
            main: '#CfCfCf' // light grey
        },
        error: {
            main: '#D00E17'
        },
        info: {
            main: '#000000'
        }
    }
});

export default theme;
