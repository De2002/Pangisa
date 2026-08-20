import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  TrendingUp, Users, Copy, Share2, CheckCircle2,
  Clock, DollarSign, ArrowRight, ChevronRight, Loader2,
  LogIn, Wallet, Gift, Phone, X, Home, Building2,
  BadgeCheck, Info, Calculator, Link2, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useAffiliate } from "@/hooks/useAffiliate";
import { formatUGX } from "@/constants/fees";
import { timeAgo } from "@/lib/timeAgo";
import { toast } from "sonner";

type Tab = "overview" | "referrals" | "earnings" | "payouts";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  paid: "bg-gray-100 text-gray-500 border-gray-200",
  reversed: "bg-red-50 text-red-500 border-red-200",
  requested: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  rejected: "bg-red-50 text-red-500 border-red-200",
};

export default function AffiliateDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    affiliate, isLoading, commissions, referrals, payouts,
    becomeAffiliate, requestPayout,
  } = useAffiliate(user?.id ?? "");

  const [tab, setTab] = useState<Tab>("overview");
  const [joiningAffiliate, setJoiningAffiliate] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutPhone, setPayoutPhone] = useState("");
  const [processingPayout, setProcessingPayout] = useState(false);
  const [copied, setCopied] = useState(false);
  const [projectedTenantReferrals, setProjectedTenantReferrals] = useState(10);
  const [projectedLandlordReferrals, setProjectedLandlordReferrals] = useState(3);
  const [tenantPayment, setTenantPayment] = useState(5000);
  const [landlordPayment, setLandlordPayment] = useState(30000);

  const projectedCommission = projectedTenantReferrals * tenantPayment * 0.2 + projectedLandlordReferrals * landlordPayment * 0.2;

  if (!user) {
    return (
      <div className="min-h-screen bg-[hsl(var(--surface-2))]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-sm px-6">
            <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--brand-primary)/0.08)] flex items-center justify-center mx-auto mb-5">
              <LogIn className="w-8 h-8 text-[hsl(var(--brand-primary))]" />
            </div>
            <h2 className="text-xl font-bold text-[hsl(var(--text-primary))] mb-2">Sign in to continue</h2>
            <p className="text-[hsl(var(--text-muted))] text-sm mb-6">You need an account to become a Pangisa affiliate.</p>
            <Button onClick={() => navigate("/auth?role=tenant")}
              className="bg-[hsl(var(--brand-primary))] text-white rounded-xl w-full h-11 font-semibold">
              Sign In / Register
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Not yet an affiliate ──────────────────────────────────────────────────
  if (!isLoading && !affiliate) {
    return (
      <div className="min-h-screen bg-[hsl(var(--surface-2))]">
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero */}
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(var(--brand-primary))] mb-3">Pangisa partner program</p>
            <div className="w-20 h-20 rounded-3xl bg-[hsl(var(--brand-primary))] flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Gift className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[hsl(var(--text-primary))] mb-3 tracking-tight">
              Earn with Pangisa
            </h1>
            <p className="text-[hsl(var(--text-secondary))] leading-relaxed max-w-md mx-auto">
              Share Pangisa with friends — landlords or tenants. You earn 20% of every payment made by people you refer.
            </p>
          </div>

          {/* How it works */}
          <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 mb-5 shadow-sm">
            <h2 className="font-bold text-[hsl(var(--text-primary))] mb-5 text-base">How it works</h2>
            <div className="space-y-5">
              {[
                {
                  step: "1", icon: Gift, color: "bg-purple-50 text-purple-600",
                  title: "Get your unique link",
                  desc: "You get a referral code like PAN12345. Share pangisa.com/?ref=YOURCODE or a specific rental link."
                },
                {
                  step: "2", icon: Users, color: "bg-blue-50 text-blue-600",
                  title: "Someone joins through your link",
                  desc: "When someone creates an account using your link, they're linked to you — even if they pay days later."
                },
                {
                  step: "3", icon: DollarSign, color: "bg-emerald-50 text-emerald-600",
                  title: "They pay — you earn 20%",
                  desc: "Tenant pays UGX 5,000 → you get UGX 1,000. Landlord pays UGX 30,000 → you get UGX 6,000."
                },
                {
                  step: "4", icon: Wallet, color: "bg-amber-50 text-amber-600",
                  title: "Withdraw via mobile money",
                  desc: "Commissions become available after the transaction is confirmed. Request payout anytime (min UGX 5,000)."
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", item.color)}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[hsl(var(--text-primary))] text-sm mb-0.5">{item.title}</p>
                    <p className="text-xs text-[hsl(var(--text-muted))] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commission rates */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { icon: "🔍", label: "Tenant referral", desc: "Pay to contact landlord", rate: "20%" },
              { icon: "🏠", label: "Landlord referral", desc: "Pay to publish listing", rate: "20%" },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4 shadow-sm text-center">
                <div className="text-2xl mb-2">{c.icon}</div>
                <p className="font-bold text-[hsl(var(--brand-primary))] text-xl mb-1">{c.rate}</p>
                <p className="text-xs font-semibold text-[hsl(var(--text-primary))]">{c.label}</p>
                <p className="text-[10px] text-[hsl(var(--text-muted))] mt-0.5">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* Projection calculator */}
          <div className="bg-[hsl(var(--brand-primary))] rounded-2xl p-6 mb-5 text-white shadow-lg">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-[hsl(var(--brand-accent-light))] text-xs font-bold uppercase tracking-wider mb-2"><Calculator className="w-4 h-4" /> Commission projection</div>
                <h2 className="text-xl font-bold">See what your network could earn</h2>
                <p className="text-sm text-white/70 mt-1">Adjust the assumptions to model a typical month.</p>
              </div>
              <button onClick={() => { setProjectedTenantReferrals(10); setProjectedLandlordReferrals(3); setTenantPayment(5000); setLandlordPayment(30000); }} className="p-2 text-white/70 hover:text-white" aria-label="Reset calculator"><RotateCcw className="w-4 h-4" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Tenant referrals / month", value: projectedTenantReferrals, set: (value: number) => setProjectedTenantReferrals(value), min: 0 },
                { label: "Landlord referrals / month", value: projectedLandlordReferrals, set: (value: number) => setProjectedLandlordReferrals(value), min: 0 },
                { label: "Tenant payment (UGX)", value: tenantPayment, set: (value: number) => setTenantPayment(value), min: 0 },
                { label: "Landlord payment (UGX)", value: landlordPayment, set: (value: number) => setLandlordPayment(value), min: 0 },
              ].map((field) => (
                <label key={field.label} className="text-xs font-semibold text-white/75">
                  {field.label}
                  <Input type="number" min={field.min} value={field.value} onChange={(e) => field.set(Math.max(field.min, Number(e.target.value) || 0))} className="mt-1.5 bg-white/10 border-white/20 text-white placeholder:text-white/40" />
                </label>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-white/15 flex items-end justify-between gap-4">
              <div><p className="text-xs text-white/60 uppercase tracking-wider font-bold">Projected gross commission</p><p className="text-3xl font-bold mt-1">{formatUGX(projectedCommission)}</p></div>
              <p className="text-xs text-right text-white/60 max-w-[150px]">Before reversals or payout processing. Based on a 20% rate.</p>
            </div>
          </div>

          {/* Terms summary */}
          <div className="bg-[hsl(var(--brand-primary)/0.05)] rounded-2xl border border-[hsl(var(--brand-primary)/0.2)] p-4 mb-5">
            <button onClick={() => setShowTerms(!showTerms)}
              className="flex items-center justify-between w-full text-sm font-semibold text-[hsl(var(--brand-primary))]">
              Affiliate Terms (click to expand)
              <ChevronRight className={cn("w-4 h-4 transition-transform", showTerms && "rotate-90")} />
            </button>
            {showTerms && (
              <div className="mt-3 space-y-2 text-xs text-[hsl(var(--text-muted))] leading-relaxed">
                <p>• Commission rate is 20% of the net payment made by the referred user.</p>
                <p>• Commissions start as "pending" and move to "available" after transaction confirmation.</p>
                <p>• Minimum withdrawal is UGX 5,000 via mobile money.</p>
                <p>• Referral attribution is to the first valid referrer only — duplicates are ignored.</p>
                <p>• Pangisa reserves the right to reverse commissions from fraudulent transactions.</p>
                <p>• You may share generic links or property-specific links to earn on both tenant and landlord referrals.</p>
                <p>• Commissions are processed within 24 hours of request.</p>
              </div>
            )}
          </div>

          <Button
            onClick={async () => {
              setJoiningAffiliate(true);
              await becomeAffiliate();
              setJoiningAffiliate(false);
            }}
            disabled={joiningAffiliate}
            className="w-full bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary-dark))] text-white font-bold rounded-xl shadow-sm"
            style={{ height: 52 }}
          >
            {joiningAffiliate
              ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Activating…</>
              : <>Become a Referrer — It's Free <ArrowRight className="w-4 h-4 ml-2" /></>}
          </Button>
          <p className="text-xs text-center text-[hsl(var(--text-muted))] mt-2">No fee. No commitment. Earn as you share.</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--surface-2))]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--brand-primary))]" />
        </div>
      </div>
    );
  }

  // ── Affiliate dashboard ───────────────────────────────────────────────────
  const referralLink = `${window.location.origin}/?ref=${affiliate!.referralCode}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied!");
  };

  const shareLink = async () => {
    const shareData = { title: "Earn with Pangisa", text: "Find your next rental or list your property on Pangisa. Use my link:", url: referralLink };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* cancelled */ }
    } else {
      await copyLink();
    }
  };

  const tenantReferrals = referrals.filter((r) => r.type === "signup" || !r.listingId);
  const landlordReferrals = referrals.filter((r) => r.listingId);
  const availableCommissions = commissions.filter((c) => c.status === "available");
  const pendingCommissions = commissions.filter((c) => c.status === "pending");

  const handleRequestPayout = async () => {
    setProcessingPayout(true);
    const amount = Number(payoutAmount);
    const ok = await requestPayout(amount, payoutPhone);
    setProcessingPayout(false);
    if (ok) {
      setShowPayoutModal(false);
      setPayoutAmount("");
      setPayoutPhone("");
    }
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "referrals", label: "Referrals" },
    { id: "earnings", label: "Earnings" },
    { id: "payouts", label: "Payouts" },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--surface-2))]">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-[hsl(var(--border))]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-0">
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[hsl(var(--brand-primary))] bg-[hsl(var(--brand-primary)/0.08)] border border-[hsl(var(--brand-primary)/0.2)] px-2.5 py-0.5 rounded-full">
                  Affiliate
                </span>
                {affiliate?.status === "active" && (
                  <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium">Active</span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] tracking-tight">
                Affiliate Dashboard
              </h1>
              <p className="text-sm text-[hsl(var(--text-muted))] mt-0.5">
                Code: <span className="font-mono font-bold text-[hsl(var(--brand-primary))]">{affiliate!.referralCode}</span>
              </p>
            </div>
            <Button
              onClick={() => setShowPayoutModal(true)}
              disabled={affiliate!.availableBalance < 5000}
              className="bg-[hsl(var(--brand-primary))] text-white rounded-xl h-10 px-4 text-sm font-semibold gap-2 flex-shrink-0"
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Withdraw</span>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              {
                value: formatUGX(affiliate!.availableBalance),
                label: "Available", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100",
              },
              {
                value: formatUGX(affiliate!.totalEarnings),
                label: "Total earned", color: "text-[hsl(var(--brand-primary))]", bg: "bg-[hsl(var(--brand-primary)/0.06)]", border: "border-[hsl(var(--brand-primary)/0.15)]",
              },
              {
                value: referrals.length,
                label: "Total referrals", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100",
              },
              {
                value: commissions.filter((c) => ["available", "paid"].includes(c.status)).length,
                label: "Successful", color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200",
              },
            ].map(({ value, label, color, bg, border }) => (
              <div key={label} className={`rounded-2xl border ${border} ${bg} px-4 py-3.5`}>
                <p className={`text-xl font-bold ${color} leading-none mb-1 truncate`}>{value}</p>
                <p className="text-xs text-[hsl(var(--text-muted))]">{label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-0 -mb-px">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn("px-1 mr-6 pb-3.5 text-sm font-semibold border-b-2 transition-colors",
                  tab === t.id ? "border-[hsl(var(--brand-primary))] text-[hsl(var(--brand-primary))]"
                    : "border-transparent text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))]")}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">

        {/* ── OVERVIEW ──────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <>
            {/* Referral link card */}
            <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5 shadow-sm">
              <h3 className="font-bold text-[hsl(var(--text-primary))] mb-4">Your Referral Link</h3>
              <div className="flex gap-2 mb-3">
                <div className="flex-1 bg-[hsl(var(--surface-1))] border border-[hsl(var(--border))] rounded-xl px-3 py-2.5 text-sm font-mono text-[hsl(var(--text-secondary))] truncate">
                  {referralLink}
                </div>
                <button onClick={copyLink}
                  className={cn("flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0",
                    copied ? "bg-emerald-500 text-white" : "bg-[hsl(var(--brand-primary))] text-white hover:bg-[hsl(var(--brand-primary-dark))]")}>
                  {copied ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
              <button onClick={shareLink}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-[hsl(var(--border))] rounded-xl text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-2))] transition-colors">
                <Share2 className="w-4 h-4" /> Share Link
              </button>
            </div>

            {/* Referral code */}
            <div className="bg-gradient-to-br from-[hsl(152,52%,14%)] to-[hsl(152,52%,22%)] rounded-2xl p-5 text-white shadow-sm">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Your code</p>
              <p className="font-mono text-4xl font-bold tracking-wider mb-3">{affiliate!.referralCode}</p>
              <p className="text-white/70 text-sm">Share this code or your full link. Both work.</p>
            </div>

            {/* Commission breakdown */}
            <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5 shadow-sm">
              <h3 className="font-bold text-[hsl(var(--text-primary))] mb-4">Commission Rates</h3>
              <div className="space-y-3">
                {[
                  { icon: "🔍", label: "Tenant pays to contact landlord", rate: "20%", eg: "UGX 5,000 payment → UGX 1,000 commission" },
                  { icon: "🏠", label: "Landlord pays to publish listing", rate: "20%", eg: "UGX 30,000 payment → UGX 6,000 commission" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[hsl(var(--surface-1))] border border-[hsl(var(--border))]">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{row.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{row.label}</p>
                        <p className="text-xs text-[hsl(var(--text-muted))]">{row.eg}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-[hsl(var(--brand-primary))] flex-shrink-0">{row.rate}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending commissions alert */}
            {pendingCommissions.length > 0 && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    {pendingCommissions.length} commission{pendingCommissions.length !== 1 ? "s" : ""} pending confirmation
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Total: {formatUGX(pendingCommissions.reduce((s, c) => s + c.amount, 0))} — will move to available once confirmed.
                  </p>
                </div>
              </div>
            )}

            {/* Property share tip */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Share & Earn on specific rentals</p>
                <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
                  On any listing page, tap the "Share & Earn" button to get a link that earns you commission when someone uses Get It Now through your link.
                </p>
              </div>
            </div>
          </>
        )}

        {/* ── REFERRALS ─────────────────────────────────────────────────── */}
        {tab === "referrals" && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              {[
                { value: tenantReferrals.length, label: "Tenants referred", icon: "👤" },
                { value: landlordReferrals.length, label: "Listing shares", icon: "🏠" },
                { value: commissions.filter((c) => ["available", "paid"].includes(c.status)).length, label: "Successful payments", icon: "✅" },
              ].map(({ value, label, icon }) => (
                <div key={label} className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4 text-center shadow-sm">
                  <p className="text-xl mb-1">{icon}</p>
                  <p className="text-2xl font-bold text-[hsl(var(--text-primary))]">{value}</p>
                  <p className="text-xs text-[hsl(var(--text-muted))] mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {referrals.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-10 text-center shadow-sm">
                <Users className="w-10 h-10 text-[hsl(var(--text-muted))] mx-auto mb-3 opacity-40" />
                <p className="font-semibold text-[hsl(var(--text-primary))] mb-1">No referrals yet</p>
                <p className="text-sm text-[hsl(var(--text-muted))]">Share your link to start earning.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((ref) => (
                  <div key={ref.id} className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center",
                          ref.listingId ? "bg-amber-50" : "bg-blue-50")}>
                          {ref.listingId ? <Building2 className="w-4 h-4 text-amber-600" /> : <Users className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">
                            {ref.listingId ? "Listing share referral" : "Account signup referral"}
                          </p>
                          <p className="text-xs text-[hsl(var(--text-muted))]">{timeAgo(ref.createdAt)}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-[hsl(var(--surface-2))] text-[hsl(var(--text-muted))] px-2.5 py-1 rounded-full font-medium capitalize">
                        {ref.source ?? "link"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── EARNINGS ──────────────────────────────────────────────────── */}
        {tab === "earnings" && (
          <div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { value: formatUGX(commissions.filter(c => c.status === "pending").reduce((s, c) => s + c.amount, 0)), label: "Pending", color: "text-amber-700" },
                { value: formatUGX(affiliate!.availableBalance), label: "Available", color: "text-emerald-700" },
                { value: formatUGX(affiliate!.totalPaidOut), label: "Paid out", color: "text-gray-500" },
              ].map(({ value, label, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4 text-center shadow-sm">
                  <p className={`text-lg font-bold ${color} leading-none mb-1`}>{value}</p>
                  <p className="text-xs text-[hsl(var(--text-muted))]">{label}</p>
                </div>
              ))}
            </div>

            {commissions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-10 text-center shadow-sm">
                <TrendingUp className="w-10 h-10 text-[hsl(var(--text-muted))] mx-auto mb-3 opacity-40" />
                <p className="font-semibold text-[hsl(var(--text-primary))] mb-1">No commissions yet</p>
                <p className="text-sm text-[hsl(var(--text-muted))]">Commissions appear here when your referrals make a payment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {commissions.map((comm) => (
                  <div key={comm.id} className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center",
                          comm.commissionType === "tenant" ? "bg-blue-50" : "bg-amber-50")}>
                          {comm.commissionType === "tenant"
                            ? <Users className="w-4 h-4 text-blue-600" />
                            : <Home className="w-4 h-4 text-amber-600" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[hsl(var(--text-primary))] capitalize">
                            {comm.commissionType} commission
                          </p>
                          <p className="text-xs text-[hsl(var(--text-muted))]">
                            {(comm.rate * 100).toFixed(0)}% of {formatUGX(comm.paymentAmount)} · {timeAgo(comm.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-[hsl(var(--brand-primary))] text-base">{formatUGX(comm.amount)}</p>
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize", STATUS_COLORS[comm.status] ?? "")}>
                          {comm.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PAYOUTS ───────────────────────────────────────────────────── */}
        {tab === "payouts" && (
          <div>
            <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5 shadow-sm mb-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-[hsl(var(--text-muted))]">Available to withdraw</p>
                  <p className="text-3xl font-bold text-[hsl(var(--brand-primary))]">{formatUGX(affiliate!.availableBalance)}</p>
                </div>
                <Button
                  onClick={() => setShowPayoutModal(true)}
                  disabled={affiliate!.availableBalance < 5000}
                  className="bg-[hsl(var(--brand-primary))] text-white rounded-xl h-10 px-4 text-sm font-semibold">
                  Withdraw
                </Button>
              </div>
              <p className="text-xs text-[hsl(var(--text-muted))]">Minimum withdrawal: UGX 5,000 via mobile money</p>
            </div>

            {payouts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-10 text-center shadow-sm">
                <Wallet className="w-10 h-10 text-[hsl(var(--text-muted))] mx-auto mb-3 opacity-40" />
                <p className="font-semibold text-[hsl(var(--text-primary))] mb-1">No payouts yet</p>
                <p className="text-sm text-[hsl(var(--text-muted))]">Your withdrawal history will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payouts.map((payout) => (
                  <div key={payout.id} className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[hsl(var(--text-primary))] text-base">{formatUGX(payout.amount)}</p>
                        <p className="text-xs text-[hsl(var(--text-muted))] mt-0.5">
                          {payout.phone} · {timeAgo(payout.requestedAt)}
                        </p>
                      </div>
                      <span className={cn("text-xs font-semibold px-3 py-1 rounded-full border capitalize", STATUS_COLORS[payout.status] ?? "")}>
                        {payout.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[hsl(var(--text-primary))]">Request Payout</h3>
              <button onClick={() => setShowPayoutModal(false)}
                className="w-8 h-8 rounded-full hover:bg-[hsl(var(--surface-2))] flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4 mb-5">
              <div>
                <label className="text-sm font-semibold text-[hsl(var(--text-secondary))] block mb-1.5">
                  Amount (UGX)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 10000"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="h-11 rounded-xl"
                />
                <p className="text-xs text-[hsl(var(--text-muted))] mt-1">
                  Available: {formatUGX(affiliate!.availableBalance)} · Min: UGX 5,000
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-[hsl(var(--text-secondary))] block mb-1.5">
                  Mobile Money Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-muted))]" />
                  <Input
                    placeholder="+256 7XX XXX XXX"
                    value={payoutPhone}
                    onChange={(e) => setPayoutPhone(e.target.value)}
                    className="pl-9 h-11 rounded-xl"
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={handleRequestPayout}
              disabled={processingPayout || !payoutAmount || !payoutPhone}
              className="w-full bg-[hsl(var(--brand-primary))] text-white rounded-xl h-11 font-semibold">
              {processingPayout ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting…</> : "Request Payout"}
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
