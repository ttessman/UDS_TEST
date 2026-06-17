import { useEffect, useState } from "react";
import { AideForm, AideFormField } from "../aideform";
import { Box } from "@mui/material";
import { registerUser } from "api/user.api";
import { UserRegister } from "es/aide/master/user/v1/user_pb";
import { useFormValidation } from "hooks";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { getToken } from "api/token.api";
import { validateEmail, validateUserId } from "./helpers/aideform.resource.user.helpers";

interface RegistrationValsUDS {
  uuid: string; // KeyCloak UUID
  userId: string; // AIDE Username
  firstName: string;
  lastName: string;
  email: string;
}

export interface BackendToken extends JwtPayload {
  sub: string; // UUID
  email: string;
  given_name: string; // First Name
  family_name: string; // Last Name
  preferred_username: string; // AIDE Username
}

const RegistrationFormUDS = () => {
  const [formData, setFormData] = useState<RegistrationValsUDS>({
    userId: "",
    firstName: "",
    lastName: "",
    email: "",
    uuid: "",
  });

  useEffect(() => {
    // Grab the token from the Backend
    getToken()
      .then((result) => {
        // Decode the JWT
        const token = jwtDecode<BackendToken>(result.data);

        if (!token.sub) throw new Error("No UUID found in token");

        // Populate the form with keycloak data
        setFormData({
          userId: token.preferred_username?.split("@")[0] ?? token.preferred_username,
          firstName: token.given_name,
          lastName: token.family_name,
          email: token.email,
          uuid: token.sub,
        });
      })
      .catch(window.handleFetchError);
  }, []);

  const config: AideFormField<RegistrationValsUDS>[] = [
    {
      type: "hidden",
      name: "uuid",
      label: "UUID",
      sx: { mb: 2 },
    },
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
      name: "email",
      label: "Email",
      required: true,
      validate: validateEmail,
      sx: { mb: 2 },
    },
    {
      type: "text",
      name: "firstName",
      label: "First Name",
      required: true,
      sx: { mb: 2 },
      validate: (val: string) => {
        if (!val) return "First name is required.";
        return null;
      },
    },
    {
      type: "text",
      name: "lastName",
      label: "Last Name",
      required: true,
      sx: { mb: 2 },
      validate: (val: string) => {
        if (!val) return "Last name is required.";
        return null;
      },
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

  const { errors, clearFieldError, validateStep } = useFormValidation(formData, config);

  const handleChange = (name: keyof RegistrationValsUDS, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name, true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.uuid) throw new Error("UUID is missing");

      const isValid = validateStep();
      if (!isValid) return;

      const userRegister: UserRegister = new UserRegister();
      userRegister.uuid = formData.uuid;
      userRegister.userId = formData.userId;
      userRegister.email = formData.email;
      userRegister.firstName = formData.firstName;
      userRegister.lastName = formData.lastName;

      await registerUser(userRegister);

      window.location.replace("/");
    } catch (e) {
      window.handleFetchError(e);
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

export default RegistrationFormUDS;
