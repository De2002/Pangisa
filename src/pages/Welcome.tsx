import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronRight,
  Home,
  MapPin,
  Megaphone,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const journeys = [
  {
    number: "01",
    label: "For tenants",
    title: "Find a place that feels right.",
    body: "Browse real homes, check the details before you travel, and move with more confidence.",
    action: "Find a home",
    href: "/browse",
    icon: Search,
    accent: "bg-[hsl(var(--brand-primary))] text-white",
    soft: "bg-[#E9F2EE]",
  },
  {
    number: "02",
    label: "For landlords",
    title: "Turn empty rooms into momentum.",
    body: "List your property clearly, reach serious renters, and keep the process simple from day one.",
    action: "List my property",
    href: "/onboarding?role=landlord",
    icon: Building2,
    accent: "bg-[#D9F95A] text-[#141A17]",
    soft: "bg-[#F4F7D9]",
  },
  {
    number: "03",
    label: "For affiliates",
    title: "Help someone move forward.",
    body: "Connect people to better housing options and earn when your referral makes a real move.",
    action: "Join as an affiliate",
    href: "/affiliate",
    icon: UsersRound,
    accent: "bg-[#151A17] text-white",
    soft: "bg-[#E8E7E0]",
  },
];

export default function Welcome() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === "landlord" ? "/landlord" : "/browse", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-warm))] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[hsl(var(--brand-primary))] border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[hsl(var(--bg-warm))] text-[#151A17]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Pangisa home">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#151A17] text-[#D9F95A]">
            <Home className="size-4.5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl font-extrabold tracking-[-0.06em]">Pangisa</span>
        </Link>
        <Link
          to="/auth?mode=login"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#151A17] transition-opacity hover:opacity-60"
        >
          Sign in <ArrowRight className="size-4" />
        </Link>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-14 pt-8 sm:px-8 sm:pt-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:px-12 lg:pb-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#151A17]/15 bg-white/60 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#151A17]">
            <MapPin className="size-3.5" />
            Housing, made clearer
          </div>
          <h1 className="max-w-4xl font-display text-[clamp(3.4rem,11vw,7.5rem)] font-extrabold leading-[0.88] tracking-[-0.09em]">
            Move with
            <span className="block text-[hsl(var(--brand-primary))]">more certainty.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-7 text-[#59635D] sm:text-xl">
            Pangisa brings the people, places, and possibilities of renting into one simple loop.
            Pick your lane and make your next move.
          </p>
        </div>

        <div className="relative flex min-h-48 flex-col justify-between overflow-hidden rounded-[2rem] bg-[#151A17] p-6 text-white sm:min-h-56 sm:p-8">
          <Sparkles className="absolute -right-3 -top-3 size-28 text-[#D9F95A]/20" strokeWidth={1} />
          <div className="relative flex items-center gap-2 text-[#D9F95A]">
            <BadgeCheck className="size-5" />
            <span className="text-xs font-extrabold uppercase tracking-[0.16em]">The Pangisa promise</span>
          </div>
          <p className="relative max-w-xs text-2xl font-bold leading-tight tracking-[-0.04em] sm:text-3xl">
            Fewer dead ends. Better moves.
          </p>
        </div>
      </section>

      <section className="border-y border-[#151A17]/10 bg-white/45">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-5 py-6 sm:grid-cols-3 sm:px-8 lg:px-12">
          {[
            [ShieldCheck, "Clearer choices", "Know what you are stepping into."],
            [Megaphone, "Real connections", "Meet the right people, directly."],
            [ChevronRight, "One next step", "Start quickly without the noise."],
          ].map(([Icon, title, body]) => (
            <div key={title as string} className="flex gap-3 sm:flex-col">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#D9F95A] text-[#151A17]">
                <Icon className="size-4" />
              </span>
              <div>
                <p className="font-bold">{title as string}</p>
                <p className="mt-1 text-sm leading-5 text-[#69736D]">{body as string}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[hsl(var(--brand-primary))]">Choose your next move</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.06em] sm:text-5xl">Three ways in.</h2>
          </div>
          <p className="hidden max-w-48 text-right text-sm leading-5 text-[#69736D] sm:block">Different goals. One connected housing experience.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {journeys.map((journey) => {
            const Icon = journey.icon;
            return (
              <article key={journey.number} className={`flex min-h-[24rem] flex-col justify-between rounded-[1.75rem] p-6 sm:p-7 ${journey.soft}`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black tracking-[0.1em] text-[#69736D]">{journey.number}</span>
                    <span className={`flex size-11 items-center justify-center rounded-full ${journey.accent}`}>
                      <Icon className="size-5" />
                    </span>
                  </div>
                  <p className="mt-12 text-xs font-extrabold uppercase tracking-[0.14em] text-[#69736D]">{journey.label}</p>
                  <h3 className="mt-3 font-display text-3xl font-extrabold leading-[0.98] tracking-[-0.07em]">{journey.title}</h3>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-[#59635D]">{journey.body}</p>
                </div>
                <Link
                  to={journey.href}
                  className="mt-8 inline-flex items-center justify-between rounded-full bg-[#151A17] px-5 py-3.5 text-sm font-extrabold text-white transition-transform hover:translate-x-1"
                >
                  {journey.action}
                  <ArrowRight className="size-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-3 border-t border-[#151A17]/10 px-5 py-7 text-sm text-[#69736D] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p>Built for better moves in Uganda.</p>
        <Link to="/auth?mode=signup" className="font-bold text-[#151A17] hover:opacity-60">Create your Pangisa account <ArrowRight className="ml-1 inline size-3.5" /></Link>
      </footer>
    </main>
  );
}
