export type FilterOption = {
  label: string;
  value: string;
};

export type FilterField<T> = {
  allLabel?: string;
  apply: (item: T, value: unknown) => boolean;
  children?: FilterField<T>[];
  label: string;
  multiple?: boolean;
  name: string;
  options: FilterOption[];
  placeholder?: string;
  type: "select";
};
