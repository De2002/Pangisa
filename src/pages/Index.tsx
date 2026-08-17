import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, ShieldCheck, Zap, ArrowRight, Home,
  Search, CheckCircle2, TrendingUp, Star, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ListingCard from "@/components/features/ListingCard";
import SearchBar from "@/components/features/SearchBar";
import { useListings, useSavedListings } from "@/hooks/useListings";
import { useAuth } from "@/hooks/useAuth";
import { storeReferralCode } from "@/hooks/useAffiliate";
import type { SearchFilters } from "@/types";
import heroImg from "@/assets/hero-kampala.jpg";
import { Loader2 } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { listings, isLoading } = useListings();
  const { isSaved, toggleSave } = useSavedListings(user?.id ?? "");

  // Capture affiliate ref code from homepage URL (e.g. pangisa.com/?ref=PAN12345)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) storeReferralCode(refCode);
  }, []);

  const featured = listings.slice(0, 6);

  const handleSearch = (filters: SearchFilters) => {
    const params = new URLSearchParams();
    if (filters.location) params.set("location", filters.location);
    if (filters.maxRent) params.set("maxRent", filters.maxRent.toString());
    if (filters.propertyType) params.set("type", filters.propertyType);
    if (filters.bedrooms) params.set("beds", filters.bedrooms.toString());
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Kampala" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(152,52%,12%)/0.93] via-[hsl(152,52%,16%)/0.80] to-[hsl(152,48%,24%)/0.45]" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 mb-7">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/90 text-sm font-medium tracking-wide">Uganda's Rental Marketplace</span>
            </div>

            <h1 className="text-[2.6rem] sm:text-[3.2rem] font-bold text-white leading-[1.12] tracking-tight mb-5">
              Find a Home.<br />
              <span className="text-[hsl(42,100%,72%)]">Skip the Wasted Trips.</span>
            </h1>

            <p className="text-white/80 text-[1.05rem] leading-relaxed mb-9 max-w-[480px]">
              Real availability, confirmed by landlords. Pay a small fee to unlock contact and pursue the rental directly.
            </p>

            {/* Search */}
            <div className="max-w-xl">
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-5 mt-7">
              {[
                { icon: CheckCircle2, label: "Confirmed availability" },
                { icon: ShieldCheck, label: "Verified landlords" },
                { icon: Zap, label: "From UGX 2,000" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-white/85 text-sm">
                  <Icon className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────── */}
      <section className="bg-[hsl(var(--brand-primary))] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-white/20">
            {[
              { value: listings.length > 0 ? `${listings.length}+` : "Live", label: "Active listings" },
              { value: "Confirmed", label: "Availability status" },
              { value: "UGX 2K", label: "Starting access fee" },
            ].map(({ value, label }) => (
              <div key={label} className="px-4 sm:px-8 py-1 text-center">
                <p className="text-white font-bold text-xl sm:text-2xl">{value}</p>
                <p className="text-white/65 text-xs sm:text-sm mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section className="py-20 bg-[hsl(var(--bg-warm))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[hsl(var(--brand-accent))] text-sm font-bold uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-[2rem] font-bold text-[hsl(var(--text-primary))] mb-3 tracking-tight">
              Three steps to your next home
            </h2>
            <p className="text-[hsl(var(--text-secondary))] max-w-md mx-auto leading-relaxed">
              No middlemen. No wasted trips. Just real listings and direct contact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                step: "1",
                icon: Search,
                title: "Search available rentals",
                desc: "Browse properties listed by landlords. Every listing shows when availability was last confirmed — so you know it's real before you go.",
                accent: "bg-blue-50 text-blue-600",
              },
              {
                step: "2",
                icon: Zap,
                title: "Get It Now",
                desc: "Pay a small access fee — as low as UGX 2,000. The landlord's phone number is revealed and the unit is temporarily held for you.",
                accent: "bg-amber-50 text-amber-600",
                featured: true,
              },
              {
                step: "3",
                icon: Home,
                title: "Call, visit, and move in",
                desc: "Speak directly with the landlord. No agents, no surprises. The property stays reserved while you discuss.",
                accent: "bg-emerald-50 text-emerald-600",
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`relative bg-white rounded-3xl p-7 border ${
                  item.featured
                    ? "border-[hsl(var(--brand-primary)/0.25)] shadow-lg ring-1 ring-[hsl(var(--brand-primary)/0.1)]"
                    : "border-[hsl(var(--border))] shadow-sm"
                }`}
              >
                {item.featured && (
                  <div className="absolute -top-3 left-6">
                    <span className="bg-[hsl(var(--brand-accent))] text-white text-xs font-bold px-3 py-1 rounded-full">Most used</span>
                  </div>
                )}
                <div className={`w-12 h-12 rounded-2xl ${item.accent} flex items-center justify-center mb-5`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-[hsl(var(--text-muted))] uppercase tracking-widest mb-2">Step {item.step}</div>
                <h3 className="font-bold text-[1.05rem] text-[hsl(var(--text-primary))] mb-2.5 leading-snug">{item.title}</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Listings ─────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[hsl(var(--brand-accent))] text-sm font-bold uppercase tracking-widest mb-2">Live Listings</p>
              <h2 className="text-[2rem] font-bold text-[hsl(var(--text-primary))] tracking-tight">Available Now</h2>
              <p className="text-[hsl(var(--text-secondary))] mt-1.5 text-sm">
                {isLoading ? "Loading…" : `${listings.length} rentals with confirmed availability`}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/browse")}
              className="hidden sm:flex items-center gap-2 border-[hsl(var(--brand-primary))] text-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary)/0.06)] rounded-xl font-semibold"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--brand-primary))]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isSaved={isSaved(listing.id)}
                  onToggleSave={user ? toggleSave : undefined}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button
              onClick={() => navigate("/browse")}
              className="bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary-dark))] text-white px-8 h-12 rounded-xl text-[0.95rem] font-semibold shadow-sm"
            >
              Browse All Rentals <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Why Pangisa ────────────────────────────────────────────── */}
      <section className="py-20 bg-[hsl(var(--bg-warm))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[hsl(var(--brand-accent))] text-sm font-bold uppercase tracking-widest mb-3">The Problem We Solve</p>
              <h2 className="text-[1.9rem] font-bold text-[hsl(var(--text-primary))] mb-5 tracking-tight leading-snug">
                Renting in Uganda<br />used to mean guessing.
              </h2>
              <p className="text-[hsl(var(--text-secondary))] leading-relaxed mb-6">
                You hear about a house. You travel there — sometimes hours away. You arrive and the house is already taken.
                You've lost transport money and a full day.
              </p>
              <p className="text-[hsl(var(--text-secondary))] leading-relaxed mb-8">
                <strong className="text-[hsl(var(--text-primary))]">Pangisa fixes this.</strong> You see real listings with real availability, confirmed by landlords.
                You pay a tiny fee — as low as UGX 2,000 — only when you're ready to pursue a specific property.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "See availability before you travel",
                  "Contact landlord directly — no agents",
                  "Property held while you discuss",
                  "Verified landlords, safe platform",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-sm text-[hsl(var(--text-secondary))]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: "🔍",
                  title: "Before Pangisa",
                  points: ["Travel to see the house", "House already taken", "Lose transport money", "Start over"],
                  bad: true,
                },
                {
                  icon: "✅",
                  title: "With Pangisa",
                  points: ["Browse from your phone", "See if it's available", "Pay UGX 2,000 to connect", "Call & visit with certainty"],
                  bad: false,
                },
              ].map((col) => (
                <div
                  key={col.title}
                  className={`rounded-2xl p-5 border ${
                    col.bad
                      ? "bg-red-50 border-red-100"
                      : "bg-emerald-50 border-emerald-100"
                  }`}
                >
                  <div className="text-2xl mb-3">{col.icon}</div>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${col.bad ? "text-red-500" : "text-emerald-700"}`}>
                    {col.title}
                  </p>
                  <ul className="space-y-2">
                    {col.points.map((p) => (
                      <li key={p} className={`text-xs leading-snug ${col.bad ? "text-red-600 line-through opacity-70" : "text-emerald-800 font-medium"}`}>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── For Landlords ─────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[hsl(152,52%,14%)] to-[hsl(152,52%,22%)] rounded-3xl p-8 md:p-14 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/3" />

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 mb-5">
                  <TrendingUp className="w-4 h-4 text-[hsl(var(--brand-accent-light))]" />
                  <span className="text-sm font-semibold text-white/90">For Landlords</span>
                </div>
                <h2 className="text-[1.9rem] font-bold text-white mb-4 leading-tight tracking-tight">
                  Put your property in front of people who are ready to rent.
                </h2>
                <p className="text-white/70 leading-relaxed mb-5">
                  List your property once and let serious tenants come to you. Only tenants who have paid to pursue the rental can contact you — no time-wasters.
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/75 text-sm">
                  {[
                    "Listing fee from UGX 10,000",
                    "3% of one month's rent",
                    "Bulk discounts for multiple units",
                  ].map((item) => (
                    <span key={item} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--brand-accent-light))] flex-shrink-0" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 flex-shrink-0 w-full lg:w-auto">
                <Button
                  onClick={() => navigate("/list-property")}
                  className="bg-[hsl(var(--brand-accent))] hover:bg-[hsl(var(--brand-accent-dark))] text-white h-13 px-8 rounded-xl text-base font-bold shadow-lg w-full lg:w-auto"
                  style={{ height: 52 }}
                >
                  List Your Property
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/onboarding?role=landlord")}
                  className="border border-white/30 text-white hover:bg-white/10 h-12 px-8 rounded-xl w-full lg:w-auto font-semibold"
                >
                  Register as Landlord
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust section ─────────────────────────────────────────── */}
      <section className="bg-[hsl(var(--bg-warm))] py-16 border-t border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              {
                icon: ShieldCheck,
                title: "Verified Landlords",
                desc: "Landlords submit ID and chairman letter. We review and issue the verification badge.",
                color: "text-emerald-600 bg-emerald-50",
              },
              {
                icon: Star,
                title: "Availability Confidence",
                desc: "Every listing shows when it was last confirmed available — so you know it's not stale.",
                color: "text-amber-600 bg-amber-50",
              },
              {
                icon: Users,
                title: "Direct Connection",
                desc: "No agents in the middle. Your contact fee goes directly to connecting you with the landlord.",
                color: "text-blue-600 bg-blue-50",
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-[hsl(var(--border))] shadow-sm">
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[hsl(var(--text-primary))] mb-2">{title}</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
