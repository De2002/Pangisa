import { useState, useRef, useEffect } from "react";
import { Search, SlidersHorizontal, X, ChevronDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { SearchFilters, PropertyType } from "@/types";
import { PROPERTY_TYPES } from "@/constants/propertyTypes";
import { useLocationAutocomplete } from "@/hooks/useListings";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  compact?: boolean;
}

const defaultFilters: SearchFilters = {
  location: "",
  minRent: null,
  maxRent: null,
  propertyType: "",
  bedrooms: null,
  amenities: [],
  isFurnished: null,
};

export default function SearchBar({ onSearch, initialFilters, compact = false }: SearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>({ ...defaultFilters, ...initialFilters });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  const { data: suggestions = [] } = useLocationAutocomplete(filters.location ?? "");

  const update = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(filters);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    onSearch(defaultFilters);
  };

  const hasActiveFilters = filters.location || filters.minRent || filters.maxRent ||
    filters.propertyType || filters.bedrooms || filters.isFurnished != null;

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={cn(
        "bg-white rounded-2xl shadow-lg border border-[hsl(var(--border))]",
        compact ? "p-3" : "p-4"
      )}>
        <div className={cn("flex gap-2.5", compact ? "flex-row items-center" : "flex-col sm:flex-row")}>
          {/* Location input with autocomplete */}
          <div className="relative flex-1" ref={locationRef}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-muted))] pointer-events-none" />
            <Input
              placeholder="Search by area, district or city…"
              value={filters.location}
              onChange={(e) => {
                update("location", e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="pl-10 border-[hsl(var(--border))] focus:border-[hsl(var(--brand-primary))] bg-[hsl(var(--surface-1))] h-11 rounded-xl"
              autoComplete="off"
            />
            {filters.location && (
              <button type="button" onClick={() => { update("location", ""); setShowSuggestions(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-[hsl(var(--border))] shadow-xl z-50 overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      update("location", s);
                      setShowSuggestions(false);
                      onSearch({ ...filters, location: s });
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[hsl(var(--surface-1))] transition-colors text-left"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[hsl(var(--brand-primary))] flex-shrink-0" />
                    <span className="text-sm text-[hsl(var(--text-primary))]">{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {!compact && (
            <div className="flex gap-2">
              <Select
                value={filters.maxRent?.toString() ?? ""}
                onValueChange={(v) => update("maxRent", v ? Number(v) : null)}
              >
                <SelectTrigger className="h-11 border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] rounded-xl" style={{ width: 152 }}>
                  <SelectValue placeholder="Max Rent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300000">UGX 300k</SelectItem>
                  <SelectItem value="500000">UGX 500k</SelectItem>
                  <SelectItem value="800000">UGX 800k</SelectItem>
                  <SelectItem value="1200000">UGX 1.2M</SelectItem>
                  <SelectItem value="2000000">UGX 2M</SelectItem>
                  <SelectItem value="5000000">UGX 5M+</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.propertyType}
                onValueChange={(v) => update("propertyType", v as PropertyType | "")}
              >
                <SelectTrigger className="w-32 h-11 border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] rounded-xl">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((pt) => (
                    <SelectItem key={pt.value} value={pt.value}>
                      {pt.icon} {pt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2">
            {!compact && (
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 px-3 h-11 rounded-xl border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-2))] transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Filters</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showAdvanced && "rotate-180")} />
              </button>
            )}
            <Button type="submit"
              className="h-11 px-5 bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary-dark))] text-white font-semibold rounded-xl">
              {compact ? <Search className="w-4 h-4" /> : "Search"}
            </Button>
          </div>
        </div>

        {/* Advanced filters */}
        {showAdvanced && !compact && (
          <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--text-muted))] mb-1.5 block">Min Rent (UGX)</label>
              <Input type="number" placeholder="e.g. 200000"
                value={filters.minRent ?? ""}
                onChange={(e) => update("minRent", e.target.value ? Number(e.target.value) : null)}
                className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--text-muted))] mb-1.5 block">Bedrooms</label>
              <Select value={filters.bedrooms?.toString() ?? ""} onValueChange={(v) => update("bedrooms", v ? Number(v) : null)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--text-muted))] mb-1.5 block">Furnishing</label>
              <Select
                value={filters.isFurnished == null ? "" : filters.isFurnished ? "furnished" : "unfurnished"}
                onValueChange={(v) => update("isFurnished", v === "" ? null : v === "furnished")}
              >
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="furnished">Furnished</SelectItem>
                  <SelectItem value="unfurnished">Unfurnished</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              {hasActiveFilters && (
                <button type="button" onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 h-9 transition-colors">
                  <X className="w-3.5 h-3.5" /> Clear all
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
