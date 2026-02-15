import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const Partidos = () => {
  const [partidos, setPartidos] = useState([]);

  useEffect(() => {
    const fetchPartidos = async () => {
      const { data, error } = await supabase
        .from("Partidos")
        .select(`
          ID,
          Fecha,
          GolesLocal,
          GolesVisitante,
          Terminado,
          EquipoLocal:IdEquipoLocal(Nombre, LogoURL),
          EquipoVisitante:IdEquipoVisitante(Nombre, LogoURL)
        `)
        .order("Fecha", { ascending: false });

      if (error) console.error(error);
      else setPartidos(data);
    };

    fetchPartidos();
  }, []);

  if (partidos.length === 0)
    return <p className="mt-24 text-center text-red-500">No hay partidos cargados</p>;

  return (
    <div className="mt-24 max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-green-400 mb-6">Partidos</h1>
      <div className="space-y-4">
        {partidos.map((p) => (
          <div
            key={p.ID}
            className="flex justify-between items-center bg-gray-800 p-4 rounded-xl shadow hover:bg-gray-700 transition"
          >
            <div className="flex items-center space-x-2">
              {p.EquipoLocal?.LogoURL && (
                <img src={p.EquipoLocal.LogoURL} className="w-8 h-8 rounded-full" />
              )}
              <span>{p.EquipoLocal?.Nombre}</span>
            </div>
            <div className="font-bold text-lg">
              {p.GolesLocal ?? "-"} - {p.GolesVisitante ?? "-"}
            </div>
            <div className="flex items-center space-x-2">
              <span>{p.EquipoVisitante?.Nombre}</span>
              {p.EquipoVisitante?.LogoURL && (
                <img src={p.EquipoVisitante.LogoURL} className="w-8 h-8 rounded-full" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Partidos;
