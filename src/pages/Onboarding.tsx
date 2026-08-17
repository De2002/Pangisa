import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Home,
  PhoneCall,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const TENANT_STEPS = [
  { icon: Search, text: "Search houses by area and price" },
  { icon: BadgeCheck, text: "See if the house is still available" },
  { icon: CircleDollarSign, text: "Pay a small fee — as low as UGX 2,000" },
  { icon: PhoneCall, text: "Get the landlord's number and call directly" },
];

const LANDLORD_STEPS = [
  { icon: FileText, text: "Create your listing in a few minutes" },
  { icon: CircleDollarSign, text: "Pay a small listing fee — from UGX 10,000" },
  { icon: Users, text: "Tenants find your property and pay to contact you" },
  { icon: ShieldCheck, text: "Only serious tenants will reach you" },
];

export default function Onboarding() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const role = (params.get("role") as "tenant" | "landlord") ?? "tenant";
  const isTenant = role === "tenant";
  const steps = isTenant ? TENANT_STEPS : LANDLORD_STEPS;

  return (
    <main className="min-h-screen bg-[hsl(var(--bg-warm))] text-[hsl(var(--text-primary))]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col lg:grid lg:grid-cols-[0.9fr_1.1fr]">
        <section className={`relative overflow-hidden px-5 pb-8 pt-5 text-white sm:px-8 sm:pb-10 lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:px-12 lg:py-10 ${isTenant ? "bg-[hsl(var(--brand-primary))]" : "bg-[hsl(var(--brand-primary-dark))]"}`}>
          <div className="absolute -right-20 top-24 size-56 rounded-full border-[28px] border-[hsl(var(--brand-accent))]/25" />
          <div className="absolute -bottom-24 -left-16 size-64 rounded-full bg-[hsl(var(--brand-accent))]/15" />

          <div className="relative z-10 flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              aria-label="Back to home"
              className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 transition-colors hover:bg-white/20"
            >
              <ArrowLeft className="size-4" />
            </button>
            <span className="font-display text-sm font-extrabold tracking-tight">pangisa<span className="text-[hsl(var(--brand-accent-light))]">.</span></span>
          </div>

          <div className="relative z-10 flex flex-col gap-6 pt-12 lg:pt-0">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[hsl(var(--brand-accent-light))]">
              <Sparkles className="size-4" />
              {isTenant ? "Your house hunt starts here" : "Your next tenant starts here"}
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="max-w-xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl">
                {isTenant ? "Find a place that feels like yours." : "Turn your empty space into opportunity."}
              </h1>
              <p className="max-w-md text-sm leading-6 text-white/75 sm:text-base">
                {isTenant
                  ? "Real homes, clear details, and a direct line to the person who owns the keys."
                  : "Put your property in front of serious people who are ready to move, not just browse."}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-white/85">
              {isTenant ? <Home className="size-5 text-[hsl(var(--brand-accent-light))]" /> : <BadgeCheck className="size-5 text-[hsl(var(--brand-accent-light))]" />}
              {isTenant ? "A simpler way to move" : "A smarter way to rent"}
            </div>
          </div>

          <div className="relative z-10 hidden items-center gap-2 text-xs text-white/50 lg:flex">
            <span className="size-2 rounded-full bg-[hsl(var(--brand-accent))]" />
            Built for better moves across Uganda
          </div>
        </section>

        <section className="flex flex-1 flex-col px-5 pb-8 pt-7 sm:px-8 lg:px-16 lg:py-12">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[hsl(var(--brand-primary))]">
                Step 1 of 1
              </p>
              <p className="text-sm text-[hsl(var(--text-muted))]">A few things to know before you begin</p>
            </div>
            <div className="flex gap-1.5" aria-label="Progress: complete">
              <span className="h-1.5 w-10 rounded-full bg-[hsl(var(--brand-primary))]" />
              <span className="h-1.5 w-3 rounded-full bg-[hsl(var(--surface-2))]" />
              <span className="h-1.5 w-3 rounded-full bg-[hsl(var(--surface-2))]" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${isTenant ? "bg-blue-50 text-blue-700" : "bg-[hsl(var(--brand-accent-light))]/35 text-[hsl(var(--brand-accent-dark))]"}`}>
              {isTenant ? "For tenants" : "For landlords"}
            </span>
            <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-balance sm:text-4xl">
              {isTenant ? "You want a good house. We will help you find one." : "You have a house to rent. We will find you a tenant."}
            </h2>
            <p className="max-w-xl text-sm leading-6 text-[hsl(var(--text-secondary))] sm:text-base">
              {isTenant
                ? "No wasted trips. No fake listings. No agents. Just real, available houses near you."
                : "Pay once to list. Tenants pay to contact you. That means only serious people will call you."}
            </p>
          </div>

          <div className={`my-8 rounded-3xl p-5 ${isTenant ? "bg-blue-50" : "bg-[hsl(var(--brand-accent-light))]/35"}`}>
            <p className={`mb-4 text-sm font-bold ${isTenant ? "text-blue-800" : "text-[hsl(var(--brand-accent-dark))]"}`}>
              {isTenant ? "As a tenant, you want:" : "As a landlord, you want:"}
            </p>
            <ul className={`flex flex-col gap-3 text-sm ${isTenant ? "text-blue-700" : "text-[hsl(var(--brand-accent-dark))]"}`}>
              {(isTenant
                ? ["A clean, safe house at a fair price", "To know the house is still available", "To talk to the landlord directly"]
                : ["A reliable tenant who pays on time", "No time wasters calling just to look", "Your house rented out quickly"]
              ).map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className={`mt-5 text-sm font-extrabold ${isTenant ? "text-blue-800" : "text-[hsl(var(--brand-accent-dark))]"}`}>Pangisa has got you covered.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[hsl(var(--text-muted))]">How it works</p>
              <p className="mt-1 text-sm text-[hsl(var(--text-secondary))]">Simple steps. Better connections.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.text} className="flex gap-3 rounded-2xl border border-[hsl(var(--border))] bg-white p-4 transition-transform hover:-translate-y-0.5">
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${isTenant ? "bg-blue-50 text-blue-700" : "bg-[hsl(var(--brand-accent-light))]/40 text-[hsl(var(--brand-accent-dark))]"}`}>
                      <Icon className="size-5" />
                    </div>
                    <div className="flex gap-2">
                      <span className="font-display text-xs font-extrabold text-[hsl(var(--text-muted))]">0{i + 1}</span>
                      <p className="text-sm leading-5 text-[hsl(var(--text-primary))]">{step.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-[hsl(var(--border))] pt-6 lg:mt-auto">
            <Button onClick={() => navigate(`/auth?role=${role}`)} className="h-12 w-full bg-[hsl(var(--brand-primary))] text-base font-bold text-white hover:bg-[hsl(var(--brand-primary-dark))]">
              Create My Account <ArrowRight data-icon="inline-end" />
            </Button>
            <button onClick={() => navigate(`/auth?role=${role}&mode=login`)} className="py-2 text-sm text-[hsl(var(--text-muted))] transition-colors hover:text-[hsl(var(--brand-primary))]">
              I already have an account — Sign in
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
