import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "api/user.api";
import { UserCreate, UserRole } from "es/aide/master/user/v1/user_pb";
import { PublicRoutePaths } from "utils/routes";
import { AideForm, AideFormField } from "../aideform";
import { Box } from "@mui/material";
import { useFormValidation } from "hooks";
import { validateEmail, validateUserId } from "./helpers/aideform.resource.user.helpers";

export interface RegistrationVals {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegistrationForm = () => {
  const [formData, setFormData] = useState<RegistrationVals>({
    userId: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [generalError, setGeneralError] = useState<string | null>(null);
  const navigate = useNavigate();

  const config: AideFormField<RegistrationVals>[] = [
    {
      type: "text",
      name: "userId",
      label: "User ID",
      required: true,
      validate: validateUserId,
      sx: { mb: 2 },
    },
    {
      type: "text",
      name: "firstName",
      label: "First Name",
      sx: { mb: 2 },
    },
    {
      type: "text",
      name: "lastName",
      label: "Last Name",
      sx: { mb: 2 },
    },
    {
      type: "text",
      name: "email",
      label: "Email",
      required: true,
      validate: validateEmail,
      sx: { mb: 2 },
    },
    {
      type: "password",
      name: "password",
      label: "Password",
      required: true,
      validate: (val: string) => (!val ? "Password is required." : null),
      sx: { mb: 2 },
    },
    {
      type: "password",
      name: "confirmPassword",
      label: "Confirm Password",
      required: true,
      validate: (val: string, data: RegistrationVals) => {
        if (!val) return "Confirm Password is required.";
        if (val !== data.password) return "Passwords must match.";
        return null;
      },
      sx: { mb: 2 },
    },
    {
      type: "button",
      name: "submit",
      label: "Register",
      fullWidth: true,
      onClick: () => {
        void handleSubmit();
      },
    },
  ];

  const { errors, validateStep, clearFieldError } = useFormValidation(formData, config);

  const handleChange = (name: keyof RegistrationVals, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name, true);
  };

  const handleSubmit = async () => {
    const isValid = validateStep();
    if (!isValid) return;

    try {
      const newUser = new UserCreate();
      newUser.userId = formData.userId;
      newUser.firstName = formData.firstName;
      newUser.lastName = formData.lastName;
      newUser.email = formData.email;
      newUser.password = formData.password;
      newUser.roles = [UserRole.DEVELOPER];

      await createUser(newUser);
      navigate(PublicRoutePaths.LOGIN);
    } catch (error: any) {
      const apiError =
        error?.rawMessage || error?.response?.data?.message || "Failed to create user. Please try again.";
      setGeneralError(apiError);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        width: "100%",
        maxWidth: "450px",
      }}
    >
      {generalError && <div style={{ color: "var(--error-color)", marginBottom: 8 }}>{generalError}</div>}
      <AideForm
        config={config}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={() => void handleSubmit}
        errors={errors}
        loading={false}
        sx={{ width: "100%" }}
        needsForm={true}
      />
    </Box>
  );
};

export default RegistrationForm;
