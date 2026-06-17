import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Box, Button, SxProps } from "@mui/material";
import { AideForm } from "components/forms/aideform";
import { useWizardControls } from "wizards/createWizard/content/create.wizard.form.context";
import { useDeserifySelector } from "middleware/serifyMiddleware";
import { Volume } from "es/aide/master/volume/v1/volume_pb";
import { CodeMount, CodeMountSourceType } from "es/aide/master/code/v1/code_pb";
import {
  WizardCustomStep,
  template as wizardCustomStepTemplate,
} from "wizards/createWizard/content/create.wizard.custom.step";
import { codeMount, diffMounts, getCodeMounts, MountDiff } from "utils/mounts";
import { MountsModalTemplate, template as mountsModalTemplate } from "templates/template.mounts.modal";
import { VolumeModal } from "modal/resourceTypes/WizardModals/VolumeModal";
import { resolveMaxCodeMountLimit } from "utils/shared/constantsResolve";
import { RepositoryModal } from "modal/resourceTypes/WizardModals/RepoModal";
import { Repository } from "es/aide/master/repository/v1/repository_pb";
import { TemplateForkModal } from "modal/resourceTypes/AideFormModal/resourceTypes/TemplateForkModal";
import { useScopedMounts } from "hooks/useScopedMounts";
import { useParentAllowedCodeSources, useCodeMountForm, ValidateCoundMountFields } from "hooks";
import { createLogger } from "utils/shared/constants";
import { setAppMetaFields } from "reducers/application.meta.form.actions";
import { resolveDirectoryPrefix } from "utils/utils";
import { useDispatch } from "react-redux";

const log = createLogger("[MountCode]", "#00BCD4");

export interface MountCodeHandle {
  validateStep: () => boolean;
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<string, string>>>>;
  validateFields: ValidateCoundMountFields;
}

interface MountCodeProps {
  isWizard?: boolean;
  showWizardControls?: boolean;
  allowAdd?: boolean;
  allowCreate?: boolean;
  showSingleMount?: boolean;
  syncAppMetaOnSingleMount?: boolean;
  action?: (mounts: CodeMount[], diff?: MountDiff<CodeMount>) => void;
  onClose?: () => void;
  sx?: SxProps;
  initialMounts?: codeMount[];
  requiredMounts?: number;
  scope?: string;
  ref?: React.Ref<MountCodeHandle>;
}

const WARN_TOAST_DELAY = 900;

