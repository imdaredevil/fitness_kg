import React, { useState } from "react";
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Box } from "@mui/material";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function CheckboxesTags(props) {
  const key = props.keyname;
  const label = props.label || "name";
  const defaultValue = props.defaultValue || [{ [key]: "Select All", [label]: "Select All" }]
  const options = [ { [key]: "Select All", [label]: "Select All" }, ...props.options]
  const [selectedOption, setSelectedOption] = useState([{ [key]: "Select All", [label]: "Select All" }]);
  const onChange = (e, option, action) => {
    setSelectedOption(option);
    const values = option.map((x) => x[key])
    if(values.indexOf('Select All') > -1) {
      props.setSelected(options.map((x) => x[key]))
    } else {
      props.setSelected(values)
    }
  }
  return (
    <Box sx={{ padding: "2%" }}>
    <Autocomplete
      multiple
      id="checkboxes-tags"
      options={options}
      disableCloseOnSelect
      onChange={onChange}
      isOptionEqualToValue={
        (option1, option2) => (option1[key] == option2[key])
      }
      getOptionLabel={option => option[label]}
      renderOption={(props, option, state) => {
        const selectOptionIndex = selectedOption.findIndex(
          opt => {
            return (opt[key].toLowerCase() === "select all");
          });
        if (selectOptionIndex > -1) {
          state.selected = true;
        }
        return (
          <li
            {...props}
          >
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={state.selected}
            />
            {option.name}
            <br></br>
          </li>
        );
      }}
      style={{ width: "100%" }}
      renderInput={params => (
        <TextField
          {...params}
          variant="outlined"
          label={props.name}
        />
      )}
      defaultValue={defaultValue}
    />
  </Box>
  );
}