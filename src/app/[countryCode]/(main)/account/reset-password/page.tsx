"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { redirect } from "next/navigation"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setMessage("Invalid or missing reset token")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setMessage("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters")
      return
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, password }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setMessage("Password reset successfully")
        setTimeout(() => {
          redirect("/account")
        }, 2000)
      } else {
        setMessage(data.error || "Failed to reset password")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    }
  }

  if (!token) {
    return (
      <div className="w-full flex justify-center px-8 py-8">
        <div className="max-w-sm w-full text-center">
          <h1 className="text-large-semi uppercase mb-6">Invalid Reset Link</h1>
          <p className="text-ui-fg-base mb-6">{message}</p>
          <a href="/account" className="underline">
            Back to account
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex justify-center px-8 py-8">
      <div className="max-w-sm w-full flex flex-col items-center">
        <h1 className="text-large-semi uppercase mb-6">Reset Password</h1>
        <p className="text-center text-base-regular text-ui-fg-base mb-8">
          Enter your new password below.
        </p>

        {isSuccess ? (
          <div className="w-full text-center">
            <p className="text-ui-fg-base mb-6">{message}</p>
            <p className="text-small-regular text-ui-fg-subtle">
              Redirecting to sign in...
            </p>
          </div>
        ) : (
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="flex flex-col w-full gap-y-2">
              <Input
                label="New Password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                data-testid="new-password-input"
              />
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                data-testid="confirm-password-input"
              />
            </div>
            {message && (
              <ErrorMessage
                error={message}
                data-testid="reset-password-error"
              />
            )}
            <SubmitButton
              data-testid="reset-password-button"
              className="w-full mt-6"
            >
              Reset Password
            </SubmitButton>
          </form>
        )}
      </div>
    </div>
  )
}
