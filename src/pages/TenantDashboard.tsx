import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Phone, Bookmark, Clock, LogIn,
  MapPin, MessageCircle, ArrowRight, Search,
  Navigation, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AvailabilityBadge from "@/components/features/AvailabilityBadge";
import { useAuth } from "@/hooks/useAuth";
import { useSavedListings, useTenantTransactions } from "@/hooks/useListings";
import { formatUGX } from "@/constants/fees";
import { timeAgo } from "@/lib/timeAgo";

type Tab = "contacts" | "saved" | "history";

export default function TenantDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savedListings } = useSavedListings(user?.id ?? "");
  const { data: transactions = [], isLoading: txLoading } = useTenantTransactions(user?.id ?? "");
  const [tab, setTab] = useState<Tab>("contacts");

  if (!user) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-warm))]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-sm px-6">
            <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--brand-primary)/0.08)] flex items-center justify-center mx-auto mb-5">
              <LogIn className="w-8 h-8 text-[hsl(var(--brand-primary))]" />
            </div>
            <h2 className="text-xl font-bold text-[hsl(var(--text-primary))] mb-2">Sign in to continue</h2>
            <p className="text-[hsl(var(--text-muted))] text-sm mb-6">Your dashboard and saved rentals are waiting for you.</p>
            <Button onClick={() => navigate("/auth?role=tenant&mode=login")}
              className="bg-[hsl(var(--brand-primary))] text-white rounded-xl w-full h-11 font-semibold">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const activeTransactions = transactions.filter((t) => t.status === "active");
  const historyTransactions = transactions.filter((t) => t.status !== "active");
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  const openWhatsApp = (phone: string, title: string) => {
    const cleaned = phone.replace(/\D/g, "");
    const intl = cleaned.startsWith("0") ? "256" + cleaned.slice(1) : cleaned;
    window.open(`https://wa.me/${intl}?text=Hello, I found your listing on Pangisa: "${title}". Is it still available?`, "_blank");
  };

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "contacts", label: "Active Contacts", count: activeTransactions.length },
    { id: "saved", label: "Saved", count: savedListings.length },
    { id: "history", label: "History", count: historyTransactions.length },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-warm))]">
      <Navbar />

      <div className="bg-white border-b border-[hsl(var(--border))]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-0">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-sm text-[hsl(var(--text-muted))] mb-1">Welcome back</p>
              <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] tracking-tight">
                {user.name.split(" ")[0]}'s Dashboard
              </h1>
            </div>
            <Button onClick={() => navigate("/browse")}
              className="bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary-dark))] text-white rounded-xl h-10 px-4 text-sm font-semibold gap-2 flex items-center shadow-sm">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Browse Rentals</span>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { value: activeTransactions.length, label: "Active contacts", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
              { value: savedListings.length, label: "Saved listings", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100" },
              { value: formatUGX(totalSpent), label: "Total spent", color: "text-[hsl(var(--brand-primary))]", bg: "bg-[hsl(var(--brand-primary)/0.06)]", border: "border-[hsl(var(--brand-primary)/0.15)]" },
            ].map(({ value, label, color, bg, border }) => (
              <div key={label} className={`rounded-2xl border ${border} ${bg} px-4 py-3.5`}>
                <p className={`text-xl font-bold ${color} leading-none mb-1`}>{value}</p>
                <p className="text-xs text-[hsl(var(--text-muted))]">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-0 -mb-px">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn("flex items-center gap-2 px-1 mr-6 pb-3.5 text-sm font-semibold border-b-2 transition-colors",
                  tab === t.id ? "border-[hsl(var(--brand-primary))] text-[hsl(var(--brand-primary))]"
                    : "border-transparent text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))]")}>
                {t.label}
                {t.count > 0 && (
                  <span className={cn("text-[11px] font-bold px-1.5 py-0.5 rounded-full",
                    tab === t.id ? "bg-[hsl(var(--brand-primary))] text-white" : "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-muted))]")}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {txLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--brand-primary))]" />
          </div>
        ) : (
          <>
            {/* Active Contacts */}
            {tab === "contacts" && (
              <div>
                {activeTransactions.length === 0 ? (
                  <EmptyState icon={Phone} title="No active contacts yet"
                    desc={`Browse rentals and tap "Get It Now" to unlock a landlord's contact.`}
                    action={{ label: "Browse Rentals", onClick: () => navigate("/browse") }} />
                ) : (
                  <div className="space-y-4">
                    {activeTransactions.map((tx) => tx.listing && (
                      <div key={tx.id} className="bg-white rounded-2xl border border-[hsl(var(--border))] overflow-hidden shadow-sm">
                        <div className="flex gap-4 p-4">
                          {tx.listing.photos[0] && (
                            <img src={tx.listing.photos[0]} alt="" className="w-24 h-20 object-cover rounded-xl flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <Link to={`/listing/${tx.listing.id}`}
                              className="font-semibold text-[hsl(var(--text-primary))] hover:text-[hsl(var(--brand-primary))] transition-colors text-[15px] leading-snug block mb-1">
                              {tx.listing.title}
                            </Link>
                            <p className="text-xs text-[hsl(var(--text-muted))] flex items-center gap-1 mb-2">
                              <MapPin className="w-3 h-3" />{tx.listing.location}
                            </p>
                            <p className="text-sm font-bold text-[hsl(var(--brand-primary))]">
                              {formatUGX(tx.listing.monthlyRent)}/month
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--brand-primary)/0.04)] px-4 py-3">
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-[hsl(var(--brand-primary))] flex items-center justify-center">
                                <Phone className="w-3.5 h-3.5 text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-[hsl(var(--text-muted))]">Landlord's number</p>
                                <a href={`tel:${tx.unlockedPhone}`} className="font-bold text-[hsl(var(--text-primary))] text-base tracking-wide hover:text-[hsl(var(--brand-primary))]">
                                  {tx.unlockedPhone}
                                </a>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => openWhatsApp(tx.unlockedPhone, tx.listing!.title)}
                                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
                                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                              </button>
                              {tx.listing.lat && tx.listing.lng && (
                                <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${tx.listing!.lat},${tx.listing!.lng}`, "_blank")}
                                  className="flex items-center gap-1.5 border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] text-xs font-semibold px-3 py-2 rounded-xl hover:bg-[hsl(var(--surface-2))] transition-colors">
                                  <Navigation className="w-3.5 h-3.5" /> Directions
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-amber-600">
                            <Clock className="w-3 h-3" />
                            <span>Held until {new Date(tx.expiresAt).toLocaleDateString("en-UG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Saved */}
            {tab === "saved" && (
              <div>
                {savedListings.length === 0 ? (
                  <EmptyState icon={Bookmark} title="No saved rentals yet"
                    desc="Bookmark properties to keep track of them easily."
                    action={{ label: "Browse Rentals", onClick: () => navigate("/browse") }} />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedListings.map((listing) => (
                      <Link key={listing.id} to={`/listing/${listing.id}`}
                        className="group bg-white rounded-2xl border border-[hsl(var(--border))] overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                        {listing.photos[0] && (
                          <div className="relative" style={{ aspectRatio: "16/9" }}>
                            <img src={listing.photos[0]} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                          </div>
                        )}
                        <div className="p-4">
                          <p className="font-semibold text-[hsl(var(--text-primary))] text-[15px] line-clamp-1 mb-1">{listing.title}</p>
                          <p className="text-xs text-[hsl(var(--text-muted))] flex items-center gap-1 mb-2.5">
                            <MapPin className="w-3 h-3" />{listing.location}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-[hsl(var(--brand-primary))] font-bold">
                              {formatUGX(listing.monthlyRent)}<span className="text-xs font-normal text-[hsl(var(--text-muted))]">/mo</span>
                            </p>
                            <AvailabilityBadge lastConfirmedAt={listing.lastConfirmedAt} availableUnits={listing.availableUnits}
                              totalUnits={listing.totalUnits} size="sm" showConfidence={false} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* History */}
            {tab === "history" && (
              <div>
                {historyTransactions.length === 0 ? (
                  <EmptyState icon={Clock} title="No past transactions"
                    desc="Your completed or expired contact requests will appear here."
                    action={{ label: "Browse Rentals", onClick: () => navigate("/browse") }} />
                ) : (
                  <div className="space-y-3">
                    {historyTransactions.map((tx) => tx.listing && (
                      <div key={tx.id} className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4 flex gap-4 items-center shadow-sm opacity-75">
                        {tx.listing.photos[0] && (
                          <img src={tx.listing.photos[0]} alt="" className="w-16 h-14 object-cover rounded-xl flex-shrink-0 grayscale" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[hsl(var(--text-primary))] text-sm line-clamp-1">{tx.listing.title}</p>
                          <p className="text-xs text-[hsl(var(--text-muted))] mt-0.5">{tx.listing.location}</p>
                          <p className="text-xs text-[hsl(var(--text-muted))] mt-1">Paid {formatUGX(tx.amount)} · {timeAgo(tx.createdAt)}</p>
                        </div>
                        <span className="text-xs font-semibold text-[hsl(var(--text-muted))] bg-[hsl(var(--surface-2))] px-2.5 py-1 rounded-full capitalize flex-shrink-0">
                          {tx.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc, action }: {
  icon: React.ElementType; title: string; desc: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-12 text-center shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--surface-2))] flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-[hsl(var(--text-muted))]" />
      </div>
      <p className="font-semibold text-[hsl(var(--text-primary))] mb-2">{title}</p>
      <p className="text-sm text-[hsl(var(--text-muted))] mb-6 max-w-xs mx-auto leading-relaxed">{desc}</p>
      {action && (
        <Button onClick={action.onClick} className="bg-[hsl(var(--brand-primary))] text-white rounded-xl h-10 px-6 text-sm font-semibold">
          {action.label} <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      )}
    </div>
  );
}
