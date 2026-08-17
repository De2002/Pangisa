import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Listing, SearchFilters, Transaction, LandlordProfile } from "@/types";
import { toast } from "sonner";

// ─── Shape mapping helpers ──────────────────────────────────────────────────

function dbRowToListing(row: Record<string, unknown>, landlordProfile?: LandlordProfile): Listing {
  const units = Array.from({ length: (row.total_units as number) || 1 }, (_, i) => ({
    id: `${row.id}-u${i}`,
    status: "available" as const,
  }));

  return {
    id: row.id as string,
    landlordId: row.landlord_id as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    propertyType: row.property_type as Listing["propertyType"],
    propertySubtype: (row.property_subtype as Listing["propertySubtype"]) ?? undefined,
    bedrooms: (row.bedrooms as number) ?? 1,
    bathrooms: (row.bathrooms as number) ?? 1,
    monthlyRent: (row.monthly_rent as number) ?? 0,
    deposit: (row.deposit as number) ?? 0,
    location: (row.location as string) ?? "",
    district: (row.district as string) ?? "",
    address: (row.address as string) ?? "",
    lat: (row.lat as number) ?? undefined,
    lng: (row.lng as number) ?? undefined,
    photos: (row.photos as string[]) ?? [],
    videoUrl: (row.video_url as string) ?? undefined,
    amenities: (row.amenities as string[]) ?? [],
    rules: (row.rules as string[]) ?? [],
    isFurnished: (row.is_furnished as boolean) ?? undefined,
    totalUnits: (row.total_units as number) ?? 1,
    availableUnits: (row.available_units as number) ?? 1,
    pendingUnits: (row.pending_units as number) ?? 0,
    rentedUnits: (row.rented_units as number) ?? 0,
    units,
    lastConfirmedAt: (row.last_confirmed_at as string) ?? new Date().toISOString(),
    isVerified: (row.is_verified as boolean) ?? false,
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
    isPaid: true,
    landlord: landlordProfile ?? {
      id: row.landlord_id as string,
      name: "Landlord",
      phone: "",
      isVerified: false,
      listingsCount: 1,
      joinedAt: new Date().toISOString(),
    },
  };
}

