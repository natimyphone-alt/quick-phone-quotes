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

  const loadProfile = async (email: string) => {
    const { data } = await supabase
      .from("usuarios")
      .select("rol, nombre, sucursal_id")
      .eq("email", email)
      .maybeSingle();

    setIsAdmin(data?.rol === "administrador");
    setSucursalId(data?.sucursal_id ? String(data.sucursal_id) : null);
    setNombre(data?.nombre ?? null);
  };

  const refresh = async () => {
    const { data } = await supabase.auth.getSession();
    const u = data.session?.user ?? null;
    setUser(u);
    if (u?.email) await loadProfile(u.email);
    setLoading(false);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u?.email) loadProfile(u.email);
      else {
        setIsAdmin(false);
        setSucursalId(null);
        setNombre(null);
      }
    });
    refresh();
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, loading, isAdmin, sucursalId, nombre, refresh };
}