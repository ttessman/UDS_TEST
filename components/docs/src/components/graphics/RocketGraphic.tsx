import { Box } from "@mui/material";

export function RocketGraphic() {
  return (
    <Box sx={{ height: 112, position: "relative" }}>
      <Box
        component="span"
        sx={{
          background: "linear-gradient(135deg, #a78bfa, #ec4899)",
          borderRadius: "50% 50% 50% 8px",
          boxShadow:
            "-18px 46px 0 -24px #7c3aed, -36px 62px 0 -28px #c084fc, 0 0 44px rgba(192, 132, 252, 0.55)",
          height: 68,
          left: 36,
          position: "absolute",
          top: 18,
          transform: "rotate(-38deg)",
          width: 68
        }}
      />
    </Box>
  );
}
