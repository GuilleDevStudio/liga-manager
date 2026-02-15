import { useEffect, useState } from "react";
import { getPartidos } from "../services/partidosService";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay
} from "date-fns";
import { es } from "date-fns/locale";

export default function Calendario(equipos = []) {
  const [partidos, setPartidos] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
      async function fetchData() {
      const data = await getPartidos(); // ahora ya tiene local y visitante
      setPartidos(data);
    }
    fetchData();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let day = startDate;

  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  function partidosDelDia(date) {
    return partidos.filter(match =>
      match.Fecha && isSameDay(new Date(match.Fecha), date)
    );
  }



  return (
    <div className="p-10">

      {/* HEADER CON NAVEGACIÓN */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition"
        >
          ←
        </button>

        <h1 className="text-3xl font-bold capitalize">
          {format(currentDate, "MMMM yyyy", { locale: es })}
        </h1>

        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition"
        >
          →
        </button>
      </div>

      {/* DÍAS SEMANA */}
      <div className="grid grid-cols-7 text-center text-slate-400 font-semibold mb-2">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* GRID CALENDARIO */}
      <div className="grid grid-cols-7 gap-3">
        {days.map((date, index) => {
          const dayMatches = partidosDelDia(date);

          return (
            <div
              key={index}
              className={`
                min-h-[130px] p-2 rounded-2xl border transition-all
                ${isSameMonth(date, monthStart)
                  ? "bg-slate-900 border-slate-800"
                  : "bg-slate-900/40 border-slate-800/40"}
                ${isSameDay(date, new Date())
                  ? "ring-2 ring-emerald-500"
                  : ""}
              `}
            >
              {/* Número día */}
              <div className="text-sm font-bold mb-2 text-slate-300">
                {format(date, "d")}
              </div>

              {/* Partidos */}
              <div className="space-y-2">
                {dayMatches.map(match => (
                  <div
                    key={match.ID}
                    className={`
                      text-xs p-2 rounded-lg truncate transition-all
                      ${match.Terminado
                        ? "bg-emerald-600/20 text-emerald-400"
                        : "bg-blue-600/20 text-blue-400"}
                      hover:scale-105
                    `}
                  >
                    <div className="font-semibold">
                      {match.local?.Nombre || "Equipo desconocido"} vs {match.visitante?.Nombre || "Equipo desconocido"}
                    </div>

                    {/* Hora */}
                    <div className="text-slate-400 text-[10px]">
                      {format(new Date(match.Fecha), "HH:mm")}
                    </div>

                    {/* Resultado */}
                    {match.GolesLocal != null && match.GolesVisitante != null && (
                      <div className="text-slate-200 text-[10px] font-bold">
                        Resultado: {match.GolesLocal} - {match.GolesVisitante}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
