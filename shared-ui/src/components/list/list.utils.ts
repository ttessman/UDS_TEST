import { isValidElement, type ReactNode } from "react";

export function isEmptyRenderValue(value: ReactNode | ReactNode[]): boolean {
  if (Array.isArray(value)) {
    return value.every(isEmptyRenderValue);
  }

  return value == null || value === "" || typeof value === "boolean";
}

export function normalizeRenderValues(value: ReactNode | ReactNode[], emptyValue?: ReactNode): ReactNode[] {
  const values = (Array.isArray(value) ? value : [value]).filter((item) => !isEmptyRenderValue(item));

  if (values.length === 0 && !isEmptyRenderValue(emptyValue)) {
    return [emptyValue];
  }

  return dedupePrimitiveValues(values);
}

export function renderValuesAsText(values: ReactNode[]): string {
  return values
    .filter((value): value is string | number => typeof value === "string" || typeof value === "number")
    .map(String)
    .join(", ");
}

function dedupePrimitiveValues(values: ReactNode[]): ReactNode[] {
  const seen = new Set<string>();

  return values.filter((value) => {
    if (isValidElement(value) || (typeof value !== "string" && typeof value !== "number")) {
      return true;
    }

    const key = String(value);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
