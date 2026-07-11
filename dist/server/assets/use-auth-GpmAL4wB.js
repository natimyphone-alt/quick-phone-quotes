import { useState, useEffect } from "react";
import { s as supabase } from "./client-CzxaLLtB.js";
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sucursalId, setSucursalId] = useState(null);
  const [nombre, setNombre] = useState(null);
  const loadProfile = async (email) => {
    const { data } = await supabase.from("usuarios").select("rol, nombre, sucursal_id").eq("email", email).maybeSingle();
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
export {
  useAuth as u
};
