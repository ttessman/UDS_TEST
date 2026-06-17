import { useId, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { FormControl, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { SearchAddonButton } from "../form/resourceTypes/SearchAddonButton.js";
import { Modal } from "../modal/Modal.js";
import { useModalSync } from "../../store/modal.store.js";
import type { FilterField } from "./filter.types.js";

export type UseFiltersOptions<T> = {
  fields: Array<FilterField<T>>;
  items: T[];
  modalTitle?: string;
  sx?: SxProps<Theme>;
};

export function useFilters<T>({ fields, items, modalTitle = "Filters", sx }: UseFiltersOptions<T>) {
  const modalId = useId();
  const modal = useModalSync(modalId);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const activeCount = fields.filter((field) => hasFilterValue(values[field.name])).length;
  const filteredItems = useMemo(
    () => items.filter((item) => fields.every((field) => applyFilterField(field, item, values))),
    [fields, items, values]
  );
  const control = fields.length ? (
    <>
      <SearchAddonButton active={activeCount > 0} icon="tune" label={activeCount > 0 ? `${activeCount} active filters` : "Filter"} onClick={modal.openModal} />
      <Modal
        definition={{
          actions: [
            {
              disabled: activeCount === 0,
              icon: "close",
              label: "Clear",
              onClick: () => setValues({}),
              sx: {
                borderColor: "var(--app-border-strong)",
                color: "var(--app-text-secondary)",
                "&:hover": {
                  bgcolor: "var(--app-bg-paper-hover)",
                  borderColor: "var(--app-border-strong)"
                }
              },
              variant: "outlined"
            },
            {
              icon: "statusSuccess",
              label: "Apply",
              onClick: modal.closeModal,
              sx: {
                bgcolor: "var(--app-text-primary)",
                color: "var(--app-bg-default)",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "var(--app-text-secondary)",
                  boxShadow: "none"
                }
              },
              variant: "contained"
            }
          ],
          maxWidth: "xs",
          title: modalTitle
        }}
        modalId={modalId}
      >
        <Stack sx={{ gap: 2, ...sx }}>
          {fields.map((field) => (
            <FilterSelect key={field.name} field={field} setValues={setValues} values={values} />
          ))}
        </Stack>
      </Modal>
    </>
  ) : null;

  return { activeCount, control, filteredItems, setValues, values };
}

function FilterSelect<T>({
  field,
  setValues,
  values
}: {
  field: FilterField<T>;
  setValues: Dispatch<SetStateAction<Record<string, unknown>>>;
  values: Record<string, unknown>;
}) {
  const id = `filter-${field.name}`;
  const selectedValue = normalizeFilterControlValue(values[field.name], field.multiple);

  return (
    <FormControl fullWidth size="small">
      <InputLabel id={`${id}-label`} shrink>
        {field.label}
      </InputLabel>
      <Select
        displayEmpty
        label={field.label}
        labelId={`${id}-label`}
        multiple={field.multiple}
        onChange={(event) => {
          const nextValue = event.target.value;
          setValues((existing) => ({
            ...existing,
            [field.name]: field.multiple && typeof nextValue === "string" ? nextValue.split(",") : nextValue
          }));
        }}
        renderValue={(selected) =>
          Array.isArray(selected)
            ? selected.map((value) => field.options.find((option) => option.value === value)?.label ?? value).join(", ")
            : field.options.find((option) => option.value === selected)?.label ?? field.placeholder ?? field.allLabel ?? "All"
        }
        value={selectedValue}
      >
        {!field.multiple ? (
          <MenuItem value="">
            <FilterOptionLabel>{field.allLabel ?? "All"}</FilterOptionLabel>
          </MenuItem>
        ) : null}
        {field.options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <FilterOptionLabel>{option.label}</FilterOptionLabel>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function FilterOptionLabel({ children }: { children: string }) {
  return (
    <Typography color="text.secondary" sx={{ fontSize: 14, fontWeight: 500 }}>
      {children}
    </Typography>
  );
}

function applyFilterField<T>(field: FilterField<T>, item: T, values: Record<string, unknown>): boolean {
  if (field.children?.length) {
    return field.children.every((child) => applyFilterField(child, item, values));
  }

  return field.apply(item, values[field.name]);
}

function hasFilterValue(value: unknown) {
  return Array.isArray(value) ? value.length > 0 : value != null && value !== "";
}

function normalizeFilterControlValue(value: unknown, multiple: boolean | undefined) {
  if (multiple) {
    return Array.isArray(value) ? value : [];
  }

  return typeof value === "string" ? value : "";
}
