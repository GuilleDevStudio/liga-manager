import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const Estadisticas = () => {
  const [jugadores, setJugadores] = useState([]);

  useEffect(() => {
    const fetchJugadores = async () => {
      const { data, error } = await supabase
        .from("Jugadores")
        .select(`
          ID,
          Nombre,
          Apellidos,
          Nickname,
          ImagenURL,
          Goles,
          Asistencias,
          TA,
          TR,
          Equipos (
            ID,
            Nombre
          )
        `);

      if (error) console.error(error);
      else setJugadores(data);
    };

    fetchJugadores();
  }, []);

  const getNombreJugador = (j) => {
    if (j.Nickname && j.Nickname.trim() !== "") return j.Nickname;
    return `${j.Nombre} ${j.Apellidos || ""}`;
  };

  const renderTabla = (titulo, campo) => {
    const datosOrdenados = [...jugadores]
      .sort((a, b) => (b[campo] || 0) - (a[campo] || 0))
      .filter(j => (j[campo] || 0) > 0);

    if (datosOrdenados.length === 0) return null;

    return (
      <div className="mb-10">
        <h2 className="text-2xl sm:text-3xl font-semibold text-green-400 mb-4">
          {titulo}
        </h2>

        {/* Scroll horizontal en móviles */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-200 bg-gray-800 rounded-xl overflow-hidden min-w-[500px] sm:min-w-full">
            <thead className="bg-gray-900 text-gray-400 text-sm sm:text-base">
              <tr>
                <th className="p-2 sm:p-4 w-8">#</th>
                <th className="w-32 sm:w-auto">Jugador</th>
                <th className="w-24 sm:w-auto">Equipo</th>
                <th className="text-right pr-2 sm:pr-4 w-20">{titulo}</th>
              </tr>
            </thead>
            <tbody>
              {datosOrdenados.map((j, i) => (
                <tr
                  key={j.ID}
                  className="border-b border-gray-700 hover:bg-gray-700 transition text-sm sm:text-base"
                >
                  <td className="p-2 sm:p-4">{i + 1}</td>
                  <td className="p-2 sm:p-4">
                    <div className="flex items-center gap-2">
                      {j.ImagenURL && (
                        <img
                          src={j.ImagenURL}
                          alt="jugador"
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
                        />
                      )}
                      <span className="truncate">{getNombreJugador(j)}</span>
                    </div>
                  </td>
                  <td className="p-2 sm:p-4 truncate">
                    {j.Equipos ? j.Equipos.Nombre : "Sin equipo"}
                  </td>
                  <td className="text-right pr-2 sm:pr-4 font-semibold">
                    {j[campo] || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (jugadores.length === 0)
    return (
      <p className="mt-24 text-center text-red-500">
        No hay estadísticas
      </p>
    );

  return (
    <div className="mt-24 max-w-5xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl sm:text-4xl font-bold text-green-400 mb-8 text-center sm:text-left">
        Estadísticas
      </h1>

      {renderTabla("Goles", "Goles")}
      {renderTabla("Asistencias", "Asistencias")}
      {renderTabla("Tarjetas Amarillas", "TA")}
      {renderTabla("Tarjetas Rojas", "TR")}
    </div>
  );
};

export default Estadisticas;