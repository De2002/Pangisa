import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin, ShieldCheck, Phone, ChevronLeft, ChevronRight,
  Bookmark, BookmarkCheck, Flag, Share2, Clock, Lock, Play,
  MessageCircle, Check, X, CheckCircle2, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AvailabilityBadge from "@/components/features/AvailabilityBadge";
import GetItNowModal from "@/components/features/GetItNowModal";
import PropertyMap from "@/components/features/PropertyMap";
import { useListing, useSavedListings, useTenantTransactions, useListings } from "@/hooks/useListings";
import { useAuth } from "@/hooks/useAuth";
import { formatUGX, calcTenantFee } from "@/constants/fees";
import { AMENITY_LIST } from "@/constants/amenities";
import { getPropertyTypeIcon, getPropertyTypeLabel } from "@/constants/propertyTypes";
import { timeAgo } from "@/lib/timeAgo";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AMENITY_ICONS: Record<string, string> = {
  water: "💧", electricity: "⚡", wifi: "📶", security: "🛡️", parking: "🚗",
  generator: "🔋", borehole: "🌊", tiled: "⬜", kitchen: "🍳", veranda: "🏡",
  compound: "🌳", gated: "🔒", furnished: "🛋️", dsatv: "📺",
};

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: listing, isLoading } = useListing(id ?? "");
  const { getItNow } = useListings();
  const { isSaved, toggleSave } = useSavedListings(user?.id ?? "");
  const { data: myTransactions = [] } = useTenantTransactions(user?.id ?? "");

  const [photoIndex, setPhotoIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [videoExpanded, setVideoExpanded] = useState(false);

  const myTx = myTransactions.find((t) => t.listingId === listing?.id && t.status === "active");
  const hasUnlocked = !!myTx;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-warm))]">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--brand-primary))]" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-warm))]">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Listing not found</h2>
            <Button onClick={() => navigate("/browse")} className="bg-[hsl(var(--brand-primary))] text-white mt-4 rounded-xl">
              Browse Rentals
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const fee = calcTenantFee(listing.monthlyRent);
  const amenityDetails = listing.amenities
    .map((aid) => AMENITY_LIST.find((a) => a.id === aid))
    .filter(Boolean);

  const handleGetItNow = () => {
    if (!user) { navigate("/auth?role=tenant&mode=login"); return; }
    setShowModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!user) return null;
    const tx = await getItNow(listing.id, user.id);
    if (tx) toast.success("Contact unlocked!");
    return tx;
  };

  const handleShare = async () => {
    const shareData = {
      title: listing.title,
      text: `${listing.title} — ${formatUGX(listing.monthlyRent)}/month in ${listing.location}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleReport = () => {
    if (!reportReason) { toast.error("Please select a reason."); return; }
    toast.success("Report submitted. We'll review it.");
    setShowReportModal(false);
    setReportReason("");
  };

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([^&?]+)/);
    return match ? match[1] : null;
  };

  const typeIcon = getPropertyTypeIcon(listing.propertyType);
  const typeLabel = getPropertyTypeLabel(listing.propertyType);

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-warm))]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-[hsl(var(--text-muted))] hover:text-[hsl(var(--brand-primary))] mb-5 transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4" /> Back to listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* Left col */}
          <div className="lg:col-span-2 space-y-4">

            {/* Photo gallery */}
            <div className="relative rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "16/10" }}>
              {listing.photos.length > 0 ? (
                <img src={listing.photos[photoIndex]} alt={`Photo ${photoIndex + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[hsl(var(--surface-2))] flex items-center justify-center">
                  <span className="text-4xl">🏠</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

              {listing.photos.length > 1 && (
                <>
                  <button onClick={() => setPhotoIndex((i) => Math.max(0, i - 1))} disabled={photoIndex === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-sm disabled:opacity-30 hover:bg-white transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setPhotoIndex((i) => Math.min(listing.photos.length - 1, i + 1))} disabled={photoIndex === listing.photos.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-sm disabled:opacity-30 hover:bg-white transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {listing.photos.map((_, i) => (
                      <button key={i} onClick={() => setPhotoIndex(i)}
                        className={cn("rounded-full transition-all", i === photoIndex ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/60")} />
                    ))}
                  </div>
                  <div className="absolute bottom-4 right-4 flex gap-1.5">
                    {listing.photos.slice(0, 4).map((photo, i) => (
                      <button key={i} onClick={() => setPhotoIndex(i)}
                        className={cn("w-10 h-10 rounded-lg overflow-hidden border-2 transition-all shadow-sm",
                          i === photoIndex ? "border-white" : "border-white/40 hover:border-white/70")}>
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </>
              )}

              {listing.videoUrl && (
                <button onClick={() => setVideoExpanded(true)}
                  className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors">
                  <Play className="w-3.5 h-3.5 fill-white" /> Watch video
                </button>
              )}
            </div>

            {/* Video player */}
            {listing.videoUrl && videoExpanded && (
              <div className="bg-black rounded-2xl overflow-hidden relative">
                {getYouTubeId(listing.videoUrl) ? (
                  <iframe src={`https://www.youtube.com/embed/${getYouTubeId(listing.videoUrl)}?autoplay=1`}
                    title="Property video" className="w-full" style={{ aspectRatio: "16/9" }}
                    allow="autoplay; encrypted-media" allowFullScreen />
                ) : (
                  <video src={listing.videoUrl} controls className="w-full" style={{ aspectRatio: "16/9" }} />
                )}
                <button onClick={() => setVideoExpanded(false)}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Title card */}
            <div className="bg-white rounded-2xl p-5 border border-[hsl(var(--border))] shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-[hsl(var(--text-primary))] leading-tight mb-1">{listing.title}</h1>
                  <div className="flex items-center gap-1 text-sm text-[hsl(var(--text-muted))]">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{listing.address}{listing.address && listing.location ? ", " : ""}{listing.location}</span>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {user && (
                    <button onClick={() => toggleSave(listing.id)}
                      className="w-9 h-9 rounded-xl border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--surface-2))] transition-colors">
                      {isSaved(listing.id)
                        ? <BookmarkCheck className="w-4 h-4 text-[hsl(var(--brand-primary))]" />
                        : <Bookmark className="w-4 h-4 text-[hsl(var(--text-muted))]" />}
                    </button>
                  )}
                  <button onClick={handleShare}
                    className="w-9 h-9 rounded-xl border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--surface-2))] transition-colors">
                    <Share2 className="w-4 h-4 text-[hsl(var(--text-muted))]" />
                  </button>
                </div>
              </div>
              <AvailabilityBadge lastConfirmedAt={listing.lastConfirmedAt} availableUnits={listing.availableUnits}
                totalUnits={listing.totalUnits} size="md" showConfidence={true} />
              {listing.pendingUnits > 0 && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{listing.pendingUnits} unit{listing.pendingUnits !== 1 ? "s" : ""} currently being pursued</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl p-5 border border-[hsl(var(--border))] shadow-sm">
              <h2 className="font-bold text-base text-[hsl(var(--text-primary))] mb-4">Property Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Bedrooms", value: listing.bedrooms, icon: "🛏️" },
                  { label: "Bathrooms", value: listing.bathrooms, icon: "🚿" },
                  { label: "Type", value: `${typeIcon} ${typeLabel}`, icon: null },
                  { label: "Units", value: listing.totalUnits, icon: "🏢" },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="bg-[hsl(var(--surface-1))] rounded-xl p-3.5 text-center border border-[hsl(var(--border))]">
                    {icon && <p className="text-lg mb-1">{icon}</p>}
                    <p className="font-bold text-[hsl(var(--brand-primary))] text-lg leading-none">{value}</p>
                    <p className="text-xs text-[hsl(var(--text-muted))] mt-1">{label}</p>
                  </div>
                ))}
              </div>
              {listing.propertySubtype && (
                <div className="mt-3 flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))]">
                  <span className="capitalize font-medium">{listing.propertySubtype}</span>
                  <span className="text-[hsl(var(--text-muted))]">house</span>
                </div>
              )}
              {listing.isFurnished != null && (
                <div className={cn(
                  "mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                  listing.isFurnished ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-gray-50 text-gray-600 border border-gray-200"
                )}>
                  <span>{listing.isFurnished ? "🛋️" : "🪑"}</span>
                  {listing.isFurnished ? "Furnished" : "Unfurnished"}
                </div>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-2xl p-5 border border-[hsl(var(--border))] shadow-sm">
                <h2 className="font-bold text-base text-[hsl(var(--text-primary))] mb-3">About this place</h2>
                <p className="text-[hsl(var(--text-secondary))] leading-relaxed text-sm">{listing.description}</p>
              </div>
            )}

            {/* Amenities */}
            {amenityDetails.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-[hsl(var(--border))] shadow-sm">
                <h2 className="font-bold text-base text-[hsl(var(--text-primary))] mb-4">What's included</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {amenityDetails.map((amenity) => amenity && (
                    <div key={amenity.id} className="flex items-center gap-2.5 py-2 px-3 rounded-xl bg-[hsl(var(--surface-1))] border border-[hsl(var(--border))]">
                      <span className="text-base">{AMENITY_ICONS[amenity.id] ?? "✓"}</span>
                      <span className="text-sm text-[hsl(var(--text-secondary))] font-medium">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules */}
            {listing.rules.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-[hsl(var(--border))] shadow-sm">
                <h2 className="font-bold text-base text-[hsl(var(--text-primary))] mb-3">House Rules</h2>
                <ul className="space-y-2">
                  {listing.rules.map((rule, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-[hsl(var(--text-secondary))]">
                      <div className="w-5 h-5 rounded-full bg-[hsl(var(--brand-primary)/0.1)] flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-[hsl(var(--brand-primary))]" />
                      </div>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Map */}
            {listing.lat && listing.lng && (
              <div className="bg-white rounded-2xl p-5 border border-[hsl(var(--border))] shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-base text-[hsl(var(--text-primary))]">Location</h2>
                  {!hasUnlocked ? (
                    <span className="flex items-center gap-1 text-xs text-[hsl(var(--text-muted))] bg-[hsl(var(--surface-2))] px-2.5 py-1 rounded-full">
                      <Lock className="w-3 h-3" /> Area only
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <MapPin className="w-3 h-3" /> Exact pin unlocked
                    </span>
                  )}
                </div>
                <PropertyMap lat={listing.lat} lng={listing.lng} revealed={hasUnlocked}
                  locationLabel={listing.location} showRouting={hasUnlocked} />
                {!hasUnlocked && (
                  <p className="text-xs text-[hsl(var(--text-muted))] mt-2 text-center">
                    The circle shows the approximate area. Pay the contact fee to reveal the exact pin and get directions.
                  </p>
                )}
              </div>
            )}

            <button onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 text-sm text-[hsl(var(--text-muted))] hover:text-red-500 transition-colors">
              <Flag className="w-4 h-4" /> Report this listing
            </button>
          </div>

          {/* Right sticky col */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Price card */}
              <div className="bg-white rounded-2xl p-5 border border-[hsl(var(--border))] shadow-sm">
                <div className="flex items-end justify-between mb-1">
                  <span className="text-3xl font-bold text-[hsl(var(--brand-primary))]">{formatUGX(listing.monthlyRent)}</span>
                  <span className="text-[hsl(var(--text-muted))] text-sm mb-1">/month</span>
                </div>
                {listing.deposit > 0 && (
                  <p className="text-xs text-[hsl(var(--text-muted))] mb-4">Deposit: {formatUGX(listing.deposit)}</p>
                )}
                <AvailabilityBadge lastConfirmedAt={listing.lastConfirmedAt} availableUnits={listing.availableUnits}
                  totalUnits={listing.totalUnits} size="sm" />

                <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
                  {hasUnlocked ? (
                    <div className="space-y-2">
                      <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-200">
                        <p className="text-xs font-bold text-emerald-700 mb-1">✅ Contact Unlocked</p>
                        <p className="text-base font-bold text-[hsl(var(--text-primary))]">{myTx?.unlockedPhone}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <a href={`tel:${myTx?.unlockedPhone}`}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[hsl(var(--brand-primary))] text-[hsl(var(--brand-primary))] text-sm font-semibold hover:bg-[hsl(var(--brand-primary)/0.06)] transition-colors">
                          <Phone className="w-3.5 h-3.5" /> Call
                        </a>
                        <button onClick={() => {
                          const p = myTx?.unlockedPhone ?? "";
                          const cleaned = p.replace(/\D/g, "");
                          const intl = cleaned.startsWith("0") ? "256" + cleaned.slice(1) : cleaned;
                          window.open(`https://wa.me/${intl}?text=Hello, I found your listing "${listing.title}" on Pangisa. Is it still available?`, "_blank");
                        }}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors">
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        </button>
                      </div>
                      {listing.lat && listing.lng && (
                        <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`, "_blank")}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-2))] transition-colors">
                          Get Directions
                        </button>
                      )}
                    </div>
                  ) : listing.availableUnits > 0 ? (
                    <>
                      <Button onClick={handleGetItNow}
                        className="w-full font-bold bg-[hsl(var(--brand-accent))] hover:bg-[hsl(var(--brand-accent-dark))] text-white rounded-xl shadow-sm mb-2"
                        style={{ height: 52 }}>
                        Get It Now — {formatUGX(fee)}
                      </Button>
                      <p className="text-xs text-center text-[hsl(var(--text-muted))]">Pay to connect. Property held while you discuss.</p>
                    </>
                  ) : (
                    <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
                      <p className="text-red-700 font-semibold text-sm">No units available</p>
                      <p className="text-red-400 text-xs mt-0.5">Save to get notified when a unit opens</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Landlord card */}
              <div className="bg-white rounded-2xl p-5 border border-[hsl(var(--border))] shadow-sm">
                <h3 className="text-xs font-bold text-[hsl(var(--text-muted))] uppercase tracking-wider mb-3">Listed by</h3>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[hsl(var(--brand-primary)/0.1)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {listing.landlord.avatar ? (
                      <img src={listing.landlord.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[hsl(var(--brand-primary))] font-bold text-lg">{listing.landlord.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-[hsl(var(--text-primary))] text-sm">{listing.landlord.name}</p>
                      {listing.landlord.isVerified && <ShieldCheck className="w-4 h-4 text-[hsl(var(--brand-primary))]" />}
                    </div>
                    <p className="text-xs text-[hsl(var(--text-muted))]">Joined {new Date(listing.landlord.joinedAt).getFullYear()}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-[hsl(var(--text-muted))]">
                  <Phone className="w-3.5 h-3.5" />
                  <span className="tracking-wider text-sm">+256 *** *** ***</span>
                  <span className="text-[10px] bg-[hsl(var(--surface-2))] rounded px-1.5 py-0.5">Locked</span>
                </div>
                <p className="text-xs text-[hsl(var(--text-muted))] mt-1.5">Pay the contact fee to unlock the number</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <GetItNowModal listing={listing} onClose={() => setShowModal(false)} onConfirm={handleConfirmPayment}
          isLoggedIn={!!user} onLoginRequired={() => navigate("/auth?role=tenant&mode=login")} />
      )}

      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[hsl(var(--text-primary))]">Report Listing</h3>
              <button onClick={() => setShowReportModal(false)} className="w-8 h-8 rounded-full hover:bg-[hsl(var(--surface-2))] flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 mb-5">
              {["Fake property", "Wrong price", "Already rented", "Wrong information", "Suspicious landlord"].map((r) => (
                <button key={r} onClick={() => setReportReason(r)}
                  className={cn("w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
                    reportReason === r ? "border-red-400 bg-red-50 text-red-700" : "border-[hsl(var(--border))] hover:border-red-300 text-[hsl(var(--text-secondary))]")}>
                  {r}
                </button>
              ))}
            </div>
            <Button onClick={handleReport} className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl">Submit Report</Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
