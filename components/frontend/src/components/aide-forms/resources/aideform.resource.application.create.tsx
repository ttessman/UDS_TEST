import React, { useEffect, useRef, useState } from "react";
import { get } from "lodash";
import { AideForm, AideFormContext, AideFormField } from "components/forms/aideform";
import { useWizardControls } from "wizards/createWizard/content/create.wizard.form.context";
import { CapabilityClass, Environment } from "es/aide/master/environment/v1/environment_pb";
import type { applicationCreateState } from "wizards/resourceTypes/application.wizard";
import {
  WizardCustomStep,
  template as wizardCustomStepTemplate,
} from "wizards/createWizard/content/create.wizard.custom.step";
import { ApplicationMetaForm, AppMetaFormHandle } from "./aideform.resource.application.meta.form";
import { MountCodeHandle } from "./aideform.resource.mount.code";
import { useScopedMounts } from "hooks/useScopedMounts";
import { DEFAULT_CODE_SCOPE } from "reducers/aideform.resource.mount.code.reducers";
import { getNotice } from "./helpers/aideform.resource.mount.helpers";
import { useDeserifySelector } from "middleware/serifyMiddleware";
import { createLogger, maximumDescriptionLength, maximumNameIDLength, tiers } from "utils/shared/constants";

const log = createLogger("ApplicationCreateForm", "#00BCD4");

interface Props {
  state: applicationCreateState;
  dispatcher: (action: any) => void;
  envList?: Environment[];
  showWizardControls?: boolean;
  scope?: string;
}

/**
 * Component for the first step of the Application Creation Wizard.
 * Handles general settings, launch settings, and deployment metadata.
 * @param {Props} props - Component properties.
 * @returns {React.FC} The Application Create Form component.
 */
