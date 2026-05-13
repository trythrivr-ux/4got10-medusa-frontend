import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div
      className="flex flex-col"
      data-testid="login-page"
      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
    >
      {/* Header */}
      <div className="px-[28px] pt-[28px] pb-[24px] border-b border-[#f0f0f0]">
        <h1 className="text-[18px] font-semibold text-black tracking-[-0.01em]">
          Sign in
        </h1>
        <p className="text-[12.5px] text-[#00000055] mt-[4px]">
          Welcome back — sign in to your account.
        </p>
      </div>

      {/* Form */}
      <form
        className="px-[28px] pt-[24px] pb-[28px] flex flex-col gap-[12px]"
        action={formAction}
      >
        <div className="flex flex-col gap-[4px]">
          <label className="text-[12px] font-medium text-[#00000070]">
            Email
          </label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            data-testid="email-input"
            className="w-full h-[42px] px-[14px] rounded-[10px] border border-[#e8e8e8] text-[13.5px] font-medium text-black outline-none focus:border-black transition-colors placeholder:text-[#00000030] bg-white"
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-[4px]">
          <label className="text-[12px] font-medium text-[#00000070]">
            Password
          </label>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
            className="w-full h-[42px] px-[14px] rounded-[10px] border border-[#e8e8e8] text-[13.5px] font-medium text-black outline-none focus:border-black transition-colors placeholder:text-[#00000030] bg-white"
            placeholder="••••••••"
          />
        </div>

        <ErrorMessage error={message} data-testid="login-error-message" />

        <SubmitButton
          data-testid="sign-in-button"
          className="w-full h-[42px] mt-[4px] bg-black text-white rounded-[10px] text-[13.5px] font-semibold hover:bg-[#222] transition-colors"
        >
          Sign in
        </SubmitButton>

        <div className="flex items-center justify-between pt-[4px]">
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.FORGOT_PASSWORD)}
            className="text-[12px] text-[#00000055] hover:text-black transition-colors"
            data-testid="forgot-password-button"
          >
            Forgot password?
          </button>
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
            className="text-[12px] font-medium text-black underline underline-offset-2"
            data-testid="register-button"
          >
            Create account
          </button>
        </div>
      </form>
    </div>
  )
}

export default Login
