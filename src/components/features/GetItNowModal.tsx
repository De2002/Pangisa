import { useState } from "react";
import { Phone, Lock, CheckCircle2, Clock, MapPin, MessageCircle, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { formatUGX, calcTenantFee, PENDING_EXPIRY_HOURS } from "@/constants/fees";
import type { Listing, Transaction } from "@/types";

interface GetItNowModalProps {
  listing: Listing;
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<Transaction | null>;
  isLoggedIn: boolean;
  onLoginRequired: () => void;
}

type Step = "confirm" | "processing" | "success";

export default function GetItNowModal({
  listing, open, onClose, onConfirm, isLoggedIn, onLoginRequired,
}: GetItNowModalProps) {
  const [step, setStep] = useState<Step>("confirm");
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const fee = calcTenantFee(listing.monthlyRent);

  const handlePay = async () => {
    if (!isLoggedIn) { onLoginRequired(); return; }
    setStep("processing");
    const tx = await onConfirm();
    setTransaction(tx);
    setStep("success");
  };

  const handleOpenChange = (next: boolean) => {
    if (next) return;
    if (step === "processing") return; // don't allow closing mid-payment
    onClose();
    // reset for next open
    setTimeout(() => { setStep("confirm"); setTransaction(null); }, 250);
  };

  const openWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    const intl = cleaned.startsWith("0") ? "256" + cleaned.slice(1) : cleaned;
    window.open(`https://wa.me/${intl}?text=Hello, I found your listing on Pangisa: "${listing.title}". Is it still available?`, "_blank");
  };

  const openGoogleMaps = () => {
    if (listing.lat && listing.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`, "_blank");
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="z-[1200] rounded-t-3xl border-0 p-0 max-h-[90vh] overflow-y-auto sm:max-w-md sm:mx-auto [&>button]:hidden"
      >
        {/* Grab handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-[hsl(var(--border))]" />
        </div>

        <SheetHeader className="px-6 pt-2 pb-4 text-left">
          <SheetTitle className="text-lg font-bold text-[hsl(var(--text-primary))]">
            {step === "success" ? "You're in contact 🎉" : "Get it now"}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Unlock the landlord&apos;s contact details for this property.
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 pb-8">
          {step === "confirm" && (
            <>
              <div className="bg-[hsl(var(--surface-1))] rounded-2xl p-4 mb-5 border border-[hsl(var(--border))]">
                <p className="font-bold text-[hsl(var(--text-primary))] text-sm mb-1 line-clamp-1">{listing.title}</p>
                <p className="text-[hsl(var(--text-muted))] text-sm">{listing.location}</p>
                <p className="text-[hsl(var(--brand-primary))] font-bold mt-2 text-lg">{formatUGX(listing.monthlyRent)}/month</p>
              </div>

              <div className="space-y-2.5 mb-6 text-sm text-[hsl(var(--text-secondary))]">
                {[
                  { icon: Phone, text: "The landlord's phone number is revealed to you" },
                  { icon: MapPin, text: "Exact location and address unlocked" },
                  { icon: Clock, text: `Property held for ${PENDING_EXPIRY_HOURS} hours while you talk` },
                  { icon: Lock, text: "Only you can pursue this unit for now" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[hsl(var(--brand-primary)/0.08)] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-[hsl(var(--brand-primary))]" />
                    </div>
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={handlePay}
                className="w-full font-bold bg-[hsl(var(--brand-accent))] hover:bg-[hsl(var(--brand-accent-dark))] text-white rounded-xl shadow-sm"
                style={{ height: 52 }}
              >
                Get it now — {formatUGX(fee)}
              </Button>
              <p className="text-xs text-center text-[hsl(var(--text-muted))] mt-3">
                Pay to connect directly with the landlord.
              </p>
            </>
          )}

          {step === "processing" && (
            <div className="py-10 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[hsl(var(--brand-primary)/0.1)] flex items-center justify-center">
                <div className="w-8 h-8 border-[3px] border-[hsl(var(--brand-primary))] border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-[hsl(var(--text-primary))]">Processing payment…</p>
                <p className="text-sm text-[hsl(var(--text-muted))] mt-1">Securing your contact request</p>
              </div>
            </div>
          )}

          {step === "success" && transaction && (
            <>
              <div className="flex flex-col items-center py-2 mb-5">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                </div>
                <p className="font-bold text-xl text-[hsl(var(--text-primary))] mb-1">Contact unlocked!</p>
                <p className="text-sm text-[hsl(var(--text-muted))] text-center">
                  Call or WhatsApp the landlord directly.
                </p>
              </div>

              {/* Phone number */}
              <div className="bg-[hsl(var(--brand-primary)/0.06)] rounded-2xl p-4 mb-3 flex items-center gap-3 border border-[hsl(var(--brand-primary)/0.12)]">
                <div className="w-11 h-11 rounded-xl bg-[hsl(var(--brand-primary))] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--text-muted))]">Landlord's phone</p>
                  <p className="text-xl font-bold text-[hsl(var(--text-primary))] tracking-wide">{transaction.unlockedPhone}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <a
                  href={`tel:${transaction.unlockedPhone}`}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[hsl(var(--brand-primary))] text-[hsl(var(--brand-primary))] text-sm font-semibold hover:bg-[hsl(var(--brand-primary)/0.08)] transition-colors"
                >
                  <Phone className="w-4 h-4" /> Call now
                </a>
                <button
                  onClick={() => openWhatsApp(transaction.unlockedPhone)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </button>
              </div>

              {/* Directions button */}
              {listing.lat && listing.lng && (
                <button
                  onClick={openGoogleMaps}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-2))] transition-colors mb-4"
                >
                  <Navigation className="w-4 h-4" /> Get directions
                </button>
              )}

              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 mb-4">
                <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  This property is temporarily held for you for <strong>{PENDING_EXPIRY_HOURS} hours</strong> while you discuss the rental.
                </p>
              </div>

              <Button
                onClick={() => handleOpenChange(false)}
                className="w-full bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary-dark))] text-white rounded-xl font-semibold"
                style={{ height: 48 }}
              >
                Done
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
