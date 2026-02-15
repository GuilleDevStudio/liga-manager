import { supabase } from "../services/supabaseClient";


export async function actualizarClasificacion(partidos, equipos, supabase) {
  // Recorremos todos los equipos
  for (const equipo of equipos) {
    let PJ = 0, V = 0, E = 0, D = 0, GF = 0, GC = 0, Puntos = 0;

    partidos.forEach(p => {
      if (!p.Terminado) return;
      if (p.IdEquipoLocal === equipo.ID || p.IdEquipoVisitante === equipo.ID) {
        PJ++;
        const golesPropios = p.IdEquipoLocal === equipo.ID ? p.GolesLocal : p.GolesVisitante;
        const golesContra = p.IdEquipoLocal === equipo.ID ? p.GolesVisitante : p.GolesLocal;
        GF += golesPropios;
        GC += golesContra;

        if (golesPropios > golesContra) V++;
        else if (golesPropios === golesContra) E++;
        else D++;
      }
    });

    Puntos = V * 3 + E;

    await supabase.from("Clasificacion")
      .update({ Puntos, PartidosJugados: PJ, Victorias: V, Empates: E, Derrotas: D, GolesFavor: GF, GolesContra: GC })
      .eq("EquipoID", equipo.ID);
  }
}
