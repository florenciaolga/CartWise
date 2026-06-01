import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInUser } from "../api/authenticationAPI";
import {
  validateEmail,
  validatePassword,
} from "../utils/validators";
import { saveLoginData } from "../services/authService";

export default function useSignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signinError, setSigninError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [touched, setTouched] = useState({email: false, password: false});
  const emailError = touched.email ? validateEmail(email) : null;
  const passwordError = touched.password ? validatePassword(password, signinError) : null;

  const handleSignIn = async (e) => {
    e.preventDefault();

    setTouched({
      email: true,
      password: true,
    });

    if (
      validateEmail(email) !== "" ||
      validatePassword(password) !== ""
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const { ok, data } =
        await signInUser({
          email,
          password,
        });

      if (ok) {
        saveLoginData(data, rememberMe);

        setSuccessMessage(
          "Sign In successful!"
        );

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setSigninError(
          "Incorrect email or password."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email, setEmail,
    password, setPassword,
    rememberMe, setRememberMe,
    showPassword, setShowPassword,
    isLoading,
    successMessage,
    emailError,
    passwordError,
    touched, setTouched,
    handleSignIn,
  };
}