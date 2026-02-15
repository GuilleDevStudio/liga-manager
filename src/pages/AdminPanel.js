import { useEffect, useState, useMemo } from "react";
import { supabase } from "../services/supabaseClient";
import { actualizarClasificacion } from "../utils/updateStandings";
import { getPartidos } from "../services/partidosService";
import toast, { Toaster } from "react-hot-toast";


export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("Equipos"); 
  const [equipos, setEquipos] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [posiciones, setPosiciones] = useState([]);
  const [clasificacion, setClasificacion] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) window.location.href = "/login";
    else setUser(JSON.parse(stored));

    fetchAll();
  }, []);

  async function fetchAll() {
    const { data: e } = await supabase.from("Equipos").select("*");
    setEquipos(e);

    const { data: j } = await supabase.from("Jugadores").select("*");
    setJugadores(j);

    const { data: p } = await supabase.from("Partidos").select("*");
    // Aquí añadimos los objetos de los equipos
    const partidosConEquipos = p.map(match => {
      const local = e.find(eq => eq.ID === match.IdEquipoLocal) || null;
      const visitante = e.find(eq => eq.ID === match.IdEquipoVisitante) || null;
      return { ...match, local, visitante };
    });

    setPartidos(partidosConEquipos);

    const { data: pos } = await supabase.from("Posiciones").select("*");
    setPosiciones(pos);

    const { data: c } = await supabase.from("Clasificacion").select("*, EquipoID(*)");
    setClasificacion(c);
  }

  // -----------------------------
  // CRUD Equipos
  // -----------------------------
  async function crearEquipo(nombre, logo) {
    const { data: equipo, error } = await supabase.from("Equipos").insert([{ Nombre: nombre, LogoURL: logo }]).select().single();
    if(error) return alert("Error creando equipo: " + error.message);

    await supabase.from("Clasificacion").insert([{
      EquipoID: equipo.ID,
      Puntos: 0,
      PartidosJugados: 0,
      Victorias: 0,
      Empates: 0,
      Derrotas: 0,
      GolesFavor: 0,
      GolesContra: 0
    }]);

    toast.success("Equipo creado con éxito 🎉");

    fetchAll();
  }

  async function editarEquipo(id, nombre, logo) {
    const { error } = await supabase.from("Equipos").update({ Nombre: nombre, LogoURL: logo }).eq("ID", id);
    if (error) return alert("Error editando equipo: " + error.message);

    toast.success("Equipo modificado con éxito 🎉");

    fetchAll();
  }

  async function eliminarEquipo(id) {
    if (!window.confirm("¿Seguro que quieres eliminar este equipo?")) return;
    const { error } = await supabase.from("Equipos").delete().eq("ID", id);
    if (error) return alert("Error eliminando equipo: " + error.message);

    toast.success("Equipo eliminado con éxito 🎉");

    fetchAll();
  }

  // -----------------------------
  // CRUD Jugadores
  // -----------------------------
  async function crearJugador(nombre, apellidos, nickname, equipoID, posicionID) {
    const { error } = await supabase.from("Jugadores").insert([{
      Nombre: nombre,
      Apellidos: apellidos,
      Nickname: nickname,
      IdEquipo: equipoID,
      IdPosicion: posicionID
    }]);
    if (error) return alert("Error creando jugador: " + error.message);

    toast.success("Jugador creado con éxito 🎉");

    fetchAll();
  }

  async function editarJugador(id, nombre, apellidos, nickname, equipoID, posicionID, goles, asistencias, ta, tr) {
    const { error } = await supabase.from("Jugadores").update({
        Nombre: nombre,
        Apellidos: apellidos,
        Nickname: nickname,
        IdEquipo: equipoID,
        IdPosicion: posicionID,
        Goles: parseInt(goles) || 0,
        Asistencias: parseInt(asistencias) || 0,
        TA: parseInt(ta) || 0,
        TR: parseInt(tr) || 0
      }).eq("ID", id);
    if (error) return alert("Error editando jugador: " + error.message);

    toast.success("Jugador modificado con éxito 🎉");

    fetchAll();
  }

  async function eliminarJugador(id) {
    if (!window.confirm("¿Seguro que quieres eliminar este jugador?")) return;
    const { error } = await supabase.from("Jugadores").delete().eq("ID", id);
    if (error) return alert("Error eliminando jugador: " + error.message);

    toast.success("Jugador eliminado con éxito 🎉");

    fetchAll();
  }

  // -----------------------------
  // CRUD Partidos
  // -----------------------------
  async function crearPartido(localID, visitanteID, fecha) {
    const { error } = await supabase.from("Partidos").insert([{ IdEquipoLocal: localID, IdEquipoVisitante: visitanteID, Fecha: fecha, Terminado: false }]);
    if (error) return alert("Error creando partido: " + error.message);

    toast.success("Partido creado con éxito 🎉");

    fetchAll();
  }

  async function editarPartido(id, localID, visitanteID, fecha) {
    const { error } = await supabase.from("Partidos").update({ IdEquipoLocal: localID, IdEquipoVisitante: visitanteID, Fecha: fecha }).eq("ID", id);
    if (error) return alert("Error editando partido: " + error.message);

    toast.success("Partido modificado con éxito 🎉");

    fetchAll();
  }

  async function eliminarPartido(id) {
    if (!window.confirm("¿Seguro que quieres eliminar este partido?")) return;
    const { error } = await supabase.from("Partidos").delete().eq("ID", id);
    if (error) return alert("Error eliminando partido: " + error.message);

    toast.success("Partido eliminado con éxito 🎉");

    fetchAll();
  }

  async function registrarResultado(match) {
    if (match.GolesLocal == null || match.GolesVisitante == null) 
      return alert("Introduce goles antes");

    // Actualiza el partido en Supabase
    const { error } = await supabase
      .from("Partidos")
      .update({ GolesLocal: match.GolesLocal, GolesVisitante: match.GolesVisitante, Terminado: true })
      .eq("ID", match.ID);

    if (error) return alert("Error registrando resultado: " + error.message);

    // Refresca la lista de partidos para que incluya el recién actualizado
    const { data: updatedPartidos } = await supabase.from("Partidos").select("*");
    
    // Ahora recalcula la clasificación con todos los partidos
    await actualizarClasificacion(updatedPartidos, equipos, supabase);

    toast.success("Resultado registrado con éxito 🎉");

    fetchAll(); // refresca todos los estados
  }




  if (!user) return null;

  return (
    <div className="p-10 min-h-screen bg-slate-950 text-white">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Hola {user.Nombre}</h1>
        <button onClick={() => { localStorage.removeItem("user"); window.location.href = "/login"; }} className="bg-red-500 px-4 py-2 rounded-xl hover:bg-red-600 transition">Logout</button>
      </div>

      <div className="flex gap-4 mb-6">
        {/* {["Equipos", "Jugadores", "Partidos", "Clasificacion"].map(t => ( */}
          {["Equipos", "Jugadores", "Partidos"].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl ${tab===t?"bg-emerald-500":"bg-slate-800 hover:bg-slate-700"} transition`}>{t}</button>
        ))}
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl shadow-xl">
        {tab === "Equipos" && <SeccionEquipos equipos={equipos} onCrear={crearEquipo} onEditar={editarEquipo} onEliminar={eliminarEquipo} />}
        {tab === "Jugadores" && <SeccionJugadores jugadores={jugadores} equipos={equipos} posiciones={posiciones} onCrear={crearJugador} onEditar={editarJugador} onEliminar={eliminarJugador} />}
        {tab === "Partidos" && <SeccionPartidos partidos={partidos} equipos={equipos} onCrear={crearPartido} onEditar={editarPartido} onEliminar={eliminarPartido} onResultado={registrarResultado} />}
        {/* {tab === "Clasificacion" && <SeccionClasificacion clasificacion={clasificacion} />} */}
      </div>
    </div>
  );
}

// -----------------------------
// Sección Equipos
// -----------------------------
function SeccionEquipos({ equipos, onCrear, onEditar, onEliminar }) {
  // Crear equipo
  const [nombre, setNombre] = useState("");
  const [logo, setLogo] = useState("");

  // Editar equipo
  const [equipoEdit, setEquipoEdit] = useState(null);

  // Toast de éxito
  const [toast, setToast] = useState("");

  function mostrarToast(mensaje) {
    setToast(mensaje);
    setTimeout(() => setToast(""), 2000);
  }

  function abrirModalEditar(equipo) {
    setEquipoEdit({ ...equipo });
  }

  return (
    <div className="flex flex-col gap-8 relative">

      {/* TOAST */}
      {toast && (
        <div className="fixed top-5 right-5 bg-emerald-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      {/* Crear */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-md max-w-4xl">
        <h2 className="text-xl font-semibold mb-4">Crear Equipo</h2>
        <div className="flex flex-row gap-4 items-end">
          <input
            placeholder="Nombre Equipo"
            className="flex-1 px-3 py-2 rounded-lg bg-slate-700 border border-slate-600"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />
          <input
            placeholder="Logo URL"
            className="flex-1 px-3 py-2 rounded-lg bg-slate-700 border border-slate-600"
            value={logo}
            onChange={e => setLogo(e.target.value)}
          />
          <button
            className="bg-emerald-500 py-3 px-8 rounded-xl hover:bg-emerald-600 transition font-semibold"
            onClick={() => {
              if (!nombre) return alert("Completa nombre");
              onCrear(nombre, logo);
              setNombre(""); setLogo("");
              mostrarToast("Equipo creado con éxito");
            }}
          >
            Guardar
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-slate-900 p-6 rounded-2xl shadow-xl overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Listado de Equipos</h2>
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Logo</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-slate-900 divide-y divide-slate-700">
            {equipos.map(e => (
              <tr key={e.ID}>
                <td className="px-4 py-2">{e.Nombre}</td>
                <td className="px-4 py-2">
                  {e.LogoURL && <img src={e.LogoURL} alt={e.Nombre} className="h-10 w-10 object-cover rounded" />}
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    className="bg-yellow-500 px-2 py-1 rounded hover:bg-yellow-600 mr-2"
                    onClick={() => abrirModalEditar(e)}
                  >
                    Editar
                  </button>
                  <button
                    className="bg-red-500 px-2 py-1 rounded hover:bg-red-600"
                    onClick={() => onEliminar(e.ID)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
      {equipoEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-md flex flex-col gap-3">
            <h2 className="text-xl font-semibold mb-4">Editar Equipo</h2>

            <label className="text-sm text-slate-300">Nombre del equipo</label>
            <input
              placeholder="Ej: Real Madrid"
              className="p-2 rounded-lg bg-slate-700 border border-slate-600"
              value={equipoEdit.Nombre}
              onChange={e => setEquipoEdit(prev => ({ ...prev, Nombre: e.target.value }))}
            />

            <label className="text-sm text-slate-300">Logo URL</label>
            <input
              placeholder="Ej: https://logo.com/logo.png"
              className="p-2 rounded-lg bg-slate-700 border border-slate-600"
              value={equipoEdit.LogoURL || ""}
              onChange={e => setEquipoEdit(prev => ({ ...prev, LogoURL: e.target.value }))}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button className="bg-red-500 px-4 py-2 rounded hover:bg-red-600" onClick={() => setEquipoEdit(null)}>
                Cancelar
              </button>
              <button
                className="bg-emerald-500 px-4 py-2 rounded hover:bg-emerald-600"
                onClick={async () => {
                  await onEditar(equipoEdit.ID, equipoEdit.Nombre, equipoEdit.LogoURL);
                  setEquipoEdit(null);
                  mostrarToast("Equipo editado con éxito");
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// -----------------------------
// Sección Jugadores
// -----------------------------
function SeccionJugadores({ jugadores, equipos, posiciones, onCrear, onEditar, onEliminar }) {
  // Crear jugador
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [nickname, setNickname] = useState("");
  const [equipo, setEquipo] = useState("");
  const [posicion, setPosicion] = useState("");

  // Editar jugador
  const [jugadorEdit, setJugadorEdit] = useState(null);

  // Buscador y filtro
  const [search, setSearch] = useState("");
  const [filtroEquipo, setFiltroEquipo] = useState("");

  // Toast de éxito
  const [toast, setToast] = useState("");

  function mostrarToast(mensaje) {
    setToast(mensaje);
    setTimeout(() => setToast(""), 2000);
  }

  function abrirModalEditar(jugador) {
    setJugadorEdit({ ...jugador });
  }

  // Filtrar jugadores según busqueda y equipo
  const jugadoresFiltrados = useMemo(() => {
    return jugadores.filter(j => {
      const nombreCompleto = (j.Nombre + " " + j.Apellidos + " " + j.Nickname).toLowerCase();
      const busquedaValida = nombreCompleto.includes(search.toLowerCase());
      const equipoValido = !filtroEquipo || j.IdEquipo === parseInt(filtroEquipo);
      return busquedaValida && equipoValido;
    });
  }, [jugadores, search, filtroEquipo]);

  return (
    <div className="flex flex-col gap-8 relative">

      {/* TOAST */}
      {toast && (
        <div className="fixed top-5 right-5 bg-emerald-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      {/* Crear */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-md max-w-6xl flex flex-col gap-4">
        <h2 className="text-xl font-semibold mb-4">Crear Jugador</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <input
            placeholder="Nombre"
            className="p-2 rounded-lg bg-slate-700 border border-slate-600 flex-1 min-w-[120px]"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />
          <input
            placeholder="Apellidos"
            className="p-2 rounded-lg bg-slate-700 border border-slate-600 flex-1 min-w-[120px]"
            value={apellidos}
            onChange={e => setApellidos(e.target.value)}
          />
          <input
            placeholder="Nickname"
            className="p-2 rounded-lg bg-slate-700 border border-slate-600 flex-1 min-w-[120px]"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
          />
          <select
            className="p-2 rounded-lg bg-slate-700 border border-slate-600 flex-1 min-w-[120px]"
            value={equipo}
            onChange={e => setEquipo(parseInt(e.target.value))}
          >
            <option value="">Equipo</option>
            {equipos.map(e => <option key={e.ID} value={e.ID}>{e.Nombre}</option>)}
          </select>
          <select
            className="p-2 rounded-lg bg-slate-700 border border-slate-600 flex-1 min-w-[120px]"
            value={posicion}
            onChange={e => setPosicion(parseInt(e.target.value))}
          >
            <option value="">Posición</option>
            {posiciones.map(p => <option key={p.ID} value={p.ID}>{p.Nombre}</option>)}
          </select>
          <button
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition"
            onClick={() => {
              if (!nombre || !equipo || !posicion) return alert("Completa datos");
              onCrear(nombre, apellidos, nickname, equipo, posicion);
              setNombre(""); setApellidos(""); setNickname(""); setEquipo(""); setPosicion("");
              mostrarToast("Jugador creado con éxito");
            }}
          >
            Crear Jugador
          </button>
        </div>
      </div>

      {/* Buscador y filtro */}
      <div className="flex gap-4 items-center">
        <input
          placeholder="Buscar jugador..."
          className="p-2 rounded-lg bg-slate-700 border border-slate-600 flex-1"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="p-2 rounded-lg bg-slate-700 border border-slate-600"
          value={filtroEquipo}
          onChange={e => setFiltroEquipo(e.target.value)}
        >
          <option value="">Todos los equipos</option>
          {equipos.map(e => <option key={e.ID} value={e.ID}>{e.Nombre}</option>)}
        </select>
      </div>

      {/* Grid de jugadores */}
      <div className="bg-slate-900 p-6 rounded-2xl shadow-xl overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Listado de Jugadores</h2>
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-2 text-center">Nombre</th>
              <th className="px-4 py-2 text-center">Apellidos</th>
              <th className="px-4 py-2 text-center">Nickname</th>
              <th className="px-4 py-2 text-center">Equipo</th>
              <th className="px-4 py-2 text-center">Posición</th>
              <th className="px-4 py-2 text-center">Goles</th>
              <th className="px-4 py-2 text-center">Asistencias</th>
              <th className="px-4 py-2 text-center">TA</th>
              <th className="px-4 py-2 text-center">TR</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-slate-900 divide-y divide-slate-700">
            {jugadoresFiltrados.map(j => {
              const equipoObj = equipos.find(e => e.ID === j.IdEquipo);
              const posicionObj = posiciones.find(p => p.ID === j.IdPosicion);

              return (
                <tr key={j.ID}>
                  <td className="px-4 py-2 text-center">{j.Nombre}</td>
                  <td className="px-4 py-2 text-center">{j.Apellidos}</td>
                  <td className="px-4 py-2 text-center">{j.Nickname}</td>
                  <td className="px-4 py-2 text-center">{equipoObj?.Nombre || "Equipo desconocido"}</td>
                  <td className="px-4 py-2 text-center">{posicionObj?.Nombre || "Posición desconocida"}</td>
                  <td className="px-4 py-2 text-center">{j.Goles || 0}</td>
                  <td className="px-4 py-2 text-center">{j.Asistencias || 0}</td>
                  <td className="px-4 py-2 text-center">{j.TA || 0}</td>
                  <td className="px-4 py-2 text-center">{j.TR || 0}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      className="bg-yellow-500 px-2 py-1 rounded hover:bg-yellow-600 mr-2"
                      onClick={() => abrirModalEditar(j)}
                    >
                      Editar
                    </button>
                    <button
                      className="bg-red-500 px-2 py-1 rounded hover:bg-red-600"
                      onClick={() => {
                        onEliminar(j.ID);
                        mostrarToast("Jugador eliminado");
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
      {jugadorEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-md flex flex-col gap-3">
            <h2 className="text-xl font-semibold mb-4">Editar Jugador</h2>

            <label className="text-sm text-slate-300">Nombre</label>
            <input
              placeholder="Ej: Lionel"
              className="p-2 rounded-lg bg-slate-700 border border-slate-600"
              value={jugadorEdit.Nombre}
              onChange={e => setJugadorEdit(prev => ({ ...prev, Nombre: e.target.value }))}
            />

            <label className="text-sm text-slate-300">Apellidos</label>
            <input
              placeholder="Ej: Messi"
              className="p-2 rounded-lg bg-slate-700 border border-slate-600"
              value={jugadorEdit.Apellidos}
              onChange={e => setJugadorEdit(prev => ({ ...prev, Apellidos: e.target.value }))}
            />

            <label className="text-sm text-slate-300">Nickname</label>
            <input
              placeholder="Apodo o alias"
              className="p-2 rounded-lg bg-slate-700 border border-slate-600"
              value={jugadorEdit.Nickname}
              onChange={e => setJugadorEdit(prev => ({ ...prev, Nickname: e.target.value }))}
            />

            <label className="text-sm text-slate-300">Equipo</label>
            <select
              className="p-2 rounded-lg bg-slate-700 border border-slate-600"
              value={jugadorEdit.IdEquipo}
              onChange={e => setJugadorEdit(prev => ({ ...prev, IdEquipo: parseInt(e.target.value) }))}
            >
              <option value="">Selecciona el equipo</option>
              {equipos.map(e => <option key={e.ID} value={e.ID}>{e.Nombre}</option>)}
            </select>

            <label className="text-sm text-slate-300">Posición</label>
            <select
              className="p-2 rounded-lg bg-slate-700 border border-slate-600"
              value={jugadorEdit.IdPosicion}
              onChange={e => setJugadorEdit(prev => ({ ...prev, IdPosicion: parseInt(e.target.value) }))}
            >
              <option value="">Selecciona la posición</option>
              {posiciones.map(p => <option key={p.ID} value={p.ID}>{p.Nombre}</option>)}
            </select>

            {/* Estadísticas */}
            <label className="text-sm text-slate-300 mt-2">Estadísticas</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-slate-400">Goles</label>
                <input
                  type="number"
                  className="p-2 rounded-lg bg-slate-700 border border-slate-600 w-full"
                  value={jugadorEdit.Goles || 0}
                  onChange={e => setJugadorEdit(prev => ({ ...prev, Goles: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-400">Asistencias</label>
                <input
                  type="number"
                  className="p-2 rounded-lg bg-slate-700 border border-slate-600 w-full"
                  value={jugadorEdit.Asistencias || 0}
                  onChange={e => setJugadorEdit(prev => ({ ...prev, Asistencias: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-slate-400">Tarjetas Amarillas (TA)</label>
                <input
                  type="number"
                  className="p-2 rounded-lg bg-slate-700 border border-slate-600 w-full"
                  value={jugadorEdit.TA || 0}
                  onChange={e => setJugadorEdit(prev => ({ ...prev, TA: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-400">Tarjetas Rojas (TR)</label>
                <input
                  type="number"
                  className="p-2 rounded-lg bg-slate-700 border border-slate-600 w-full"
                  value={jugadorEdit.TR || 0}
                  onChange={e => setJugadorEdit(prev => ({ ...prev, TR: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 mt-4">
              <button className="bg-red-500 px-4 py-2 rounded hover:bg-red-600" onClick={() => setJugadorEdit(null)}>
                Cancelar
              </button>
              <button
                className="bg-emerald-500 px-4 py-2 rounded hover:bg-emerald-600"
                onClick={async () => {
                  await onEditar(
                    jugadorEdit.ID,
                    jugadorEdit.Nombre,
                    jugadorEdit.Apellidos,
                    jugadorEdit.Nickname,
                    jugadorEdit.IdEquipo,
                    jugadorEdit.IdPosicion,
                    parseInt(jugadorEdit.Goles) || 0,
                    parseInt(jugadorEdit.Asistencias) || 0,
                    parseInt(jugadorEdit.TA) || 0,
                    parseInt(jugadorEdit.TR) || 0
                  );
                  setJugadorEdit(null);
                  mostrarToast("Jugador editado con éxito");
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// -----------------------------
// Sección Partidos
// -----------------------------
function SeccionPartidos({ partidos, equipos, onCrear, onEditar, onEliminar, onResultado }) {
  const [local,setLocal]=useState("");
  const [visitante,setVisitante]=useState("");
  const [fecha,setFecha]=useState("");

  return (
    <div className="flex flex-col gap-8">
      {/* Crear */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-md max-w-4xl">
        <h2 className="text-xl font-semibold mb-4">Crear Partido</h2>
        <div className="flex flex-row gap-4 items-end">
          <select className="flex-1 px-3 py-2 rounded-lg bg-slate-700 border border-slate-600" onChange={e=>setLocal(parseInt(e.target.value))} value={local}>
            <option value="">Equipo Local</option>
            {equipos.map(e=><option key={e.ID} value={e.ID}>{e.Nombre}</option>)}
          </select>
          <select className="flex-1 px-3 py-2 rounded-lg bg-slate-700 border border-slate-600" onChange={e=>setVisitante(parseInt(e.target.value))} value={visitante}>
            <option value="">Equipo Visitante</option>
            {equipos.map(e=><option key={e.ID} value={e.ID}>{e.Nombre}</option>)}
          </select>
          <input type="datetime-local" className="flex-1 px-3 py-2 rounded-lg bg-slate-700 border border-slate-600" onChange={e=>setFecha(e.target.value)} value={fecha} />
          <button onClick={()=>{
            if(!local||!visitante||!fecha) return alert("Completa datos");
            onCrear(local,visitante,fecha);
            setLocal(""); setVisitante(""); setFecha("");
          }} className="bg-emerald-500 py-3 px-8 rounded-xl hover:bg-emerald-600 transition font-semibold">Guardar</button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-slate-900 p-6 rounded-2xl shadow-xl overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Listado de Partidos</h2>
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-2 text-center">Local</th>
              <th className="px-4 py-2 text-center">Visitante</th>
              <th className="px-4 py-2 text-center">Fecha</th>
              <th className="px-4 py-2 text-center">Goles Local</th>
              <th className="px-4 py-2 text-center">Goles Visitante</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-slate-900 divide-y divide-slate-700">
            {partidos?.map(m => (
              <tr key={m.ID}>
                <td className="px-4 py-2 text-center">{m.local?.Nombre || "Equipo desconocido"}</td>
                <td className="px-4 py-2 text-center">{m.visitante?.Nombre || "Equipo desconocido"}</td>
                <td className="px-4 py-2 text-center">{new Date(m.Fecha).toLocaleString()}</td>
                <td className="px-4 py-2 text-center">
                  <input type="number" className="w-16 p-1 rounded bg-slate-800 text-center"
                        defaultValue={m.GolesLocal} 
                        onChange={e => m.GolesLocal = parseInt(e.target.value)} />
                </td>
                <td className="px-4 py-2 text-center">
                  <input type="number" className="w-16 p-1 rounded bg-slate-800 text-center"
                        defaultValue={m.GolesVisitante} 
                        onChange={e => m.GolesVisitante = parseInt(e.target.value)} />
                </td>
                <td className="px-4 py-2 text-center">
                  <button 
                    className="bg-emerald-500 px-3 py-1 rounded hover:bg-emerald-600"
                    onClick={()=>onResultado(m)}
                  >
                    Registrar Resultado
                  </button>
                  <button 
                    className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 ml-2"
                    onClick={()=>onEliminar(m.ID)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// // -----------------------------
// // Sección Clasificación
// // -----------------------------
// function SeccionClasificacion({ clasificacion }) {
//   return (
//     <div className="overflow-x-auto bg-slate-900 p-6 rounded-2xl shadow-xl">
//       <h2 className="text-xl font-semibold mb-4">Clasificación</h2>
//       <table className="min-w-full divide-y divide-slate-700">
//         <thead className="bg-slate-800">
//           <tr>
//             <th className="px-4 py-2 text-left">Equipo</th>
//             <th className="px-4 py-2 text-center">Puntos</th>
//             <th className="px-4 py-2 text-center">PJ</th>
//             <th className="px-4 py-2 text-center">V</th>
//             <th className="px-4 py-2 text-center">E</th>
//             <th className="px-4 py-2 text-center">D</th>
//             <th className="px-4 py-2 text-center">GF</th>
//             <th className="px-4 py-2 text-center">GC</th>
//           </tr>
//         </thead>
//         <tbody className="bg-slate-900 divide-y divide-slate-700">
//           {clasificacion?.map(c => (
//             <tr key={c.EquipoID}>
//               <td className="px-4 py-2">{c.EquipoID?.Nombre}</td>
//               <td className="px-4 py-2 text-center">{c.Puntos}</td>
//               <td className="px-4 py-2 text-center">{c.PartidosJugados}</td>
//               <td className="px-4 py-2 text-center">{c.Victorias}</td>
//               <td className="px-4 py-2 text-center">{c.Empates}</td>
//               <td className="px-4 py-2 text-center">{c.Derrotas}</td>
//               <td className="px-4 py-2 text-center">{c.GolesFavor}</td>
//               <td className="px-4 py-2 text-center">{c.GolesContra}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

