import { useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Mail, KeyRound, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AuthStep = "email" | "otp";

export default function OTPAuth() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { sendOTP, verifyOTP } = useAuth();

  const role = (params.get("role") as "tenant" | "landlord") ?? "tenant";
  const mode = params.get("mode") ?? "signup";
  const isSignup = mode !== "login";

  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOTP = async () => {
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (isSignup && !name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    setLoading(true);
    const { error } = await sendOTP(email);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    setStep("otp");
    toast.success("Code sent! Check your email.");
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all 4 filled
    if (value && index === 3 && next.every((d) => d !== "")) {
      handleVerifyWithCode(next.join(""));
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyWithCode = async (code: string) => {
    setLoading(true);
    const { error } = await verifyOTP(email, code, role, name || undefined);
    setLoading(false);
    if (error) {
      toast.error(error.includes("otp") || error.includes("token") ? "Wrong code. Please check your email and try again." : error);
      setOtp(["", "", "", ""]);
      otpRefs.current[0]?.focus();
      return;
    }
    toast.success(isSignup ? "Welcome to Pangisa!" : "Welcome back!");
    if (role === "landlord") {
      navigate("/landlord", { replace: true });
    } else {
      navigate("/setup-location", { replace: true });
    }
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length < 4) {
      toast.error("Please enter the full 4-digit code.");
      return;
    }
    handleVerifyWithCode(code);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-warm))] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={() => step === "otp" ? setStep("email") : navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white border border-transparent hover:border-[hsl(var(--border))] transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--brand-primary))] flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[hsl(var(--brand-primary))]">Pangisa</span>
        </Link>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col px-5 pt-4 pb-12 max-w-md mx-auto w-full">

        {/* Role chip */}
        <div className={cn(
          "inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 mb-7 text-xs font-semibold border",
          role === "tenant"
            ? "bg-blue-50 border-blue-200 text-blue-700"
            : "bg-amber-50 border-amber-200 text-amber-700"
        )}>
          <span>{role === "tenant" ? "🔍" : "🏠"}</span>
          {role === "tenant" ? "Tenant Account" : "Landlord Account"}
        </div>

        {/* EMAIL STEP */}
        {step === "email" && (
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">
              {isSignup ? "Create your account" : "Sign in"}
            </h1>
            <p className="text-sm text-[hsl(var(--text-muted))] mb-8 leading-relaxed">
              {isSignup
                ? "Enter your email. We will send you a 4-digit code."
                : "Enter your email to get a sign-in code."}
            </p>

            <div className="space-y-4 flex-1">
              {isSignup && (
                <div>
                  <label className="text-sm font-semibold text-[hsl(var(--text-secondary))] block mb-2">
                    Your name
                  </label>
                  <Input
                    placeholder="e.g. Sarah Nakato"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-13 text-base bg-white border-[hsl(var(--border))] focus:border-[hsl(var(--brand-primary))] rounded-xl"
                    style={{ height: 52 }}
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-[hsl(var(--text-secondary))] block mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-muted))]" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                    className="pl-11 bg-white border-[hsl(var(--border))] focus:border-[hsl(var(--brand-primary))] rounded-xl"
                    style={{ height: 52 }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full font-bold bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary-dark))] text-white rounded-xl shadow-sm"
                style={{ height: 52 }}
              >
                {loading ? "Sending code…" : "Send Code →"}
              </Button>

              <p className="text-xs text-center text-[hsl(var(--text-muted))]">
                No password needed — just a code sent to your email.
              </p>

              {mode === "signup" ? (
                <button
                  onClick={() => navigate(`/auth?role=${role}&mode=login`)}
                  className="w-full text-sm text-center text-[hsl(var(--text-muted))] hover:text-[hsl(var(--brand-primary))] py-2 transition-colors"
                >
                  Already have an account? <span className="font-semibold text-[hsl(var(--brand-primary))]">Sign in</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/auth?role=${role}`)}
                  className="w-full text-sm text-center text-[hsl(var(--text-muted))] hover:text-[hsl(var(--brand-primary))] py-2 transition-colors"
                >
                  New here? <span className="font-semibold text-[hsl(var(--brand-primary))]">Create account</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* OTP STEP */}
        {step === "otp" && (
          <div className="flex flex-col flex-1">
            <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--brand-primary)/0.1)] flex items-center justify-center mb-6">
              <KeyRound className="w-7 h-7 text-[hsl(var(--brand-primary))]" />
            </div>

            <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">Enter the code</h1>
            <p className="text-sm text-[hsl(var(--text-muted))] mb-1">
              We sent a 4-digit code to
            </p>
            <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-8 truncate">{email}</p>

            {/* 4-digit OTP boxes */}
            <div className="flex gap-3 justify-center mb-8">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(i, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(i, e)}
                  className={cn(
                    "w-16 h-16 text-center text-2xl font-bold rounded-2xl border-2 outline-none transition-all bg-white",
                    digit
                      ? "border-[hsl(var(--brand-primary))] text-[hsl(var(--brand-primary))] shadow-sm"
                      : "border-[hsl(var(--border))] text-[hsl(var(--text-primary))]",
                    "focus:border-[hsl(var(--brand-primary))] focus:shadow-sm"
                  )}
                />
              ))}
            </div>

            <div className="mt-auto space-y-3">
              <Button
                onClick={handleVerify}
                disabled={loading || otp.join("").length < 4}
                className="w-full font-bold bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary-dark))] text-white rounded-xl"
                style={{ height: 52 }}
              >
                {loading ? "Verifying…" : "Confirm Code"}
              </Button>

              <button
                onClick={async () => {
                  const { error } = await sendOTP(email);
                  if (!error) {
                    toast.success("New code sent!");
                    setOtp(["", "", "", ""]);
                    otpRefs.current[0]?.focus();
                  }
                }}
                className="w-full text-sm text-center text-[hsl(var(--text-muted))] hover:text-[hsl(var(--brand-primary))] py-2 transition-colors"
              >
                Didn't get it? <span className="font-semibold">Resend code</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
