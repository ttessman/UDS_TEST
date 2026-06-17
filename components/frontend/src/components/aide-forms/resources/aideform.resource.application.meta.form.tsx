import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { AideForm, AideFormField, FormOption } from "components/forms/aideform";
import { useDispatch } from "react-redux";
import { useDeserifySelector } from "middleware/serifyMiddleware";
import { useContents, useFormValidation } from "hooks";
import { AppMetaState } from "reducers/application.meta.form.reducers";
import { setAppMetaFields } from "reducers/application.meta.form.actions";
import { FsObjectType } from "es/aide/master/api/v1/fs_pb";
import { CodeMountSourceType } from "es/aide/master/code/v1/code_pb";
import { LoadingSpinner } from "components/LoadingSpinner/LoadingSpinner";
import FileManager, { ACCEPTED_FILE_EXTENSIONS, extWithDot, isAllowedExt } from "components/FileManager/FileManager";
import { ContentsType, renderCodeType } from "render/code";
import { codeMount } from "utils/mounts";
import { MountCode, MountCodeHandle } from "./aideform.resource.mount.code";
import {
  normalizeDir,
  normalizePath,
  findNodeByPath,
  toSuffix,
  deepestExistingDir,
  resolveDirNode,
  treeProbeFromSuffix,
  treeDirFromSuffix,
  treeFilePathFromMeta,
} from "components/FileManager/FileHelpers";
import { useScopedMounts } from "hooks/useScopedMounts";
import { resolveDirectoryPrefix } from "utils/utils";
import { createLogger } from "utils/shared/constants";

const log = createLogger("[ApplicationMetaForm]", "#00BCD4");

const getMountKey = (mount?: codeMount) =>
  mount == null ? "" : `${mount.mountType}:${mount.sourceId}:${mount.destinationPath ?? ""}`;

export interface AppMetaFormHandle {
  validateStep: () => boolean;
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<string, string>>>>;
}

interface Props {
  codeMounts?: codeMount[];
  showMountCode?: boolean;
  mountCodeRef?: React.RefObject<MountCodeHandle | null>;
  scope?: string;
  ref?: React.Ref<AppMetaFormHandle>;
}

/**
 * ApplicationMetaForm manages the deployment-specific metadata for an application.
 * It handles file selection, directory validation, and source mount synchronization.
 */
