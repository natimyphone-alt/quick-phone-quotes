import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  sucursalId: string | null;
  nombre: string | null;
  refresh: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sucursalId, setSucursalId] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);

  const loadProfile = async (uid: string) => {
    const [{ data: roleRows }, { data: prof }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("profiles").select("sucursal_id, nombre").eq("id", uid).maybeSingle(),
    ]);
    setIsAdmin((roleRows || []).some((r: any) => r.role === "admin"));
    setSucursalId(prof?.sucursal_id ?? null);
    setNombre(prof?.nombre ?? null);
  };

  const refresh = async () => {
    const { data } = await supabase.auth.getSession();
    const u = data.session?.user ?? null;
    setUser(u);
    if (u) await loadProfile(u.id);
    setLoading(false);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadProfile(u.id);
      else {
        setIsAdmin(false); setSucursalId(null); setNombre(null);
      }
    });
    refresh();
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, loading, isAdmin, sucursalId, nombre, refresh };
}
