import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  UGANDA_REGIONS,
  REGION_DESCRIPTIONS,
  REGION_EMOJI,
  DISTRICTS_BY_REGION,
  type UgandaRegion,
} from "@/constants/uganda";

type SetupStep = "region" | "district" | "areas";

const LOCATION_PREF_KEY = "pangisa_location_pref";

export default function LocationSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<SetupStep>("region");
  const [region, setRegion] = useState<UgandaRegion | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const districts = region ? DISTRICTS_BY_REGION[region] : [];
  const areas = district
    ? districts.find((d) => d.name === district)?.areas ?? []
    : [];

  const saveAndGo = (areaFilter?: string[]) => {
    const pref = { region, district, areas: areaFilter ?? selectedAreas };
    localStorage.setItem(LOCATION_PREF_KEY, JSON.stringify(pref));
    const params = new URLSearchParams();
    if (district) params.set("location", district);
    if (areaFilter?.length) params.set("area", areaFilter[0]);
    navigate(`/browse?${params.toString()}`, { replace: true });
  };

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-warm))] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        {step !== "region" ? (
          <button
            onClick={() => {
              if (step === "areas") { setStep("district"); setSelectedAreas([]); }
              else if (step === "district") { setStep("region"); setDistrict(null); }
            }}
            className="w-9 h-9 rounded-full border border-[hsl(var(--border))] flex items-center justify-center hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
          </button>
        ) : (
          <div className="w-9 h-9" />
        )}

        {/* Progress dots */}
        <div className="flex gap-1.5 mx-auto">
          {(["region", "district", "areas"] as SetupStep[]).map((s) => (
            <div
              key={s}
              className={cn(
                "h-2 rounded-full transition-all",
                step === s ? "w-5 bg-[hsl(var(--brand-primary))]" : "w-2 bg-[hsl(var(--border))]"
              )}
            />
          ))}
        </div>
        <div className="w-9 h-9" />
      </div>

      <div className="flex-1 flex flex-col px-5 pb-10 max-w-lg mx-auto w-full">

        {/* STEP 1: Region */}
        {step === "region" && (
          <>
            <div className="mt-4 mb-7">
              <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-2">
                Where are you looking?
              </h1>
              <p className="text-sm text-[hsl(var(--text-muted))]">
                Pick a region to start. We will show you houses there.
              </p>
            </div>

            <div className="space-y-3 flex-1">
              {UGANDA_REGIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => { setRegion(r); setStep("district"); }}
                  className="w-full flex items-center gap-4 bg-white rounded-2xl border-2 border-[hsl(var(--border))] hover:border-[hsl(var(--brand-primary))] px-5 py-4 transition-all text-left group"
                >
                  <span className="text-3xl">{REGION_EMOJI[r]}</span>
                  <div className="flex-1">
                    <p className="font-bold text-[hsl(var(--text-primary))] text-base">{r} Uganda</p>
                    <p className="text-xs text-[hsl(var(--text-muted))] mt-0.5">{REGION_DESCRIPTIONS[r]}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[hsl(var(--text-muted))] group-hover:text-[hsl(var(--brand-primary))] transition-colors" />
                </button>
              ))}
            </div>

            <button
              onClick={() => navigate("/browse", { replace: true })}
              className="mt-6 w-full flex items-center justify-center gap-1.5 text-sm text-[hsl(var(--text-muted))] py-3 hover:text-[hsl(var(--brand-primary))] transition-colors"
            >
              Skip — show me all houses <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* STEP 2: District */}
        {step === "district" && region && (
          <>
            <div className="mt-4 mb-7">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{REGION_EMOJI[region]}</span>
                <span className="text-sm font-semibold text-[hsl(var(--brand-primary))]">{region} Uganda</span>
              </div>
              <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-2">
                Which town or city?
              </h1>
              <p className="text-sm text-[hsl(var(--text-muted))]">
                Pick a city or district close to where you want to live.
              </p>
            </div>

            <div className="space-y-2.5 flex-1">
              {districts.map((d) => (
                <button
                  key={d.name}
                  onClick={() => { setDistrict(d.name); setStep("areas"); }}
                  className="w-full flex items-center justify-between bg-white rounded-xl border-2 border-[hsl(var(--border))] hover:border-[hsl(var(--brand-primary))] px-5 py-4 transition-all group text-left"
                >
                  <div>
                    <p className="font-bold text-[hsl(var(--text-primary))]">{d.name}</p>
                    <p className="text-xs text-[hsl(var(--text-muted))] mt-0.5">{d.areas.length} areas</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[hsl(var(--text-muted))] group-hover:text-[hsl(var(--brand-primary))] transition-colors" />
                </button>
              ))}
            </div>

            <button
              onClick={() => saveAndGo([])}
              className="mt-6 w-full flex items-center justify-center gap-1.5 text-sm text-[hsl(var(--text-muted))] py-3 hover:text-[hsl(var(--brand-primary))] transition-colors"
            >
              Show all houses in {region} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* STEP 3: Areas */}
        {step === "areas" && district && (
          <>
            <div className="mt-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-[hsl(var(--brand-primary))]">
                  {region} › {district}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-2">
                Any specific area?
              </h1>
              <p className="text-sm text-[hsl(var(--text-muted))]">
                Pick one or more. Or skip to see all of {district}.
              </p>
            </div>

            <div className="flex-1 mb-6">
              <div className="grid grid-cols-2 gap-2">
                {areas.map((area) => {
                  const active = selectedAreas.includes(area);
                  return (
                    <button
                      key={area}
                      onClick={() => toggleArea(area)}
                      className={cn(
                        "flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all",
                        active
                          ? "border-[hsl(var(--brand-primary))] bg-[hsl(var(--brand-primary)/0.08)] text-[hsl(var(--brand-primary))]"
                          : "border-[hsl(var(--border))] bg-white text-[hsl(var(--text-primary))] hover:border-[hsl(var(--brand-primary)/0.4)]"
                      )}
                    >
                      <span className="truncate">{area}</span>
                      {active && <Check className="w-4 h-4 flex-shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 mt-auto">
              <Button
                onClick={() => saveAndGo()}
                className="w-full h-12 text-base font-bold bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary-dark))] text-white"
              >
                {selectedAreas.length > 0
                  ? `Show houses in ${selectedAreas.length} area${selectedAreas.length > 1 ? "s" : ""}`
                  : `Show all houses in ${district}`}
              </Button>

              {selectedAreas.length > 0 && (
                <button
                  onClick={() => saveAndGo([])}
                  className="w-full text-sm text-center text-[hsl(var(--text-muted))] py-2 hover:text-[hsl(var(--brand-primary))] transition-colors"
                >
                  Skip — show all of {district}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
