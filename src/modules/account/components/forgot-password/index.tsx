"use client"

import { useState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const ForgotPassword = ({ setCurrentView }: Props) => {
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/password-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setMessage(data.message || "If the email exists, a reset link has been sent")
      } else {
        setMessage(data.error || "Failed to send reset email")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    }
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="forgot-password-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Forgot Password</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {isSuccess ? (
        <div className="w-full text-center">
          <p className="text-ui-fg-base mb-6">{message}</p>
          <button
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="underline"
            data-testid="back-to-login-button"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col w-full gap-y-2">
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              data-testid="email-input"
            />
          </div>
          {message && (
            <ErrorMessage error={message} data-testid="forgot-password-error" />
          )}
          <SubmitButton data-testid="send-reset-button" className="w-full mt-6">
            Send Reset Link
          </SubmitButton>
        </form>
      )}

      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Remember your password?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
          data-testid="back-to-login-button"
        >
          Sign in
        </button>
        .
      </span>
    </div>
  )
}

export default ForgotPassword