async function fetchListingsWithLandlords(filters?: SearchFilters): Promise<Listing[]> {
  let query = supabase
    .from("listings")
    .select("*")
    .eq("is_paused", false)
    .gt("available_units", 0)
    .order("last_confirmed_at", { ascending: false });

  if (filters?.propertyType) query = query.eq("property_type", filters.propertyType);
  if (filters?.bedrooms) query = query.gte("bedrooms", filters.bedrooms);
  if (filters?.minRent) query = query.gte("monthly_rent", filters.minRent);
  if (filters?.maxRent) query = query.lte("monthly_rent", filters.maxRent);
  if (filters?.isFurnished != null) query = query.eq("is_furnished", filters.isFurnished);
  if (filters?.location) {
    query = query.or(
      `location.ilike.%${filters.location}%,district.ilike.%${filters.location}%,address.ilike.%${filters.location}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  if (!data?.length) return [];

  // Fetch landlord profiles in bulk
  const landlordIds = [...new Set(data.map((r) => r.landlord_id as string))];
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, username, is_verified, avatar_url, phone")
    .in("id", landlordIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [
      p.id,
      {
        id: p.id,
        name: p.username ?? "Landlord",
        phone: p.phone ?? "",
        isVerified: p.is_verified ?? false,
        listingsCount: 1,
        joinedAt: new Date().toISOString(),
        avatar: p.avatar_url ?? undefined,
      } as LandlordProfile,
    ])
  );

  return data.map((row) => dbRowToListing(row, profileMap.get(row.landlord_id as string)));
}

async function fetchSingleListing(id: string): Promise<Listing | null> {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id, username, is_verified, avatar_url, phone")
    .eq("id", data.landlord_id)
    .single();

  const landlordProfile: LandlordProfile = {
    id: data.landlord_id,
    name: profile?.username ?? "Landlord",
    phone: profile?.phone ?? "",
    isVerified: profile?.is_verified ?? false,
    listingsCount: 1,
    joinedAt: new Date().toISOString(),
    avatar: profile?.avatar_url ?? undefined,
  };

  return dbRowToListing(data, landlordProfile);
}

// ─── Main hook ──────────────────────────────────────────────────────────────

export function useListings(filters?: SearchFilters) {
  const qc = useQueryClient();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["listings", filters],
    queryFn: () => fetchListingsWithLandlords(filters),
    staleTime: 30_000,
  });

  const { data: allListings = [] } = useQuery({
    queryKey: ["listings-all"],
    queryFn: () =>
      supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false })
        .then(async ({ data }) => {
          if (!data?.length) return [];
          const landlordIds = [...new Set(data.map((r) => r.landlord_id as string))];
          const { data: profiles } = await supabase
            .from("user_profiles")
            .select("id, username, is_verified, avatar_url, phone")
            .in("id", landlordIds);
          const profileMap = new Map(
            (profiles ?? []).map((p) => [p.id, {
              id: p.id, name: p.username ?? "Landlord", phone: p.phone ?? "",
              isVerified: p.is_verified ?? false, listingsCount: 1,
              joinedAt: new Date().toISOString(), avatar: p.avatar_url ?? undefined,
            } as LandlordProfile])
          );
          return data.map((row) => dbRowToListing(row, profileMap.get(row.landlord_id as string)));
        }),
    staleTime: 30_000,
  });

  const searchListings = useCallback(
    (f: SearchFilters): Listing[] => {
      return listings.filter((l) => {
        if (l.availableUnits === 0) return false;
        if (f.location && !l.location.toLowerCase().includes(f.location.toLowerCase()) &&
            !l.district.toLowerCase().includes(f.location.toLowerCase()) &&
            !l.address.toLowerCase().includes(f.location.toLowerCase())) return false;
        if (f.minRent && l.monthlyRent < f.minRent) return false;
        if (f.maxRent && l.monthlyRent > f.maxRent) return false;
        if (f.propertyType && l.propertyType !== f.propertyType) return false;
        if (f.bedrooms && l.bedrooms < f.bedrooms) return false;
        if (f.amenities.length > 0 && !f.amenities.every((a) => l.amenities.includes(a))) return false;
        if (f.isFurnished != null && l.isFurnished !== f.isFurnished) return false;
        return true;
      });
    },
    [listings]
  );

  const getListing = useCallback((id: string) => listings.find((l) => l.id === id), [listings]);

  const getItNow = async (listingId: string, tenantId: string): Promise<Transaction | null> => {
    // Check available unit
    const listing = await fetchSingleListing(listingId);
    if (!listing || listing.availableUnits === 0) return null;

    const amount = Math.max(2000, Math.round((listing.monthlyRent * 0.0025) / 500) * 500);
    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

    // Create or find an available unit row
    const { data: unitRows } = await supabase
      .from("listing_units")
      .select("id")
      .eq("listing_id", listingId)
      .eq("status", "available")
      .limit(1);

    let unitId: string | null = unitRows?.[0]?.id ?? null;

    // If no unit row exists, create one
    if (!unitId) {
      const { data: newUnit } = await supabase
        .from("listing_units")
        .insert({ listing_id: listingId, status: "available" })
        .select("id")
        .single();
      unitId = newUnit?.id ?? null;
    }

    if (!unitId) return null;

    // Mark unit as pending
    await supabase
      .from("listing_units")
      .update({ status: "pending", tenant_id: tenantId, pending_since: new Date().toISOString() })
      .eq("id", unitId);

    // Decrement available, increment pending
    await supabase
      .from("listings")
      .update({
        available_units: Math.max(0, listing.availableUnits - 1),
        pending_units: listing.pendingUnits + 1,
      })
      .eq("id", listingId);

    // Insert transaction
    const { data: txRow, error: txErr } = await supabase
      .from("transactions")
      .insert({
        listing_id: listingId,
        tenant_id: tenantId,
        unit_id: unitId,
        amount,
        status: "active",
        unlocked_phone: listing.landlord.phone,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (txErr || !txRow) return null;

    // Invalidate queries
    qc.invalidateQueries({ queryKey: ["listings"] });
    qc.invalidateQueries({ queryKey: ["listing", listingId] });
    qc.invalidateQueries({ queryKey: ["transactions"] });

    return {
      id: txRow.id,
      listingId: txRow.listing_id,
      tenantId: txRow.tenant_id,
      unitId: txRow.unit_id,
      amount: txRow.amount,
      status: txRow.status,
      unlockedPhone: txRow.unlocked_phone,
      createdAt: txRow.created_at,
      expiresAt: txRow.expires_at,
      listing,
    };
  };

  const getTenantTransactions = useCallback(
    (tenantId: string): (Transaction & { listing?: Listing })[] => {
      // Returns from cache — use useTenantTransactions hook for live data
      return [];
    },
    []
  );

  const addListing = async (listing: Omit<Listing, "id" | "landlord" | "units" | "isPaid" | "isVerified">): Promise<Listing | null> => {
    const { data, error } = await supabase
      .from("listings")
      .insert({
        landlord_id: listing.landlordId,
        title: listing.title,
        description: listing.description,
        property_type: listing.propertyType,
        property_subtype: listing.propertySubtype ?? null,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        monthly_rent: listing.monthlyRent,
        deposit: listing.deposit,
        location: listing.location,
        district: listing.district,
        address: listing.address,
        lat: listing.lat ?? null,
        lng: listing.lng ?? null,
        photos: listing.photos,
        video_url: listing.videoUrl ?? null,
        amenities: listing.amenities,
        rules: listing.rules,
        is_furnished: listing.isFurnished ?? null,
        total_units: listing.totalUnits,
        available_units: listing.totalUnits,
        pending_units: 0,
        rented_units: 0,
        last_confirmed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("addListing error:", error);
      return null;
    }

    qc.invalidateQueries({ queryKey: ["listings"] });
    return dbRowToListing(data);
  };

  return {
    listings,
    allListings,
    isLoading,
    searchListings,
    getListing,
    getItNow,
    getTenantTransactions,
    addListing,
  };
}

// ─── Single listing hook ─────────────────────────────────────────────────────

export function useListing(id: string) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => fetchSingleListing(id),
    enabled: !!id,
    staleTime: 20_000,
  });
}

// ─── Tenant transactions hook ────────────────────────────────────────────────

export function useTenantTransactions(tenantId: string) {
  return useQuery({
    queryKey: ["transactions", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data?.length) return [];

      const listingIds = [...new Set(data.map((t) => t.listing_id as string))];
      const listings = await fetchListingsWithLandlords();
      const listingMap = new Map(listings.map((l) => [l.id, l]));

      // Also fetch paused/all listings for history
      const { data: allListingRows } = await supabase
        .from("listings")
        .select("*")
        .in("id", listingIds);

      const profileIds = [...new Set((allListingRows ?? []).map((r) => r.landlord_id as string))];
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("id, username, is_verified, avatar_url, phone")
        .in("id", profileIds);
      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.id, {
          id: p.id, name: p.username ?? "Landlord", phone: p.phone ?? "",
          isVerified: p.is_verified ?? false, listingsCount: 1,
          joinedAt: new Date().toISOString(), avatar: p.avatar_url ?? undefined,
        } as LandlordProfile])
      );

      const allListingMap = new Map(
        (allListingRows ?? []).map((row) => [
          row.id as string,
          dbRowToListing(row, profileMap.get(row.landlord_id as string)),
        ])
      );

      return data.map((t) => ({
        id: t.id as string,
        listingId: t.listing_id as string,
        tenantId: t.tenant_id as string,
        unitId: t.unit_id as string,
        amount: t.amount as number,
        status: t.status as Transaction["status"],
        unlockedPhone: t.unlocked_phone as string,
        createdAt: t.created_at as string,
        expiresAt: t.expires_at as string,
        listing: listingMap.get(t.listing_id as string) ?? allListingMap.get(t.listing_id as string),
      })) as (Transaction & { listing?: Listing })[];
    },
    enabled: !!tenantId,
    staleTime: 15_000,
  });
}

// ─── Saved listings hook ─────────────────────────────────────────────────────

export function useSavedListings(tenantId: string) {
  const qc = useQueryClient();

  const { data: savedIds = [] } = useQuery({
    queryKey: ["saved", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase
        .from("saved_listings")
        .select("listing_id")
        .eq("tenant_id", tenantId);
      return (data ?? []).map((r) => r.listing_id as string);
    },
    enabled: !!tenantId,
    staleTime: 30_000,
  });

  const { data: savedListings = [] } = useQuery({
    queryKey: ["saved-listings-full", tenantId],
    queryFn: async () => {
      if (!tenantId || !savedIds.length) return [];
      const { data } = await supabase
        .from("listings")
        .select("*")
        .in("id", savedIds);
      if (!data?.length) return [];
      const profileIds = [...new Set(data.map((r) => r.landlord_id as string))];
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("id, username, is_verified, avatar_url, phone")
        .in("id", profileIds);
      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.id, {
          id: p.id, name: p.username ?? "Landlord", phone: p.phone ?? "",
          isVerified: p.is_verified ?? false, listingsCount: 1,
          joinedAt: new Date().toISOString(),
        } as LandlordProfile])
      );
      return data.map((row) => dbRowToListing(row, profileMap.get(row.landlord_id as string)));
    },
    enabled: !!tenantId && savedIds.length > 0,
    staleTime: 30_000,
  });

  const toggleSave = async (listingId: string) => {
    if (!tenantId) return;
    const alreadySaved = savedIds.includes(listingId);

    // Optimistic update
    qc.setQueryData<string[]>(["saved", tenantId], (prev) =>
      alreadySaved ? (prev ?? []).filter((id) => id !== listingId) : [...(prev ?? []), listingId]
    );

    if (alreadySaved) {
      await supabase
        .from("saved_listings")
        .delete()
        .eq("tenant_id", tenantId)
        .eq("listing_id", listingId);
    } else {
      await supabase
        .from("saved_listings")
        .insert({ tenant_id: tenantId, listing_id: listingId });
    }

    qc.invalidateQueries({ queryKey: ["saved", tenantId] });
    qc.invalidateQueries({ queryKey: ["saved-listings-full", tenantId] });
  };

  const isSaved = (listingId: string) => savedIds.includes(listingId);

  return { savedIds, savedListings, toggleSave, isSaved };
}

// ─── Landlord listings hook ───────────────────────────────────────────────────

export function useLandlordListings(landlordId: string) {
  return useQuery({
    queryKey: ["landlord-listings", landlordId],
    queryFn: async () => {
      if (!landlordId) return [];
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("landlord_id", landlordId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!data?.length) return [];
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("id, username, is_verified, avatar_url, phone")
        .eq("id", landlordId)
        .single();
      const landlordProfile: LandlordProfile = {
        id: landlordId,
        name: profile?.username ?? "Landlord",
        phone: profile?.phone ?? "",
        isVerified: profile?.is_verified ?? false,
        listingsCount: data.length,
        joinedAt: new Date().toISOString(),
        avatar: profile?.avatar_url ?? undefined,
      };
      return data.map((row) => dbRowToListing(row, landlordProfile));
    },
    enabled: !!landlordId,
    staleTime: 20_000,
  });
}

// ─── Location autocomplete hook ───────────────────────────────────────────────

export function useLocationAutocomplete(query: string) {
  return useQuery({
    queryKey: ["location-autocomplete", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const { data } = await supabase
        .from("listings")
        .select("location, district")
        .or(`location.ilike.%${query}%,district.ilike.%${query}%`)
        .limit(20);

      if (!data?.length) return [];

      const seen = new Set<string>();
      const suggestions: string[] = [];
      for (const row of data) {
        const parts = [row.location, row.district].filter(Boolean);
        for (const p of parts) {
          if (p && !seen.has(p.toLowerCase())) {
            seen.add(p.toLowerCase());
            suggestions.push(p);
          }
        }
      }
      return suggestions.slice(0, 8);
    },
    enabled: query.length >= 2,
    staleTime: 60_000,
  });
}
