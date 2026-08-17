import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { User as AuthUserType } from "@supabase/supabase-js";
import type { User } from "@/types";

const USER_PROFILE_KEY = "pangisa_profile";

function mapSupabaseUser(supaUser: AuthUserType, profile?: Partial<User>): User {
  const meta = supaUser.user_metadata ?? {};
  return {
    id: supaUser.id,
    name: profile?.name ?? meta.name ?? meta.full_name ?? supaUser.email?.split("@")[0] ?? "User",
    email: supaUser.email ?? "",
    phone: profile?.phone ?? meta.phone ?? "",
    role: (profile?.role ?? meta.role ?? "tenant") as User["role"],
    avatar: profile?.avatar ?? meta.avatar_url,
    isVerified: profile?.isVerified ?? false,
    createdAt: supaUser.created_at,
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem(USER_PROFILE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const cacheUser = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_PROFILE_KEY);
  };

  // Fetch full profile from DB
  const fetchProfile = useCallback(async (supaUser: AuthUserType): Promise<User> => {
    const { data } = await supabase
      .from("user_profiles")
      .select("username, email, role, phone, is_verified, avatar_url")
      .eq("id", supaUser.id)
      .single();

    return mapSupabaseUser(supaUser, {
      name: data?.username,
      phone: data?.phone,
      role: data?.role,
      isVerified: data?.is_verified,
      avatar: data?.avatar_url,
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        const profile = await fetchProfile(session.user);
        if (mounted) cacheUser(profile);
      } else {
        if (mounted) cacheUser(null);
      }
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
        const profile = await fetchProfile(session.user);
        cacheUser(profile);
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        cacheUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  /**
   * Step 1 — send OTP to email
   */
  const sendOTP = async (email: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) return { error: error.message };
    return {};
  };

  /**
   * Step 2 — verify OTP and upsert profile
   */
  const verifyOTP = async (
    email: string,
    token: string,
    role: "tenant" | "landlord",
    name?: string
  ): Promise<{ error?: string; user?: import("@supabase/supabase-js").User }> => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) return { error: error.message };
    if (!data.user) return { error: "Verification failed. Please try again." };

    // Upsert profile with role + name
    const displayName = name ?? email.split("@")[0];
    await supabase.from("user_profiles").upsert({
      id: data.user.id,
      email: data.user.email,
      username: displayName,
      role,
    }, { onConflict: "id" });

    // Also update user metadata
    await supabase.auth.updateUser({ data: { role, name: displayName } });

    const profile = mapSupabaseUser(data.user, { name: displayName, role });
    cacheUser(profile);
    // Return user for referral attribution in OTPAuth
    return { user: data.user };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    cacheUser(null);
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ error?: string }> => {
    if (!user) return { error: "Not logged in" };
    const { error } = await supabase.from("user_profiles").update({
      username: updates.name,
      phone: updates.phone,
      role: updates.role,
    }).eq("id", user.id);
    if (error) return { error: error.message };
    cacheUser({ ...user, ...updates });
    return {};
  };

  return { user, loading, sendOTP, verifyOTP, logout, updateProfile };
}
