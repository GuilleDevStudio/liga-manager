import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-slate-900 shadow-lg px-8 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-emerald-500">
        Liga Manager
      </h1>

      <div className="flex gap-6 text-slate-300 font-medium">
        <Link to="/" className="hover:text-emerald-400 transition">Clasificación</Link>
        <Link to="/calendario" className="hover:text-emerald-400 transition">Calendario</Link>
        <Link to="/estadisticas" className="hover:text-emerald-400 transition">Estadísticas</Link>
        <Link to="/admin" className="hover:text-emerald-400 transition">Admin</Link>
      </div>
    </nav>
  );
}
