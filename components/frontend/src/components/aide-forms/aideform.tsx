import { get } from "lodash";
import React, { useState, RefObject, useEffect, useRef } from "react";
import { Box, SxProps, Theme, ButtonProps } from "@mui/material";
import { createPortal } from "react-dom";

import { AideTextInput } from "./inputs/aideform.input.text";
import {
  AideRadioField,
  AideRatingField,
  AideSelectField,
  AideSelectMultipleField,
  AideSliderField,
  AideTagField,
  AideToggleField,
} from "./inputs/aideform.input.selection";
import { AideAutocompleteFields } from "./inputs/aideform.input.autocomplete";
import { DateRange } from "./inputs/aideform.input.date.range";
import { AideExternalUpload, AideScreenshotUpload, AideLocalUpload } from "./inputs/aideform.input.upload";
import { IconKeywordMatch } from "components/utility/AideIcon";
import { Dayjs } from "dayjs";
import { AideSliderConfig } from "./inputs/aideform.input.slider";
import { DateRangeLayoutType } from "./inputs/aideform.input.date.range";
import { AideButtonField } from "./inputs/aideform.input.button";
import { AideContentField } from "./inputs/aideform.input.content";
import { AideHeadingField } from "./inputs/aideform.input.heading";
import { AideGroupField } from "./inputs/aideform.input.group";
import { createLogger } from "utils/shared/constants";
import { User } from "@/es/aide/master/user/v1/user_pb";
import { AideAvatarField } from "./inputs/aideform.input.avatar";

/*-------------------------------------------
  Logger
--------------------------------------------*/
const log = createLogger("[AideForm]", "#1E88E5");

/*-------------------------------------------
  Interfaces for the Form
--------------------------------------------*/
export type AideFormDisplayTag = "div" | "span" | "p" | "section" | "article" | "header" | "footer" | "main";

export type AideHeadingVariant = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface LocalUploadFieldProps<TFormData> {
  onAddFile: (file: File, name: keyof TFormData) => void;
  onRemove: (index: number, name: keyof TFormData) => void;
  onClose?: () => void;
}

export interface ScreenshotUploadField {
  max?: number;
  previewHeight?: number;
  capture?: () => Promise<File>;
}

export interface ExternalUploadFieldProps<TFormData> {
  onFetchFile: (name: keyof TFormData, formData: TFormData) => Promise<void>;
  onRemove: (index: number, name: keyof TFormData) => void;
  onClose?: () => void;
}

export type AideFormButtonClickHandler<TFormData> = (
  event: React.MouseEvent<HTMLButtonElement>,
  context: AideFormContext<TFormData>,
) => void;

export type AideFormOptions = FormOption[] | ((context: AideFormContext<any>) => FormOption[]);

/*-------------------------------------------
  Core Types & Context
--------------------------------------------*/
export interface FormOption {
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface AideFormContext<TFormData = any> {
  formData: TFormData;
  field: AideFormField<TFormData>;
  [key: string]: any;
}

export type AideFormValidateFn<TFormData = any> = (
  value: any,
  formData?: TFormData,
  field?: AideFormField<TFormData>,
) => string | null;

export type AideFieldType =
  | "group"
  | "text"
  | "textarea"
  | "select"
  | "select-multiple"
  | "autocomplete"
  | "autocomplete-multiple"
  | "switch"
  | "checkbox"
  | "radio"
  | "tags"
  | "content"
  | "button"
  | "local-upload"
  | "heading"
  | "date-range"
  | "slider"
  | "avatar"
  | "password"
  | "screenshot-upload"
  | "external-upload"
  | "rating"
  | "hidden";

export interface AideFormField<TFormData = any> {
  type: AideFieldType;
  name: keyof TFormData | string;
  label?: string | ((context: AideFormContext<TFormData>) => string);
  id?: string;
  placeholder?: string;
  required?: boolean;
  options?: AideFormOptions;
  rows?: number;
  minRows?: number;
  maxRows?: number;
  fullWidth?: boolean;
  tooltip?: string;
  maxLength?: number;
  content?: React.ReactNode | ((context: AideFormContext<TFormData>) => React.ReactNode);
  helper?: string | React.ReactNode | ((context: AideFormContext<TFormData>) => string | React.ReactNode);

  sx?: any;
  wrapperSx?: any;
  action?: string;
  component?: AideFormDisplayTag;
  condition?: (context: AideFormContext<TFormData>) => boolean;

  validate?: AideFormValidateFn;

  localUploadConfig?: LocalUploadFieldProps<TFormData>;
  externalUploadConfig?: ExternalUploadFieldProps<TFormData>;
  screenshotConfig?: ScreenshotUploadField;

  testid?: string;
  headingVariant?: AideHeadingVariant;
  heading?: string;

