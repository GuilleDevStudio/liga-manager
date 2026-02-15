import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const Estadisticas = () => {
  const [jugadores, setJugadores] = useState([]);

  useEffect(() => {
    const fetchJugadores = async () => {
      const { data, error } = await supabase
        .from("Jugadores")
        .select(`
          Nombre,
          Apellidos,
          ImagenURL,
          Goles,
          Asistencias,
          TarjetasAmarillas,
          TarjetasRojas
        `)
        .order("Goles", { ascending: false })
        .limit(10);

      if (error) console.error(error);
      else setJugadores(data);
    };

    fetchJugadores();
  }, []);

  if (jugadores.length === 0)
    return <p className="mt-24 text-center text-red-500">No hay estadísticas</p>;

  return (
    <div className="mt-24 max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-green-400 mb-6">Estadísticas</h1>
      <table className="w-full text-left text-gray-200 bg-gray-800 rounded-xl overflow-hidden">
        <thead className="bg-gray-900 text-gray-400">
          <tr>
            <th className="p-4">#</th>
            <th>Jugador</th>
            <th>Goles</th>
            <th>Asistencias</th>
            <th>TA</th>
            <th>TR</th>
          </tr>
        </thead>
        <tbody>
          {jugadores.map((j, i) => (
            <tr key={i} className="border-b border-gray-700 hover:bg-gray-700 transition">
              <td className="p-4">{i + 1}</td>
              <td className="flex items-center space-x-2">
                {j.ImagenURL && <img src={j.ImagenURL} className="w-6 h-6 rounded-full" />}
                <span>{j.Nombre} {j.Apellidos}</span>
              </td>
              <td>{j.Goles}</td>
              <td>{j.Asistencias}</td>
              <td>{j.TarjetasAmarillas}</td>
              <td>{j.TarjetasRojas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Estadisticas;
