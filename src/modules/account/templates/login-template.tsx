"use client"

import { useState } from "react"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import ForgotPassword from "@modules/account/components/forgot-password"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
  FORGOT_PASSWORD = "forgot-password",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState("sign-in")

  return (
    <div
      className="min-h-screen bg-[#f7f7f7] flex items-start justify-center pt-[80px] px-[16px] pb-[40px]"
      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
    >
      <div
        className="w-full max-w-[420px] bg-white rounded-[16px] overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        {currentView === "sign-in" ? (
          <Login setCurrentView={setCurrentView} />
        ) : currentView === "register" ? (
          <Register setCurrentView={setCurrentView} />
        ) : (
          <ForgotPassword setCurrentView={setCurrentView} />
        )}
      </div>
    </div>
  )
}

export default LoginTemplate
