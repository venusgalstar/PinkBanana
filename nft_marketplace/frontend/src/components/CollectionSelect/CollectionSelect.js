import * as React from 'react';
import { useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import axios from "axios";
import config from "../../config";
import styles from "./CollectionList.module.sass";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';

function sleep(delay = 0) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}

const ColorModeContext = React.createContext({ CollectionSelect: () => { } });

const CollectionSelect = ({ selected }) => {
    const [open, setOpen] = React.useState(false);
    const [options, setOptions] = React.useState([]);
    // const loading = open && options.length === 0;
    const loading = false;
    const [value, setValue] = React.useState();

    const [mode, setMode] = React.useState('light');
    const colorMode = React.useContext(ColorModeContext);
    const globalThemeMode = useSelector(state => state.user.themeMode);

    useEffect(() => {
        setMode(globalThemeMode);
    }, [globalThemeMode])

    useEffect(() => {
        let thmode = localStorage.getItem("darkMode");
        if (thmode.toString() === "true") setMode('dark');
        else setMode('light');
    }, [])

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                },
                components: {
                    MuiOutlinedInput: {
                        styleOverrides: {
                            notchedOutline: {
                                border: 'none !important'
                            }
                        }
                    }
                }
            }),
        [mode],
    );

    useEffect(() => {
        // console.log("changed value:", value);
        axios.post(`${config.baseUrl}collection/get_collection_names`, { name: "", /*limit: 20*/ })
            .then((data) => {
                setOptions([...data.data.list]);
            })
    // }, [value])
    }, []);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <Autocomplete
                    id="asynchronous-collection"
                    // sx={{ width: 300 }}
                    className={styles.collectionList}
                    open={open}
                    onOpen={() => {
                        setOpen(true);
                    }}
                    onClose={() => {
                        setOpen(false);
                    }}
                    onChange={(e, v) => { setValue(v); selected(v); }}
                    isOptionEqualToValue={(option, value) => option.name === value.name}
                    getOptionLabel={(option) => option.name}
                    options={options}
                    loading={loading}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            className={styles.collectionText}
                            // label="Collection"
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <React.Fragment>
                                        {/* {loading ? <CircularProgress color="inherit" size={20} /> : null} */}
                                        {params.InputProps.endAdornment}
                                    </React.Fragment>
                                ),
                            }}
                        />
                    )}
                />
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

export default CollectionSelect;
