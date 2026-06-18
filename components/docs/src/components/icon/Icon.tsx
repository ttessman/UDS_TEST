import { Box } from "@mui/material";

export type IconName = "package" | "check" | "launch" | "shield" | "server" | "cube" | "kube" | "react";

const iconPaths: Record<IconName, string> = {
  package: "M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.3 5.6 3.1L12 10.5 6.4 7.4 12 4.3ZM5 9.1l6 3.3v6.9l-6-3.4V9.1Zm14 6.8-6 3.4v-6.9l6-3.3v6.8Z",
  check: "M9.4 16.6 4.8 12l1.4-1.4 3.2 3.2 8.4-8.4L19.2 7 9.4 16.6Z",
  launch: "M5 4h8v2H7v11h11v-6h2v8H5V4Zm10 0h5v5h-2V7.4l-7.3 7.3-1.4-1.4L16.6 6H15V4Z",
  shield: "M12 2 5 5v6c0 4.4 2.8 8.5 7 10 4.2-1.5 7-5.6 7-10V5l-7-3Zm0 2.2 5 2.1V11c0 3.2-1.9 6.3-5 7.7-3.1-1.4-5-4.5-5-7.7V6.3l5-2.1Z",
  server: "M4 4h16v6H4V4Zm2 2v2h12V6H6Zm-2 8h16v6H4v-6Zm2 2v2h12v-2H6Z",
  cube: "M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.3 5.5 3.1L12 10.4 6.5 7.4 12 4.3Zm-7 5 6 3.3v6.8l-6-3.3V9.3Zm8 10.1v-6.8l6-3.3v6.8l-6 3.3Z",
  kube: "M12 2 4 6.5v9L12 20l8-4.5v-9L12 2Zm0 2.3 5.9 3.3v6.8L12 17.7l-5.9-3.3V7.6L12 4.3Zm0 2.7 3.6 2.1v4.2L12 15.4l-3.6-2.1V9.1L12 7Z",
  react: "M12 10.3a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4Zm0-6.8c3.5 0 6.3 3.8 6.3 8.5s-2.8 8.5-6.3 8.5S5.7 16.7 5.7 12 8.5 3.5 12 3.5Zm0 2c-2.1 0-4.3 2.7-4.3 6.5s2.2 6.5 4.3 6.5 4.3-2.7 4.3-6.5S14.1 5.5 12 5.5Z"
};

export function Icon({ name }: { name: IconName }) {
  return (
    <Box
      aria-hidden="true"
      className="icon"
      component="span"
      sx={{
        alignItems: "center",
        aspectRatio: "1",
        background: "rgba(37, 99, 235, 0.1)",
        borderRadius: "50%",
        color: "#2563eb",
        display: "inline-grid",
        flex: "0 0 auto",
        height: 30,
        justifyItems: "center",
        placeItems: "center",
        width: 30,
        "& svg": {
          fill: "currentColor",
          height: 18,
          width: 18
        }
      }}
    >
      <svg viewBox="0 0 24 24" role="img">
        <path d={iconPaths[name]} />
      </svg>
    </Box>
  );
}
