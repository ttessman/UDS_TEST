import React, { useEffect, useMemo, useState, useImperativeHandle, useRef, useCallback } from "react";
import { Box, Button, SxProps } from "@mui/material";
import { AideForm, AideFormField } from "components/forms/aideform";
import { useWizardControls } from "wizards/createWizard/content/create.wizard.form.context";
import { DataMountSourceType, DataMount } from "es/aide/master/data/v1/data_pb";
import { diffMounts, getDataMounts, MountDiff, type dataMount } from "utils/mounts";
import type { Dataset } from "es/aide/master/dataset/v1/dataset_pb";
import {
  WizardCustomStep,
  template as wizardCustomStepTemplate,
} from "wizards/createWizard/content/create.wizard.custom.step";
import { MountsModalTemplate, template as mountsModalTemplate } from "templates/template.mounts.modal";
import { useNavigate } from "react-router-dom";
import { resolveMaxDataMountLimit } from "utils/shared/constantsResolve";
import { getMountsGroupMessage, getNotice, validateMounts } from "./helpers/aideform.resource.mount.helpers";
import { DatasetModal } from "modal/resourceTypes/WizardModals/DatasetModal";
import { DEFAULT_DATA_SCOPE } from "reducers/aideform.resource.mount.data.reducers";
import { useScopedMounts } from "hooks/useScopedMounts";
import { useDataMountForm } from "hooks/useDataMount";
import { aideDataMountPath, createLogger } from "utils/shared/constants";

/* --------------------------- HELPERS --------------------------- */
const log = createLogger("MountData", "#9c27b0");

/**
 * getDataMountConfig
 * Organizes the form fields for dataset mounting.
 */
export const getDataMountConfig = (
  mounts: dataMount[],
  datasets: Dataset[],
  hasDatasets: boolean,
  requiredMounts: number,
  availableDatasets: Dataset[],
  datasetsLoaded: boolean,
  allowAdd: boolean,
  notices: MountDataNotice[] = [],
): AideFormField<any>[] => {
  const preFields: AideFormField<any>[] = [
    getNotice(
      () => !allowAdd && requiredMounts <= 0 && mounts.length <= 0,
      "NOTE: No dataset is required, and you are not allowed to add any. Please proceed to next step.",
      "not-allowed-mounts",
    ),
    getNotice(
      () => datasetsLoaded && !hasDatasets,
      "NOTE: No dataset was found.",
      "mountsNotice",
      () => validateMounts(requiredMounts, mounts),
    ),
    ...notices.map((notice) => getNotice(notice.condition ?? (() => true), notice.note, notice.name)),
    {
      type: "content",
      name: "mounts-group-message",
      content: (ctx) => {
        const currentMounts = ctx.formData.mounts || [];
        return getMountsGroupMessage(currentMounts, allowAdd, (flags) => {
          ctx.formData._suppressMountMessages = flags;
        });
      },
    },
  ];

  const mountFields: AideFormField<any>[] = mounts.map((m, idx) => {
    const idKey = `mounts.${idx}.sourceId`;
    const pathKey = `mounts.${idx}.destinationPath`;

    return {
      type: "group",
      name: `data-mount-${idx}`,
      sx: { display: "flex", flexDirection: "column", gap: 1, mb: 1 },
      children: [
        {
          type: "content",
          name: "can-remove-message",
          content: (ctx) => {
            const currentMounts = ctx.formData.mounts || [];
            const mount = currentMounts[idx];
            const canRemove = mount?.canRemove;
            const canEdit = mount?.canEdit;
            const suppress = ctx.formData._suppressMountMessages || {};

            const show =
              (!canRemove && !canEdit && !suppress.both) ||
              (!canRemove && canEdit && !suppress.remove) ||
              (canRemove && !canEdit && !suppress.edit);

            if (!show) return "";

            let message = "";
            if (!canRemove && !canEdit) {
              message = "NOTE: This mount is required and cannot be edited or removed.";
            } else if (!canRemove) {
              message = "NOTE: This mount is required and cannot be removed.";
            } else if (!canEdit) {
              message = "NOTE: This mount is locked and cannot be edited.";
            }

            return (
              <Box sx={{ color: "var(--placeholder-text-color)", fontSize: "0.75rem", lineHeight: "1.66" }}>
                {message}
              </Box>
            );
          },
        },
        {
          type: "group",
          name: `mountGroup-${idx}`,
          sx: {
            display: "flex",
            flexDirection: "row",
            gap: 1,
            "@media (max-width: 767px)": {
              flexWrap: "wrap",
            },
          },
          children: [
            {
              type: "select",
              name: idKey,
              label: "Dataset",
              fullWidth: true,
              required: true,
              disabled: (ctx) => !ctx.formData.mounts[idx]?.canEdit,
              options: () => {
                const selectedId = mounts[idx].sourceId;
                const selected = datasets.find((d) => d.identifier === selectedId);
                const base = availableDatasets.map((d) => ({ label: d.name, value: d.identifier }));

                if (selected && !availableDatasets.some((d) => d.identifier === selectedId)) {
                  base.push({ label: selected.name, value: selected.identifier });
                }

                return base;
              },
              condition: () => datasets.length > 0,
              value: (ctx) => ctx.formData.mounts[idx].sourceId,
              validate: (v) => (!v ? "Dataset is required" : null),
            },
            {
              type: "text",
              name: pathKey,
              label: "Mount Path",
              fullWidth: true,
              startAdornment: aideDataMountPath,
              placeholder: "folder_name",
              disabled: (ctx) => !ctx.formData.mounts[idx]?.canEdit,
              condition: (ctx) => ctx.formData.mounts[idx].sourceId != null && ctx.formData.mounts[idx].sourceId > 0,
              value: (ctx) => ctx.formData.mounts[idx].destinationPath,
              sx: {
                ".MuiInputAdornment-root": {
                  mr: "0.5px",
                  ".MuiTypography-root": { color: "var(--text-color)" },
                },
              },
            },
          ],
        },
        {
          type: "button",
          name: `remove-${idx}`,
          label: "Remove",
          buttonVariant: "text",
          buttonSize: "small",
          sx: { color: "var(--error-color)", width: "min-content" },
          disabled: (ctx) => !ctx.formData.mounts[idx]?.canEdit,
          onClick: (_e, ctx) => (ctx as any).handleRemove(idx),
          condition: (ctx) => ctx.formData.mounts[idx]?.canRemove,
        },
      ],
    };
  });

  return [...preFields, ...mountFields];
};

