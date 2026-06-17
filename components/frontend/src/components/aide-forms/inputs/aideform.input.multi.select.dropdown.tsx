import React, { Dispatch, SetStateAction } from "react";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { MenuItem } from "@mui/material";

interface MultiSelectDropdownProps {
  filterObjects: string[];
  objFilter: string[];
  setObjFilter: Dispatch<SetStateAction<string[]>>;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ filterObjects, objFilter, setObjFilter }) => {
  const handleChange = (event: SelectChangeEvent<typeof objFilter>) => {
    // Get the new updated array
    let updatedFilter = typeof event.target.value === "string" ? event.target.value.split(",") : event.target.value;

    const lastElement = updatedFilter[updatedFilter.length - 1];

    // The filter should Filter Everything or a selected amount of objects
    if (lastElement === "Everything" || updatedFilter.length === 0) {
      updatedFilter = ["Everything"];
    } else {
      updatedFilter = updatedFilter.filter((item) => item !== "Everything");
    }

    setObjFilter(updatedFilter);
  };

  return (
    <div style={{ marginRight: "10px", display: "flex", alignItems: "center" }}>
      <span style={{ fontSize: "0.9em", fontWeight: "bold", marginLeft: "5px", marginRight: "5px" }}>Search For:</span>
      <FormControl size="small" sx={{ width: 200 }}>
        <Select
          labelId="aide-multi-select-dropdown-label"
          id="aide-multi-select-dropdown"
          multiple
          value={objFilter}
          onChange={handleChange}
        >
          {filterObjects.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};
