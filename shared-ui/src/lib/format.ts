export function yesNo(value: boolean | undefined): string {
  return value ? "yes" : "no";
}

export function trimOutput(value: string): string {
  return value.trim().slice(0, 8000);
}

export function formatBytes(value: number | null | undefined): string | null {
  if (value == null || !Number.isFinite(value)) {
    return null;
  }

  const units = ["B", "KiB", "MiB", "GiB"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size >= 10 || unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
}

export function relativeAge(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  const timestamp = date.getTime();
  if (Number.isNaN(timestamp)) {
    return null;
  }

  const elapsedMs = Date.now() - timestamp;
  const elapsedDays = Math.max(0, Math.floor(elapsedMs / 86_400_000));

  if (elapsedDays >= 1) {
    return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(date);
  }

  const elapsedMinutes = Math.max(0, Math.floor(elapsedMs / 60_000));
  if (elapsedMinutes < 60) {
    return elapsedMinutes <= 1 ? "just now" : `${elapsedMinutes} min`;
  }

  const elapsedHours = Math.max(0, Math.floor(elapsedMs / 3_600_000));
  return `${elapsedHours} hr`;
}
