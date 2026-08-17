import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Home, MapPin, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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
    <div className="min-h-screen bg-[hsl(var(--bg-warm))] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[hsl(var(--brand-primary))] flex items-center justify-center shadow-sm">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[hsl(var(--brand-primary))]">Pangisa</span>
        </div>
        <Link
          to="/browse"
          className="text-sm font-medium text-[hsl(var(--text-muted))] hover:text-[hsl(var(--brand-primary))] transition-colors"
        >
          Browse rentals
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-between px-5 pb-10 max-w-lg mx-auto w-full">

        {/* Welcome */}
        <div className="mt-6">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 mb-6">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">Made for Uganda</span>
          </div>

          <h1 className="text-[2rem] font-bold text-[hsl(var(--text-primary))] leading-tight mb-3">
            Welcome to<br />
            <span className="text-[hsl(var(--brand-primary))]">Pangisa</span>
          </h1>

          <p className="text-[hsl(var(--text-secondary))] text-base leading-relaxed mb-7">
            Finding a house in Uganda is hard. You hear about a place. You travel there.
            The house is already taken.
            <br /><br />
            <strong className="text-[hsl(var(--text-primary))]">Pangisa fixes that.</strong>
          </p>

          {/* Problem → Solution cards */}
          <div className="space-y-2.5 mb-8">
            {[
              {
                problem: "You travel far and the house is gone.",
                fix: "See if it's available before you go.",
              },
              {
                problem: "You don't know if the landlord is real.",
                fix: "We check and verify landlords for you.",
              },
              {
                problem: "Agents charge you too much.",
                fix: "No agents. Pay as low as UGX 2,000.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[hsl(var(--border))] px-4 py-3.5 shadow-sm">
                <p className="text-sm text-red-400 mb-1.5 line-through opacity-70">{item.problem}</p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{item.fix}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Who are you? */}
        <div>
          <p className="text-center text-[hsl(var(--text-muted))] text-sm font-medium mb-4">Who are you?</p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/onboarding?role=tenant")}
              className="flex flex-col items-center gap-3 bg-white border-2 border-[hsl(var(--border))] hover:border-[hsl(var(--brand-primary))] active:scale-[0.98] rounded-2xl p-5 transition-all group shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <span className="text-2xl">🔍</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-[hsl(var(--text-primary))] text-base">Tenant</p>
                <p className="text-xs text-[hsl(var(--text-muted))] mt-0.5">I'm looking for a house</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/onboarding?role=landlord")}
              className="flex flex-col items-center gap-3 bg-white border-2 border-[hsl(var(--border))] hover:border-[hsl(var(--brand-accent))] active:scale-[0.98] rounded-2xl p-5 transition-all group shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
                <span className="text-2xl">🏠</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-[hsl(var(--text-primary))] text-base">Landlord</p>
                <p className="text-xs text-[hsl(var(--text-muted))] mt-0.5">I have a house to rent</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
