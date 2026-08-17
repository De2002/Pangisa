import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const TENANT_STEPS = [
  { icon: "🔍", text: "Search houses by area and price" },
  { icon: "✅", text: "See if the house is still available" },
  { icon: "💳", text: "Pay a small fee — as low as UGX 2,000" },
  { icon: "📞", text: "Get the landlord's number and call directly" },
];

const LANDLORD_STEPS = [
  { icon: "📝", text: "Create your listing in a few minutes" },
  { icon: "💵", text: "Pay a small listing fee — from UGX 10,000" },
  { icon: "👀", text: "Tenants find your property and pay to contact you" },
  { icon: "🤝", text: "Only serious tenants will reach you" },
];

export default function Onboarding() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const role = params.get("role") as "tenant" | "landlord" ?? "tenant";

  const isTenant = role === "tenant";

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-warm))] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <button
          onClick={() => navigate("/")}
          className="w-9 h-9 rounded-full border border-[hsl(var(--border))] flex items-center justify-center hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
        </button>
        <span className="font-semibold text-[hsl(var(--text-primary))]">
          {isTenant ? "Finding a House" : "Listing a House"}
        </span>
      </div>

      <div className="flex-1 flex flex-col px-5 pb-10 max-w-lg mx-auto w-full">

        {/* Role badge */}
        <div className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 mb-5 mt-2 ${
          isTenant ? "bg-blue-50 border border-blue-200" : "bg-amber-50 border border-amber-200"
        }`}>
          <span>{isTenant ? "🔍" : "🏠"}</span>
          <span className={`text-xs font-semibold ${isTenant ? "text-blue-700" : "text-amber-700"}`}>
            {isTenant ? "For Tenants" : "For Landlords"}
          </span>
        </div>

        {/* Headline */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] leading-snug mb-3">
            {isTenant
              ? "You want a good house.\nWe will help you find one."
              : "You have a house to rent.\nWe will find you a tenant."}
          </h1>
          <p className="text-[hsl(var(--text-secondary))] text-sm leading-relaxed">
            {isTenant
              ? "No wasted trips. No fake listings. No agents. Just real, available houses near you."
              : "Pay once to list. Tenants pay to contact you. That means only serious people will call you."}
          </p>
        </div>

        {/* Promise card */}
        <div className={`rounded-2xl p-4 mb-6 border ${
          isTenant
            ? "bg-blue-50 border-blue-100"
            : "bg-amber-50 border-amber-100"
        }`}>
          <p className={`text-sm font-semibold mb-2 ${isTenant ? "text-blue-800" : "text-amber-800"}`}>
            {isTenant
              ? "As a tenant, you want:"
              : "As a landlord, you want:"}
          </p>
          <ul className={`text-sm space-y-1.5 ${isTenant ? "text-blue-700" : "text-amber-700"}`}>
            {isTenant ? (
              <>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> A clean, safe house at a fair price</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> To know the house is still available</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> To talk to the landlord directly</li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> A reliable tenant who pays on time</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> No time wasters calling just to look</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> Your house rented out quickly</li>
              </>
            )}
          </ul>
          <p className={`text-sm font-bold mt-3 ${isTenant ? "text-blue-800" : "text-amber-800"}`}>
            Pangisa has got you covered.
          </p>
        </div>

        {/* Steps */}
        <div className="mb-8">
          <p className="text-xs font-bold text-[hsl(var(--text-muted))] uppercase tracking-wider mb-3">
            How it works
          </p>
          <div className="space-y-3">
            {(isTenant ? TENANT_STEPS : LANDLORD_STEPS).map((step, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-[hsl(var(--border))] px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-[hsl(var(--surface-1))] flex items-center justify-center flex-shrink-0">
                  <span className="text-base">{step.icon}</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs font-bold text-[hsl(var(--text-muted))] w-5 flex-shrink-0">
                    {i + 1}.
                  </span>
                  <p className="text-sm text-[hsl(var(--text-primary))]">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3 mt-auto">
          <Button
            onClick={() => navigate(`/auth?role=${role}`)}
            className="w-full h-12 text-base font-bold bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary-dark))] text-white"
          >
            Create My Account <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <button
            onClick={() => navigate(`/auth?role=${role}&mode=login`)}
            className="w-full text-sm text-[hsl(var(--text-muted))] py-2 hover:text-[hsl(var(--brand-primary))] transition-colors"
          >
            I already have an account — Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