export const ApplicationMetaForm = ({
  codeMounts: codeMountsProp,
  showMountCode = false,
  mountCodeRef,
  scope = "_default",
  ref,
}: Props) => {
  const dispatch = useDispatch();
  const appMeta = useDeserifySelector((s) => s.appMeta);

  const { contentsRoot, contentsError, isLoading, setContentsId, setContentsRoot, setContentsType } = useContents();
  const canValidateTree = !!contentsRoot && !isLoading && !contentsError;

  const [path, setPath] = useState(normalizeDir("/"));
  const [dirEditing, setDirEditing] = useState(false);

  const prevSuffixRef = useRef<string | undefined>(appMeta.directorySuffix);
  const prevIdRef = useRef<string | undefined>(appMeta.fileIdentifier);
  const prevTypeRef = useRef<string | undefined>(appMeta.fileType);
  const prevMountKeysRef = useRef<string[]>([]);

  const { codeMounts: scopedMounts } = useScopedMounts(scope);
  const codeMounts = codeMountsProp ?? scopedMounts;

  const formData = React.useMemo(() => ({ ...appMeta, fileSelect: false }), [appMeta]);

  const dirValidationMode = React.useMemo<"strict" | "disabled">(() => {
    if (isLoading || contentsError || !contentsRoot) return "disabled";
    return "strict";
  }, [isLoading, contentsError, contentsRoot]);

  // ---------------- validators ----------------
  const getFileTypeError = React.useCallback((v?: string | null) => {
    const val = (v ?? "").trim();
    if (!val) return "File Type is required";
    return isAllowedExt(val) ? null : `Unsupported file type: ${extWithDot(val)}`;
  }, []);

  const getFileIdentifierError = React.useCallback(
    (v?: string | null) => {
      if (!v?.trim()) return "File Identifier is required";
      if (!appMeta.fileType) return "File Type is required";
      if (!canValidateTree) return null;

      const safeExt = extWithDot(appMeta.fileType);
      const probeDir = treeProbeFromSuffix(appMeta.directorySuffix);
      const dirWithSlash = probeDir.endsWith("/") ? probeDir : `${probeDir}/`;
      const virtualFile = normalizePath(`${dirWithSlash}${v}${safeExt}`);
      const node = findNodeByPath(contentsRoot as any, virtualFile);

      return node?.type === FsObjectType.FILE ? null : "File not found at the given path.";
    },
    [appMeta.fileType, appMeta.directorySuffix, canValidateTree, contentsRoot],
  );

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const setFieldError = React.useCallback((field: string, error?: string) => {
    setErrors((prev) => {
      if (prev[field] === error) return prev;
      return { ...prev, [field]: error };
    });
  }, []);

  const setFileIdentifierErrorNow = React.useCallback(() => {
    const err = getFileIdentifierError(appMeta.fileIdentifier);
    setFieldError("fileIdentifier", err || undefined);
  }, [getFileIdentifierError, appMeta.fileIdentifier, setFieldError]);

  const setFileTypeErrorNow = React.useCallback(() => {
    const err = getFileTypeError(appMeta.fileType);
    setFieldError("fileType", err || undefined);
  }, [getFileTypeError, appMeta.fileType, setFieldError]);

  /**
   * Callback for when a file is selected in the FileManager.
   * Parses the path and updates the global app metadata.
   */
  const handleOpenFile = React.useCallback(
    (fullPath: string) => {
      const slash = fullPath.lastIndexOf("/");
      const dot = fullPath.lastIndexOf(".");
      if (dot < 0 || dot < slash) {
        window.alertErrorMessage?.("Invalid path: file must have an extension");
        return;
      }
      const dir = slash < 0 ? "" : fullPath.slice(0, slash);
      const id = fullPath.slice(slash + 1, dot);
      const ext = fullPath.slice(dot); // includes "."

      const prefix = appMeta.directoryPrefix || "/";
      const relativeSuffix = toSuffix(dir, prefix);

      dispatch(setAppMetaFields({ directorySuffix: relativeSuffix, fileIdentifier: id, fileType: ext }));
    },
    [dispatch, appMeta.directoryPrefix],
  );

  // ---------------- fields ----------------
  const sharedFields: AideFormField<typeof formData>[] = React.useMemo(
    () => [
      {
        type: "group",
        name: "manual",
        sx: { display: "flex", flexDirection: "row", gap: 1 },
        children: [
          {
            type: "text",
            name: "objectIdentifier",
            label: "Object Identifier",
            required: true,
            validate: (v) => (v ? null : "Object Identifier is required."),
            value: (ctx) => ctx.formData.objectIdentifier,
            sx: {
              width: "100%",
              "@media (min-width: 767px)": {
                width: "75%",
              },
            },
            helper: "The variable name of the application (i.e server, app).",
          },
        ],
      },
      {
        type: "group",
        name: "file-type-and-id",
        sx: { display: "flex", flexDirection: "column", gap: 1, mb: 0 },
        children: [
          {
            type: "text",
            name: "directorySuffix",
            label: "Directory",
            required: true,
            fullWidth: true,
            startAdornment: (ctx) => ctx.formData.directoryPrefix,
            value: (ctx) => ctx.formData.directorySuffix,
            onFocus: () => {
              setDirEditing(true);
              setErrors((e) => ({ ...e, directorySuffix: undefined }));
            },
            onBlur: () => setDirEditing(false),
            validate: (v) => {
              const raw = String(v ?? "").trim();
              if (!raw) return null;
              if (dirValidationMode === "disabled" || !canValidateTree) return null;

              const suffix = toSuffix(raw, appMeta.directoryPrefix || "/");
              const probe = treeProbeFromSuffix(suffix);
              const node = findNodeByPath(contentsRoot as any, probe);
              return node?.type === FsObjectType.DIRECTORY ? null : "Directory not found";
            },
            helper:
              dirValidationMode === "disabled"
                ? "Source not loaded yet—cannot validate this path."
                : "The path to the application file, if not at the mount path.",
            sx: {
              ".MuiInputAdornment-root": {
                mr: "0.5px",
                ".MuiTypography-root": { color: "var(--text-color)" },
              },
            },
          },
          {
            type: "group",
            name: "type-and-id",
            sx: {
              display: "flex",
              flexDirection: "row",
              gap: 1,
              "@media (max-width: 600px)": {
                flexWrap: "wrap",
              },
            },
            children: [
              {
                type: "text",
                name: "fileIdentifier",
                label: "File Identifier",
                required: true,
                validate: (v) => getFileIdentifierError(v),
                onFocus: () => setErrors((prev) => ({ ...prev, fileIdentifier: undefined })),
                onBlur: () => setFileIdentifierErrorNow(),
                value: (ctx) => ctx.formData.fileIdentifier,
                sx: {
                  width: "75%",
                  "@media (max-width: 600px)": {
                    width: "100%",
                  },
                },
                helper: "Name of the file which contains the app definition.",
              },
              {
                type: "text",
                name: "fileType",
                label: "File Type",
                required: true,
                validate: (v) => getFileTypeError(v),
                onFocus: () => setErrors((prev) => ({ ...prev, fileType: undefined })),
                onBlur: () => setFileTypeErrorNow(),
                value: (ctx) => ctx.formData.fileType ?? "",
                sx: {
                  width: "25%",
                  "@media (max-width: 600px)": {
                    width: "100%",
                  },
                },
                helper: `File extension (e.g. .py or .ipynb). Allowed: ${ACCEPTED_FILE_EXTENSIONS.join(", ")}`,
              },
            ],
          },
        ],
      },
      {
        type: "content",
        name: "picker",
        content: () =>
          isLoading ? (
            <LoadingSpinner />
          ) : contentsError ? (
            <div style={{ padding: "1em", color: "var(--error-color)" }}>Error loading contents</div>
          ) : contentsRoot == null ? (
            <div style={{ padding: "1em" }}>No contents yet. Pick a source mount.</div>
          ) : (
            (() => {
              const node = resolveDirNode(contentsRoot as any, path);
              if (!node) return <div style={{ padding: "1em" }}>No preview available</div>;
              return (
                <FileManager object={node} onOpenFile={handleOpenFile} onNavigate={(p) => setPath(normalizeDir(p))} />
              );
            })()
          ),
        required: true,
        sx: { border: "1px solid var(--border-color)", borderRadius: "5px" },
        validate: (_v, fd) => {
          const data = fd as AppMetaState;
          const missing: string[] = [];
          if (!data.fileIdentifier) missing.push("file identifier");
          if (!data.fileType) missing.push("file type");
          return missing.length ? `Missing: ${missing.join(", ")}` : null;
        },
      },
    ],
    [
      dirValidationMode,
      canValidateTree,
      appMeta.directoryPrefix,
      contentsRoot,
      getFileIdentifierError,
      setFileIdentifierErrorNow,
      getFileTypeError,
      setFileTypeErrorNow,
      isLoading,
      contentsError,
      path,
      handleOpenFile,
    ],
  );
  const mountField: AideFormField<typeof formData> = React.useMemo(
    () =>
      showMountCode
        ? {
            type: "content",
            name: "mounts",
            content: (
              <MountCode
                ref={mountCodeRef || null}
                showWizardControls={false}
                allowCreate={true}
                requiredMounts={1}
                key={"single-mount"}
                showSingleMount={true}
                syncAppMetaOnSingleMount={true}
                scope={scope}
              />
            ),
          }
        : {
            type: "select",
            name: "sourceMount",
            label: "Source Mount",
            fullWidth: true,
            required: true,
            options: (): FormOption[] =>
              codeMounts.map(
                (mount: codeMount): FormOption => ({
                  value: mount.sourceId,
                  label: `${mount.sourceName} (${renderCodeType(mount.mountType)})`,
                }),
              ),
            value: (ctx) => ctx.formData.sourceMount?.sourceId || "",
            helper: "Change the application's source mount",
          },
    [showMountCode, mountCodeRef, scope, codeMounts],
  );

  const config: AideFormField<typeof formData>[] = React.useMemo(
    () => [mountField, ...sharedFields],
    [mountField, sharedFields],
  );

  // ---------------- form validation hook ----------------
  const {
    errors: vfErrors,
    setErrors: setVfErrors,
    validateStep: validateVfStep,
    clearFieldError,
  } = useFormValidation(formData, config);

  // ---------------- controlled changes ----------------
  const handleChange = React.useCallback(
    (name: keyof typeof formData, value: any) => {
      clearFieldError(name, true);

      const touchesPicker =
        name === "fileIdentifier" || name === "fileType" || name === "directorySuffix" || name === "sourceMount";
      if (touchesPicker) clearFieldError("picker" as any, true);

      if (name === "sourceMount" && !showMountCode) {
        const sourceMount = codeMounts.find((m: codeMount) => m.sourceId === value);

        dispatch(
          setAppMetaFields({
            sourceMount,
            directoryPrefix: resolveDirectoryPrefix(sourceMount?.destinationPath),
          }),
        );

        setFieldError("directorySuffix", undefined);
        setPath(normalizeDir("/"));
        return;
      } else if (name === "directorySuffix") {
        const suffix = toSuffix(String(value), appMeta.directoryPrefix || "/");
        dispatch(setAppMetaFields({ directorySuffix: suffix }));
      } else if (name === "fileType") {
        dispatch(setAppMetaFields({ fileType: String(value) }));
      } else {
        dispatch(setAppMetaFields({ [name]: value } as any));
      }
    },
    [clearFieldError, showMountCode, codeMounts, dispatch, appMeta.directoryPrefix, setFieldError],
  );

  useImperativeHandle(ref, () => ({
    validateStep: () => {
      setFileTypeErrorNow();
      setFileIdentifierErrorNow();
      return validateVfStep();
    },
    setErrors: setVfErrors,
  }));

  /**
   * Sync App Meta fields with the current mount.
   *
   * Important:
   * - Do NOT auto-switch to "addedMount"
   * - Do NOT fall back to codeMounts[0] unless there is no valid current source
   * - Preserve the currently selected source mount whenever it still exists
   * - Otherwise prefer the current appDeploy mount
   */
  useEffect(() => {
    log("source sync effect:start", {
      codeMounts,
      currentSourceMount: appMeta.sourceMount,
      currentDirectoryPrefix: appMeta.directoryPrefix,
      prevMountKeys: prevMountKeysRef.current,
    });

    if (!codeMounts.length) {
      log("no codeMounts, clearing prev keys");
      prevMountKeysRef.current = [];
      return;
    }

    const currentKeys = codeMounts.map(getMountKey);
    const prevKeys = prevMountKeysRef.current;
    prevMountKeysRef.current = currentKeys;

    const currentSource = appMeta.sourceMount;

    const matchingCurrentSource =
      currentSource == null
        ? undefined
        : codeMounts.find(
            (mount) => mount.sourceId === currentSource.sourceId && mount.mountType === currentSource.mountType,
          );

    const appDeploySource = codeMounts.find((mount) => mount.appDeploy);
    const source = matchingCurrentSource ?? appDeploySource ?? codeMounts[0];
    const desiredPrefix = resolveDirectoryPrefix(source.destinationPath);

    const mountsChanged =
      prevKeys.length !== currentKeys.length || prevKeys.some((key, index) => key !== currentKeys[index]);

    const shouldDispatch =
      getMountKey(source) !== getMountKey(appMeta.sourceMount) || desiredPrefix !== appMeta.directoryPrefix;

    log("source sync effect:computed", {
      prevKeys,
      currentKeys,
      mountsChanged,
      matchingCurrentSource,
      appDeploySource,
      chosenSource: source,
      desiredPrefix,
      shouldDispatch,
    });

    // bootstrap guard:
    // if the mount list itself did not change, and we already have a source mount,
    // do not "sync" over bootstrapped app meta
    if (!mountsChanged && appMeta.sourceMount) {
      log("source sync effect:bootstrap guard hit, skipping dispatch");
      return;
    }

    if (!shouldDispatch) {
      log("source sync effect:no dispatch");
      return;
    }

    log("source sync effect:dispatching setAppMetaFields", {
      sourceMount: source,
      directoryPrefix: desiredPrefix,
    });

    dispatch(
      setAppMetaFields({
        sourceMount: source,
        directoryPrefix: desiredPrefix,
      }),
    );
    setPath(normalizeDir("/"));
  }, [codeMounts, appMeta.sourceMount, appMeta.directoryPrefix, dispatch]);

  /**
   * Load contents when source mount ID changes.
   */
  useEffect(() => {
    const id = appMeta.sourceMount?.sourceId;
    if (id) {
      setContentsId(id as any);
      return;
    }

    setContentsRoot((prev) => (prev ? undefined : prev));
  }, [appMeta.sourceMount?.sourceId, setContentsId, setContentsRoot]);

  /**
   * Set contents type (Volume vs Repo) based on mount type.
   */
  useEffect(() => {
    const t = appMeta.sourceMount?.mountType;
    if (t === CodeMountSourceType.VOLUME) {
      setContentsType(ContentsType.VOLUME);
      return;
    }

    if (t === CodeMountSourceType.REPOSITORY) {
      setContentsType(ContentsType.REPOSITORY);
      return;
    }

    setContentsRoot((prev) => (prev ? undefined : prev));
  }, [appMeta.sourceMount?.mountType, setContentsType, setContentsRoot]);

  /**
   * Sync FileManager directory when suffix changes.
   */
  useEffect(() => {
    if (!contentsRoot) return;
    const suffixChanged = prevSuffixRef.current !== appMeta.directorySuffix;
    prevSuffixRef.current = appMeta.directorySuffix;
    if (!suffixChanged) return;

    const desiredPath = treeDirFromSuffix(appMeta.directorySuffix);
    const next = deepestExistingDir(contentsRoot as any, desiredPath);
    if (normalizeDir(next) !== normalizeDir(path)) setPath(normalizeDir(next));
  }, [contentsRoot, appMeta.directorySuffix, path]);

  /**
   * Jump FileManager to parent directory if file fields change.
   */
  useEffect(() => {
    if (!contentsRoot) return;
    const idChanged = prevIdRef.current !== appMeta.fileIdentifier;
    const typeChanged = prevTypeRef.current !== appMeta.fileType;
    const suffixChanged = prevSuffixRef.current !== appMeta.directorySuffix;
    prevIdRef.current = appMeta.fileIdentifier;
    prevTypeRef.current = appMeta.fileType;

    if (!(idChanged || typeChanged || suffixChanged)) return;
    if (!appMeta.fileIdentifier || !appMeta.fileType) return;

    const fp = treeFilePathFromMeta(appMeta.directorySuffix, appMeta.fileIdentifier, appMeta.fileType);
    const node = findNodeByPath(contentsRoot as any, fp);
    if (node) {
      const parent = fp.replace(/\/[^/]+$/, "") || "/";
      const normalizedParent = normalizeDir(parent);
      if (normalizedParent !== path) setPath(normalizeDir(parent));
    }
  }, [contentsRoot, appMeta.directorySuffix, appMeta.fileIdentifier, appMeta.fileType, path]);

  /**
   * Live debounced directory validation.
   */
  useEffect(() => {
    const raw = (appMeta.directorySuffix ?? "").trim();
    if (!raw) {
      setFieldError("directorySuffix", undefined);
      return;
    }
    if (dirValidationMode === "disabled") {
      setFieldError("directorySuffix", undefined);
      return;
    }

    const DEBOUNCE_MS = dirEditing ? 400 : 0;
    const timer = setTimeout(() => {
      const probe = treeProbeFromSuffix(raw);
      const node = findNodeByPath(contentsRoot as any, probe);
      setFieldError("directorySuffix", node?.type === FsObjectType.DIRECTORY ? undefined : "Directory not found");
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [appMeta.directorySuffix, dirEditing, dirValidationMode, contentsRoot, setFieldError]);

  /**
   * Live file existence validation.
   */
  useEffect(() => {
    if (!canValidateTree) return;
    const id = appMeta.fileIdentifier?.trim();
    const ext = appMeta.fileType?.trim();
    if (!id || !ext) return;

    const fp = treeFilePathFromMeta(appMeta.directorySuffix, appMeta.fileIdentifier, appMeta.fileType);
    const node = findNodeByPath(contentsRoot as any, fp);
    if (node?.type === FsObjectType.FILE) setFieldError("fileIdentifier", undefined);
  }, [contentsRoot, appMeta.directorySuffix, appMeta.fileIdentifier, appMeta.fileType, canValidateTree, setFieldError]);

  /**
   * Clear picker errors when identifier and type are provided.
   */
  useEffect(() => {
    if (appMeta.fileIdentifier?.trim() && appMeta.fileType?.trim()) {
      setErrors((prev) => {
        if (!("picker" in prev)) return prev;
        const { picker: _drop, ...rest } = prev as any;
        return rest;
      });
    }
  }, [appMeta.fileIdentifier, appMeta.fileType]);

  /**
   * Re-validate directory as soon as the tree loads.
   */
  useEffect(() => {
    if (dirValidationMode !== "strict") return;
    const raw = (appMeta.directorySuffix ?? "").trim();
    if (!raw) {
      setFieldError("directorySuffix", undefined);
      return;
    }

    const probe = treeProbeFromSuffix(raw);
    const node = findNodeByPath(contentsRoot as any, probe);
    setFieldError("directorySuffix", node?.type === FsObjectType.DIRECTORY ? undefined : "Directory not found");
  }, [dirValidationMode, contentsRoot, appMeta.directorySuffix, setFieldError]);

  log("appMeta render", appMeta);

  return (
    <AideForm
      config={config}
      formData={formData}
      handleChange={handleChange}
      handleSubmit={() => {}}
      errors={{ ...errors, ...vfErrors }}
      loading={false}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    />
  );
};
