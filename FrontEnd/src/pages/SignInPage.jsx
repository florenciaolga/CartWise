import { signInUser } from "../api/authenticationAPI";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { RiWallet3Fill } from "react-icons/ri";
import groceriesImg from "../assets/groceriesImg.png";

function validateEmail(value) {
  if (!value) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return "Invalid email format (ex: nam@email.com).";
  return "";
}

function validatePassword(value, signinError = "") {
  if (!value || value.trim() === "") {
    return "Password is required.";
  }
  if (signinError) {
    return signinError;
  }
  return "";
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-red-500">
      <span className="mt-px shrink-0">{message}</span>
    </p>
  );
}

export default function SignInPage() {
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [serverError, setServerError] = useState("");
  const [signinError, setSigninError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [touched, setTouched] = useState({ email: false, password: false });

  const navigate = useNavigate();

  const emailError    = touched.email ? validateEmail(email) : null;
  const passwordError = touched.password ? validatePassword(password, signinError) : null;

  const isFormValid =
    validateEmail(email) === "" && validatePassword(password) === "";

  const handleBlur = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const borderClass = (err) =>
    err === null
      ? "border-gray-200"
      : err === ""
      ? "border-green-400 ring-1 ring-green-300"
      : "border-red-400 ring-1 ring-red-300";

  const handleSignIn = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!isFormValid) return;

    setIsLoading(true);
    setServerError("");

    try {
      const { ok, data } = await signInUser({email, password});

    if (ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (rememberMe) {
          localStorage.setItem("rememberDevice", "true");
        }
        
        setSuccessMessage("Sign In successful! Redirecting to dashboard...");
        setTimeout(() => {navigate("/dashboard");}, 1800);
      } else {
        const msg = data.error || "Login failed.";
        if (
          msg.toLowerCase().includes("password") ||
          msg.toLowerCase().includes("invalid")
        ) {
          setSigninError("Incorrect email or password.");
        } else {
          setServerError(msg);
        }
      }
    } catch (error) {
      console.error("Error API:", error);
      setServerError("Tidak bisa terhubung ke server. Pastikan backend sudah aktif.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white p-4 font-manrope">
      <div className="flex h-full max-h-[700px] w-full max-w-[1000px] overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">

        <div className="relative hidden w-1/2 flex-col justify-center p-16 text-white md:flex">
          <img src={groceriesImg} alt="Groceries" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-white/80"></div>
          <div className="relative z-10">
            <div className="mb-12 flex items-center gap-3">
              <RiWallet3Fill className="text-4xl text-[#48521D]" />
              <span className="text-4xl font-semibold tracking-tight text-[#48521D]">CartWise</span>
            </div>
            <h1 className="text-[3.8rem] font-bold leading-[1.1] text-[#48521D]">
              Your <br /> Household <br /> Budget <br /> Companion
            </h1>
          </div>
        </div>

        <div className="flex w-full flex-col justify-center bg-[#FCFFF6] p-10 md:w-1/2 md:p-16">
          <h2 className="mb-2 text-3xl font-semibold text-black">Welcome Back</h2>
          <p className="mb-8 text-black">Please enter your details to access your account</p>

          {successMessage && (
            <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 shadow-sm">
              <p className="text-sm font-semibold text-green-700">
                {successMessage}
              </p>
            </div>
          )}

          <form onSubmit={handleSignIn} className="flex flex-col gap-4" noValidate>

            <div className="space-y-0.5">
              <label className="text-sm font-semibold text-black">Email Address</label>
              <div className="relative">
                <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#767C7E]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (serverError) setServerError(""); 
                  }}
                  onBlur={() => handleBlur("email")}
                  placeholder="name@example.com"
                  className={`w-full rounded-2xl border bg-[#E8EDF2] py-3 pl-12 pr-4 outline-none transition focus:ring-2 focus:ring-[#4A541F] text-[#767C7E] font-medium ${borderClass(emailError)}`}
                />
              </div>
              <FieldError message={emailError} />
            </div>

            <div className="space-y-0.5">
              <label className="text-sm font-semibold text-black">Password</label>
              <div className="relative">
                <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#767C7E]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (serverError) setServerError("");
                    if (signinError) setSigninError("");
                  }}
                  onBlur={() => handleBlur("password")}
                  placeholder="••••••••"
                  className={`w-full rounded-2xl border bg-[#E8EDF2] py-3 pl-12 pr-10 outline-none transition focus:ring-2 focus:ring-[#4A541F] text-[#767C7E] font-medium ${borderClass(passwordError)}`}
                />
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#767C7E]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                </div>
              </div>
              <FieldError message={passwordError} />
            </div>

            <div className="flex items-center gap-3 py-1">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-5 w-5 cursor-pointer rounded border-gray-300 accent-[#4A541F] focus:ring-[#4A541F]"
              />
              <label htmlFor="rememberMe" className="text-sm font-medium text-[#5A6062] cursor-pointer select-none">
                Remember this device for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 w-full rounded-full bg-[#4A541F] py-3.5 font-bold text-[#E8FFE8] transition-all hover:bg-[#3d4519] active:scale-95 shadow-lg disabled:bg-gray-400"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#5A6062] font-medium">
            Don't have an account?{" "} 
            <Link
              to="/sign-up"
              className="font-semibold text-[#48521D] underline transition hover:text-[#3d4519]"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}