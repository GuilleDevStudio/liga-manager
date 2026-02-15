import { supabase } from "./supabaseClient";

export async function getPartidos() {
  const { data, error } = await supabase
    .from("Partidos")
    .select(`
      ID,
      Fecha,
      Terminado,
      GolesLocal,
      GolesVisitante,
      IdEquipoLocal (Nombre),
      IdEquipoVisitante (Nombre)
    `);

  if (error) {
    console.error("Error fetching partidos:", error);
    return [];
  }

  // Map para que cada partido tenga .local y .visitante
  return data.map(p => ({
    ...p,
    local: p.IdEquipoLocal,
    visitante: p.IdEquipoVisitante
  }));
}

