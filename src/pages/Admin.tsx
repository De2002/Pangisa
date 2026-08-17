import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck, LayoutDashboard, Home, Users, CreditCard,
  Flag, AlertTriangle, LogOut, Eye, EyeOff, Pause, Trash2,
  CheckCircle2, XCircle, TrendingUp, Clock, Search, ChevronDown,
  MoreVertical, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MOCK_LISTINGS, MOCK_USERS, MOCK_TRANSACTIONS, MOCK_LANDLORDS, MOCK_LANDLORD_VERIFICATIONS } from "@/constants/mockData";
import { timeAgo } from "@/lib/timeAgo";
import type { Listing } from "@/types";

const ADMIN_KEY = "pangisa_admin_session";
const ADMIN_PASSWORD = "admin2026";

// ── Mock report data ──────────────────────────────────────────────────────────
const MOCK_REPORTS = [
  { id: "r1", listingId: "p3", listingTitle: "3-Bedroom House in Najjera", reason: "Wrong price", reportedBy: "James Mutebi", reportedAt: new Date(Date.now() - 7200000).toISOString(), status: "open" },
  { id: "r2", listingId: "p6", listingTitle: "Single Room in Kisaasi", reason: "Fake property", reportedBy: "Sarah Nakato", reportedAt: new Date(Date.now() - 86400000).toISOString(), status: "open" },
  { id: "r3", listingId: "p8", listingTitle: "3-Bedroom in Kyanja", reason: "Already rented", reportedBy: "Peter Opio", reportedAt: new Date(Date.now() - 172800000).toISOString(), status: "resolved" },
  { id: "r4", listingId: "p3", listingTitle: "3-Bedroom House in Najjera", reason: "Suspicious landlord", reportedBy: "Anonymous", reportedAt: new Date(Date.now() - 3600000).toISOString(), status: "open" },
];

const MOCK_FLAGS = [
  { id: "f1", listingId: "p3", listingTitle: "3-Bedroom House in Najjera", reason: "2 reports in 24 hours", severity: "high", flaggedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "f2", listingId: "p6", listingTitle: "Single Room in Kisaasi", reason: "Unverified landlord + fake property report", severity: "high", flaggedAt: new Date(Date.now() - 7200000).toISOString() },
  { id: "f3", listingId: "p8", listingTitle: "3-Bedroom in Kyanja", reason: "Listing not confirmed for 8+ hours", severity: "medium", flaggedAt: new Date(Date.now() - 28800000).toISOString() },
];

type AdminTab = "overview" | "listings" | "users" | "transactions" | "reports" | "flags";

function formatUGX(n: number) {
  return `UGX ${n.toLocaleString()}`;
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_KEY, "true");
      onLogin();
    } else {
      setError("Wrong password. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-warm))] flex items-center justify-center px-5">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-[hsl(var(--border))] p-8 shadow-sm">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[hsl(var(--brand-primary)/0.1)] mx-auto mb-5">
          <ShieldCheck className="w-7 h-7 text-[hsl(var(--brand-primary))]" />
        </div>
        <h1 className="text-xl font-bold text-[hsl(var(--text-primary))] text-center mb-1">Admin Panel</h1>
        <p className="text-sm text-[hsl(var(--text-muted))] text-center mb-6">Pangisa staff only</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[hsl(var(--text-secondary))] block mb-1.5">Password</label>
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="h-12 pr-10 text-base"
              />
              <button
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))]"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
          <Button
            onClick={handleLogin}
            className="w-full h-12 text-base font-bold bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary-dark))] text-white"
          >
            Enter Admin Panel
          </Button>
        </div>
        <p className="text-xs text-center text-[hsl(var(--text-muted))] mt-5">
          Demo password: <span className="font-mono font-bold text-[hsl(var(--brand-primary))]">admin2026</span>
        </p>
      </div>
    </div>
  );
}

