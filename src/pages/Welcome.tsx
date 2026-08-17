import { useEffect } from "react";
import { ArrowDown, ArrowRight, Home, MapPin, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const journeys = [
  {
    eyebrow: "For tenants",
    title: "Find a place that feels like yours.",
    description: "Browse real, available homes before you travel. Discover your next chapter with less guesswork.",
    image: "/tenant-journey.png",
    action: "Explore homes",
    href: "/browse",
    tone: "blue",
  },
  {
    eyebrow: "For landlords",
    title: "Turn your space into someone’s next start.",
    description: "List your property, meet serious tenants, and keep every step simple from one place.",
    image: "/landlord-journey.png",
    action: "List your property",
    href: "/onboarding?role=landlord",
    tone: "orange",
  },
  {
    eyebrow: "For affiliates",
    title: "Make every helpful tip count.",
    description: "Know someone searching for a home? Connect them to Pangisa and grow with every successful move.",
    image: "/affiliate-journey.png",
    action: "Join the network",
    href: "/auth?role=affiliate",
    tone: "purple",
  },
];

const toneClasses = {
  blue: "bg-[#e6f1ff] text-[#174ea6]",
  orange: "bg-[#fff0d6] text-[#a64b08]",
  purple: "bg-[#f0e8ff] text-[#6941a5]",
};

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
        <div className="w-8 h-8 border-2 border-[hsl(var(--brand-primary))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[hsl(var(--bg-warm))] text-[hsl(var(--text-primary))]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Pangisa home">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--brand-primary))] text-white shadow-lg shadow-emerald-900/10">
            <Home className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-[hsl(var(--brand-primary))]">Pangisa</span>
        </Link>
        <Link to="/browse" className="flex items-center gap-1.5 text-sm font-bold text-[hsl(var(--text-secondary))] transition-colors hover:text-[hsl(var(--brand-primary))]">
          Browse homes <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-10 pt-8 sm:px-8 sm:pb-16 sm:pt-16">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800">
            <MapPin className="h-3.5 w-3.5" /> Made for moving forward in Uganda
          </div>
          <h1 className="font-display text-[2.7rem] font-extrabold leading-[1.05] tracking-[-0.045em] sm:text-6xl">
            Your next move starts <span className="text-[hsl(var(--brand-accent-dark))]">here.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[hsl(var(--text-secondary))] sm:text-lg">
            Pangisa brings the people, places, and possibilities of renting together. Find a home, fill a home, or help someone get there.
          </p>
          <button onClick={() => document.getElementById("journeys")?.scrollIntoView({ behavior: "smooth" })} className="mt-7 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand-primary))] px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-950/15 transition-transform hover:-translate-y-0.5 active:translate-y-0">
            Choose your path <ArrowDown className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section id="journeys" className="mx-auto flex max-w-6xl flex-col gap-8 px-5 pb-16 sm:px-8 sm:gap-12">
        {journeys.map((journey, index) => (
          <article key={journey.eyebrow} className="group overflow-hidden rounded-[2rem] bg-white shadow-[0_16px_50px_rgba(28,67,48,0.09)] sm:grid sm:grid-cols-2">
            <div className={`relative min-h-[275px] overflow-hidden sm:min-h-[430px] ${index % 2 === 1 ? "sm:order-2" : ""}`}>
              <img src={journey.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[hsl(var(--text-primary))]">0{index + 1}</span>
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <div className={`mb-5 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] ${toneClasses[journey.tone as keyof typeof toneClasses]}`}>
                {index === 2 && <Sparkles className="h-3.5 w-3.5" />}{journey.eyebrow}
              </div>
              <h2 className="font-display max-w-md text-3xl font-extrabold leading-tight tracking-[-0.035em] sm:text-4xl">{journey.title}</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-[hsl(var(--text-secondary))] sm:text-base">{journey.description}</p>
              <Link to={journey.href} className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-[hsl(var(--brand-primary))] px-5 py-3.5 text-sm font-bold text-white transition-all hover:gap-3 hover:bg-[hsl(var(--brand-primary-dark))]">
                {journey.action} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </section>

      <footer className="border-t border-[hsl(var(--border))] px-5 py-8 text-center text-xs text-[hsl(var(--text-muted))] sm:px-8">
        <p className="font-bold text-[hsl(var(--brand-primary))]">Pangisa</p>
        <p className="mt-1">Better moves. Better beginnings.</p>
      </footer>
    </main>
  );
}
