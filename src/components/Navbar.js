import { Link } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-slate-900 shadow-lg px-4 sm:px-8 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-emerald-500">
          Liga Manager
        </h1>

        {/* Botón hamburguesa (solo móvil) */}
        <button
          onClick={() => setOpen(!open)}
          className="sm:hidden text-slate-300 focus:outline-none"
        >
          ☰
        </button>

        {/* Menú desktop */}
        <div className="hidden sm:flex gap-6 text-slate-300 font-medium">
          <Link to="/" className="hover:text-emerald-400 transition">
            Clasificación
          </Link>
          <Link to="/calendario" className="hover:text-emerald-400 transition">
            Calendario
          </Link>
          <Link to="/estadisticas" className="hover:text-emerald-400 transition">
            Estadísticas
          </Link>
          <Link to="/admin" className="hover:text-emerald-400 transition">
            Admin
          </Link>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {open && (
        <div className="sm:hidden mt-4 flex flex-col gap-4 text-slate-300 font-medium">
          <Link onClick={() => setOpen(false)} to="/" className="hover:text-emerald-400 transition">
            Clasificación
          </Link>
          <Link onClick={() => setOpen(false)} to="/calendario" className="hover:text-emerald-400 transition">
            Calendario
          </Link>
          <Link onClick={() => setOpen(false)} to="/estadisticas" className="hover:text-emerald-400 transition">
            Estadísticas
          </Link>
          <Link onClick={() => setOpen(false)} to="/admin" className="hover:text-emerald-400 transition">
            Admin
          </Link>
        </div>
      )}
    </nav>
  );
}