import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface AffiliateProfile {
  id: string;
  userId: string;
  referralCode: string;
  status: "active" | "suspended";
  totalEarnings: number;
  availableBalance: number;
  totalPaidOut: number;
  createdAt: string;
}

export interface AffiliateReferral {
  id: string;
  affiliateId: string;
  referredUserId: string | null;
  referralCode: string;
  type: "signup" | "listing_share";
  listingId: string | null;
  source: string | null;
  createdAt: string;
}

export interface AffiliateCommission {
  id: string;
  affiliateId: string;
  referralId: string | null;
  transactionId: string | null;
  amount: number;
  rate: number;
  paymentAmount: number;
  commissionType: "tenant" | "landlord";
  status: "pending" | "confirmed" | "available" | "paid" | "reversed";
  createdAt: string;
  confirmedAt: string | null;
}

export interface AffiliatePayout {
  id: string;
  affiliateId: string;
  amount: number;
  phone: string | null;
  status: "requested" | "processing" | "paid" | "rejected";
  requestedAt: string;
  paidAt: string | null;
}

const AFFILIATE_RATE = 0.20;

// ─── Generate unique referral code ──────────────────────────────────────────
function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "PAN";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ─── Map DB row ──────────────────────────────────────────────────────────────
function mapAffiliate(row: Record<string, unknown>): AffiliateProfile {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    referralCode: row.referral_code as string,
    status: row.status as AffiliateProfile["status"],
    totalEarnings: (row.total_earnings as number) ?? 0,
    availableBalance: (row.available_balance as number) ?? 0,
    totalPaidOut: (row.total_paid_out as number) ?? 0,
    createdAt: row.created_at as string,
  };
}

