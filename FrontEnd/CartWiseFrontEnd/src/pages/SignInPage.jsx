import { MdEmail, MdLock, MdVisibility } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { RiWallet3Fill } from "react-icons/ri";

import groceriesImg from "../assets/groceriesImg.png"

export default function SignInPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white p-4 font-sans">
      <div className="flex h-full max-h-[700px] w-full max-w-[1000px] overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">
        <div className="relative hidden w-1/2 flex-col justify-center p-16 text-white md:flex">

          <img 
            src={groceriesImg}
            alt="Groceries" 
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-white/80"></div>
          
          <div className="relative z-10">
            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg">
                <RiWallet3Fill className="text-4xl text-[#48521D]"/>
              </div>
              <span className="text-4xl font-semibold tracking-tight text-[#48521D]">CartWise</span>
            </div>

            <h1 className="text-[3.8rem] font-bold leading-[1.1] text-[#48521D]">
              Your <br /> 
              Household <br /> 
              Budget <br /> 
              Companion
            </h1>
          </div>
        </div>

        <div className="flex w-full flex-col justify-center bg-[#FCFFF6] p-10 md:w-1/2 md:p-16">
          <h2 className="mb-2 text-3xl font-semibold text-gray-800">Welcome Back</h2>
          <p className="mb-8 text-black">Please enter your details to access your account</p>

          <form className="flex flex-col gap-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-black">Email Address</label>
              <div className="relative">
                <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-gray-200 bg-[#E8EDF2] py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#4A541F]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-black">Password</label>
              <div className="relative">
                <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-[#E8EDF2] py-3 pl-12 pr-10 outline-none focus:ring-2 focus:ring-[#4A541F]"
                />
                <MdVisibility className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="rem" className="h-4 w-4 rounded border-gray-300 accent-[#4A541F]" />
              <label htmlFor="rem" className="text-sm font-medium text-[#5A6062]">Remember this device for 30 days</label>
            </div>

            <button className="mt-2 w-full rounded-full bg-[#4A541F] py-3.5 font-semibold text-[#E8FFE8] transition-all hover:bg-[#3d4519] active:scale-95 shadow-lg">
              Sign In
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <span className="relative bg-[#F9FBF7] px-4 text-[12px] font-semibold uppercase text-[#767C7E] tracking-widest">Or continue with</span>
          </div>

          {/* Social Buttons */}
          <div className="flex gap-4">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 hover:bg-gray-50 transition-colors shadow-sm">
              <FcGoogle size={22} />
              <span className="text-sm font-bold text-gray-700">Google</span>
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 hover:bg-gray-50 transition-colors shadow-sm">
              <FaApple size={22} />
              <span className="text-sm font-bold text-gray-700">Apple</span>
            </button>
          </div>

          <p className="mt-10 text-center text-sm text-[#5A6062] font-medium">
            Don't have an account? <a href="#" className="font-semibold text-[#48521D] underline">Sign Up</a>
          </p>
        </div>

      </div>
    </div>
  );
}