// ── Main Admin Dashboard ──────────────────────────────────────────────────────
export default function Admin() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [verifiedLandlords, setVerifiedLandlords] = useState<Set<string>>(
    new Set(MOCK_LANDLORDS.filter((l) => l.isVerified).map((l) => l.id))
  );
  const [listings, setListings] = useState<(Listing & { paused?: boolean })[]>(
    MOCK_LISTINGS.map((l) => ({ ...l }))
  );
  const [listingSearch, setListingSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [reportFilter, setReportFilter] = useState<"all" | "open" | "resolved">("open");

  useEffect(() => {
    if (localStorage.getItem(ADMIN_KEY) === "true") setAuthed(true);
  }, []);

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_KEY);
    navigate("/");
  };

  const togglePause = (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, paused: !l.paused } : l))
    );
  };

  const removeListingFn = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalRevenue = MOCK_TRANSACTIONS.reduce((sum, t) => sum + t.amount, 0);
  const activeListings = listings.filter((l) => !l.paused && l.availableUnits > 0).length;
  const openReports = MOCK_REPORTS.filter((r) => r.status === "open").length;

  const filteredListings = listings.filter((l) =>
    l.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
    l.location.toLowerCase().includes(listingSearch.toLowerCase())
  );

  const filteredUsers = MOCK_USERS.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredReports =
    reportFilter === "all"
      ? MOCK_REPORTS
      : MOCK_REPORTS.filter((r) => r.status === reportFilter);

  const TABS: { id: AdminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "listings", label: "Listings", icon: Home, badge: listings.length },
    { id: "users", label: "Users", icon: Users, badge: MOCK_USERS.length },
    { id: "transactions", label: "Transactions", icon: CreditCard, badge: MOCK_TRANSACTIONS.length },
    { id: "reports", label: "Reports", icon: Flag, badge: openReports },
    { id: "flags", label: "Suspicious", icon: AlertTriangle, badge: MOCK_FLAGS.length },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-warm))] flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-[hsl(var(--border))] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--brand-primary))] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-[hsl(var(--text-primary))] text-sm">Pangisa Admin</span>
              <span className="ml-2 text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">Staff only</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-[hsl(var(--text-muted))] hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Tab nav */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-6 scrollbar-none">
          {TABS.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                tab === id
                  ? "bg-[hsl(var(--brand-primary))] text-white shadow-sm"
                  : "text-[hsl(var(--text-secondary))] hover:bg-white hover:text-[hsl(var(--text-primary))]"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {badge !== undefined && badge > 0 && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center",
                  tab === id ? "bg-white/20 text-white" : "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-muted))]"
                )}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ────────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">Overview</h1>
              <p className="text-sm text-[hsl(var(--text-muted))]">Platform snapshot — updated live</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Listings", value: listings.length, icon: Home, color: "text-[hsl(var(--brand-primary))]", bg: "bg-[hsl(var(--brand-primary)/0.08)]" },
                { label: "Active Listings", value: activeListings, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Total Users", value: MOCK_USERS.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Transactions", value: MOCK_TRANSACTIONS.length, icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", s.bg)}>
                    <s.icon className={cn("w-5 h-5", s.color)} />
                  </div>
                  <p className="text-2xl font-bold text-[hsl(var(--text-primary))]">{s.value}</p>
                  <p className="text-xs text-[hsl(var(--text-muted))] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Revenue + alerts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-[hsl(var(--brand-primary))] rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-white/70" />
                  <p className="text-sm font-medium text-white/80">Total Revenue</p>
                </div>
                <p className="text-3xl font-bold">{formatUGX(totalRevenue)}</p>
                <p className="text-xs text-white/60 mt-1">from {MOCK_TRANSACTIONS.length} transaction{MOCK_TRANSACTIONS.length !== 1 ? "s" : ""}</p>
              </div>

              <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Flag className="w-5 h-5 text-red-400" />
                  <p className="text-sm font-medium text-[hsl(var(--text-secondary))]">Open Reports</p>
                </div>
                <p className="text-3xl font-bold text-[hsl(var(--text-primary))]">{openReports}</p>
                <button onClick={() => setTab("reports")} className="text-xs text-[hsl(var(--brand-primary))] hover:underline mt-1 block">
                  View all reports →
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <p className="text-sm font-medium text-[hsl(var(--text-secondary))]">Suspicious Flags</p>
                </div>
                <p className="text-3xl font-bold text-[hsl(var(--text-primary))]">{MOCK_FLAGS.length}</p>
                <button onClick={() => setTab("flags")} className="text-xs text-[hsl(var(--brand-primary))] hover:underline mt-1 block">
                  View all flags →
                </button>
              </div>
            </div>

            {/* Recent transactions */}
            <div className="bg-white rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
              <div className="px-5 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
                <p className="font-bold text-[hsl(var(--text-primary))]">Recent Transactions</p>
                <button onClick={() => setTab("transactions")} className="text-xs text-[hsl(var(--brand-primary))] hover:underline">See all</button>
              </div>
              {MOCK_TRANSACTIONS.map((tx) => {
                const listing = MOCK_LISTINGS.find((l) => l.id === tx.listingId);
                return (
                  <div key={tx.id} className="flex items-center justify-between px-5 py-3.5 border-b border-[hsl(var(--border))] last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{listing?.title ?? tx.listingId}</p>
                      <p className="text-xs text-[hsl(var(--text-muted))]">{timeAgo(tx.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[hsl(var(--brand-primary))]">{formatUGX(tx.amount)}</p>
                      <span className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded-full",
                        tx.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                      )}>{tx.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── LISTINGS ────────────────────────────────────────────────────── */}
        {tab === "listings" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">All Listings</h1>
              <span className="text-sm text-[hsl(var(--text-muted))]">{filteredListings.length} listings</span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-muted))]" />
              <Input
                placeholder="Search by title or location..."
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                className="pl-9 h-10 bg-white"
              />
            </div>

            <div className="space-y-3">
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className={cn(
                    "bg-white rounded-2xl border p-4 transition-all",
                    listing.paused ? "border-amber-200 opacity-60" : "border-[hsl(var(--border))]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <img
                        src={listing.photos[0]}
                        alt={listing.title}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                          <p className="font-bold text-[hsl(var(--text-primary))] text-sm truncate">{listing.title}</p>
                          {listing.isVerified && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0">✓ Verified</span>
                          )}
                          {listing.paused && (
                            <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0">Paused</span>
                          )}
                        </div>
                        <p className="text-xs text-[hsl(var(--text-muted))]">{listing.location} · {listing.landlord.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-semibold text-[hsl(var(--brand-primary))]">{formatUGX(listing.monthlyRent)}/mo</span>
                          <span className="text-xs text-[hsl(var(--text-muted))]">{listing.availableUnits}/{listing.totalUnits} available</span>
                          <span className="text-xs text-[hsl(var(--text-muted))]">Listed {timeAgo(listing.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => togglePause(listing.id)}
                        title={listing.paused ? "Unpause" : "Pause"}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                          listing.paused
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                        )}
                      >
                        {listing.paused ? <RefreshCw className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => removeListingFn(listing.id)}
                        title="Remove listing"
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── USERS ───────────────────────────────────────────────────────── */}
        {tab === "users" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">All Users</h1>
              <span className="text-sm text-[hsl(var(--text-muted))]">{filteredUsers.length} users</span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-muted))]" />
              <Input
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9 h-10 bg-white"
              />
            </div>

            {/* Landlords */}
            <div>
              <p className="text-xs font-bold text-[hsl(var(--text-muted))] uppercase tracking-wider mb-3">Landlords ({MOCK_LANDLORDS.length})</p>
              <div className="space-y-3">
                {MOCK_LANDLORDS.map((lp) => {
                  const isVerifiedNow = verifiedLandlords.has(lp.id);
                  const hasDocs = MOCK_LANDLORD_VERIFICATIONS.some((v) => v.landlordId === lp.id);
                  return (
                    <div key={lp.id} className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700 flex-shrink-0">
                            {lp.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{lp.name}</p>
                              {isVerifiedNow && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                            </div>
                            <p className="text-xs text-[hsl(var(--text-muted))]">{lp.phone} · {lp.listingsCount} listing{lp.listingsCount !== 1 ? "s" : ""}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isVerifiedNow ? (
                            <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-full">✓ Verified</span>
                          ) : (
                            <button
                              onClick={() => {
                                setVerifiedLandlords((prev) => { const n = new Set(prev); n.add(lp.id); return n; });
                                import("sonner").then(({ toast }) => toast.success(`${lp.name} is now verified.`));
                              }}
                              className="text-xs bg-[hsl(var(--brand-primary))] text-white font-bold px-3 py-1.5 rounded-full hover:bg-[hsl(var(--brand-primary-dark))] transition-colors"
                            >
                              Verify
                            </button>
                          )}
                        </div>
                      </div>
                      {hasDocs && (
                        <div className="mt-3 pt-3 border-t border-[hsl(var(--border))] flex items-center gap-2">
                          <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                            📄 Verification docs submitted
                          </span>
                          <span className="text-xs text-[hsl(var(--text-muted))]">Review and verify above</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tenants */}
            <div>
              <p className="text-xs font-bold text-[hsl(var(--text-muted))] uppercase tracking-wider mb-3">Tenants ({MOCK_USERS.filter(u => u.role === "tenant").length})</p>
              <div className="space-y-2">
                {filteredUsers.filter(u => u.role === "tenant").map((u) => (
                  <div key={u.id} className="bg-white rounded-xl border border-[hsl(var(--border))] px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{u.name}</p>
                        <p className="text-xs text-[hsl(var(--text-muted))]">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">Tenant</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TRANSACTIONS ────────────────────────────────────────────────── */}
        {tab === "transactions" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Transactions</h1>
              <span className="text-sm font-bold text-[hsl(var(--brand-primary))]">
                {formatUGX(MOCK_TRANSACTIONS.reduce((s, t) => s + t.amount, 0))} total
              </span>
            </div>

            <div className="space-y-3">
              {MOCK_TRANSACTIONS.map((tx) => {
                const listing = MOCK_LISTINGS.find((l) => l.id === tx.listingId);
                const tenant = MOCK_USERS.find((u) => u.id === tx.tenantId);
                const isExpired = new Date(tx.expiresAt) < new Date();
                return (
                  <div key={tx.id} className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-sm text-[hsl(var(--text-primary))]">
                            {listing?.title ?? tx.listingId}
                          </p>
                          <span className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded-full",
                            tx.status === "active" && !isExpired ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                          )}>
                            {isExpired ? "expired" : tx.status}
                          </span>
                        </div>
                        <p className="text-xs text-[hsl(var(--text-muted))]">
                          Tenant: {tenant?.name ?? tx.tenantId} · Unit: {tx.unitId}
                        </p>
                        <p className="text-xs text-[hsl(var(--text-muted))] mt-0.5">
                          Paid {timeAgo(tx.createdAt)} · expires {timeAgo(tx.expiresAt)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold text-[hsl(var(--brand-primary))]">{formatUGX(tx.amount)}</p>
                        <p className="text-xs text-[hsl(var(--text-muted))] font-mono mt-0.5">{tx.id}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {MOCK_TRANSACTIONS.length === 0 && (
              <div className="text-center py-16 text-[hsl(var(--text-muted))]">
                <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No transactions yet</p>
              </div>
            )}
          </div>
        )}

        {/* ── REPORTS ─────────────────────────────────────────────────────── */}
        {tab === "reports" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Reports</h1>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              {(["all", "open", "resolved"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setReportFilter(f)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize",
                    reportFilter === f
                      ? "bg-[hsl(var(--brand-primary))] text-white"
                      : "bg-white border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--brand-primary)/0.4)]"
                  )}
                >
                  {f}
                  {f !== "all" && (
                    <span className="ml-1.5 text-xs opacity-70">
                      ({MOCK_REPORTS.filter((r) => r.status === f).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredReports.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3 flex-1">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                        r.status === "open" ? "bg-red-50" : "bg-gray-100"
                      )}>
                        <Flag className={cn("w-4 h-4", r.status === "open" ? "text-red-500" : "text-gray-400")} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[hsl(var(--text-primary))]">{r.listingTitle}</p>
                        <p className="text-xs text-[hsl(var(--text-muted))] mt-0.5">
                          Reason: <span className="font-semibold text-[hsl(var(--text-secondary))]">{r.reason}</span>
                        </p>
                        <p className="text-xs text-[hsl(var(--text-muted))] mt-0.5">
                          By {r.reportedBy} · {timeAgo(r.reportedAt)}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0",
                      r.status === "open" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
                    )}>
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SUSPICIOUS FLAGS ────────────────────────────────────────────── */}
        {tab === "flags" && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Suspicious Activity</h1>
              <p className="text-sm text-[hsl(var(--text-muted))] mt-0.5">Auto-flagged listings that need review</p>
            </div>

            <div className="space-y-3">
              {MOCK_FLAGS.map((f) => (
                <div key={f.id} className={cn(
                  "bg-white rounded-2xl border p-4",
                  f.severity === "high" ? "border-red-200" : "border-amber-200"
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                      f.severity === "high" ? "bg-red-50" : "bg-amber-50"
                    )}>
                      <AlertTriangle className={cn("w-4 h-4", f.severity === "high" ? "text-red-500" : "text-amber-500")} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-sm text-[hsl(var(--text-primary))]">{f.listingTitle}</p>
                        <span className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded-full",
                          f.severity === "high" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                        )}>
                          {f.severity} risk
                        </span>
                      </div>
                      <p className="text-xs text-[hsl(var(--text-muted))]">{f.reason}</p>
                      <p className="text-xs text-[hsl(var(--text-muted))] mt-1">Flagged {timeAgo(f.flaggedAt)}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => togglePause(f.listingId)}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors"
                      >
                        Pause
                      </button>
                      <button
                        onClick={() => removeListingFn(f.listingId)}
                        className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