  size?: "small" | "medium";
  minDate?: Dayjs;
  maxDate?: Dayjs;
  portalTarget?: string | RefObject<HTMLElement | null>;
  onClick?: AideFormButtonClickHandler<TFormData>;
  buttonVariant?: ButtonProps["variant"];
  buttonSize?: ButtonProps["size"];
  children?: AideFormField<TFormData>[];
  apply?: (item: TFormData, value: any) => boolean;
  dateRangeLayout?: DateRangeLayoutType;
  startAdornment?: React.ReactNode | ((ctx: AideFormContext<TFormData>) => React.ReactNode);
  endAdornment?: React.ReactNode | ((ctx: AideFormContext<TFormData>) => React.ReactNode);
  value?: (ctx: AideFormContext<TFormData>) => any;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
  sliderConfig?: AideSliderConfig;
  autoComplete?: string;

  disabled?: boolean | ((ctx: AideFormContext<TFormData>) => boolean);
  showErrorWhenDisabled?: boolean;

  icon?: {
    type: IconKeywordMatch | ((ctx: AideFormContext<TFormData>) => IconKeywordMatch);
    position?: "start" | "end";
    fontSize?: "inherit" | "small" | "medium" | "large";
    sx?: object;
  };

  ratingConfig?: {
    precision?: number;
    max?: number;
    showEmoji?: boolean;
    labels?: Record<number, string>;
  };
  onFocus?: (e: React.FocusEvent<any>, ctx: AideFormContext<TFormData>) => void;
  onBlur?: (e: React.FocusEvent<any>, ctx: AideFormContext<TFormData>) => void;
  avatarConfig?: {
    user?: Partial<User> | null;
    presetColors?: string[];
    editable?: boolean;
  };
}

export interface AideFieldProps<TFormData> {
  field: AideFormField<TFormData>;
  fullContext: AideFormContext<TFormData>;
  formData: TFormData;
  handleChange: (name: keyof TFormData, value: any) => void;
  handleSubmit: () => void;
  name: string | keyof TFormData;
  error?: string;
  showError: boolean;
  disabled: boolean;
  uniqueId: string;
  rawValue: any;
  label?: string;
  options: FormOption[];
  helper?: any;
  content?: any;
  startAdornment?: any;
  endAdornment?: any;
  passwordVisible?: boolean;
  onTogglePassword?: () => void;
}

export interface AideFormProps<TFormData extends Record<string, any>> {
  config: AideFormField<TFormData>[];
  formData: TFormData;
  handleChange: (name: keyof TFormData, value: any) => void;
  handleSubmit: () => void;
  errors?: Partial<Record<keyof TFormData, string>>;
  loading?: boolean;
  context?: any;
  sx?: SxProps<Theme>;
  needsForm?: boolean;
}

const resolveFieldProp = <T,>(context: AideFormContext<any>, key: keyof AideFormField<any>): T => {
  const val = context.field[key];
  return (typeof val === "function" ? val(context) : val) as T;
};

const shouldRenderInPortal = (field: AideFormField<any>) => !!field.portalTarget;

/*-------------------------------------------
  AideForm
--------------------------------------------*/
export const AideForm = <TFormData extends Record<string, any>>({
  config,
  formData,
  handleChange,
  handleSubmit,
  errors = {},
  loading = false,
  context,
  sx,
  needsForm = false,
}: AideFormProps<TFormData>) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [passwordVisibility, setPasswordVisibility] = useState<Record<string, boolean>>({});
  const [openPickers, setOpenPickers] = useState<Record<string, boolean>>({});

  const previousConfigRef = useRef<AideFormField<TFormData>[] | null>(null);
  const previousFormDataRef = useRef<TFormData | null>(null);

  useEffect(() => {
    log("render", {
      configRefChanged: previousConfigRef.current !== config,
      formDataRefChanged: previousFormDataRef.current !== formData,
      configLength: config.length,
      fieldNames: config.map((field) => String(field.name)),
      errorKeys: Object.keys(errors as object),
      loading,
    });

    previousConfigRef.current = config;
    previousFormDataRef.current = formData;
  }, [config, formData, errors, loading]);

  const hasErrorDeep = (fields: AideFormField<TFormData>[]): boolean =>
    fields.some((f) => errors[f.name as keyof TFormData] || (f.children && hasErrorDeep(f.children)));

