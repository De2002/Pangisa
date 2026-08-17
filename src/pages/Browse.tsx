import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ListingCard from "@/components/features/ListingCard";
import SearchBar from "@/components/features/SearchBar";
import { useListings, useSavedListings } from "@/hooks/useListings";
import { useAuth } from "@/hooks/useAuth";
import type { SearchFilters, PropertyType } from "@/types";

export default function Browse() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedListings(user?.id ?? "");

  const areaParam = searchParams.get("area") ?? "";
  const locationParam = searchParams.get("location") ?? areaParam;

  const [filters, setFilters] = useState<SearchFilters>({
    location: locationParam,
    minRent: null,
    maxRent: searchParams.get("maxRent") ? Number(searchParams.get("maxRent")) : null,
    propertyType: (searchParams.get("type") as PropertyType) ?? "",
    bedrooms: searchParams.get("beds") ? Number(searchParams.get("beds")) : null,
    amenities: [],
    isFurnished: null,
  });

  const [activeFilters, setActiveFilters] = useState<SearchFilters>(filters);
  const [sortBy, setSortBy] = useState<"confidence" | "price_asc" | "price_desc" | "newest">("confidence");
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Fetch from Supabase with active filters
  const { listings: rawListings, isLoading } = useListings(activeFilters);

  const results = [...rawListings].sort((a, b) => {
    if (sortBy === "price_asc") return a.monthlyRent - b.monthlyRent;
    if (sortBy === "price_desc") return b.monthlyRent - a.monthlyRent;
    if (sortBy === "confidence") return new Date(b.lastConfirmedAt).getTime() - new Date(a.lastConfirmedAt).getTime();
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setActiveFilters(newFilters);
    setShowSearchModal(false);
  };

  const clearFilters = () => {
    const empty: SearchFilters = {
      location: "", minRent: null, maxRent: null,
      propertyType: "", bedrooms: null, amenities: [], isFurnished: null,
    };
    setFilters(empty);
    setActiveFilters(empty);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-warm))]">
      <Navbar />

      {/* Desktop search bar */}
      <div className="hidden sm:block bg-white border-b border-[hsl(var(--border))] sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <SearchBar onSearch={handleSearch} initialFilters={{ location: locationParam }} compact={false} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Results header */}
        <div className="flex items-center justify-between mb-5 gap-3">
          <div>
            <h1 className="text-lg font-bold text-[hsl(var(--text-primary))]">
              {isLoading ? "Finding rentals…" : `${results.length} rental${results.length !== 1 ? "s" : ""} available`}
            </h1>
            {activeFilters.location && (
              <p className="text-xs text-[hsl(var(--text-muted))] mt-0.5">in "{activeFilters.location}"</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-[hsl(var(--border))] rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-[hsl(var(--brand-primary))] text-[hsl(var(--text-secondary))]"
            >
              <option value="confidence">Recently confirmed</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="newest">Newest first</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[hsl(var(--border))] overflow-hidden shadow-sm animate-pulse">
                <div className="bg-[hsl(var(--surface-2))] w-full" style={{ aspectRatio: "4/3" }} />
                <div className="p-4 space-y-2.5">
                  <div className="h-4 bg-[hsl(var(--surface-2))] rounded-lg w-3/4" />
                  <div className="h-3 bg-[hsl(var(--surface-2))] rounded-lg w-1/2" />
                  <div className="h-5 bg-[hsl(var(--surface-2))] rounded-lg w-1/3 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[hsl(var(--border))] flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Search className="w-7 h-7 text-[hsl(var(--text-muted))]" />
            </div>
            <h3 className="font-bold text-lg text-[hsl(var(--text-primary))] mb-1">No rentals found</h3>
            <p className="text-sm text-[hsl(var(--text-muted))] mb-4">Try adjusting your filters or search a different area.</p>
            <button
              onClick={clearFilters}
              className="text-sm font-semibold text-[hsl(var(--brand-primary))] hover:underline"
            >
              Clear filters and show all
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isSaved={isSaved(listing.id)}
                onToggleSave={user ? toggleSave : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Search FAB */}
      <div className="sm:hidden fixed bottom-6 right-5 z-50">
        <button
          onClick={() => setShowSearchModal(true)}
          className="w-14 h-14 rounded-full bg-[hsl(var(--brand-primary))] text-white shadow-lg flex items-center justify-center hover:bg-[hsl(var(--brand-primary-dark))] active:scale-95 transition-all"
        >
          <Search className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end">
          <div className="w-full bg-[hsl(var(--bg-warm))] rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg text-[hsl(var(--text-primary))]">Search Rentals</h2>
              <button
                onClick={() => setShowSearchModal(false)}
                className="w-8 h-8 rounded-full bg-[hsl(var(--surface-2))] flex items-center justify-center"
              >
                <X className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
              </button>
            </div>
            <SearchBar onSearch={handleSearch} initialFilters={{ location: filters.location }} compact={false} />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
