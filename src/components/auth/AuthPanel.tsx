"use client";

import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

type Mode = "login" | "register" | "forgot";
type ButtonTone = "default" | "error" | "success";

function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  disabled,
  error,
  maxLength,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 ml-0.5 block text-[13px] font-bold text-white">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        maxLength={maxLength}
        className="w-full rounded-[2px] border px-[10px] py-[10px] text-[13px] text-white/80 outline-none"
        style={{
          borderColor: error ? "rgba(195,44,55,0.6)" : "rgba(255,255,255,0.12)",
          background: "rgba(0, 0, 0, 0.2)",
          marginBottom: "35px",
          opacity: disabled ? 0.7 : 1,
        }}
      />
    </div>
  );
}

function AuthSubmit({
  label,
  loadingLabel,
  loading,
  tone = "default",
}: {
  label: string;
  loadingLabel: string;
  loading: boolean;
  tone?: ButtonTone;
}) {
  const textColor = tone === "error" ? "crimson" : tone === "success" ? "aqua" : "white";

  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-4 mb-5 w-full cursor-pointer rounded-[20px] border px-4 py-[9px] text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-70"
      style={{
        background: "rgba(0, 0, 0, 0.4)",
        borderColor: "rgba(255,255,255,0.4)",
        color: textColor,
        wordSpacing: "1.9px",
      }}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="inline-loader inline-loader--sm" aria-hidden="true" />
          <span>{loadingLabel}</span>
        </span>
      ) : (
        label
      )}
    </button>
  );
}

