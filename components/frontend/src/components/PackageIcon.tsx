import { Avatar } from "@mui/material";

export function PackageIcon({
  icon,
  size = 48,
  title
}: {
  icon: string | null;
  size?: number;
  title: string;
}) {
  if (icon) {
    return (
      <Avatar
        alt=""
        src={icon}
        variant="rounded"
        sx={{ bgcolor: "transparent", flex: "0 0 auto", height: size, width: size }}
      />
    );
  }

  return (
    <Avatar
      variant="rounded"
      sx={{
        bgcolor: "var(--app-brand-bg)",
        flex: "0 0 auto",
        fontSize: size >= 48 ? 23 : 18,
        fontWeight: 800,
        height: size,
        width: size
      }}
    >
      {title.slice(0, 1).toUpperCase()}
    </Avatar>
  );
}
