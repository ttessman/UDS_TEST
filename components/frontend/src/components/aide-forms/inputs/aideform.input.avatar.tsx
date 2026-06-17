import { useState } from "react";
import { Box } from "@mui/material";
import { AideFieldProps } from "../aideform";
import { AvatarType, UserAvatar as UserAvatarType } from "es/aide/master/user/v1/user_pb";
import { UserAvatarComponent, UserAvatarComponentSizes } from "components/avatar/Avatar";
import { ColorSwatch } from "@/components/buttons/button.color.swatch";

export const AideAvatarField = <TFormData,>({ field, handleChange, name, rawValue }: AideFieldProps<TFormData>) => {
  const { avatarConfig, sx } = field;

  const [pickerOpen, setPickerOpen] = useState(false);

  const presetColors = avatarConfig?.presetColors ?? [];
  const editable = avatarConfig?.editable ?? true;
  const avatarColor = String(rawValue || "var(--avatar-color-base)");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mb: 3, ...sx }}>
      <UserAvatarComponent
        size={UserAvatarComponentSizes.LG}
        user={{
          ...(avatarConfig?.user || {}),
          avatar: {
            type: AvatarType.COLOR,
            value: avatarColor,
          } as UserAvatarType,
        }}
        editing
        hasClickEvent={false}
        wrapperSx={{ ml: 0, mr: 0 }}
      />

      {editable && (
        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "5px" }}>
          {presetColors.map((color, index) => (
            <ColorSwatch
              key={index}
              color={color}
              selected={avatarColor === color}
              onClick={() => {
                setPickerOpen(false);
                handleChange(name as keyof TFormData, color);
              }}
            />
          ))}

          <ColorSwatch
            color={presetColors.includes(avatarColor) ? "" : avatarColor}
            selected={!presetColors.includes(avatarColor)}
            onClick={() => setPickerOpen((prev) => !prev)}
            onColorChange={(color) => handleChange(name as keyof TFormData, color)}
            enableColorPicker
            pickerOpen={pickerOpen}
            onPickerClose={() => setPickerOpen(false)}
          />
        </Box>
      )}
    </Box>
  );
};