export default function AuthPanel({ defaultMode = "login" }: { defaultMode?: Mode }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginButton, setLoginButton] = useState<{ text: string; tone: ButtonTone }>({ text: "Login", tone: "default" });
  const [registerButton, setRegisterButton] = useState<{ text: string; tone: ButtonTone }>({ text: "Register", tone: "default" });
  const [forgotButton, setForgotButton] = useState<{ text: string; tone: ButtonTone }>({ text: "Send code", tone: "default" });
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginCooldown, setLoginCooldown] = useState(0);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});
  const [checkingRegisterEmail, setCheckingRegisterEmail] = useState(false);

  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1);
  const [resetErrors, setResetErrors] = useState<Record<string, string>>({});
  const [resetCompleteMessage, setResetCompleteMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loginErrors.email && !loginErrors.password) return;
    const timer = window.setTimeout(() => setLoginErrors({}), 2000);
    return () => window.clearTimeout(timer);
  }, [loginErrors]);

  useEffect(() => {
    if (!registerErrors.username && !registerErrors.email && !registerErrors.password) return;
    const timer = window.setTimeout(() => setRegisterErrors({}), 2000);
    return () => window.clearTimeout(timer);
  }, [registerErrors]);

  useEffect(() => {
    if (!resetErrors.email && !resetErrors.code && !resetErrors.password) return;
    const timer = window.setTimeout(() => setResetErrors({}), 2000);
    return () => window.clearTimeout(timer);
  }, [resetErrors]);

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  useEffect(() => {
    if (loginCooldown <= 0) return;

    const timer = window.setInterval(() => {
      setLoginCooldown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setLoginAttempts(0);
          setLoginButton({ text: "Login", tone: "default" });
          return 0;
        }

        const next = prev - 1;
        setLoginButton({
          text: `Too many login attempts, Try again in ${next} sec`,
          tone: "error",
        });
        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [loginCooldown]);

  const resetCommonState = () => {
    setMessage(null);
    setLoading(false);
    setShowPassword(false);
    setLoginErrors({});
    setRegisterErrors({});
    setResetErrors({});
    setLoginButton({ text: "Login", tone: "default" });
    setRegisterButton({ text: "Register", tone: "default" });
    setForgotButton({ text: "Send code", tone: "default" });
    setLoginAttempts(0);
    setLoginCooldown(0);
  };

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setResetStep(1);
    setResetCode("");
    setNewPassword("");
    setResetCompleteMessage(null);
    resetCommonState();
  };

  const forgotMessage = useMemo(() => {
    if (resetStep === 1) {
      return "We will send a password reset code to the email you used to create your account. Please enter the email below.";
    }
    if (resetStep === 2) {
      return `We have sent a code to this email address: ${resetEmail}. Please copy the code and enter it below. In case of some system error, you might also check in spam messages.`;
    }
    return "Now you can enter your new password. Please make sure that your new password is very hard to guess by someone else.";
  }, [resetEmail, resetStep]);

  useEffect(() => {
    setForgotButton({
      text: resetStep === 1 ? "Send code" : resetStep === 2 ? "Continue" : "Change password",
      tone: "default",
    });
  }, [resetStep]);

  const flashButton = (
    setter: Dispatch<SetStateAction<{ text: string; tone: ButtonTone }>>,
    text: string,
    tone: ButtonTone,
    fallbackText: string
  ) => {
    setter({ text, tone });
    window.setTimeout(() => setter({ text: fallbackText, tone: "default" }), 2000);
  };

  const triggerLoginCooldown = () => {
    setLoginCooldown(30);
    setLoginButton({
      text: "Too many login attempts, Try again in 30 sec",
      tone: "error",
    });
  };

  const setSingleError = (
    setter: Dispatch<SetStateAction<Record<string, string>>>,
    key: string,
    value: string
  ) => {
    setter({ [key]: value });
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (loginCooldown > 0) return;
    setLoginErrors({});
    setMessage(null);

    if (!loginEmail.trim()) {
      setSingleError(setLoginErrors, "email", "Please enter your email");
      flashButton(setLoginButton, "Please enter your email", "error", "Login");
      return;
    }

    if (!loginEmail.includes("@")) {
      setSingleError(setLoginErrors, "email", "Email should include '@'");
      flashButton(setLoginButton, "Email should include '@'", "error", "Login");
      return;
    }

    if (!loginEmail.includes(".com")) {
      setSingleError(setLoginErrors, "email", "Email should include '.com'");
      flashButton(setLoginButton, "Email should include '.com'", "error", "Login");
      return;
    }

    if (!loginEmail.toLowerCase().includes("gmail")) {
      setSingleError(setLoginErrors, "email", "Email should include 'gmail'");
      flashButton(setLoginButton, "Email should include 'gmail'", "error", "Login");
      return;
    }

    if (!loginPassword.trim()) {
      setSingleError(setLoginErrors, "password", "Please enter your password");
      flashButton(setLoginButton, "Please enter your password", "error", "Login");
      return;
    }

    if (loginPassword.trim().length < 4) {
      setSingleError(setLoginErrors, "password", "Password is too short");
      flashButton(setLoginButton, "Password is too short", "error", "Login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        const nextAttempts = loginAttempts + 1;
        setLoginAttempts(nextAttempts);
        if (nextAttempts >= 3) {
          showToast({ type: "error", message: "Too many login attempts. Try again in 30 seconds." });
          triggerLoginCooldown();
          return;
        }
        showToast({ type: "error", message: data.error ?? "Wrong password or email" });
        flashButton(setLoginButton, data.error ?? "Wrong password or email", "error", "Login");
        return;
      }

      setLoginAttempts(0);
      setLoginCooldown(0);
      setLoginButton({ text: "Logged in successfully, We are taking you home!", tone: "success" });
      setMessage({ type: "success", text: "Logged in successfully, We are taking you home!" });
      showToast({ type: "success", message: "Logged in successfully." });
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setRegisterErrors({});
    setMessage(null);

    if (registerUsername.trim().length < 1) {
      setSingleError(setRegisterErrors, "username", "Please enter your name");
      flashButton(setRegisterButton, "Please enter your name", "error", "Register");
      return;
    }

    if (registerUsername.trim().length < 4) {
      setSingleError(setRegisterErrors, "username", "Username should have atleast 4 characters");
      flashButton(setRegisterButton, "Username should have atleast 4 characters", "error", "Register");
      return;
    }

    if (!registerEmail.trim()) {
      setSingleError(setRegisterErrors, "email", "Please enter your email");
      flashButton(setRegisterButton, "Please enter your email", "error", "Register");
      return;
    }

    if (!registerEmail.includes("@")) {
      setSingleError(setRegisterErrors, "email", "Email should include '@'");
      flashButton(setRegisterButton, "Email should include '@'", "error", "Register");
      return;
    }

    if (!registerEmail.includes(".com")) {
      setSingleError(setRegisterErrors, "email", "Email should include '.com'");
      flashButton(setRegisterButton, "Email should include '.com'", "error", "Register");
      return;
    }

    if (!registerEmail.toLowerCase().includes("gmail")) {
      setSingleError(setRegisterErrors, "email", "Email should include 'gmail'");
      flashButton(setRegisterButton, "Email should include 'gmail'", "error", "Register");
      return;
    }

    if (!registerPassword.trim()) {
      setSingleError(setRegisterErrors, "password", "Please enter the password");
      flashButton(setRegisterButton, "Please enter the password", "error", "Register");
      return;
    }

    if (registerPassword.trim().length < 4) {
      setSingleError(setRegisterErrors, "password", "Password is too short and weak");
      flashButton(setRegisterButton, "Password is too short and weak", "error", "Register");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerUsername.trim(),
          email: registerEmail.trim(),
          password: registerPassword,
        }),
      });

      const contentType = res.headers.get("content-type") ?? "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { error: (await res.text()) || "Registration failed" };

      if (!res.ok) {
        showToast({ type: "error", message: data.error ?? "Not registered, something went wrong" });
        flashButton(setRegisterButton, data.error ?? "Not registered, something went wrong", "error", "Register");
        return;
      }

      setRegisterButton({ text: "Registered successfully, Now lets take you home!", tone: "success" });
      setMessage({ type: "success", text: "Registered successfully, Now lets take you home!" });
      showToast({ type: "success", message: "Registration successful." });
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const checkRegisterEmail = async () => {
    const email = registerEmail.trim();
    if (!email || !email.includes("@") || !email.includes(".com") || !email.toLowerCase().includes("gmail")) {
      return;
    }

    setCheckingRegisterEmail(true);
    try {
      const res = await fetch(`/api/auth/check-email/${encodeURIComponent(email)}`);
      const data = await res.json();

      setRegisterErrors((prev) => {
        const next = { ...prev };
        if (data.taken) next.email = "The email is already in use with another account";
        else if (next.email === "The email is already in use with another account") delete next.email;
        return next;
      });
      if (data.taken) {
        showToast({ type: "error", message: "The email is already in use with another account" });
        flashButton(setRegisterButton, "The email is already in use with another account", "error", "Register");
      }
    } finally {
      setCheckingRegisterEmail(false);
    }
  };

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    setResetErrors({});
    setMessage(null);

    if (!resetEmail.trim()) {
      setSingleError(setResetErrors, "email", "Please enter your email");
      flashButton(setForgotButton, "Please enter your email", "error", "Send code");
      return;
    }

    if (!resetEmail.includes("@")) {
      setSingleError(setResetErrors, "email", "Email should include '@'");
      flashButton(setForgotButton, "Email should include '@'", "error", "Send code");
      return;
    }

    if (!resetEmail.includes(".com")) {
      setSingleError(setResetErrors, "email", "Email should include '.com'");
      flashButton(setForgotButton, "Email should include '.com'", "error", "Send code");
      return;
    }

    if (!resetEmail.toLowerCase().includes("gmail")) {
      setSingleError(setResetErrors, "email", "Email should include 'gmail'");
      flashButton(setForgotButton, "Email should include 'gmail'", "error", "Send code");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast({ type: "error", message: data.error ?? "Failed to send code" });
        flashButton(setForgotButton, data.error ?? "Failed to send code", "error", "Send code");
        return;
      }

      setResetStep(2);
      setResetErrors({});
      setMessage(null);
      showToast({ type: "success", message: "Reset code sent." });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckCode = async (e: FormEvent) => {
    e.preventDefault();
    setResetErrors({});
    setMessage(null);

    if (!resetCode.trim()) {
      setSingleError(setResetErrors, "code", "Please enter the code");
      flashButton(setForgotButton, "Please enter the code", "error", "Continue");
      return;
    }

    if (!/^\d+$/.test(resetCode.trim())) {
      setSingleError(setResetErrors, "code", "Code should be numbers only");
      flashButton(setForgotButton, "Code should be numbers only", "error", "Continue");
      return;
    }

    if (resetCode.trim().length !== 6) {
      setSingleError(setResetErrors, "code", "Code should have 6 digits");
      flashButton(setForgotButton, "Code should have 6 digits", "error", "Continue");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/check-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail.trim(), code: resetCode.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast({ type: "error", message: data.error ?? "You have entered a wrong code" });
        flashButton(setForgotButton, data.error ?? "You have entered a wrong code", "error", "Continue");
        return;
      }

      setResetStep(3);
      setResetErrors({});
      setMessage(null);
      showToast({ type: "success", message: "Reset code confirmed." });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setResetErrors({});
    setMessage(null);

    if (!newPassword.trim()) {
      setSingleError(setResetErrors, "password", "Please enter the new password");
      flashButton(setForgotButton, "Please enter the new password", "error", "Change password");
      return;
    }

    if (newPassword.trim().length < 4) {
      setSingleError(setResetErrors, "password", "The Password is too short and weak");
      flashButton(setForgotButton, "The Password is too short and weak", "error", "Change password");
      return;
    }

    if (newPassword.trim().length > 15) {
      setSingleError(setResetErrors, "password", "The password is too long, you may forget it");
      flashButton(setForgotButton, "The password is too long, you may forget it", "error", "Change password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail.trim(), code: resetCode.trim(), newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast({ type: "error", message: data.error ?? "Failed to reset password" });
        flashButton(setForgotButton, data.error ?? "Failed to reset password", "error", "Change password");
        return;
      }

      setForgotButton({ text: "Password successfully changed", tone: "success" });
      setResetCompleteMessage(
        `Hello ${data.username ?? "there"}, We have successfully reset your password. You can now login using that new password.`
      );
      setNewPassword("");
      showToast({ type: "success", message: "Password changed successfully." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-white px-0 py-0 sm:px-0"
    >
      <main
        className="shadow-[0px_2px_4px_0px_rgba(0,0,0,0.9)] md:mx-[20%]"
      >
        <nav
          className="bg-cover px-[10px] pt-[10px] pb-[25px]"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.9), rgb(22,40,50), rgba(0,0,0,0.9))" }}
        >
          <Link href="/" className="mb-[27px] flex items-center gap-2">
            <Image src="/files/sagetech_icon.jpg" alt="SageTech" width={35} height={35} className="rounded-sm object-cover" />
            <span
              className="truncate text-[28px] font-bold text-white max-sm:text-[25px]"
              style={{ fontFamily: "serif", wordSpacing: "2.2px" }}
            >
              Sage<span className="text-cyan-400">Tech</span>
            </span>
          </Link>
          <span className="mt-0.5 block h-px bg-white/10" />

          {mode !== "forgot" && (
            <div className="flex justify-between gap-6 px-1 sm:px-0">
              <div className="flex-1 sm:flex-none">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="w-full cursor-pointer rounded-[20px] border bg-transparent px-8 py-[5px] capitalize text-white outline-none sm:min-w-[180px] sm:px-[65px]"
                  style={{
                    borderColor: mode === "login" ? "aqua" : "white",
                    color: mode === "login" ? "aqua" : "white",
                  }}
                >
                  login
                </button>
              </div>
              <div className="flex-1 sm:flex-none">
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="w-full cursor-pointer rounded-[20px] border bg-transparent px-8 py-[5px] capitalize text-white outline-none sm:min-w-[180px] sm:px-[65px]"
                  style={{
                    borderColor: mode === "register" ? "aqua" : "white",
                    color: mode === "register" ? "aqua" : "white",
                  }}
                >
                  register
                </button>
              </div>
            </div>
          )}
        </nav>

        <div>
          {message && message.type === "success" ? (
            <div
              className="mx-0 px-[10px] py-3 text-[13px] sm:px-[30px]"
              style={{
                color: "aqua",
                background: "rgba(0,0,0,0.35)",
                wordSpacing: "1.6px",
                lineHeight: "21px",
              }}
            >
              {message.text}
            </div>
          ) : null}

          {mode === "register" && (
            <form
              onSubmit={handleRegister}
              className="px-[10px] py-[30px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.9)] sm:px-[30px]"
              style={{ background: "rgba(0, 0, 0, 0.9)" }}
            >
              <div>
                <AuthField
                  id="username"
                  label="Username"
                  value={registerUsername}
                  onChange={setRegisterUsername}
                  error={registerErrors.username}
                />
                <AuthField
                  id="email"
                  label="Email"
                  type="email"
                  value={registerEmail}
                  onChange={setRegisterEmail}
                  onBlur={checkRegisterEmail}
                  error={registerErrors.email}
                />
                {checkingRegisterEmail ? (
                  <div className="-mt-7 mb-6 text-[12px] text-white/35">Checking email...</div>
                ) : null}
                <label htmlFor="password" className="mb-1 ml-0.5 block text-[13px] font-bold text-white">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-[2px] border px-[10px] py-[10px] pr-10 text-[13px] text-white/80 outline-none"
                    style={{
                      borderColor: registerErrors.password ? "rgba(195,44,55,0.6)" : "rgba(255,255,255,0.12)",
                      background: "rgba(0, 0, 0, 0.2)",
                      marginBottom: "35px",
                      opacity: loading ? 0.7 : 1,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={loading}
                    className="absolute right-[15px] top-[10px] text-white/30"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
                </div>
              </div>
              <AuthSubmit label={registerButton.text} loadingLabel="Please wait.." loading={loading} tone={registerButton.tone} />
            </form>
          )}

          {mode === "login" && (
            <form
              onSubmit={handleLogin}
              className="px-[10px] py-[30px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.9)] sm:px-[30px]"
              style={{ background: "rgba(0, 0, 0, 0.9)" }}
            >
              <div>
                <AuthField
                  id="login_email"
                  label="Email"
                  type="email"
                  value={loginEmail}
                  onChange={setLoginEmail}
                  disabled={loading || loginCooldown > 0}
                  error={loginErrors.email}
                />

                <label htmlFor="login_password" className="mb-1 ml-0.5 block text-[13px] font-bold text-white">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login_password"
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={loading || loginCooldown > 0}
                    className="w-full rounded-[2px] border px-[10px] py-[10px] pr-10 text-[13px] text-white/80 outline-none"
                    style={{
                      borderColor: loginErrors.password ? "rgba(195,44,55,0.6)" : "rgba(255,255,255,0.12)",
                      background: "rgba(0, 0, 0, 0.2)",
                      marginBottom: "35px",
                      opacity: loading || loginCooldown > 0 ? 0.7 : 1,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={loading || loginCooldown > 0}
                    className="absolute right-[15px] top-[10px] text-white/30"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
                </div>

                <AuthSubmit label={loginButton.text} loadingLabel="Please wait.." loading={loading} tone={loginButton.tone} />

                <div className="my-[15px] text-left">
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="cursor-pointer text-[13px] font-bold"
                    style={{ color: "teal", wordSpacing: "2px" }}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            </form>
          )}

          {mode === "forgot" && (
            <div
              className="px-[10px] py-[30px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.9)] sm:px-[30px]"
              style={{ background: "rgba(0, 0, 0, 0.9)" }}
            >
              <div
                className="px-[3px] pb-5 text-[13px]"
                style={{
                  color: resetCompleteMessage ? "greenyellow" : "rgba(55,199,44,0.8)",
                  wordSpacing: "1.6px",
                  lineHeight: "21px",
                  textAlign: resetCompleteMessage ? "left" : "justify",
                  fontSize: resetCompleteMessage ? "14.5px" : "13px",
                }}
              >
                {resetCompleteMessage ?? forgotMessage}
              </div>

              {resetStep === 1 && (
                <form onSubmit={handleSendCode}>
                  <AuthField
                    id="password_reset_email"
                    label="Enter email"
                    type="email"
                    value={resetEmail}
                    onChange={setResetEmail}
                    error={resetErrors.email}
                  />
                  <AuthSubmit label={forgotButton.text} loadingLabel="Sending.." loading={loading} tone={forgotButton.tone} />
                </form>
              )}

              {resetStep === 2 && (
                <form onSubmit={handleCheckCode}>
                  <AuthField
                    id="password_reset_code"
                    label="Enter code"
                    value={resetCode}
                    onChange={setResetCode}
                    maxLength={6}
                    error={resetErrors.code}
                  />
                  <AuthSubmit label={forgotButton.text} loadingLabel="Checking the code.." loading={loading} tone={forgotButton.tone} />
                </form>
              )}

              {resetStep === 3 && (
                <form onSubmit={handleResetPassword}>
                  {!resetCompleteMessage ? (
                    <>
                      <AuthField
                        id="new_password"
                        label="New password"
                        type="password"
                        value={newPassword}
                        onChange={setNewPassword}
                        error={resetErrors.password}
                      />
                      <AuthSubmit label={forgotButton.text} loadingLabel="Reseting password.." loading={loading} tone={forgotButton.tone} />
                    </>
                  ) : null}
                </form>
              )}

              <button
                type="button"
                onClick={() => switchMode("login")}
                className="cursor-pointer text-[13px] font-bold"
                style={{ color: "teal", wordSpacing: "2px" }}
              >
                Back to login
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