export const MountCode: React.FC<MountCodeProps> = ({
  isWizard = true,
  showWizardControls = false,
  allowAdd = true,
  allowCreate = true,
  showSingleMount = false,
  syncAppMetaOnSingleMount = false,
  action,
  onClose,
  sx = {},
  initialMounts = [],
  requiredMounts = -1,
  scope = "_default",
  ref,
}) => {
  const { next } = useWizardControls();
  const dispatch = useDispatch();
  const { codeMounts, code } = useScopedMounts(scope);
  const appMetaState = useDeserifySelector((s) => s.appMeta);

  const {
    volumes: allowVolumes = true,
    repositories: allowRepos = true,
    warning,
    message,
  } = useParentAllowedCodeSources();

  const hasWarnedRef = useRef(false);
  const [originalMounts] = useState<codeMount[]>(initialMounts);

  const [showNewVol, setShowNewVol] = useState(false);
  const [showNewRepo, setShowNewRepo] = useState(false);
  const [showRepoCredentialUpdate, setShowRepoCredentialUpdate] = useState(false);
  const [repoCredentialTarget, setRepoCredentialTarget] = useState<{ mount: codeMount; idx: number } | null>(null);
  const [wizardKey, setWizardKey] = useState(0);
  const [showUseTemplate, setShowUseTemplate] = useState(false);

  const indexedMounts = useMemo(
    () =>
      codeMounts
        .map((mount, scopedIndex) => ({ mount, scopedIndex }))
        .filter((entry): entry is { mount: codeMount; scopedIndex: number } => entry.mount != null),
    [codeMounts],
  );

  const selectedSourceId = appMetaState.sourceMount?.sourceId;
  const selectedMountType = appMetaState.sourceMount?.mountType;

  const selectedEntry = useMemo(
    () =>
      indexedMounts.find(
        (entry) => entry.mount.sourceId === selectedSourceId && entry.mount.mountType === selectedMountType,
      ) ??
      indexedMounts.find((entry) => entry.mount.appDeploy) ??
      indexedMounts[0],
    [indexedMounts, selectedMountType, selectedSourceId],
  );

  const displayedEntries = useMemo(
    () => (showSingleMount ? (selectedEntry ? [selectedEntry] : []) : indexedMounts),
    [indexedMounts, selectedEntry, showSingleMount],
  );

  const filteredMounts = useMemo(() => indexedMounts.map((entry) => entry.mount), [indexedMounts]);
  const displayedMounts = useMemo(() => displayedEntries.map((entry) => entry.mount), [displayedEntries]);
  const displayedToScopedIndex = useMemo(() => displayedEntries.map((entry) => entry.scopedIndex), [displayedEntries]);

  const noSourcesAllowed = !allowVolumes && !allowRepos;
  const areCodeMountsAtMax = filteredMounts.length >= resolveMaxCodeMountLimit();

  const {
    config,
    formData,
    volumeList,
    repoList,
    handleChange,
    handleRemove,
    setRefreshVol,
    setRefreshRepo,
    availableRepos,
    availableVolumes,
    errors,
    setErrors,
    validateStep,
    validateFields,
    isStepValid,
    hasTemplates,
  } = useCodeMountForm(
    displayedMounts,
    requiredMounts,
    allowAdd,
    scope,
    allowVolumes,
    allowRepos,
    displayedToScopedIndex,
    filteredMounts,
    showSingleMount,
  );

  const uiVolumeList = allowVolumes ? volumeList : [];
  const uiRepoList = allowRepos ? repoList : [];
  const uiAvailableVolumes = allowVolumes ? availableVolumes : [];
  const uiAvailableRepos = allowRepos ? availableRepos : [];
  const uiHasTemplates = allowVolumes && hasTemplates;

  const forceCreateAllowed = !allowCreate && showSingleMount && displayedMounts.length === 0;

  const disableCreateButton = Object.values(errors).some(
    (msg) => msg && !msg.includes("A volume or repository is required."),
  );
  const isDisabled = !forceCreateAllowed && disableCreateButton;

  const leftoverVolumes = uiAvailableVolumes.length > 0;
  const leftoverRepos = uiAvailableRepos.length > 0;

  const repoCredentialSource = useMemo(() => {
    if (!repoCredentialTarget) return null;

    return (
      repoList.find(
        (repo) =>
          repoCredentialTarget.mount.mountType === CodeMountSourceType.REPOSITORY &&
          repo.identifier === repoCredentialTarget.mount.sourceId,
      ) ?? null
    );
  }, [repoCredentialTarget, repoList]);

  useImperativeHandle(ref, () => ({ validateStep, setErrors, validateFields }));

  useEffect(() => {
    if (!warning || hasWarnedRef.current) return;

    const t = setTimeout(() => {
      window.alertInfoMessage?.(message ?? "Public context: mounting local volumes may expose files to collaborators.");
      hasWarnedRef.current = true;
    }, WARN_TOAST_DELAY);

    return () => clearTimeout(t);
  }, [warning, message]);

  const onLocalNext = () => {
    if (!validateStep()) return;

    setErrors({});
    const finalMounts = getCodeMounts(filteredMounts);
    const diff = diffMounts(filteredMounts, originalMounts, getCodeMounts);
    const changed = diff.added.length > 0 || diff.removed.length > 0;

    if (!isWizard && typeof action === "function") {
      action(changed ? finalMounts : [], changed ? diff : undefined);
    }

    if (isWizard) next();
  };

  const handleAddCode = () => {
    if (!validateStep()) return;
    code.add();
  };

  const handleVolSuccess = (v: Volume) => {
    if (!allowVolumes) return;

    const nextMount: codeMount = {
      mountType: CodeMountSourceType.VOLUME,
      sourceId: v.identifier,
      destinationPath: `${v.name}`,
      sourceName: v.name,
      canRemove: !showSingleMount,
      canEdit: true,
    };

    if (showSingleMount) {
      const existingIndex = codeMounts.findIndex(
        (m) => m.mountType === CodeMountSourceType.VOLUME && m.sourceId === v.identifier,
      );

      const normalizedMounts = codeMounts.map((mount) => ({
        ...mount,
        appDeploy: false,
        canEdit: true,
        canRemove: true,
      }));

      let updatedMounts: codeMount[];

      if (existingIndex >= 0) {
        updatedMounts = normalizedMounts.map((mount, idx) =>
          idx === existingIndex
            ? {
                ...mount,
                ...nextMount,
                appDeploy: true,
                canEdit: true,
                canRemove: false,
              }
            : mount,
        );
      } else {
        updatedMounts = [
          ...normalizedMounts,
          {
            ...nextMount,
            appDeploy: true,
            canEdit: true,
            canRemove: false,
          },
        ];
      }

      code.setAll(updatedMounts);

      if (syncAppMetaOnSingleMount) {
        const activeMount = updatedMounts.find((mount) => mount.appDeploy) ?? updatedMounts[updatedMounts.length - 1];

        dispatch(
          setAppMetaFields({
            sourceMount: activeMount,
            directoryPrefix: resolveDirectoryPrefix(activeMount.destinationPath),
          }),
        );
      }
    } else {
      const alreadyMounted = codeMounts.some(
        (m) => m.mountType === CodeMountSourceType.VOLUME && m.sourceId === v.identifier,
      );
      if (alreadyMounted) return;
      code.add(nextMount);
    }

    setRefreshVol(true);
    setShowNewVol(false);
    setShowUseTemplate(false);
    setShowNewRepo(false);
    setShowRepoCredentialUpdate(false);
    setRepoCredentialTarget(null);
    setErrors({});
    setWizardKey((k) => k + 1);
  };

  const handleRepoSuccess = (repo: Repository) => {
    if (!allowRepos) return;

    const nextMount: codeMount = {
      mountType: CodeMountSourceType.REPOSITORY,
      sourceId: repo.identifier,
      destinationPath: `${repo.name}`,
      sourceName: repo.name,
      canRemove: !showSingleMount,
      canEdit: true,
    };

    if (showSingleMount) {
      const existingIndex = codeMounts.findIndex(
        (m) => m.mountType === CodeMountSourceType.REPOSITORY && m.sourceId === repo.identifier,
      );

      const normalizedMounts = codeMounts.map((mount) => ({
        ...mount,
        appDeploy: false,
        canEdit: true,
        canRemove: true,
      }));

      let updatedMounts: codeMount[];

      if (existingIndex >= 0) {
        updatedMounts = normalizedMounts.map((mount, idx) =>
          idx === existingIndex
            ? {
                ...mount,
                ...nextMount,
                appDeploy: true,
                canEdit: true,
                canRemove: false,
              }
            : mount,
        );
      } else {
        updatedMounts = [
          ...normalizedMounts,
          {
            ...nextMount,
            appDeploy: true,
            canEdit: true,
            canRemove: false,
          },
        ];
      }

      code.setAll(updatedMounts);

      if (syncAppMetaOnSingleMount) {
        const activeMount = updatedMounts.find((mount) => mount.appDeploy) ?? updatedMounts[updatedMounts.length - 1];

        dispatch(
          setAppMetaFields({
            sourceMount: activeMount,
            directoryPrefix: resolveDirectoryPrefix(activeMount.destinationPath),
          }),
        );
      }
    } else {
      const alreadyMounted = codeMounts.some(
        (m) => m.mountType === CodeMountSourceType.REPOSITORY && m.sourceId === repo.identifier,
      );
      if (alreadyMounted) return;
      code.add(nextMount);
    }

    setRefreshVol(false);
    setRefreshRepo(true);
    setShowNewVol(false);
    setShowUseTemplate(false);
    setShowNewRepo(false);
    setShowRepoCredentialUpdate(false);
    setRepoCredentialTarget(null);
    setErrors({});
    setWizardKey((k) => k + 1);
  };

  const handleRepoCredentialUpdateOpen = (mount: codeMount, idx: number) => {
    const sourceRepo =
      mount.mountType === CodeMountSourceType.REPOSITORY
        ? repoList.find((repo) => repo.identifier === mount.sourceId)
        : undefined;

    if (!sourceRepo) {
      window.alertErrorMessage?.("Unable to locate the selected repository to update credentials.");
      return;
    }

    setShowNewRepo(false);
    setShowNewVol(false);
    setShowUseTemplate(false);
    setRepoCredentialTarget({ mount, idx });
    setShowRepoCredentialUpdate(true);
  };

  const handleRepoCredentialUpdateSuccess = (repo: Repository) => {
    if (!allowRepos || !repoCredentialTarget) return;

    const scopedIdx = displayedToScopedIndex?.[repoCredentialTarget.idx] ?? repoCredentialTarget.idx;
    const currentMount = codeMounts[scopedIdx];

    if (!currentMount) {
      setShowRepoCredentialUpdate(false);
      setRepoCredentialTarget(null);
      setRefreshRepo(true);
      return;
    }

    const nextMount: codeMount = {
      ...currentMount,
      mountType: CodeMountSourceType.REPOSITORY,
      sourceId: repo.identifier,
      sourceName: repo.name,
      destinationPath: currentMount.destinationPath || repo.name,
      needsCredentialUpdate: false,
    };

    const updatedMounts = codeMounts.map((mount, idx) => (idx === scopedIdx ? nextMount : mount));
    code.setAll(updatedMounts);

    if (showSingleMount && syncAppMetaOnSingleMount) {
      const activeMount = updatedMounts.find((mount) => mount.appDeploy) ?? updatedMounts[updatedMounts.length - 1];

      if (activeMount) {
        dispatch(
          setAppMetaFields({
            sourceMount: activeMount,
            directoryPrefix: resolveDirectoryPrefix(activeMount.destinationPath),
          }),
        );
      }
    }

    setRefreshRepo(true);
    setShowRepoCredentialUpdate(false);
    setRepoCredentialTarget(null);
    setErrors({});
    setWizardKey((k) => k + 1);
  };

  const renderForm = () => (
    <>
      <AideForm
        config={config}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={() => {}}
        errors={errors}
        loading={false}
        context={{
          volumes: uiVolumeList,
          repositories: uiRepoList,
          handleRemove,
          validateStep,
          openRepoCredentialUpdate: handleRepoCredentialUpdateOpen,
        }}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 0 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {allowAdd && (leftoverVolumes || leftoverRepos) && !areCodeMountsAtMax && !showSingleMount && (
            <Button
              variant="contained"
              onClick={handleAddCode}
              disabled={!isStepValid}
              data-testid="mount-code--add-mount"
            >
              Add Mount +
            </Button>
          )}

          {((allowCreate && !areCodeMountsAtMax) || (showSingleMount && displayedMounts.length === 0)) && (
            <>
              {allowVolumes && (
                <Button
                  variant="outlined"
                  onClick={() => setShowNewVol((v) => !v)}
                  disabled={isDisabled}
                  data-testid="mount-code--create-new-mount"
                >
                  {showNewVol ? "Cancel New Volume" : "Create New Volume"}
                </Button>
              )}

              {allowRepos && (
                <Button
                  variant="outlined"
                  onClick={() => setShowNewRepo((v) => !v)}
                  disabled={isDisabled}
                  data-testid="mount-code--create-new-mount-repo"
                >
                  {showNewRepo ? "Cancel New Repository" : "Create New Repository"}
                </Button>
              )}

              {uiHasTemplates && (
                <Button
                  variant="outlined"
                  onClick={() => setShowUseTemplate((v) => !v)}
                  disabled={isDisabled}
                  data-testid="mount-code--use-template"
                >
                  {showUseTemplate ? "Cancel Use Template" : "Use Template"}
                </Button>
              )}
            </>
          )}
        </Box>

        {warning && (
          <Box
            role="alert"
            sx={{
              px: 1.25,
              py: 0.75,
              borderRadius: 1,
              border: "1px solid var(--warning-color)",
              color: "var(--warning-color)",
              fontSize: 13,
            }}
          >
            {message ?? "Public context: volumes and repos are allowed for now, but be mindful of exposing files."}
          </Box>
        )}

        {noSourcesAllowed && (
          <Box sx={{ color: "var(--placeholder-text-color)", fontSize: 14 }}>
            No code sources are allowed for this context.
          </Box>
        )}
      </Box>

      {allowRepos && (
        <RepositoryModal
          key={`repo-${wizardKey}`}
          show={showNewRepo}
          setShow={setShowNewRepo}
          onSuccess={handleRepoSuccess}
        />
      )}

      {allowRepos && repoCredentialSource && (
        <RepositoryModal
          key={`repo-needs-credentials-${wizardKey}`}
          show={showRepoCredentialUpdate}
          setShow={setShowRepoCredentialUpdate}
          onSuccess={handleRepoCredentialUpdateSuccess}
          cloneSource={repoCredentialSource}
          clearCredentialOnClone={true}
          requireCredential={true}
          title="Update Repository Credentials"
        />
      )}

      {allowVolumes && (
        <VolumeModal
          key={`volume-${wizardKey}`}
          show={showNewVol}
          setShow={setShowNewVol}
          onSuccess={handleVolSuccess}
        />
      )}

      {allowVolumes && (
        <TemplateForkModal show={showUseTemplate} setShow={setShowUseTemplate} onSuccess={handleVolSuccess} />
      )}
    </>
  );

  const onLocalModalClose = () => {
    code.reset();
    originalMounts.forEach((m) => code.add(m));
    if (onClose) onClose();
    setRefreshVol(true);
    setRefreshRepo(true);
  };

  const didApplyInitialMounts = useRef(false);

  useEffect(() => {
    if (filteredMounts.length > 0) {
      if (!didApplyInitialMounts.current && requiredMounts > 0) {
        const updated = (showSingleMount ? codeMounts : filteredMounts).map((mount, idx) => {
          const shouldLock = showSingleMount ? !!mount.appDeploy : idx < requiredMounts;

          if (shouldLock && (mount.canEdit || mount.canRemove)) {
            return {
              ...mount,
              canEdit: false,
              canRemove: false,
            };
          }

          return mount;
        });

        const current = showSingleMount ? codeMounts : filteredMounts;
        const isSame = JSON.stringify(current) === JSON.stringify(updated);

        if (!isSame) {
          code.setAll(updated);
        }

        didApplyInitialMounts.current = true;
      }

      return;
    }

    if (didApplyInitialMounts.current) return;

    const noReduxMounts = filteredMounts.length === 0;
    const hasAllowedVolumeList = allowVolumes && volumeList.length > 0;
    const hasAllowedRepoList = allowRepos && repoList.length > 0;

    if (!hasAllowedVolumeList && !hasAllowedRepoList) return;

    if (noReduxMounts && initialMounts.length > 0) {
      const validInitials = initialMounts.filter((mount) => {
        if (mount.mountType === CodeMountSourceType.VOLUME && allowVolumes) {
          return volumeList.some((v) => v.identifier === mount.sourceId);
        }

        if (mount.mountType === CodeMountSourceType.REPOSITORY && allowRepos) {
          return !!mount.needsCredentialUpdate || repoList.some((r) => r.identifier === mount.sourceId);
        }

        return false;
      });

      validInitials.forEach((mount) => code.add(mount));
      didApplyInitialMounts.current = true;
    } else if (noReduxMounts && requiredMounts > 0) {
      const canUseVolumes = allowVolumes && volumeList.length > 0;
      const pool = canUseVolumes ? volumeList : repoList;
      const asType = canUseVolumes ? CodeMountSourceType.VOLUME : CodeMountSourceType.REPOSITORY;

      for (let i = 0; i < Math.min(requiredMounts, pool.length); i++) {
        const src = pool[i];
        code.add({
          mountType: asType,
          sourceId: src?.identifier ?? 0,
          destinationPath: src?.name ?? "",
          sourceName: src?.name ?? "",
          canRemove: false,
          canEdit: true,
        });
      }

      didApplyInitialMounts.current = true;
    }
  }, [
    volumeList,
    repoList,
    filteredMounts,
    codeMounts,
    code,
    initialMounts,
    requiredMounts,
    allowVolumes,
    allowRepos,
    showSingleMount,
  ]);

  useEffect(() => {
    log("mount view sync", {
      scope,
      showSingleMount,
      appMetaSourceMount: appMetaState.sourceMount,
      codeMounts,
      indexedMounts,
      selectedEntry,
      displayedEntries,
      filteredMounts,
      displayedMounts,
      displayedToScopedIndex,
    });
  }, [
    scope,
    showSingleMount,
    appMetaState.sourceMount,
    codeMounts,
    indexedMounts,
    selectedEntry,
    displayedEntries,
    filteredMounts,
    displayedMounts,
    displayedToScopedIndex,
  ]);

  if (isWizard) {
    return (
      <WizardCustomStep
        showWizardControls={showWizardControls}
        onNextOverride={onLocalNext}
        contentSx={{ p: !showSingleMount ? 2 : 0, overflowY: "visible" }}
        wrapperSx={sx}
        useBoundedHeightLayout={showWizardControls}
      >
        <wizardCustomStepTemplate.content>{renderForm()}</wizardCustomStepTemplate.content>
      </WizardCustomStep>
    );
  }

  return (
    <MountsModalTemplate onClose={onLocalModalClose} onSubmit={onLocalNext} buttonLabel="Update Code" wrapperSx={sx}>
      <mountsModalTemplate.form>{renderForm()}</mountsModalTemplate.form>
    </MountsModalTemplate>
  );
};

MountCode.displayName = "MountCode";

export default MountCode;
