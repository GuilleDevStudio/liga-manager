import { supabase } from "./supabaseClient";

export async function getEquipos() {
  const { data, error } = await supabase
    .from("Equipos")
    .select("*");

  if (error) throw error;
  return data;
}
