import { useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, KeyRound, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { recordReferral, getStoredReferralCode, clearReferralCode, storeReferralCode } from "@/hooks/useAffiliate";
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

  // Store referral code from URL on mount
  useEffect(() => {
    const refCode = params.get("ref");
    if (refCode) storeReferralCode(refCode);
  }, [params]);
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOTP = async () => {
    if (!email.includes("@")) return toast.error("Please enter a valid email address.");
    if (isSignup && !name.trim()) return toast.error("Please enter your name.");
    setLoading(true);
    const { error } = await sendOTP(email);
    setLoading(false);
    if (error) return toast.error(error);
    setStep("otp");
    toast.success("Code sent! Check your email.");
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 3) otpRefs.current[index + 1]?.focus();
    if (value && index === 3 && next.every(Boolean)) handleVerifyWithCode(next.join(""));
  };

  const handleVerifyWithCode = async (code: string) => {
    setLoading(true);
    const result = await verifyOTP(email, code, role, name || undefined);
    setLoading(false);
    if (result.error) {
      toast.error(result.error.includes("otp") || result.error.includes("token") ? "Wrong code. Please try again." : result.error);
      setOtp(["", "", "", ""]);
      otpRefs.current[0]?.focus();
      return;
    }

    // Attribute referral on signup
    if (isSignup && result.user?.id) {
      const refCode = getStoredReferralCode();
      if (refCode) {
        recordReferral({ referralCode: refCode, referredUserId: result.user.id, source: "generic_link" })
          .then(() => clearReferralCode())
          .catch(() => {});
      }
    }

    toast.success(isSignup ? "Welcome to Pangisa!" : "Welcome back!");
    navigate(role === "landlord" ? "/landlord" : "/setup-location", { replace: true });
  };

  const brand = role === "landlord" ? "List your place" : "Find your next place";

  return (
    <main className="min-h-screen bg-[hsl(var(--bg-warm))] text-[hsl(var(--text-primary))]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <button aria-label="Go back" onClick={() => step === "otp" ? setStep("email") : navigate(-1)} className="flex size-10 items-center justify-center rounded-full border border-[hsl(var(--text-primary)/0.12)] transition hover:bg-white">
          <ArrowLeft className="size-4" />
        </button>
        <Link to="/" className="font-display text-xl font-extrabold tracking-[-0.06em]">pangisa<span className="text-[hsl(var(--brand-accent))]">.</span></Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--text-muted))]">Secure access</span>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-6xl items-center gap-10 px-5 pb-12 pt-8 sm:px-8 lg:grid-cols-[1fr_440px] lg:gap-24 lg:pt-0">
        <section className="max-w-xl">
          <p className="mb-5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-[hsl(var(--brand-accent))]">{role === "landlord" ? "Landlord access" : "Tenant access"}</p>
          <h1 className="font-display text-[clamp(3.2rem,9vw,6.5rem)] font-extrabold leading-[0.88] tracking-[-0.08em]">{brand}<span className="text-[hsl(var(--brand-accent))]">.</span></h1>
          <p className="mt-7 max-w-md text-base leading-7 text-[hsl(var(--text-muted))]">{role === "landlord" ? "Turn an empty room into a real opportunity. Your next tenant is already looking." : "Good homes should not be hard to find. Get straight to places that fit your life."}</p>
          <div className="mt-9 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[hsl(var(--text-muted))]"><span className="size-2 rounded-full bg-[hsl(var(--brand-accent))]" /> No password. Just a secure email code.</div>
        </section>

        <section className="rounded-[2rem] border border-[hsl(var(--text-primary)/0.12)] bg-white p-6 shadow-[8px_8px_0_hsl(var(--text-primary))] sm:p-8">
          {step === "email" ? (
            <>
              <div className="mb-8 flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--text-muted))]">01 / 02</p><h2 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.06em]">{isSignup ? "Start here" : "Welcome back"}</h2></div><ArrowUpRight className="size-5 text-[hsl(var(--brand-accent))]" /></div>
              <div className="flex flex-col gap-5">
                {isSignup && <div><label htmlFor="name" className="mb-2 block text-sm font-bold">Your name</label><Input id="name" placeholder="e.g. Sarah Nakato" value={name} onChange={(e) => setName(e.target.value)} className="h-13 rounded-xl border-[hsl(var(--text-primary)/0.18)] bg-[hsl(var(--bg-warm))]" /></div>}
                <div><label htmlFor="auth-email" className="mb-2 block text-sm font-bold">Email address</label><div className="relative"><Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[hsl(var(--text-muted))]" /><Input id="auth-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) handleSendOTP(); }} className="h-13 rounded-xl border-[hsl(var(--text-primary)/0.18)] bg-[hsl(var(--bg-warm))] pl-11" /></div></div>
                <Button onClick={handleSendOTP} disabled={loading} className="h-13 w-full rounded-xl bg-[hsl(var(--text-primary))] font-bold text-[hsl(var(--bg-warm))] hover:bg-[hsl(var(--brand-accent))] hover:text-[hsl(var(--text-primary))]">{loading ? "Sending code…" : "Continue"}<ArrowUpRight data-icon="inline-end" /></Button>
              </div>
              <p className="mt-5 text-center text-xs leading-5 text-[hsl(var(--text-muted))]">By continuing, you agree to use Pangisa responsibly.</p>
              <button onClick={() => navigate(isSignup ? `/auth?role=${role}&mode=login` : `/auth?role=${role}`)} className="mt-6 w-full text-center text-sm font-bold underline decoration-[hsl(var(--brand-accent))] decoration-2 underline-offset-4">{isSignup ? "Already have an account? Sign in" : "New here? Create an account"}</button>
            </>
          ) : (
            <>
              <div className="mb-8"><div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-[hsl(var(--brand-accent))]"><KeyRound className="size-5" /></div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--text-muted))]">02 / 02</p><h2 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.06em]">Check your inbox.</h2><p className="mt-3 text-sm leading-6 text-[hsl(var(--text-muted))]">Enter the 4-digit code we sent to <strong className="text-[hsl(var(--text-primary))]">{email}</strong>.</p></div>
              <div className="mb-8 flex justify-between gap-2">{otp.map((digit, i) => <input key={i} aria-label={`Digit ${i + 1}`} ref={(el) => { otpRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleOTPChange(i, e.target.value)} onKeyDown={(e) => { if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus(); }} className={cn("size-14 rounded-xl border-2 bg-[hsl(var(--bg-warm))] text-center font-mono text-2xl font-bold outline-none transition sm:size-16", digit ? "border-[hsl(var(--brand-accent))]" : "border-[hsl(var(--text-primary)/0.15)]", "focus:border-[hsl(var(--text-primary))]")} />)}</div>
              <Button onClick={() => otp.join("").length === 4 ? handleVerifyWithCode(otp.join("")) : toast.error("Please enter the full 4-digit code.")} disabled={loading || otp.join("").length < 4} className="h-13 w-full rounded-xl bg-[hsl(var(--text-primary))] font-bold text-[hsl(var(--bg-warm))] hover:bg-[hsl(var(--brand-accent))] hover:text-[hsl(var(--text-primary))]">{loading ? "Verifying…" : "Enter Pangisa"}</Button>
              <button onClick={async () => { const { error } = await sendOTP(email); if (!error) { toast.success("New code sent!"); setOtp(["", "", "", ""]); otpRefs.current[0]?.focus(); } }} className="mt-5 w-full text-center text-sm font-bold underline decoration-[hsl(var(--brand-accent))] decoration-2 underline-offset-4">Resend code</button>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