// ─── Main hook ───────────────────────────────────────────────────────────────
export function useAffiliate(userId: string) {
  const qc = useQueryClient();

  // Fetch affiliate profile
  const { data: affiliate, isLoading } = useQuery({
    queryKey: ["affiliate", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("affiliate_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error || !data) return null;
      return mapAffiliate(data as Record<string, unknown>);
    },
    enabled: !!userId,
    staleTime: 30_000,
  });

  // Fetch commissions
  const { data: commissions = [] } = useQuery({
    queryKey: ["affiliate-commissions", affiliate?.id],
    queryFn: async () => {
      if (!affiliate?.id) return [];
      const { data } = await supabase
        .from("affiliate_commissions")
        .select("*")
        .eq("affiliate_id", affiliate.id)
        .order("created_at", { ascending: false });
      return (data ?? []).map((r) => ({
        id: r.id as string,
        affiliateId: r.affiliate_id as string,
        referralId: r.referral_id as string | null,
        transactionId: r.transaction_id as string | null,
        amount: r.amount as number,
        rate: r.rate as number,
        paymentAmount: r.payment_amount as number,
        commissionType: r.commission_type as "tenant" | "landlord",
        status: r.status as AffiliateCommission["status"],
        createdAt: r.created_at as string,
        confirmedAt: r.confirmed_at as string | null,
      })) as AffiliateCommission[];
    },
    enabled: !!affiliate?.id,
    staleTime: 20_000,
  });

  // Fetch referrals
  const { data: referrals = [] } = useQuery({
    queryKey: ["affiliate-referrals", affiliate?.id],
    queryFn: async () => {
      if (!affiliate?.id) return [];
      const { data } = await supabase
        .from("referrals")
        .select("*")
        .eq("affiliate_id", affiliate.id)
        .order("created_at", { ascending: false });
      return (data ?? []).map((r) => ({
        id: r.id as string,
        affiliateId: r.affiliate_id as string,
        referredUserId: r.referred_user_id as string | null,
        referralCode: r.referral_code as string,
        type: r.type as "signup" | "listing_share",
        listingId: r.listing_id as string | null,
        source: r.source as string | null,
        createdAt: r.created_at as string,
      })) as AffiliateReferral[];
    },
    enabled: !!affiliate?.id,
    staleTime: 20_000,
  });

  // Fetch payouts
  const { data: payouts = [] } = useQuery({
    queryKey: ["affiliate-payouts", affiliate?.id],
    queryFn: async () => {
      if (!affiliate?.id) return [];
      const { data } = await supabase
        .from("affiliate_payouts")
        .select("*")
        .eq("affiliate_id", affiliate.id)
        .order("requested_at", { ascending: false });
      return (data ?? []).map((r) => ({
        id: r.id as string,
        affiliateId: r.affiliate_id as string,
        amount: r.amount as number,
        phone: r.phone as string | null,
        status: r.status as AffiliatePayout["status"],
        requestedAt: r.requested_at as string,
        paidAt: r.paid_at as string | null,
      })) as AffiliatePayout[];
    },
    enabled: !!affiliate?.id,
    staleTime: 20_000,
  });

  // Become an affiliate
  const becomeAffiliate = async (): Promise<boolean> => {
    if (!userId) return false;
    let code = generateReferralCode();
    // Ensure uniqueness (retry once on collision)
    const { data: existing } = await supabase
      .from("affiliate_profiles")
      .select("id")
      .eq("referral_code", code)
      .single();
    if (existing) code = generateReferralCode() + Math.floor(Math.random() * 9);

    const { error } = await supabase.from("affiliate_profiles").insert({
      user_id: userId,
      referral_code: code,
      status: "active",
      total_earnings: 0,
      available_balance: 0,
      total_paid_out: 0,
    });

    if (error) {
      toast.error("Could not activate affiliate account: " + error.message);
      return false;
    }
    qc.invalidateQueries({ queryKey: ["affiliate", userId] });
    toast.success("Affiliate account activated!");
    return true;
  };

  // Request payout
  const requestPayout = async (amount: number, phone: string): Promise<boolean> => {
    if (!affiliate) return false;
    if (amount < 5000) { toast.error("Minimum payout is UGX 5,000."); return false; }
    if (amount > affiliate.availableBalance) { toast.error("Insufficient balance."); return false; }

    const { error } = await supabase.from("affiliate_payouts").insert({
      affiliate_id: affiliate.id,
      amount,
      phone,
      status: "requested",
    });

    if (error) { toast.error("Payout request failed."); return false; }

    // Deduct from available balance
    await supabase.from("affiliate_profiles").update({
      available_balance: affiliate.availableBalance - amount,
    }).eq("id", affiliate.id);

    qc.invalidateQueries({ queryKey: ["affiliate", userId] });
    qc.invalidateQueries({ queryKey: ["affiliate-payouts", affiliate.id] });
    toast.success("Payout requested! We'll process within 24 hours.");
    return true;
  };

  return {
    affiliate,
    isLoading,
    commissions,
    referrals,
    payouts,
    becomeAffiliate,
    requestPayout,
    AFFILIATE_RATE,
  };
}

// ─── Create commission (called from useListings) ──────────────────────────────
export async function createAffiliateCommission(params: {
  referredUserId: string;
  transactionId: string;
  paymentAmount: number;
  commissionType: "tenant" | "landlord";
}) {
  const { referredUserId, transactionId, paymentAmount, commissionType } = params;

  // Find referral for this user
  const { data: referral } = await supabase
    .from("referrals")
    .select("id, affiliate_id")
    .eq("referred_user_id", referredUserId)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!referral) return; // Not referred — no commission

  const commissionAmount = Math.round(paymentAmount * AFFILIATE_RATE);
  if (commissionAmount <= 0) return;

  // Insert commission
  const { error } = await supabase.from("affiliate_commissions").insert({
    affiliate_id: referral.affiliate_id,
    referral_id: referral.id,
    transaction_id: transactionId,
    amount: commissionAmount,
    rate: AFFILIATE_RATE,
    payment_amount: paymentAmount,
    commission_type: commissionType,
    status: "pending",
  });

  if (error) {
    console.error("Commission creation error:", error);
    return;
  }

  // Update affiliate totals
  const { data: affiliateRow } = await supabase
    .from("affiliate_profiles")
    .select("total_earnings, available_balance")
    .eq("id", referral.affiliate_id)
    .single();

  if (affiliateRow) {
    await supabase.from("affiliate_profiles").update({
      total_earnings: ((affiliateRow.total_earnings as number) ?? 0) + commissionAmount,
      available_balance: ((affiliateRow.available_balance as number) ?? 0) + commissionAmount,
    }).eq("id", referral.affiliate_id);
  }

  console.log(`Commission created: UGX ${commissionAmount} for affiliate ${referral.affiliate_id}`);
}

// ─── Record referral attribution ──────────────────────────────────────────────
export async function recordReferral(params: {
  referralCode: string;
  referredUserId: string;
  listingId?: string;
  source?: string;
}) {
  const { referralCode, referredUserId, listingId, source } = params;

  // Find affiliate by code
  const { data: affiliateRow } = await supabase
    .from("affiliate_profiles")
    .select("id")
    .eq("referral_code", referralCode.toUpperCase())
    .single();

  if (!affiliateRow) return; // Invalid code

  // Avoid duplicate attribution
  const { data: existing } = await supabase
    .from("referrals")
    .select("id")
    .eq("referred_user_id", referredUserId)
    .single();

  if (existing) return; // Already attributed

  await supabase.from("referrals").insert({
    affiliate_id: affiliateRow.id,
    referred_user_id: referredUserId,
    referral_code: referralCode.toUpperCase(),
    type: listingId ? "listing_share" : "signup",
    listing_id: listingId ?? null,
    source: source ?? "generic_link",
  });
}

// ─── Look up referral code from localStorage ──────────────────────────────────
export const REFERRAL_KEY = "pangisa_ref";
export function getStoredReferralCode(): string | null {
  try { return localStorage.getItem(REFERRAL_KEY); } catch { return null; }
}
export function storeReferralCode(code: string) {
  try { localStorage.setItem(REFERRAL_KEY, code); } catch { /* noop */ }
}
export function clearReferralCode() {
  try { localStorage.removeItem(REFERRAL_KEY); } catch { /* noop */ }
}
