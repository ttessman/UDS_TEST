import { Box, SxProps, Theme } from "@mui/material";
import { AideFormField, AideFormValidateFn } from "components/forms/aideform";
import { codeMount, dataMount } from "utils/mounts";

/**
 * Minimal type used for shared mount logic — supports both codeMount and dataMount shapes.
 */
interface MountLike {
  canEdit?: boolean;
  canRemove?: boolean;
}

/**
 * Returns a human-readable message when all mounts are required/locked.
 * Also sets suppression flags to avoid duplicate per-mount messages.
 *
 * @param mounts - Array of mount objects with at least `canEdit` and `canRemove`.
 * @param allowAdd - Whether additional mounts can be added.
 * @param setSuppressFlags - Optional callback to store flags in formData for per-mount message logic.
 * @returns A string or <Box> element with a warning message, or "" if no message needed.
 */
export function getMountsGroupMessage(
  mounts: MountLike[],
  allowAdd: boolean,
  setSuppressFlags?: (flags: { both?: boolean; remove?: boolean; edit?: boolean }) => void,
): React.ReactNode | string {
  if (mounts.length === 0 || allowAdd) {
    setSuppressFlags?.({});
    return "";
  }

  const allLocked = mounts.every((m) => !m.canRemove && !m.canEdit);
  const allRequired = mounts.every((m) => !m.canRemove);
  const allReadOnly = mounts.every((m) => !m.canEdit);

  setSuppressFlags?.({
    both: allLocked,
    remove: allRequired,
    edit: allReadOnly,
  });

  let message = "";
  if (allLocked) {
    message = "NOTE: All mounts are required and cannot be edited or removed.";
  } else if (allRequired) {
    message = "NOTE: All mounts are required and cannot be removed.";
  } else if (allReadOnly) {
    message = "NOTE: All mounts are locked and cannot be edited.";
  }

  return message ? (
    <Box sx={{ color: "var(--placeholder-text-color)", fontSize: "0.75rem", lineHeight: "1.66" }}>{message}</Box>
  ) : (
    ""
  );
}

/**
 * Validates that the required number of mounts are present.
 *
 * @param requiredMounts - The minimum number of mounts required
 * @param mounts - The array of mounts (either dataMount[] or codeMount[])
 * @returns An error message if the number of mounts is insufficient, or null if valid
 */
export function validateMounts(requiredMounts: number, mounts: dataMount[] | codeMount[]): string | null {
  if (requiredMounts > 0 && mounts.length < requiredMounts) {
    const plural = requiredMounts === 1 ? "" : "s";
    const verb = requiredMounts === 1 ? "is" : "are";
    return `At least ${requiredMounts} mount${plural} ${verb} required.`;
  }
  return null;
}

/**
 * Returns an AideForm field config that shows a message based on a condition
 * and optionally validates.
 *
 * @param condition - Function that returns a boolean indicating when to show the notice (e.g. data is loaded but empty)
 * @param note - The message shown when the condition is true
 * @param name - The field name for the notice (defaults to "mountsNotice")
 * @param validate - Optional validation function that receives (value, formData, field) and returns an error string or null (defaults to no validation)
 * @returns AideFormField of type "content"
 */
export function getNotice(
  condition: () => boolean,
  note: string,
  name: string = "mountsNotice",
  validate?: AideFormValidateFn,
  sx: SxProps<Theme> = {},
): AideFormField<any> {
  return {
    type: "content",
    name,
    condition,
    content: () => (
      <Box
        sx={{
          color: "var(--placeholder-text-color)",
          fontSize: "0.75rem",
          lineHeight: "1.66",
          mt: "-10px",
          mb: "10px",
          ...sx,
        }}
      >
        {note}
      </Box>
    ),
    ...(validate ? { validate } : {}),
  };
}
