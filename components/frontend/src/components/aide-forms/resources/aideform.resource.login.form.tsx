import { type ReactElement, useState, useMemo, useCallback } from "react";
import { AideForm, AideFormField } from "components/forms/aideform";
import { useFormValidation } from "hooks";
import { useAuthCoreActions } from "hooks";
import { maximumNameIDLength } from "utils/shared/constants";
import { validateUserId } from "./helpers/aideform.resource.user.helpers";

export interface LoginVals {
  username: string;
  password: string;
}

const LoginForm = (): ReactElement => {
  const { handleLocalLoginForm } = useAuthCoreActions();

  const [loginVals, setLoginVals] = useState<LoginVals>({
    username: "",
    password: "",
  });

  const handleChange = useCallback((name: keyof LoginVals, value: any) => {
    setLoginVals((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name, true);
  }, []);

  const baseFields = useMemo<AideFormField<LoginVals>[]>(
    () => [
      {
        type: "text",
        name: "username",
        label: "UserID",
        fullWidth: true,
        maxLength: maximumNameIDLength,
        validate: validateUserId,
        autoComplete: "username",
        sx: { mb: 2 },
      },
      {
        type: "password",
        name: "password",
        label: "Password",
        fullWidth: true,
        validate: (val) => (!val ? "Password is required" : null),
        autoComplete: "current-password",
        sx: { mb: 2 },
      },
      {
        type: "button",
        name: "submit",
        label: "Login",
        fullWidth: true,
        buttonVariant: "contained",
        buttonSize: "large",
      },
    ],
    [],
  );

  const { errors, validateStep, clearFieldError } = useFormValidation(loginVals, baseFields);

  const handleSubmit = useCallback(() => {
    if (validateStep()) {
      void handleLocalLoginForm(loginVals);
    }
  }, [validateStep, handleLocalLoginForm, loginVals]);

  return (
    <AideForm
      config={baseFields}
      formData={loginVals}
      loading={false}
      errors={errors}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        width: "100%",
        maxWidth: "450px",
      }}
      needsForm={true}
    />
  );
};

export default LoginForm;
