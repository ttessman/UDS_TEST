import { useState, type Ref } from "react";
import { InputAdornment, TextField, IconButton, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AideIcon } from "components/utility/AideIcon";
import { MultiSelectDropdown } from "components/forms/inputs/aideform.input.multi.select.dropdown";

const filterObjects: string[] = [
  "Everything",
  "Project",
  "Volume",
  "Model",
  "Workspace",
  "Scheduled Job",
  "Job Template",
  "Repository",
  "Predictor",
  "User",
];

interface SearchBarProps {
  ref?: Ref<HTMLInputElement>;
}

/**
 * TopSearchBar contains the dropdown filter, the text field, and the search button.
 */
export const SearchBar: React.FC<SearchBarProps> = ({ ref }) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [objFilter, setObjFilter] = useState<string[]>(["Everything"]);

  const handleSearch = () => {
    if (searchText.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchText)}&types=${objFilter.join(",")}`);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
      <MultiSelectDropdown filterObjects={filterObjects} objFilter={objFilter} setObjFilter={setObjFilter} />

      <TextField
        inputRef={ref}
        size="small"
        placeholder="Search"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        sx={{
          flexGrow: 1,
          "& .MuiOutlinedInput-root": {
            borderRadius: "5px 0 0 5px",
            backgroundColor: "var(--card-background-color)",
          },
        }}
        InputProps={{
          endAdornment: searchText ? (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setSearchText("")}
                size="small"
                sx={{
                  padding: "2px",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                }}
              >
                <AideIcon type="close" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      <IconButton
        onClick={handleSearch}
        size="small"
        aria-label="Search"
        sx={{
          width: "50px",
          height: "40px",
          borderRadius: "0 5px 5px 0",
          backgroundColor: "var(--card-dark-color)",
          color: "var(--primary-color)",
          "&:hover": { opacity: 0.8 },
        }}
      >
        <AideIcon type="search" />
      </IconButton>
    </Box>
  );
};
