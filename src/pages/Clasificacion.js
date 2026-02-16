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
    <div className="p-4 sm:p-6 md:p-10">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
        Clasificación
      </h1>

      <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Scroll horizontal en móvil */}
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full table-auto text-slate-300 text-sm sm:text-base">
            
            <thead className="bg-slate-800 text-slate-400 text-sm uppercase">
              <tr>
                <th className="p-4 text-center w-10">#</th>
                <th className="text-left w-32 sm:w-48">Equipo</th>
                <th className="text-center w-10">Pts</th>
                <th className="text-center w-10">PJ</th>
                <th className="text-center w-10">V</th>
                <th className="text-center w-10">E</th>
                <th className="text-center w-10">D</th>
                <th className="text-center w-10">GF</th>
                <th className="text-center w-10">GC</th>
              </tr>
            </thead>
            <tbody>
              {tabla.map((eq, index) => (
                <tr key={eq.EquipoID} className="border-b border-slate-800 hover:bg-slate-800/40 transition">
                  <td className="p-4 font-bold text-center w-10">{index + 1}</td>

                  {/* Equipo */}
                  <td className="py-4 max-w-[120px] sm:max-w-[200px] w-32 sm:w-48">
                    <div className="flex items-center gap-2 truncate">
                      {eq.Equipos?.LogoURL && (
                        <img
                          src={eq.Equipos.LogoURL}
                          alt={eq.Equipos.Nombre}
                          className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0"
                        />
                      )}
                      <span className="truncate text-sm sm:text-base">{eq.Equipos.Nombre}</span>
                    </div>
                  </td>

                  {/* Puntos y demás */}
                  <td className="text-center w-10 text-emerald-400 font-bold">{eq.Puntos}</td>
                  <td className="text-center w-10">{eq.PartidosJugados}</td>
                  <td className="text-center w-10">{eq.Victorias}</td>
                  <td className="text-center w-10">{eq.Empates}</td>
                  <td className="text-center w-10">{eq.Derrotas}</td>
                  <td className="text-center w-10">{eq.GolesFavor}</td>
                  <td className="text-center w-10">{eq.GolesContra}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}