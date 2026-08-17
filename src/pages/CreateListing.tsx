import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, Minus, Plus, Info, Check, Play, Link as LinkIcon, X, Upload, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useListings } from "@/hooks/useListings";
import { AMENITY_LIST, DISTRICTS, KAMPALA_AREAS } from "@/constants/amenities";
import { formatUGX, calcLandlordFee, getLandlordDiscount } from "@/constants/fees";
import { PROPERTY_TYPES, HOUSE_SUBTYPES } from "@/constants/propertyTypes";
import LocationPicker from "@/components/features/LocationPicker";
import { supabase } from "@/lib/supabase";
import type { PropertyType, HouseSubtype } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STEPS = ["Details", "Location", "Map", "Photos", "Amenities", "Review"];

export default function CreateListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addListing } = useListings();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [propertySubtype, setPropertySubtype] = useState<HouseSubtype>("");
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [monthlyRent, setMonthlyRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [district, setDistrict] = useState("Wakiso");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [totalUnits, setTotalUnits] = useState(1);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [rules, setRules] = useState("");
  const [pinLat, setPinLat] = useState<number | null>(null);
  const [pinLng, setPinLng] = useState<number | null>(null);
  const [isFurnished, setIsFurnished] = useState<boolean | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const [newListingId, setNewListingId] = useState<string | null>(null);

  const rentNum = Number(monthlyRent) || 0;
  const fee = calcLandlordFee(rentNum, totalUnits);
  const discount = getLandlordDiscount(totalUnits);

  const toggleAmenity = (id: string) =>
    setSelectedAmenities((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const path = `listings/${user?.id ?? "anon"}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("pangisa").upload(path, file, { upsert: true });
    if (error) { toast.error("Photo upload failed."); setUploadingPhoto(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("pangisa").getPublicUrl(path);
    setPhotos((prev) => [...prev, publicUrl]);
    setUploadingPhoto(false);
    toast.success("Photo added.");
  };

  const handleSubmit = async () => {
    if (!user) { toast.error("You must be signed in."); return; }
    if (!title || !rentNum || !area || !address) { toast.error("Please fill all required fields."); return; }

    setPaying(true);
    const result = await addListing({
      landlordId: user.id,
      title,
      description,
      propertyType,
      propertySubtype: propertySubtype || undefined,
      bedrooms,
      bathrooms,
      monthlyRent: rentNum,
      deposit: Number(deposit) || rentNum,
      location: `${area}, ${district}`,
      district,
      address,
      lat: pinLat ?? undefined,
      lng: pinLng ?? undefined,
      photos: photos.length > 0 ? photos : [],
      videoUrl: videoUrl || undefined,
      amenities: selectedAmenities,
      rules: rules.split("\n").map((r) => r.trim()).filter(Boolean),
      isFurnished: isFurnished ?? undefined,
      totalUnits,
      availableUnits: totalUnits,
      pendingUnits: 0,
      rentedUnits: 0,
      lastConfirmedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    setPaying(false);

    if (!result) { toast.error("Failed to publish. Please try again."); return; }
    setNewListingId(result.id);
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-warm))]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center max-w-sm px-5">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-2">Listing Published!</h1>
            <p className="text-sm text-[hsl(var(--text-muted))] mb-7 leading-relaxed">
              Your property is live on Pangisa. Tenants searching in your area will find it.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/landlord")} className="bg-[hsl(var(--brand-primary))] text-white rounded-xl">
                View Dashboard
              </Button>
              {newListingId && (
                <Button variant="outline" onClick={() => navigate(`/listing/${newListingId}`)} className="rounded-xl">
                  View Listing
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-warm))]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">List Your Property</h1>
          <p className="text-sm text-[hsl(var(--text-muted))]">Pay once. Serious tenants pay to contact you.</p>
        </div>

        {/* Step progress */}
        <div className="flex gap-2 mb-6">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col gap-1">
              <div className={cn("h-1.5 rounded-full transition-colors",
                i + 1 <= step ? "bg-[hsl(var(--brand-primary))]" : "bg-[hsl(var(--border))]")} />
              <span className={cn("text-[10px] font-medium hidden sm:block",
                i + 1 === step ? "text-[hsl(var(--brand-primary))]" : "text-[hsl(var(--text-muted))]")}>{label}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 shadow-sm">

          {/* STEP 1: Details */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-bold text-[hsl(var(--text-primary))]">Property Details</h2>

              <div>
                <Label htmlFor="title" className="text-sm font-semibold">Listing Title *</Label>
                <Input id="title" placeholder="e.g. Modern 2-Bedroom in Kira" value={title}
                  onChange={(e) => setTitle(e.target.value)} className="mt-1.5 h-11 rounded-xl" />
              </div>

              <div>
                <Label className="text-sm font-semibold mb-2 block">Property Type *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PROPERTY_TYPES.map((pt) => (
                    <button key={pt.value} type="button"
                      onClick={() => { setPropertyType(pt.value); setPropertySubtype(""); }}
                      className={cn("flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 text-center transition-all",
                        propertyType === pt.value
                          ? "border-[hsl(var(--brand-primary))] bg-[hsl(var(--brand-primary)/0.06)]"
                          : "border-[hsl(var(--border))] hover:border-[hsl(var(--brand-primary)/0.4)]")}>
                      <span className="text-xl">{pt.icon}</span>
                      <span className={cn("text-xs font-semibold leading-tight",
                        propertyType === pt.value ? "text-[hsl(var(--brand-primary))]" : "text-[hsl(var(--text-secondary))]")}>
                        {pt.label}
                      </span>
                    </button>
                  ))}
                </div>

                {propertyType === "house" && (
                  <div className="mt-3 flex gap-2">
                    {HOUSE_SUBTYPES.map((st) => (
                      <button key={st.value} type="button" onClick={() => setPropertySubtype(st.value as HouseSubtype)}
                        className={cn("flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all",
                          propertySubtype === st.value
                            ? "border-[hsl(var(--brand-primary))] bg-[hsl(var(--brand-primary)/0.06)] text-[hsl(var(--brand-primary))]"
                            : "border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--brand-primary)/0.3)]")}>
                        {st.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-semibold mb-2 block">Furnishing</Label>
                <div className="flex gap-2">
                  {[{ val: true, label: "🛋️ Furnished" }, { val: false, label: "🪑 Unfurnished" }].map(({ val, label }) => (
                    <button key={String(val)} type="button" onClick={() => setIsFurnished(isFurnished === val ? null : val)}
                      className={cn("flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                        isFurnished === val
                          ? "border-[hsl(var(--brand-primary))] bg-[hsl(var(--brand-primary)/0.06)] text-[hsl(var(--brand-primary))]"
                          : "border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--brand-primary)/0.3)]")}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Bedrooms</Label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <button onClick={() => setBedrooms(Math.max(1, bedrooms - 1))} type="button"
                      className="w-9 h-9 rounded-xl border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--surface-2))] transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-bold text-[hsl(var(--brand-primary))] w-6 text-center">{bedrooms}</span>
                    <button onClick={() => setBedrooms(bedrooms + 1)} type="button"
                      className="w-9 h-9 rounded-xl border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--surface-2))] transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Bathrooms</Label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <button onClick={() => setBathrooms(Math.max(1, bathrooms - 1))} type="button"
                      className="w-9 h-9 rounded-xl border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--surface-2))] transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-bold text-[hsl(var(--brand-primary))] w-6 text-center">{bathrooms}</span>
                    <button onClick={() => setBathrooms(bathrooms + 1)} type="button"
                      className="w-9 h-9 rounded-xl border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--surface-2))] transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rent" className="text-sm font-semibold">Monthly Rent (UGX) *</Label>
                  <Input id="rent" type="number" placeholder="e.g. 650000" value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)} className="mt-1.5 h-11 rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="deposit" className="text-sm font-semibold">Deposit (UGX)</Label>
                  <Input id="deposit" type="number" placeholder="e.g. 1300000" value={deposit}
                    onChange={(e) => setDeposit(e.target.value)} className="mt-1.5 h-11 rounded-xl" />
                </div>
              </div>

              <div>
                <Label htmlFor="desc" className="text-sm font-semibold">Description</Label>
                <Textarea id="desc" rows={4} placeholder="Describe your property…" value={description}
                  onChange={(e) => setDescription(e.target.value)} className="mt-1.5 rounded-xl" />
              </div>

              <div>
                <Label htmlFor="video" className="text-sm font-semibold flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5" /> Video URL
                  <span className="text-[hsl(var(--text-muted))] font-normal text-xs ml-1">(optional)</span>
                </Label>
                <div className="relative mt-1.5">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-muted))]" />
                  <Input id="video" placeholder="YouTube or video link" value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)} className="pl-9 h-11 rounded-xl" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-bold text-[hsl(var(--text-primary))]">Location & Units</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">District *</Label>
                  <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger className="mt-1.5 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Area / Neighbourhood *</Label>
                  <Select value={area} onValueChange={setArea}>
                    <SelectTrigger className="mt-1.5 h-11 rounded-xl"><SelectValue placeholder="Pick area" /></SelectTrigger>
                    <SelectContent>{KAMPALA_AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-semibold">Street Address *</Label>
                <Input id="address" placeholder="e.g. Kira Road, near Kasangati Junction" value={address}
                  onChange={(e) => setAddress(e.target.value)} className="mt-1.5 h-11 rounded-xl" />
              </div>

              <div>
                <Label className="text-sm font-semibold mb-2 block">Number of Units</Label>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setTotalUnits(Math.max(1, totalUnits - 1))}
                    className="w-10 h-10 rounded-xl border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--surface-2))] transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-bold text-[hsl(var(--brand-primary))] w-8 text-center">{totalUnits}</span>
                  <button type="button" onClick={() => setTotalUnits(totalUnits + 1)}
                    className="w-10 h-10 rounded-xl border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--surface-2))] transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {totalUnits > 1 && discount > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-emerald-600">
                    <Info className="w-3.5 h-3.5" />
                    {(discount * 100).toFixed(0)}% bulk discount for {totalUnits} units
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Map */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-bold text-[hsl(var(--text-primary))] mb-1">Pin Your Property</h2>
                <p className="text-sm text-[hsl(var(--text-muted))]">
                  Tap the map to drop your exact pin. Tenants see only the area — exact pin revealed after they pay.
                </p>
              </div>
              <LocationPicker lat={pinLat} lng={pinLng}
                onChange={(la, ln) => { setPinLat(la); setPinLng(ln); }}
                centerLabel={area || undefined} />
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  <strong>Privacy:</strong> Tenants see only a zone circle before paying.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Photos */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="font-bold text-[hsl(var(--text-primary))]">Property Photos</h2>
              <p className="text-sm text-[hsl(var(--text-muted))]">Upload photos to attract tenants. Good photos get 3× more views.</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-[hsl(var(--border))]">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setPhotos((prev) => prev.filter((_, pi) => pi !== i))}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <label className={cn(
                  "aspect-square rounded-xl border-2 border-dashed border-[hsl(var(--border))] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[hsl(var(--brand-primary)/0.5)] hover:bg-[hsl(var(--brand-primary)/0.03)] transition-all",
                  uploadingPhoto && "opacity-50 pointer-events-none"
                )}>
                  {uploadingPhoto ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--brand-primary))]" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-[hsl(var(--text-muted))]" />
                      <span className="text-xs text-[hsl(var(--text-muted))] font-medium">Add Photo</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoUpload} />
                </label>
              </div>

              {photos.length === 0 && (
                <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">Listings without photos still work but get fewer views.</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Amenities */}
          {step === 5 && (
            <div className="space-y-5">
              <h2 className="font-bold text-[hsl(var(--text-primary))]">Amenities & Rules</h2>
              <div>
                <Label className="text-sm font-semibold mb-2 block">What's included?</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AMENITY_LIST.map((amenity) => {
                    const active = selectedAmenities.includes(amenity.id);
                    return (
                      <button key={amenity.id} type="button" onClick={() => toggleAmenity(amenity.id)}
                        className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border-2 transition-all text-left",
                          active
                            ? "border-[hsl(var(--brand-primary))] bg-[hsl(var(--brand-primary)/0.07)] text-[hsl(var(--brand-primary))] font-semibold"
                            : "border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--brand-primary)/0.3)]")}>
                        {active && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                        <span>{amenity.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label htmlFor="rules" className="text-sm font-semibold">House Rules
                  <span className="text-[hsl(var(--text-muted))] font-normal text-xs ml-1">(one per line)</span>
                </Label>
                <Textarea id="rules" rows={4} placeholder={"No smoking\nNo pets\nQuiet after 10pm"} value={rules}
                  onChange={(e) => setRules(e.target.value)} className="mt-1.5 rounded-xl" />
              </div>
            </div>
          )}

          {/* STEP 6: Review */}
          {step === 6 && (
            <div className="space-y-5">
              <h2 className="font-bold text-[hsl(var(--text-primary))]">Review & Publish</h2>

              <div className="bg-[hsl(var(--surface-1))] rounded-2xl p-4 space-y-2.5 text-sm border border-[hsl(var(--border))]">
                {[
                  ["Title", title || "—"],
                  ["Type", `${PROPERTY_TYPES.find(p => p.value === propertyType)?.icon} ${PROPERTY_TYPES.find(p => p.value === propertyType)?.label}`],
                  ["Location", area ? `${area}, ${district}` : "—"],
                  ["Rent", rentNum ? `${formatUGX(rentNum)}/mo` : "—"],
                  ["Units", String(totalUnits)],
                  ["Photos", `${photos.length} uploaded`],
                  ["Furnishing", isFurnished == null ? "Not specified" : isFurnished ? "Furnished" : "Unfurnished"],
                  ["Amenities", `${selectedAmenities.length} selected`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-[hsl(var(--text-muted))]">{label}</span>
                    <span className="font-semibold text-[hsl(var(--text-primary))] capitalize text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border-2 border-[hsl(var(--brand-accent)/0.4)] bg-[hsl(var(--brand-accent)/0.04)] p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[hsl(var(--text-primary))]">Listing Fee</span>
                  <span className="text-2xl font-bold text-[hsl(var(--brand-accent))]">{formatUGX(fee)}</span>
                </div>
                <p className="text-xs text-[hsl(var(--text-muted))]">
                  3% of rent × {totalUnits} unit{totalUnits !== 1 ? "s" : ""}
                  {discount > 0 && ` · ${(discount * 100).toFixed(0)}% bulk discount`}
                  {" · min UGX 10,000"}
                </p>
              </div>

              <Button onClick={handleSubmit} disabled={paying}
                className="w-full font-bold bg-[hsl(var(--brand-accent))] hover:bg-[hsl(var(--brand-accent-dark))] text-white rounded-xl shadow-sm"
                style={{ height: 52 }}>
                {paying ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Publishing…</> : `Pay ${formatUGX(fee)} & Publish`}
              </Button>
              <p className="text-xs text-center text-[hsl(var(--text-muted))]">
                Payment is simulated in demo mode.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className={cn("flex mt-6 pt-5 border-t border-[hsl(var(--border))]", step > 1 ? "justify-between" : "justify-end")}>
            {step > 1 && (
              <Button variant="outline" type="button" onClick={() => setStep(step - 1)} className="rounded-xl">Back</Button>
            )}
            {step < 6 && (
              <Button type="button" onClick={() => setStep(step + 1)}
                className="bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary-dark))] text-white rounded-xl">
                {step === 3 && !pinLat ? "Skip Map Pin" : "Continue →"}
              </Button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
