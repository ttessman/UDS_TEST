import React from "react";
import { Box } from "@mui/material";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";

interface AideCheckboxIconProps {
  checked?: boolean;
}

const AideCheckboxIcon: React.FC<AideCheckboxIconProps> = ({ checked }) => (
  <Box component="span" sx={{ position: "relative", display: "flex", svg: { fontSize: "1.125rem" } }}>
    <Box
      sx={{
        border: "2px solid transparent",
        borderRadius: "5px",
        width: "1.125rem",
        height: "1.125rem",
      }}
    ></Box>
    {checked && (
      <CheckOutlinedIcon
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "1em",
          height: "1em",
          "& path": {
            transform: "scale(0.7)",
            transformOrigin: "center",
          },
        }}
      />
    )}
  </Box>
);

export default AideCheckboxIcon;
