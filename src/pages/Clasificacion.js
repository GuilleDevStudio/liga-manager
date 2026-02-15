import { useEffect, useState } from "react";
import { getClasificacion } from "../services/clasificacionService";

export default function Clasificacion() {
  const [tabla, setTabla] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getClasificacion();
      setTabla(data);
    }
    fetchData();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-8">Clasificación</h1>

      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full table-auto text-slate-300">
          <thead className="bg-slate-800 text-slate-400 text-sm uppercase">
            <tr>
              <th className="p-4 text-center">#</th>
              <th className="text-left">Equipo</th>
              <th className="text-center">PJ</th>
              <th className="text-center">V</th>
              <th className="text-center">E</th>
              <th className="text-center">D</th>
              <th className="text-center">GF</th>
              <th className="text-center">GC</th>
              <th className="text-center">Pts</th>
            </tr>
          </thead>

          <tbody>
            {tabla.map((eq, index) => (
              <tr key={eq.EquipoID} className="border-b border-slate-800 hover:bg-slate-800/40 transition">
                <td className="p-4 font-bold text-center">{index + 1}</td>
                <td className="py-4 text-center">
                  <div className="flex items-center gap-3">
                    <img
                      src={eq.Equipos.LogoURL}
                      alt={eq.Equipos.Nombre}
                      className="w-8 h-8 object-contain"
                    />
                    <span>{eq.Equipos.Nombre}</span>
                  </div>
                </td>
                <td className="text-center">{eq.PartidosJugados}</td>
                <td className="text-center">{eq.Victorias}</td>
                <td className="text-center">{eq.Empates}</td>
                <td className="text-center">{eq.Derrotas}</td>
                <td className="text-center">{eq.GolesFavor}</td>
                <td className="text-center">{eq.GolesContra}</td>
                <td className="text-emerald-400 font-bold text-center">{eq.Puntos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
