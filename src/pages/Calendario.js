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
  const [modalDia, setModalDia] = useState(null); // fecha seleccionada para popup

  useEffect(() => {
    async function fetchData() {
      const data = await getPartidos(); // ya incluye local y visitante
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
    <div className="p-4 sm:p-6 md:p-10">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition">←</button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold capitalize text-center">
          {format(currentDate, "MMMM yyyy", { locale: es })}
        </h1>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition">→</button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 text-center text-slate-400 font-semibold mb-2">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => <div key={d}>{d}</div>)}
      </div>

      {/* GRID CALENDARIO */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 sm:gap-3 min-w-[700px]">
          {days.map((date, index) => {
            const dayMatches = partidosDelDia(date);
            return (
              <div
                key={index}
                className={`
                  min-h-[90px] sm:min-h-[110px] md:min-h-[130px] p-1 sm:p-2 rounded-2xl border transition-all
                  ${isSameMonth(date, monthStart) ? "bg-slate-900 border-slate-800" : "bg-slate-900/40 border-slate-800/40"}
                  ${isSameDay(date, new Date()) ? "ring-2 ring-emerald-500" : ""}
                  cursor-pointer
                `}
                onClick={() => setModalDia(date)} // abrir popup
              >
                {/* Número día */}
                <div className="text-xs sm:text-sm font-bold mb-1 sm:mb-2 text-slate-300">
                  {format(date, "d")}
                </div>

                {/* Partidos resumidos */}
                <div className="space-y-1">
                  {dayMatches.map(match => (
                    <div key={match.ID}
                      className={`
                        text-[10px] sm:text-xs p-1 sm:p-1.5 rounded-lg truncate transition-all
                        ${match.Terminado ? "bg-emerald-600/20 text-emerald-400" : "bg-blue-600/20 text-blue-400"}
                        hover:scale-105
                      `}
                      title={`${match.local?.Nombre || "??"} vs ${match.visitante?.Nombre || "??"} ${format(new Date(match.Fecha), "HH:mm")} ${match.GolesLocal != null ? `${match.GolesLocal} - ${match.GolesVisitante}` : ""}`}
                    >
                      <div className="font-semibold truncate">
                        {match.local?.Nombre?.slice(0, 6) || "??"} vs {match.visitante?.Nombre?.slice(0, 6) || "??"}
                      </div>
                      <div className="text-[9px] sm:text-[10px]">{format(new Date(match.Fecha), "HH:mm")}</div>
                      {/* Mostrar resultado si ya existe */}
                      {match.GolesLocal != null && match.GolesVisitante != null && (
                        <div className="text-[9px] sm:text-[10px] font-bold">
                          {match.GolesLocal} - {match.GolesVisitante}
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

      {/* POPUP MODAL DÍA */}
      {modalDia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-md flex flex-col gap-4">
            <h2 className="text-xl font-bold text-center">
              Partidos {format(modalDia, "dd/MM/yyyy")}
            </h2>

            {partidosDelDia(modalDia).length === 0 && (
              <div className="text-slate-300 text-center">No hay partidos este día</div>
            )}

            {partidosDelDia(modalDia).map(match => (
              <div key={match.ID} className="bg-slate-900/50 p-3 rounded-lg flex flex-col gap-1">
                <div className="font-semibold text-slate-200">
                  {match.local?.Nombre || "??"} vs {match.visitante?.Nombre || "??"}
                </div>
                <div className="text-sm text-slate-400">
                  Hora: {format(new Date(match.Fecha), "HH:mm")}
                </div>
                {match.GolesLocal != null && match.GolesVisitante != null && (
                  <div className="font-bold text-slate-100">
                    Resultado: {match.GolesLocal} - {match.GolesVisitante}
                  </div>
                )}
              </div>
            ))}

            <button
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 mt-4"
              onClick={() => setModalDia(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
