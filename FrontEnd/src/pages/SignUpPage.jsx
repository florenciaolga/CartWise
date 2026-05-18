import { signUpUser } from "../api/authenticationAPI"; 
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdPerson } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { RiWallet3Fill } from "react-icons/ri";
import groceriesImg from "../assets/groceriesImg.png";

function validateName(value) {
  if (!value) return null; 
  if (value.trim().length < 2) return "Name must be at least 2 characters";
  return ""; 
}

function validateEmail(value) {
  if (!value) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return "Invalid email format (ex: name@email.com).";
  return "";
}

function validatePassword(value) {
  if (!value || value.trim() === "") {
    return "Password is required.";
  }
  const errors = [];
  if (value.length < 8 || value.length > 12)
    errors.push("8–12 characters");
  if (!/[A-Z]/.test(value))
    errors.push("contain 1 uppercase letter");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value))
    errors.push("minimal 1 special character (!@#$ dll.)");
  return errors.length ? `Password must be: ${errors.join(", ")}.` : "";
}

function FieldError({ message }) {
  return (
    <div className="min-h-[22px]">
      {message && (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-red-500">
          <span className="mt-px shrink-0"></span>
          <span>{message}</span>
        </p>
      )}
    </div>
  );
}

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [touched, setTouched] = useState({ name: false, email: false, password: false });

  const navigate = useNavigate();

  const nameError   = touched.name     ? validateName(name)     : null;
  const emailError  = touched.email    ? validateEmail(email)   : null;
  const passwordError = touched.password ? validatePassword(password) : null;

  const isFormValid =
    validateName(name)     === "" &&
    validateEmail(email)   === "" &&
    validatePassword(password) === "";

  const handleBlur = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const borderClass = (err) =>
    err === null
      ? "border-gray-200"
      : err === ""
      ? "border-green-400 ring-1 ring-green-300"
      : "border-red-400 ring-1 ring-red-300";

  const handleSignUp = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });

    if (!isFormValid) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { ok, data } = await signUpUser({name, email, password});

    if (ok) {
        setSuccessMessage("Account created successfully! Redirecting to sign in...");
        setTimeout(() => {navigate("/sign-in");}, 1800);
      } else {
        const msg = data.error || "Registrasi gagal. Silakan coba lagi.";
        if (msg.toLowerCase().includes("email")) {
          setTouched((prev) => ({ ...prev, email: true }));
          setErrorMessage("");
          setEmailBackendError(msg);
        } else {
          setErrorMessage(msg);
        }
      }
    } catch (error) {
      console.error("Error API:", error);
      setErrorMessage("Tidak bisa terhubung ke server. Pastikan backend sudah aktif.");
    } finally {
      setIsLoading(false);
    }
  };

  const [emailBackendError, setEmailBackendError] = useState("");

  const handleEmailChange = (val) => {
    setEmail(val);
    if (emailBackendError) setEmailBackendError("");
  };

  const displayEmailError = emailBackendError
    ? emailBackendError
    : emailError;

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

        <div className="flex w-full flex-col justify-center bg-[#FCFFF6] p-10 pb-14 md:w-1/2 md:p-16">
          <h2 className="mb-2 text-3xl font-semibold text-black">Welcome</h2>
          <p className="mb-8 text-black">Please enter your details to access your account</p>

          {successMessage && (
            <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 shadow-sm">
              <p className="text-sm font-semibold text-green-700">
                {successMessage}
              </p>
            </div>
          )}

          <form onSubmit={handleSignUp} className="flex flex-col gap-1" noValidate>

            <div className="space-y-0">
              <label className="text-sm font-medium text-black">Name</label>
              <div className="relative">
                <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-[#767C7E]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur("name")}
                  placeholder="Full Name"
                  className={`w-full rounded-2xl border bg-[#E8EDF2] py-2.5 pl-12 pr-4 outline-none transition focus:ring-2 focus:ring-[#4A541F] text-[#767C7E] font-medium ${borderClass(nameError)}`}
                />
              </div>
              <FieldError message={nameError} />
            </div>

            <div className="space-y-0.5">
              <label className="text-sm font-semibold text-black">Email Address</label>
              <div className="relative">
                <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#767C7E]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="name@example.com"
                  className={`w-full rounded-2xl border bg-[#E8EDF2] py-2.5 pl-12 pr-4 outline-none transition focus:ring-2 focus:ring-[#4A541F] text-[#767C7E] font-medium ${borderClass(emailBackendError ? emailBackendError : emailError)}`}
                />
              </div>
              <FieldError message={displayEmailError} />
            </div>

            <div className="space-y-0.5">
              <label className="text-sm font-semibold text-black">Password</label>
              <div className="relative">
                <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#767C7E]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur("password")}
                  placeholder="••••••••"
                  className={`w-full rounded-2xl border bg-[#E8EDF2] py-2.5 pl-12 pr-10 outline-none transition focus:ring-2 focus:ring-[#4A541F] text-[#767C7E] font-medium ${borderClass(passwordError)}`}
                />
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#767C7E]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                </div>
              </div>
              <FieldError message={passwordError} />

              {touched.password && password.length > 0 && passwordError !== "" && (
                <ul className="mt-1.5 space-y-0.5 text-xs text-[#767C7E]">
                  <CheckItem ok={password.length >= 8 && password.length <= 12} label="8–12 characters" />
                  <CheckItem ok={/[A-Z]/.test(password)} label="Minimal 1 uppercase letter" />
                  <CheckItem ok={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)} label="Minimal 1 special character (!@#$ dll.)" />
                </ul>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full rounded-full bg-[#4A541F] py-3.5 font-bold text-[#E8FFE8] transition-all hover:bg-[#3d4519] active:scale-95 shadow-lg disabled:bg-gray-400"
            >
              {isLoading ? "Mendaftarkan..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#5A6062] font-medium">
            Already have an account?{" "} 
            <Link
              to="/sign-in"
              className="font-semibold text-[#48521D] underline transition hover:text-[#3d4519]"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ ok, label }) {
  return (
    <li className={`flex items-center gap-1.5 ${ok ? "text-green-600" : "text-[#767C7E]"}`}>
      <span>{ok ? "✓" : "○"}</span>
      <span>{label}</span>
    </li>
  );
}