import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUpUser } from "../api/authenticationAPI";

import {
  validateName,
  validateEmail,
  validatePassword,
} from "../utils/validators";

export default function useSignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [emailBackendError, setEmailBackendError] = useState("");
  const [touched, setTouched] = useState({name: false, email: false, password: false});
  const nameError = touched.name ? validateName(name) : null;
  const emailError = touched.email ? (emailBackendError || validateEmail(email)) : null;
  const passwordError = touched.password ? validatePassword(password) : null;

  const handleSignUp = async (e) => {
    e.preventDefault();

    setTouched({
      name: true,
      email: true,
      password: true,
    });

    if (
      validateName(name) !== "" ||
      validateEmail(email) !== "" ||
      validatePassword(password) !== ""
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const { ok, data } =
        await signUpUser({
          name,
          email,
          password,
        });

      if (ok) {
        setSuccessMessage(
          "Account created successfully!"
        );

        setTimeout(() => {
          navigate("/sign-in");
        }, 1500);

      } else {
        if (
          data.error
            ?.toLowerCase()
            .includes("email")
        ) {
          setEmailBackendError(
            data.error
          );
        }
      }

    } catch (error) {
      console.error(error);

    } finally {
      setIsLoading(false);
    }
  };

  return {
    name, setName,
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    isLoading,
    successMessage,
    nameError,
    emailError,
    passwordError,
    touched, setTouched,
    handleSignUp,
  };
}