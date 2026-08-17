import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  PlusCircle, Eye, Edit3, Trash2, Phone, Clock,
  CheckCircle2, AlertCircle, LogIn, ArrowRight,
  BarChart2, ShieldCheck, Upload, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AvailabilityBadge from "@/components/features/AvailabilityBadge";
import { useAuth } from "@/hooks/useAuth";
import { useLandlordListings } from "@/hooks/useListings";
import { formatUGX } from "@/constants/fees";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type Tab = "listings" | "verification";

export default function LandlordDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: myListings = [], isLoading } = useLandlordListings(user?.id ?? "");
  const [tab, setTab] = useState<Tab>("listings");

  // Verification upload state
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploaded, setUploaded] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

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
            <p className="text-[hsl(var(--text-muted))] text-sm mb-6">Your landlord dashboard is waiting for you.</p>
            <Button onClick={() => navigate("/auth?role=landlord&mode=login")}
              className="bg-[hsl(var(--brand-primary))] text-white rounded-xl w-full h-11 font-semibold">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalAvailable = myListings.reduce((s, l) => s + l.availableUnits, 0);
  const totalPending = myListings.reduce((s, l) => s + l.pendingUnits, 0);
  const totalRented = myListings.reduce((s, l) => s + l.rentedUnits, 0);

  const handleUploadDoc = async (key: string, file: File) => {
    setUploading((prev) => ({ ...prev, [key]: true }));
    const path = `verifications/${user.id}/${key}-${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("pangisa").upload(path, file, { upsert: true });
    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading((prev) => ({ ...prev, [key]: false }));
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("pangisa").getPublicUrl(path);
    setUploaded((prev) => ({ ...prev, [key]: publicUrl }));
    setUploading((prev) => ({ ...prev, [key]: false }));
    toast.success(`${key === "profile" ? "Profile photo" : key === "id" ? "ID photo" : "Chairman's letter"} uploaded.`);
  };

  const handleSubmitVerification = async () => {
    if (!uploaded["id"] && !uploaded["chairman"]) {
      toast.error("Please upload at least your ID photo or chairman's letter.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("landlord_verifications").upsert({
      landlord_id: user.id,
      profile_photo_url: uploaded["profile"] ?? null,
      id_photo_url: uploaded["id"] ?? null,
      chairman_letter_url: uploaded["chairman"] ?? null,
      status: "pending",
      submitted_at: new Date().toISOString(),
    }, { onConflict: "landlord_id" });

    setSubmitting(false);
    if (error) { toast.error("Submission failed: " + error.message); return; }
    toast.success("Verification submitted! Admin will review within 24 hours.");
    qc.invalidateQueries({ queryKey: ["landlord-listings", user.id] });
  };

  const handlePauseListing = async (listingId: string, isPaused: boolean) => {
    const { error } = await supabase.from("listings").update({ is_paused: !isPaused }).eq("id", listingId);
    if (error) { toast.error("Failed to update listing."); return; }
    qc.invalidateQueries({ queryKey: ["landlord-listings", user.id] });
    toast.success(isPaused ? "Listing resumed." : "Listing paused.");
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "listings", label: "My Listings" },
    { id: "verification", label: "Verification" },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-warm))]">
      <Navbar />

      <div className="bg-white border-b border-[hsl(var(--border))]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-0">
          <div className="flex items-start justify-between mb-8 gap-4">
            <div>
              <p className="text-sm text-[hsl(var(--text-muted))] mb-1">Landlord account</p>
              <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] tracking-tight">
                {user.name.split(" ")[0]}'s Dashboard
              </h1>
            </div>
            <Button onClick={() => navigate("/list-property")}
              className="bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary-dark))] text-white rounded-xl h-10 px-4 text-sm font-semibold flex items-center gap-2 shadow-sm flex-shrink-0">
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Add Listing</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { value: myListings.length, label: "Listings", color: "text-[hsl(var(--brand-primary))]", bg: "bg-[hsl(var(--brand-primary)/0.06)]", border: "border-[hsl(var(--brand-primary)/0.15)]" },
              { value: totalAvailable, label: "Available", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
              { value: totalPending, label: "Pending", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100" },
              { value: totalRented, label: "Rented", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
            ].map(({ value, label, color, bg, border }) => (
              <div key={label} className={`rounded-2xl border ${border} ${bg} px-4 py-3.5 text-center`}>
                <p className={`text-2xl font-bold ${color} leading-none mb-1`}>{value}</p>
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
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Listings tab */}
        {tab === "listings" && (
          <div>
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--brand-primary))]" />
              </div>
            ) : myListings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-12 text-center shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--surface-2))] flex items-center justify-center mx-auto mb-4">
                  <BarChart2 className="w-6 h-6 text-[hsl(var(--text-muted))]" />
                </div>
                <p className="font-semibold text-[hsl(var(--text-primary))] mb-2">No listings yet</p>
                <p className="text-sm text-[hsl(var(--text-muted))] mb-6 max-w-xs mx-auto">Create your first listing to start receiving tenant contacts.</p>
                <Button onClick={() => navigate("/list-property")}
                  className="bg-[hsl(var(--brand-primary))] text-white rounded-xl h-10 px-6 text-sm font-semibold">
                  Create Listing <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myListings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-2xl border border-[hsl(var(--border))] overflow-hidden shadow-sm">
                    <div className="flex gap-0">
                      <div className="w-32 sm:w-44 flex-shrink-0 relative">
                        {listing.photos[0] ? (
                          <img src={listing.photos[0]} alt="" className="w-full h-full object-cover" style={{ minHeight: 120 }} />
                        ) : (
                          <div className="w-full h-full bg-[hsl(var(--surface-2))] flex items-center justify-center" style={{ minHeight: 120 }}>
                            <span className="text-3xl">🏠</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-4 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <Link to={`/listing/${listing.id}`}
                            className="font-semibold text-[hsl(var(--text-primary))] hover:text-[hsl(var(--brand-primary))] transition-colors text-[15px] leading-snug">
                            {listing.title}
                          </Link>
                          <div className="flex gap-1 flex-shrink-0">
                            <button onClick={() => handlePauseListing(listing.id, listing.isPaused ?? false)}
                              title={listing.isPaused ? "Resume" : "Pause"}
                              className="w-8 h-8 rounded-lg border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--surface-2))] transition-colors">
                              <Edit3 className="w-3.5 h-3.5 text-[hsl(var(--text-muted))]" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[hsl(var(--brand-primary))] font-bold text-base mb-2.5">
                          {formatUGX(listing.monthlyRent)}<span className="text-xs font-normal text-[hsl(var(--text-muted))]">/month</span>
                        </p>

                        <AvailabilityBadge lastConfirmedAt={listing.lastConfirmedAt} availableUnits={listing.availableUnits}
                          totalUnits={listing.totalUnits} size="sm" />

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs">
                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {listing.availableUnits} available
                          </span>
                          {listing.pendingUnits > 0 && (
                            <span className="flex items-center gap-1 text-amber-600 font-medium">
                              <Clock className="w-3.5 h-3.5" /> {listing.pendingUnits} pending
                            </span>
                          )}
                          {listing.rentedUnits > 0 && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <AlertCircle className="w-3.5 h-3.5" /> {listing.rentedUnits} rented
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {listing.pendingUnits > 0 && (
                      <div className="border-t border-amber-100 bg-amber-50 px-4 py-3 flex items-start gap-2">
                        <Phone className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700">
                          <strong>{listing.pendingUnits} tenant{listing.pendingUnits !== 1 ? "s" : ""}</strong> unlocked contact.
                          Please confirm whether units were rented or are available again.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Verification tab */}
        {tab === "verification" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 shadow-sm">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-[hsl(var(--text-primary))] mb-1">Get Verified</h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                    Verified landlords get a badge on their listings and appear higher in search.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Your photo", desc: "A clear selfie", key: "profile", required: false },
                  { label: "ID photo", desc: "You holding your national ID or passport", key: "id", required: true },
                  { label: "Chairman's letter", desc: "Letter from LC1 confirming the property", key: "chairman", required: true },
                ].map(({ label, desc, key, required }) => (
                  <label key={key}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--brand-primary)/0.4)] hover:bg-[hsl(var(--brand-primary)/0.02)] cursor-pointer transition-all group">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                        uploaded[key] ? "bg-emerald-100" : "bg-[hsl(var(--surface-2))] group-hover:bg-[hsl(var(--brand-primary)/0.08)]")}>
                        {uploading[key] ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[hsl(var(--brand-primary))]" />
                        ) : uploaded[key] ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Upload className="w-4 h-4 text-[hsl(var(--text-muted))] group-hover:text-[hsl(var(--brand-primary))]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[hsl(var(--text-secondary))]">
                          {label}
                          {!required && <span className="text-xs font-normal text-[hsl(var(--text-muted))] ml-1">(optional)</span>}
                        </p>
                        <p className="text-xs text-[hsl(var(--text-muted))]">{desc}</p>
                      </div>
                    </div>
                    <span className={cn("text-xs font-semibold", uploaded[key] ? "text-emerald-600" : "text-[hsl(var(--brand-primary))]")}>
                      {uploaded[key] ? "Uploaded ✓" : "Upload"}
                    </span>
                    <input type="file" accept="image/*" className="sr-only"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadDoc(key, f); }} />
                  </label>
                ))}
              </div>

              <Button onClick={handleSubmitVerification} disabled={submitting}
                className="w-full mt-5 bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary-dark))] text-white rounded-xl h-11 font-semibold text-sm">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting…</> : "Submit for Verification"}
              </Button>
            </div>

            <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5 shadow-sm">
              <p className="text-xs font-bold text-[hsl(var(--text-muted))] uppercase tracking-widest mb-3">Why verification matters</p>
              <div className="space-y-2.5">
                {[
                  "Your listings appear higher in search results",
                  "Tenants trust verified landlords more",
                  "You get a blue verified badge on every listing",
                  "More tenant contacts means faster letting",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[hsl(var(--text-secondary))]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
