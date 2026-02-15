import { supabase } from "./supabaseClient";

export async function getClasificacion() {
  const { data, error } = await supabase
    .from("Clasificacion")
    .select(`
      *,
      Equipos (
        Nombre,
        LogoURL
      )
    `)
    .order("Puntos", { ascending: false });

  if (error) throw error;
  return data;
}