export const ApplicationCreateForm: React.FC<Props> = ({
  state,
  dispatcher,
  envList = [],
  showWizardControls = false,
  scope = DEFAULT_CODE_SCOPE,
}) => {
  const appMetaState = useDeserifySelector((s) => s.appMeta);

  const { next } = useWizardControls();
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const mountCodeRef = useRef<MountCodeHandle>(null);
  const appMetaRef = useRef<AppMetaFormHandle>(null);

  const { codeMounts, code } = useScopedMounts(scope);

  /**
   * Step 1 owns which mount is the app source.
   * Normalize the full list whenever the selected source mount changes.
   *
   * Rules for Step 1:
   * - selected mount: moved to front, appDeploy=true, canEdit=true, canRemove=false
   * - all other mounts: appDeploy=false, canEdit=true, canRemove=true
   */
  useEffect(() => {
    log("useEffect check codeMounts before unlocking");
    const selectedSourceId = appMetaState.sourceMount?.sourceId;
    const selectedMountType = appMetaState.sourceMount?.mountType;

    if (selectedSourceId == null || selectedMountType == null) return;
    if (codeMounts.length === 0) return;

    const selectedIndex = codeMounts.findIndex(
      (mount) => mount.sourceId === selectedSourceId && mount.mountType === selectedMountType,
    );

    if (selectedIndex < 0) return;

    const selectedMount = codeMounts[selectedIndex];
    const otherMounts = codeMounts.filter((_, idx) => idx !== selectedIndex);

    const nextMounts = [
      {
        ...selectedMount,
        appDeploy: true,
        canEdit: true,
        canRemove: false,
      },
      ...otherMounts.map((mount) => ({
        ...mount,
        appDeploy: false,
        canEdit: true,
        canRemove: true,
      })),
    ];

    const isSame = JSON.stringify(codeMounts) === JSON.stringify(nextMounts);
    if (isSame) return;

    log("useEffect check codeMounts after locking", { codeMounts, nextMounts });
    code.setAll(nextMounts);
  }, [appMetaState.sourceMount, codeMounts, code]);

  /**
   * Handle field changes.
   * Clears local validation errors and dispatches to global Redux state.
   * @param {keyof applicationCreateState} name - The field name to update.
   * @param {any} value - The new value to update.
   */
  const handleChange = (name: keyof applicationCreateState, value: any) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    dispatcher({ type: "UPDATE_FIELD", name, value });
  };

  const config: AideFormField<applicationCreateState>[] = [
    {
      type: "group",
      name: "general-settings",
      heading: "General Application Settings:",
      headingVariant: "h4",
      content: "The following wizard will guide you through creating an application and mounting associated volumes.",
      sx: { display: "flex", flexDirection: "column", gap: 1, mb: 3.5 },
      children: [
        {
          type: "text",
          name: "name",
          label: "Application Name",
          fullWidth: true,
          required: false,
          maxLength: maximumNameIDLength,
        },
        {
          type: "textarea",
          name: "description",
          label: "Description",
          fullWidth: true,
          maxLength: maximumDescriptionLength,
        },
      ],
    },
    {
      type: "group",
      name: "launch-settings",
      heading: "Launch Settings:",
      headingVariant: "h4",
      content: "The following fields will define how an Application is launched.",
      sx: {
        display: "flex",
        flexDirection: "row",
        gap: 1,
        mb: 3.5,
        alignItems: "flex-start",
        "@media (max-width: 767px)": {
          flexWrap: "wrap",
        },
      },
      children: [
        {
          type: "select",
          name: "hardwareTier",
          label: "Hardware Tier",
          fullWidth: true,
          required: true,
          options: () => tiers.map((tier) => ({ label: tier.id, value: String(tier.value) })),
          validate: (v) => (!v ? "Hardware Tier is required" : null),
        },
        {
          type: "group",
          name: "env-group",
          sx: { display: "flex", flexDirection: "column", position: "relative" },
          children: [
            getNotice(
              () => envList.length === 0,
              "NOTE: No environment was found.",
              "envNotice",
              () => null,
              {
                position: "absolute",
                transform: "translateY(-100%)",
                mt: 0,
                mb: 0,
              },
            ),
            {
              type: "select",
              name: "environment",
              label: "Environment",
              fullWidth: true,
              required: true,
              options: () => envList.map((env) => ({ label: env.identifier, value: env.identifier })),
              validate: (v) => (!v ? "Environment is required" : null),
            },
          ],
        },
        {
          type: "select",
          name: "framework",
          label: "Application Framework",
          fullWidth: true,
          required: true,
          condition: (ctx) => !!ctx.formData.environment,
          options: (ctx) => {
            const selected = envList.find((env) => env.identifier === ctx.formData.environment);
            return selected
              ? selected.capabilities
                  .filter((c) => c.klass === CapabilityClass.APP_SERVER)
                  .map((c) => ({ label: c.identifier, value: c.identifier }))
              : [];
          },
          validate: (v) => (!v ? "Framework is required" : null),
        },
      ],
    },
    {
      type: "group",
      name: "deployment-group",
      heading: "Deployment:",
      headingVariant: "h4",
      content: <p>Select the file used to create the app.</p>,
      sx: { mb: 3.5, display: "flex", flexDirection: "column", gap: "0.75rem" },
      children: [
        {
          type: "content",
          name: "app-meta-form",
          content: <ApplicationMetaForm ref={appMetaRef} showMountCode mountCodeRef={mountCodeRef} scope={scope} />,
        },
      ],
    },
    {
      type: "group",
      name: "tags-group",
      heading: "Application Tags",
      content: <p>Add tags to this Application to improve searching and collaboration.</p>,
      sx: { mb: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" },
      children: [
        {
          type: "tags",
          name: "tags",
          label: "Tags",
          required: false,
        },
      ],
    },
  ];

  /**
   * Helper to flatten nested group fields for validation.
   * @param {AideFormField<any>[]} fields - The fields to flatten.
   * @returns {AideFormField<any>[]} A flat array of fields.
   */
  const flattenFields = (fields: AideFormField<any>[]): AideFormField<any>[] =>
    fields.flatMap((f) => (f.type === "group" && f.children ? [f, ...flattenFields(f.children)] : [f]));

  /**
   * Validates the fields in the current step.
   * @returns {boolean} True if the step is valid.
   */
  const validateStep = (): boolean => {
    const flat = flattenFields(config);
    const newErrs: typeof errors = {};
    for (const f of flat) {
      if (f.condition && !f.condition({ formData: state } as AideFormContext<any>)) continue;
      if (!f.validate) continue;
      const rawValue =
        typeof f.value === "function" ? f.value({ formData: state } as AideFormContext<any>) : get(state, f.name);
      const msg = f.validate(rawValue, state as any, f);
      if (msg) newErrs[String(f.name)] = msg;
    }
    setErrors(newErrs);
    return Object.keys(newErrs).length === 0;
  };

  const validateMounts = (): boolean => mountCodeRef.current?.validateStep() ?? true;
  const validateAppMeta = (): boolean => appMetaRef.current?.validateStep() ?? true;

  /**
   * Overrides the wizard's next action to include local validation and mount locking.
   */
  const onLocalNext = () => {
    const ok = validateMounts() && validateStep() && validateAppMeta();
    if (!ok) return;

    /**
     * LOCK EDITING ON NEXT:
     * Tag the source mount right before moving to Step 2.
     * This ensures Step 2 renders the mount as read-only.
     */
    const selectedSourceId = appMetaState.sourceMount?.sourceId;
    const selectedMountType = appMetaState.sourceMount?.mountType;

    if (selectedSourceId != null && selectedMountType != null) {
      const selectedIndex = codeMounts.findIndex(
        (mount) => mount.sourceId === selectedSourceId && mount.mountType === selectedMountType,
      );

      if (selectedIndex >= 0) {
        const selectedMount = codeMounts[selectedIndex];
        const otherMounts = codeMounts.filter((_, idx) => idx !== selectedIndex);

        const updatedMounts = [
          {
            ...selectedMount,
            appDeploy: true,
            canEdit: false,
            canRemove: false,
          },
          ...otherMounts.map((mount) => ({
            ...mount,
            appDeploy: false,
            canEdit: true,
            canRemove: true,
          })),
        ];

        log("onLocalNext", { codeMounts, updatedMounts });
        code.setAll(updatedMounts);
      }
    }

    setErrors({});
    mountCodeRef.current?.setErrors?.({});
    appMetaRef.current?.setErrors?.({});
    next();
  };

  return (
    <WizardCustomStep
      showWizardControls={showWizardControls}
      onNextOverride={onLocalNext}
      useBoundedHeightLayout={showWizardControls}
    >
      <wizardCustomStepTemplate.content>
        <AideForm
          config={config}
          formData={state}
          handleChange={handleChange}
          handleSubmit={() => {}}
          loading={false}
          errors={errors}
          context={{ formData: state, mounts: codeMounts }}
          sx={{ display: "flex", flexDirection: "column" }}
        />
      </wizardCustomStepTemplate.content>
    </WizardCustomStep>
  );
};
