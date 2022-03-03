import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import cn from "classnames";

const RangeSlider = ({min, max, step, setRange }) => {
    const [value, setValue] = React.useState([min, max]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const returnValue = () => {
        setRange(value);
    }

    return (
        <Box>
            <Slider
                getAriaLabel={() => 'Temperature range'}
                value={value}
                onChange={handleChange}
                valueLabelDisplay="auto"
                getAriaValueText={returnValue}
                min={min}
                max={max}
                step={step}
            />
        </Box>
    );
}
export default RangeSlider;

