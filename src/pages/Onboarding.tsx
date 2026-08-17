import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
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
  { icon: Search, text: "Search by area and price" },
  { icon: BadgeCheck, text: "See what is actually available" },
  { icon: PhoneCall, text: "Call the landlord directly" },
];

const LANDLORD_STEPS = [
  { icon: FileText, text: "Add your property details" },
  { icon: CircleDollarSign, text: "Pay once to publish" },
  { icon: Users, text: "Meet serious tenants" },
];

export default function Onboarding() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const role = (params.get("role") as "tenant" | "landlord") ?? "tenant";
  const isTenant = role === "tenant";
  const steps = isTenant ? TENANT_STEPS : LANDLORD_STEPS;

  return (
    <main className="min-h-screen bg-[#f6f6f1] text-[#11130f]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-12 lg:py-8">
        <header className="flex items-center justify-between border-b border-[#11130f]/15 pb-5">
          <button onClick={() => navigate("/")} aria-label="Back to home" className="flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-60">
            <ArrowLeft className="size-4" /> Back
          </button>
          <span className="font-display text-xl font-extrabold tracking-[-0.08em]">pangisa<span className="text-[#c6f135]">.</span></span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#11130f]/45">01 / 01</span>
        </header>

        <div className="flex flex-1 flex-col gap-12 py-12 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-24 lg:py-16">
          <section className="flex flex-col gap-8">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#11130f]/55">
              <Sparkles className="size-4 text-[#759900]" />
              {isTenant ? "For the next move" : "For property owners"}
            </div>
            <div className="flex flex-col gap-5">
              <h1 className="max-w-3xl font-display text-[clamp(3.25rem,11vw,7.5rem)] font-extrabold leading-[0.88] tracking-[-0.09em] text-balance">
                {isTenant ? <>Find your <span className="text-[#759900]">next place.</span></> : <>Put your property <span className="text-[#759900]">to work.</span></>}
              </h1>
              <p className="max-w-xl text-lg leading-7 text-[#11130f]/65 sm:text-xl sm:leading-8">
                {isTenant
                  ? "Real homes. Clear details. A direct line to the person with the keys."
                  : "List once. Reach people who are ready to move. Keep the time-wasters out."}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm font-bold">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#c6f135]"><Check className="size-4" /></span>
              {isTenant ? "A simpler way to move" : "A smarter way to rent"}
            </div>
          </section>

          <section className="flex flex-col gap-8">
            <div className="border-t-2 border-[#11130f] pt-4">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#11130f]/50">The short version</p>
              <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-[-0.06em] sm:text-4xl">
                {isTenant ? "Good houses. Less running around." : "One listing. Better leads."}
              </h2>
            </div>

            <div className="flex flex-col border-y border-[#11130f]/20">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.text} className="flex items-center gap-4 border-b border-[#11130f]/15 py-5 last:border-b-0">
                    <span className="font-mono text-sm font-bold text-[#759900]">0{index + 1}</span>
                    <Icon className="size-5 shrink-0" />
                    <p className="text-base font-bold">{step.text}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-start gap-4 rounded-2xl bg-[#11130f] p-5 text-[#f6f6f1]">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#c6f135]" />
              <p className="text-sm leading-6 text-[#f6f6f1]/75">
                {isTenant ? <>Contact details start at <strong className="text-white">UGX 2,000.</strong> No agents, no guesswork.</> : <>Listing starts at <strong className="text-white">UGX 10,000.</strong> Tenants pay to contact you.</>}
              </p>
            </div>
          </section>
        </div>

        <footer className="flex flex-col gap-3 border-t border-[#11130f]/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#11130f]/55">Ready when you are.</p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row-reverse">
            <Button onClick={() => navigate(`/auth?role=${role}`)} className="h-12 w-full rounded-xl bg-[#c6f135] px-7 text-base font-bold text-[#11130f] hover:bg-[#b6e326] sm:w-auto">
              {isTenant ? "Start searching" : "List my property"} <ArrowRight data-icon="inline-end" />
            </Button>
            <button onClick={() => navigate(`/auth?role=${role}&mode=login`)} className="h-12 px-3 text-sm font-bold text-[#11130f]/55 transition-colors hover:text-[#11130f]">
              Sign in instead
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