export interface MountDataHandle {
  validateStep: () => boolean;
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<string, string>>>>;
  validateFields: (fieldNames: string[]) => boolean;
}

export interface MountDataNotice {
  name: string;
  note: string;
  condition?: () => boolean;
}

interface MountDataProps {
  isWizard?: boolean;
  showWizardControls?: boolean;
  allowAdd?: boolean;
  allowCreate?: boolean;
  action?: (mounts: DataMount[], diff?: MountDiff<DataMount>) => void;
  onClose?: () => void;
  initialMounts?: dataMount[];
  sx?: SxProps;
  requiredMounts?: number;
  scope?: string;
  ref?: React.Ref<MountDataHandle>;
  notices?: MountDataNotice[];
}

/* --------------------------- COMPONENT --------------------------- */

export const MountData = ({
  isWizard = true,
  showWizardControls = false,
  allowCreate = true,
  allowAdd = true,
  action,
  onClose,
  sx = {},
  requiredMounts = 0,
  initialMounts = [],
  scope = DEFAULT_DATA_SCOPE,
  ref,
  notices = [],
}: MountDataProps) => {
  const navigate = useNavigate();
  const { next } = useWizardControls();
  const { dataMounts, data } = useScopedMounts(scope);

  const [originalMounts] = useState<dataMount[]>(initialMounts);
  const [wizardKey, setWizardKey] = useState(0);
  const [showNew, setShowNew] = useState(false);

  const filteredMounts = useMemo(
    () => dataMounts.filter((m: dataMount | null | undefined): m is dataMount => m != null),
    [dataMounts],
  );

  const areDataMountsAtMax = filteredMounts.length >= resolveMaxDataMountLimit();

  const {
    config,
    formData,
    datasets,
    datasetsLoaded,
    availableDatasets,
    setRefreshDatasets,
    errors,
    setErrors,
    validateStep,
    validateFields,
    isStepValid,
    clearFieldError,
  } = useDataMountForm(filteredMounts, requiredMounts, allowAdd, scope, notices);

  useImperativeHandle(ref, () => ({ validateStep, setErrors, validateFields }));

  const didApplyInitialMounts = useRef(false);

  useEffect(() => {
    if (didApplyInitialMounts.current) return;
    if (!datasetsLoaded || datasets.length === 0) return;

    const noReduxMounts = filteredMounts.length === 0;

    if (noReduxMounts && initialMounts.length > 0) {
      log("📁 INITIAL: Applying provided mounts");
      initialMounts.forEach((mount) => data.add(mount));
      didApplyInitialMounts.current = true;
    } else if (noReduxMounts && requiredMounts > 0) {
      log("📁 INITIAL: Applying required default mounts");
      for (let i = 0; i < Math.min(requiredMounts, datasets.length); i++) {
        const ds = datasets[i];
        data.add({
          mountType: DataMountSourceType.DATASET,
          sourceId: ds?.identifier ?? 0,
          destinationPath: ds?.name ?? "",
          canRemove: false,
          canEdit: true,
        });
      }
      didApplyInitialMounts.current = true;
    }
  }, [datasetsLoaded, datasets, filteredMounts.length, data, initialMounts, requiredMounts]);

  const onLocalNext = useCallback(() => {
    log("onLocalNext");
    if (!validateStep()) return;

    setErrors({});

    const finalMounts = getDataMounts(filteredMounts);
    const diff = diffMounts(filteredMounts, originalMounts, getDataMounts);
    const changed = diff.added.length > 0 || diff.removed.length > 0;

    if (!isWizard && typeof action === "function") {
      action(changed ? finalMounts : [], changed ? diff : undefined);
    }

    if (isWizard) next();
  }, [validateStep, filteredMounts, originalMounts, isWizard, action, next, setErrors]);

  const handleChange = useCallback(
    (name: string | number | symbol, value: any) => {
      log("handleChange");

      if (typeof name !== "string") return;

      clearFieldError(name, true);

      const [arr, idxStr, key] = name.split(".");
      const idx = Number(idxStr);

      if (arr !== "mounts" || isNaN(idx)) return;

      if (key === "sourceId") {
        data.setId(idx, value as number);
        const autoPath = datasets.find((d) => d.identifier === value)?.name ?? "";
        if (!filteredMounts[idx]?.destinationPath) {
          data.setPath(idx, autoPath);
        }
      } else if (key === "destinationPath") {
        data.setPath(idx, String(value));
      }
    },
    [clearFieldError, data, datasets, filteredMounts],
  );

  const handleRemove = useCallback(
    (idx: number) => {
      log("📤 ACTION: Removing Data Mount");
      data.remove(idx);
      setErrors({});
    },
    [data, setErrors],
  );

  const handleAddMount = useCallback(() => {
    if (!validateStep()) return;
    log("📥 ACTION: Adding empty Data Mount");
    data.add();
  }, [validateStep, data]);

  const handleDatasetSuccess = useCallback(
    (d: Dataset) => {
      log("✅ SUCCESS: Dataset created and mounted");
      data.add({
        mountType: DataMountSourceType.DATASET,
        sourceId: d.identifier,
        destinationPath: d.name,
        canRemove: true,
        canEdit: true,
      });
      setRefreshDatasets(true);
      setShowNew(false);
      setWizardKey((k) => k + 1);
      setErrors({});
    },
    [data, setRefreshDatasets, setErrors],
  );

  const onLocalModalClose = useCallback(() => {
    data.reset();
    originalMounts.forEach((mount) => data.add(mount));
    if (onClose) onClose();
    setRefreshDatasets(true);
  }, [data, originalMounts, onClose, setRefreshDatasets]);

  const renderForm = () => (
    <>
      <AideForm
        config={config}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={() => {}}
        errors={errors}
        context={{ datasetList: datasets, handleRemove }}
        loading={false}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      />

      <Box sx={{ display: "flex", gap: 1, mb: 0 }}>
        {allowAdd && availableDatasets.length > 0 && !areDataMountsAtMax && (
          <Button
            variant="contained"
            onClick={handleAddMount}
            disabled={!isStepValid}
            data-testid="mount-data--add-mount"
          >
            Add Mount +
          </Button>
        )}

        {allowCreate && !areDataMountsAtMax && (
          <Button
            variant="outlined"
            onClick={() => setShowNew((v) => !v)}
            disabled={Object.values(errors).some((msg) => msg && !msg.includes("Dataset is required"))}
            data-testid="mount-data--create-new-mount"
          >
            {showNew ? "Cancel New Dataset" : "Create New Dataset"}
          </Button>
        )}
      </Box>

      {!datasets.length && !allowCreate && datasetsLoaded && (
        <Box
          sx={{
            color: "var(--placeholder-text-color)",
            fontSize: "0.75rem",
            lineHeight: "1.66",
            display: "flex",
            gap: 0.5,
            mb: 2,
            mx: "14px",
            mt: "3px",
          }}
        >
          <Box
            component="span"
            sx={{ color: "var(--primary-color)", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => navigate("/data/create")}
          >
            Add a dataset
          </Box>
        </Box>
      )}

      {allowCreate && (
        <DatasetModal key={wizardKey} show={showNew} setShow={setShowNew} onSuccess={handleDatasetSuccess} />
      )}
    </>
  );

  if (isWizard) {
    return (
      <WizardCustomStep showWizardControls={showWizardControls} onNextOverride={onLocalNext} wrapperSx={sx}>
        <wizardCustomStepTemplate.content>{renderForm()}</wizardCustomStepTemplate.content>
      </WizardCustomStep>
    );
  }

  return (
    <MountsModalTemplate onClose={onLocalModalClose} onSubmit={onLocalNext} buttonLabel="Update Data" wrapperSx={sx}>
      <mountsModalTemplate.form>{renderForm()}</mountsModalTemplate.form>
    </MountsModalTemplate>
  );
};

export default MountData;