  const renderField = (field: AideFormField<TFormData>): React.ReactNode => {
    const { type, name, id, condition } = field;
    const fullContext: AideFormContext<TFormData> = { formData, ...(context || {}), field };

    if (condition && !condition(fullContext)) {
      log("skip field by condition", {
        name: String(name),
        type,
      });
      return null;
    }

    const label = resolveFieldProp<string>(fullContext, "label") ?? "";
    const options = resolveFieldProp<FormOption[]>(fullContext, "options") ?? [];
    const content = resolveFieldProp<any>(fullContext, "content") ?? "";
    const helper = resolveFieldProp<any>(fullContext, "helper") ?? "";
    const startAdornment = resolveFieldProp<any>(fullContext, "startAdornment") ?? null;
    const endAdornment = resolveFieldProp<any>(fullContext, "endAdornment") ?? null;

    const uniqueId = id || `${String(name)}-input`;
    const error = errors[name as keyof TFormData];

    const rawValue =
      typeof field.value === "function"
        ? (field.value as any)(fullContext)
        : get(formData, String(name), formData[name as keyof TFormData]);

    const disabledRaw = field.disabled;
    const disabled = loading || (typeof disabledRaw === "function" ? disabledRaw(fullContext) : !!disabledRaw);

    const showError = !!error && (!disabled || !!field.showErrorWhenDisabled);

    log("renderField", {
      name: String(name),
      type,
      key: String(name),
      uniqueId,
      rawValue,
      disabled,
      showError,
      optionCount: options.length,
    });

    const props: AideFieldProps<TFormData> = {
      field,
      fullContext,
      formData,
      handleChange,
      handleSubmit,
      name,
      error: error ? String(error) : undefined,
      showError,
      disabled,
      uniqueId,
      rawValue,
      label,
      options,
      helper,
      content,
      startAdornment,
      endAdornment,
      passwordVisible: passwordVisibility[String(name)] || false,
      onTogglePassword: () => setPasswordVisibility((p) => ({ ...p, [String(name)]: !p[String(name)] })),
    };

    switch (type) {
      case "text":
      case "password":
      case "textarea":
        return <AideTextInput {...props} />;
      case "heading":
        return <AideHeadingField {...props} />;
      case "content":
        return <AideContentField {...props} />;
      case "button":
        return <AideButtonField {...props} />;
      case "select":
        return <AideSelectField {...props} />;
      case "select-multiple":
        return <AideSelectMultipleField {...props} />;
      case "checkbox":
      case "switch":
        return <AideToggleField {...props} />;
      case "tags":
        return <AideTagField {...props} />;
      case "rating":
        return <AideRatingField {...props} />;
      case "slider":
        return <AideSliderField {...props} />;
      case "avatar":
        return <AideAvatarField {...props} />;
      case "radio":
        return <AideRadioField {...props} />;
      case "autocomplete":
      case "autocomplete-multiple":
        return <AideAutocompleteFields {...props} />;
      case "local-upload":
        return <AideLocalUpload {...props} />;
      case "screenshot-upload":
        return <AideScreenshotUpload {...props} />;
      case "external-upload":
        return <AideExternalUpload {...props} />;
      case "date-range":
        return (
          <DateRange
            {...props}
            start={get(formData, `${String(name)}.start`)}
            end={get(formData, `${String(name)}.end`)}
            onChange={(val) => handleChange(name as keyof TFormData, { start: val[0], end: val[1] })}
            open={openPickers[String(name)] || false}
            setOpen={(o) => setOpenPickers((p) => ({ ...p, [String(name)]: o }))}
          />
        );
      case "group": {
        const isExpanded = expandedGroups[String(name)] ?? !field.defaultCollapsed;
        const groupHasErrors = field.children ? hasErrorDeep(field.children) : false;
        return (
          <AideGroupField
            {...props}
            expanded={isExpanded}
            hasError={groupHasErrors}
            onToggle={() => setExpandedGroups((v) => ({ ...v, [String(name)]: !isExpanded }))}
            renderChildren={() =>
              field.children?.map((child) => (
                <React.Fragment key={String(child.name)}>{renderField(child)}</React.Fragment>
              ))
            }
          />
        );
      }
      case "hidden":
        return <input type="hidden" name={String(name)} value={rawValue ?? ""} />;
      default:
        return null;
    }
  };

  const insideBox: React.ReactNode[] = [];
  const outsideBox: React.ReactNode[] = [];

  log("build inside/outside nodes", {
    configLength: config.length,
  });

  config.forEach((field) => {
    const rendered = renderField(field);
    if (!rendered) return;

    if (shouldRenderInPortal(field)) {
      const portalNode =
        typeof field.portalTarget === "string"
          ? document.getElementById(field.portalTarget)
          : field.portalTarget?.current;

      if (portalNode) {
        outsideBox.push(createPortal(rendered, portalNode, String(field.name)));
      }
    } else {
      insideBox.push(<React.Fragment key={String(field.name)}>{rendered}</React.Fragment>);
    }
  });

  const insideFormContent = (
    <Box
      component={needsForm ? "form" : "div"}
      onSubmit={
        needsForm
          ? (e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              handleSubmit();
            }
          : undefined
      }
      sx={{ display: "flex", flexDirection: "column", ...sx }}
    >
      {insideBox}
    </Box>
  );

  return (
    <>
      {insideFormContent}
      {outsideBox}
    </>
  );
};
