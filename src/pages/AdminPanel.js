import { useEffect, useState, useMemo } from "react";
import { supabase } from "../services/supabaseClient";
import { actualizarClasificacion } from "../utils/updateStandings";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("Equipos"); 
  const [equipos, setEquipos] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [posiciones, setPosiciones] = useState([]);
  const [partidoEdit, setPartidoEdit] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) navigate("/login");
    else setUser(JSON.parse(stored));
    fetchAll();
  }, []);

  async function fetchAll() {
    const { data: e } = await supabase.from("Equipos").select("*");
    setEquipos(e || []);

    const { data: j } = await supabase.from("Jugadores").select("*");
    setJugadores(j || []);

    const { data: p } = await supabase.from("Partidos").select("*");
    const partidosConEquipos = (p || []).map(match => {
      const local = e.find(eq => eq.ID === match.IdEquipoLocal) || null;
      const visitante = e.find(eq => eq.ID === match.IdEquipoVisitante) || null;
      return { ...match, local, visitante };
    });
    setPartidos(partidosConEquipos);

    const { data: pos } = await supabase.from("Posiciones").select("*");
    setPosiciones(pos || []);
  }

  // -----------------------------
  // CRUD Equipos
  // -----------------------------
  async function crearEquipo(nombre, logo) {
    const { data: equipo, error } = await supabase.from("Equipos")
      .insert([{ Nombre: nombre, LogoURL: logo }])
      .select().single();
    if(error) return alert(error.message);

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

    toast.success("Equipo creado 🎉");
    fetchAll();
  }

  async function editarEquipo(id, nombre, logo) {
    const { error } = await supabase.from("Equipos").update({ Nombre: nombre, LogoURL: logo }).eq("ID", id);
    if(error) return alert(error.message);
    toast.success("Equipo editado 🎉");
    fetchAll();
  }

  async function eliminarEquipo(id) {
    if(!window.confirm("¿Eliminar este equipo?")) return;
    const { error } = await supabase.from("Equipos").delete().eq("ID", id);
    if(error) return alert(error.message);
    toast.success("Equipo eliminado 🎉");
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
    if(error) return alert(error.message);
    toast.success("Jugador creado 🎉");
    fetchAll();
  }

  async function editarJugador(id, nombre, apellidos, nickname, equipoID, posicionID, goles, asistencias, ta, tr) {
    const { error } = await supabase.from("Jugadores").update({
      Nombre: nombre, Apellidos: apellidos, Nickname: nickname, IdEquipo: equipoID, IdPosicion: posicionID,
      Goles: parseInt(goles) || 0,
      Asistencias: parseInt(asistencias) || 0,
      TA: parseInt(ta) || 0,
      TR: parseInt(tr) || 0
    }).eq("ID", id);
    if(error) return alert(error.message);
    toast.success("Jugador editado 🎉");
    fetchAll();
  }

  async function eliminarJugador(id) {
    if(!window.confirm("¿Eliminar este jugador?")) return;
    const { error } = await supabase.from("Jugadores").delete().eq("ID", id);
    if(error) return alert(error.message);
    toast.success("Jugador eliminado 🎉");
    fetchAll();
  }

  // -----------------------------
  // CRUD Partidos
  // -----------------------------
  async function crearPartido(localID, visitanteID, fecha) {
    const { error } = await supabase.from("Partidos").insert([{ IdEquipoLocal: localID, IdEquipoVisitante: visitanteID, Fecha: fecha, Terminado: false }]);
    if(error) return alert(error.message);
    toast.success("Partido creado 🎉");
    fetchAll();
  }

  async function editarPartido(id, localID, visitanteID, fecha) {
    const { error } = await supabase.from("Partidos").update({ IdEquipoLocal: localID, IdEquipoVisitante: visitanteID, Fecha: fecha }).eq("ID", id);
    if(error) return alert(error.message);
    toast.success("Partido editado 🎉");
    fetchAll();
  }

  async function eliminarPartido(id) {
    if(!window.confirm("¿Eliminar este partido?")) return;
    const { error } = await supabase.from("Partidos").delete().eq("ID", id);
    if(error) return alert(error.message);
    toast.success("Partido eliminado 🎉");
    fetchAll();
  }

  async function registrarResultado(match) {
    if(match.GolesLocal == null || match.GolesVisitante == null) return alert("Introduce goles");
    const { error } = await supabase.from("Partidos")
      .update({ GolesLocal: match.GolesLocal, GolesVisitante: match.GolesVisitante, Terminado: true })
      .eq("ID", match.ID);
    if(error) return alert(error.message);

    toast.success("Resultado registrado 🎉");
    fetchAll();
  }

  if(!user) return null;

  return (
    <div className="p-4 sm:p-10 min-h-screen bg-slate-950 text-white">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Hola {user.Nombre}</h1>
        <button onClick={() => { localStorage.removeItem("user"); navigate("/login"); }}
          className="bg-red-500 px-4 py-2 rounded-xl hover:bg-red-600 transition">
          Logout
        </button>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
        {["Equipos","Jugadores","Partidos"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl ${tab===t?"bg-emerald-500":"bg-slate-800 hover:bg-slate-700"} transition`}>
            {t}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-xl overflow-x-auto">
        {tab==="Equipos" && <SeccionEquipos equipos={equipos} onCrear={crearEquipo} onEditar={editarEquipo} onEliminar={eliminarEquipo} />}
        {tab==="Jugadores" && <SeccionJugadores jugadores={jugadores} equipos={equipos} posiciones={posiciones} onCrear={crearJugador} onEditar={editarJugador} onEliminar={eliminarJugador} />}
        {tab==="Partidos" && <SeccionPartidos partidos={partidos} equipos={equipos} onCrear={crearPartido} onEditar={editarPartido} onEliminar={eliminarPartido} onResultado={registrarResultado} />}
      </div>
    </div>
  );
}

// -----------------------------
// Sección Equipos
// -----------------------------
function SeccionEquipos({ equipos, onCrear, onEditar, onEliminar }) {
  const [nombre, setNombre] = useState("");
  const [logo, setLogo] = useState("");
  const [equipoEdit, setEquipoEdit] = useState(null);

  return (
    <div className="flex flex-col gap-8 relative">
      {/* Crear */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-md max-w-4xl">
        <h2 className="text-xl font-semibold mb-4">Crear Equipo</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <input placeholder="Nombre" value={nombre} onChange={e=>setNombre(e.target.value)}
            className="flex-1 min-w-[120px] p-2 rounded-lg bg-slate-700 border border-slate-600"/>
          <input placeholder="Logo URL" value={logo} onChange={e=>setLogo(e.target.value)}
            className="flex-1 min-w-[120px] p-2 rounded-lg bg-slate-700 border border-slate-600"/>
          <button className="bg-emerald-500 py-2 px-6 rounded-xl hover:bg-emerald-600 transition font-semibold"
            onClick={()=>{ if(!nombre) return alert("Completa nombre"); onCrear(nombre,logo); setNombre(""); setLogo(""); }}>
            Guardar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-slate-900 p-4 rounded-2xl shadow-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Logo</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-slate-900 divide-y divide-slate-700">
            {equipos.map(e=>(
              <tr key={e.ID}>
                <td className="px-4 py-2">{e.Nombre}</td>
                <td className="px-4 py-2">{e.LogoURL && <img src={e.LogoURL} alt={e.Nombre} className="w-10 h-10 rounded object-cover"/>}</td>
                <td className="px-4 py-2 text-center">
                  <button className="bg-yellow-500 px-2 py-1 rounded hover:bg-yellow-600 mr-2"
                    onClick={()=>setEquipoEdit(e)}>Editar</button>
                  <button className="bg-red-500 px-2 py-1 rounded hover:bg-red-600" onClick={()=>onEliminar(e.ID)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {equipoEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-md flex flex-col gap-3">
            <h2 className="text-xl font-semibold mb-4">Editar Equipo</h2>

            <label className="text-sm text-slate-300">Nombre</label>
            <input value={equipoEdit.Nombre} onChange={e => setEquipoEdit(prev => ({ ...prev, Nombre: e.target.value }))}
              className="p-2 rounded-lg bg-slate-700 border border-slate-600"/>

            <label className="text-sm text-slate-300">Logo URL</label>
            <input value={equipoEdit.LogoURL} onChange={e => setEquipoEdit(prev => ({ ...prev, LogoURL: e.target.value }))}
              className="p-2 rounded-lg bg-slate-700 border border-slate-600"/>

            <div className="flex justify-end gap-3 mt-4">
              <button className="bg-red-500 px-4 py-2 rounded hover:bg-red-600" onClick={() => setEquipoEdit(null)}>Cancelar</button>
              <button className="bg-emerald-500 px-4 py-2 rounded hover:bg-emerald-600"
                onClick={() => { 
                  onEditar(equipoEdit.ID, equipoEdit.Nombre, equipoEdit.LogoURL);
                  setEquipoEdit(null);
                }}>
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
  const [nombre,setNombre]=useState(""); const [apellidos,setApellidos]=useState("");
  const [nickname,setNickname]=useState(""); const [equipo,setEquipo]=useState(""); const [posicion,setPosicion]=useState("");
  const [jugadorEdit,setJugadorEdit]=useState(null);
  const [search,setSearch]=useState(""); const [filtroEquipo,setFiltroEquipo]=useState("");

  const jugadoresFiltrados = useMemo(()=>{
    return jugadores.filter(j=>{
      const nombreCompleto = (j.Nombre + " " + j.Apellidos + " " + j.Nickname).toLowerCase();
      const busquedaValida = nombreCompleto.includes(search.toLowerCase());
      const equipoValido = !filtroEquipo || j.IdEquipo === parseInt(filtroEquipo);
      return busquedaValida && equipoValido;
    });
  },[jugadores,search,filtroEquipo]);

  return (
    <div className="flex flex-col gap-8">
      {/* Crear */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-md flex flex-col gap-4 sm:gap-2">
        <h2 className="text-xl font-semibold mb-2">Crear Jugador</h2>
        <div className="flex flex-wrap gap-2">
          <input placeholder="Nombre" value={nombre} onChange={e=>setNombre(e.target.value)}
            className="flex-1 min-w-[120px] p-2 rounded-lg bg-slate-700 border border-slate-600"/>
          <input placeholder="Apellidos" value={apellidos} onChange={e=>setApellidos(e.target.value)}
            className="flex-1 min-w-[120px] p-2 rounded-lg bg-slate-700 border border-slate-600"/>
          <input placeholder="Nickname" value={nickname} onChange={e=>setNickname(e.target.value)}
            className="flex-1 min-w-[120px] p-2 rounded-lg bg-slate-700 border border-slate-600"/>
          <select value={equipo} onChange={e=>setEquipo(parseInt(e.target.value))}
            className="flex-1 min-w-[120px] p-2 rounded-lg bg-slate-700 border border-slate-600">
            <option value="">Equipo</option>{equipos.map(e=><option key={e.ID} value={e.ID}>{e.Nombre}</option>)}
          </select>
          <select value={posicion} onChange={e=>setPosicion(parseInt(e.target.value))}
            className="flex-1 min-w-[120px] p-2 rounded-lg bg-slate-700 border border-slate-600">
            <option value="">Posición</option>{posiciones.map(p=><option key={p.ID} value={p.ID}>{p.Nombre}</option>)}
          </select>
          <button className="bg-emerald-500 py-2 px-6 rounded-xl hover:bg-emerald-600 transition font-semibold"
            onClick={()=>{ if(!nombre||!equipo||!posicion) return alert("Completa datos"); onCrear(nombre,apellidos,nickname,equipo,posicion); setNombre(""); setApellidos(""); setNickname(""); setEquipo(""); setPosicion(""); }}>
            Crear
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="flex flex-wrap gap-2 items-center">
        <input placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}
          className="p-2 rounded-lg bg-slate-700 border border-slate-600 flex-1 min-w-[120px]"/>
        <select value={filtroEquipo} onChange={e=>setFiltroEquipo(e.target.value)}
          className="p-2 rounded-lg bg-slate-700 border border-slate-600 min-w-[120px]">
          <option value="">Todos los equipos</option>{equipos.map(e=><option key={e.ID} value={e.ID}>{e.Nombre}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-slate-900 p-4 rounded-2xl shadow-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-2 py-2">Nombre</th>
              <th className="px-2 py-2">Apellidos</th>
              <th className="px-2 py-2">Nickname</th>
              <th className="px-2 py-2">Equipo</th>
              <th className="px-2 py-2">Posición</th>
              <th className="px-2 py-2">Goles</th>
              <th className="px-2 py-2">Asistencias</th>
              <th className="px-2 py-2">TA</th>
              <th className="px-2 py-2">TR</th>
              <th className="px-2 py-2">Acciones</th>
            </tr>
          </thead>
                    <tbody className="bg-slate-900 divide-y divide-slate-700">
            {jugadoresFiltrados.map(j => (
              <tr key={j.ID}>
                <td className="px-2 py-1 text-center">{j.Nombre}</td>
                <td className="px-2 py-1 text-center">{j.Apellidos}</td>
                <td className="px-2 py-1 text-center">{j.Nickname}</td>
                <td className="px-2 py-1 text-center">{equipos.find(e => e.ID === j.IdEquipo)?.Nombre}</td>
                <td className="px-2 py-1 text-center">{posiciones.find(p => p.ID === j.IdPosicion)?.Nombre}</td>
                <td className="px-2 py-1 text-center">{j.Goles || 0}</td>
                <td className="px-2 py-1 text-center">{j.Asistencias || 0}</td>
                <td className="px-2 py-1 text-center">{j.TA || 0}</td>
                <td className="px-2 py-1 text-center">{j.TR || 0}</td>
                <td className="px-2 py-1 flex gap-2 justify-center">
                  <button className="bg-yellow-500 px-2 py-1 rounded hover:bg-yellow-600" onClick={()=>setJugadorEdit(j)}>Editar</button>
                  <button className="bg-red-500 px-2 py-1 rounded hover:bg-red-600" onClick={()=>onEliminar(j.ID)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Editar Jugador */}
      {jugadorEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-slate-800 sm:p-6 p-4 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col gap-3">
            <h2 className="text-xl font-semibold mb-4">Editar Jugador</h2>

            <label className="text-sm text-slate-300">Nombre</label>
            <input value={jugadorEdit.Nombre} onChange={e=>setJugadorEdit(prev=>({...prev,Nombre:e.target.value}))} className="p-2 rounded-lg bg-slate-700 border border-slate-600"/>

            <label className="text-sm text-slate-300">Apellidos</label>
            <input value={jugadorEdit.Apellidos} onChange={e=>setJugadorEdit(prev=>({...prev,Apellidos:e.target.value}))} className="p-2 rounded-lg bg-slate-700 border border-slate-600"/>

            <label className="text-sm text-slate-300">Nickname</label>
            <input value={jugadorEdit.Nickname} onChange={e=>setJugadorEdit(prev=>({...prev,Nickname:e.target.value}))} className="p-2 rounded-lg bg-slate-700 border border-slate-600"/>

            <label className="text-sm text-slate-300">Goles</label>
            <input type="number" value={jugadorEdit.Goles||0} onChange={e=>setJugadorEdit(prev=>({...prev,Goles:e.target.value}))} className="p-2 rounded-lg bg-slate-700 border border-slate-600"/>

            <label className="text-sm text-slate-300">Asistencias</label>
            <input type="number" value={jugadorEdit.Asistencias||0} onChange={e=>setJugadorEdit(prev=>({...prev,Asistencias:e.target.value}))} className="p-2 rounded-lg bg-slate-700 border border-slate-600"/>

            <label className="text-sm text-slate-300">Tarjetas Amarillas</label>
            <input type="number" value={jugadorEdit.TA||0} onChange={e=>setJugadorEdit(prev=>({...prev,TA:e.target.value}))} className="p-2 rounded-lg bg-slate-700 border border-slate-600"/>

            <label className="text-sm text-slate-300">Tarjetas Rojas</label>
            <input type="number" value={jugadorEdit.TR||0} onChange={e=>setJugadorEdit(prev=>({...prev,TR:e.target.value}))} className="p-2 rounded-lg bg-slate-700 border border-slate-600"/>

            <label className="text-sm text-slate-300">Equipo</label>
            <select value={jugadorEdit.IdEquipo} onChange={e=>setJugadorEdit(prev=>({...prev,IdEquipo:parseInt(e.target.value)}))} className="p-2 rounded-lg bg-slate-700 border border-slate-600">
              {equipos.map(e=><option key={e.ID} value={e.ID}>{e.Nombre}</option>)}
            </select>

            <label className="text-sm text-slate-300">Posición</label>
            <select value={jugadorEdit.IdPosicion} onChange={e=>setJugadorEdit(prev=>({...prev,IdPosicion:parseInt(e.target.value)}))} className="p-2 rounded-lg bg-slate-700 border border-slate-600">
              {posiciones.map(p=><option key={p.ID} value={p.ID}>{p.Nombre}</option>)}
            </select>

            <div className="flex justify-end gap-3 mt-4">
              <button className="bg-red-500 px-4 py-2 rounded hover:bg-red-600" onClick={()=>setJugadorEdit(null)}>Cancelar</button>
              <button className="bg-emerald-500 px-4 py-2 rounded hover:bg-emerald-600"
                onClick={()=>{ 
                  onEditar(jugadorEdit.ID,jugadorEdit.Nombre,jugadorEdit.Apellidos,jugadorEdit.Nickname,jugadorEdit.IdEquipo,jugadorEdit.IdPosicion,jugadorEdit.Goles,jugadorEdit.Asistencias,jugadorEdit.TA,jugadorEdit.TR);
                  setJugadorEdit(null);
                }}>
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
  const [local,setLocal]=useState(""); const [visitante,setVisitante]=useState(""); const [fecha,setFecha]=useState("");
  const [partidoEdit,setPartidoEdit]=useState(null);

  function formatoFechaHora(fechaStr) {
      const fecha = new Date(fechaStr);
      const hoy = new Date();
      const manana = new Date();
      manana.setDate(hoy.getDate() + 1);

      // Quitar horas/minutos/segundos para comparar solo fechas
      const mismaFecha = (a, b) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

      // Formato hora HH:mm
      const hora = fecha.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

      if (mismaFecha(fecha, hoy)) return `Hoy ${hora}`;
      if (mismaFecha(fecha, manana)) return `Mañana ${hora}`;

      // Formato dd/mm/yyyy HH:mm
      const fechaFormateada = fecha.toLocaleDateString("es-ES");
      return `${fechaFormateada} ${hora}`;
    }

  return (
    <div className="flex flex-col gap-8">
      {/* Crear Partido */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-md flex flex-wrap gap-4 items-end">
        <select value={local} onChange={e=>setLocal(parseInt(e.target.value))} className="p-2 rounded-lg bg-slate-700 border border-slate-600 min-w-[120px]">
          <option value="">Equipo Local</option>{equipos.map(e=><option key={e.ID} value={e.ID}>{e.Nombre}</option>)}
        </select>
        <select value={visitante} onChange={e=>setVisitante(parseInt(e.target.value))} className="p-2 rounded-lg bg-slate-700 border border-slate-600 min-w-[120px]">
          <option value="">Equipo Visitante</option>{equipos.map(e=><option key={e.ID} value={e.ID}>{e.Nombre}</option>)}
        </select>
        <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600"/>
        <button className="bg-emerald-500 py-2 px-6 rounded-xl hover:bg-emerald-600 transition font-semibold"
          onClick={()=>{ if(!local||!visitante||!fecha) return alert("Completa datos"); onCrear(local,visitante,fecha); setLocal(""); setVisitante(""); setFecha(""); }}>
          Crear
        </button>
      </div>

      {/* Tabla Partidos */}
      <div className="bg-slate-900 p-4 rounded-2xl shadow-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-2 py-2">Local</th>
              <th className="px-2 py-2">Visitante</th>
              <th className="px-2 py-2">Fecha</th>
              <th className="px-2 py-2">Resultado</th>
              <th className="px-2 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-slate-900 divide-y divide-slate-700">
            {partidos.map(p=>(
              <tr key={p.ID}>
                <td className="px-2 py-1 text-center">{p.local?.Nombre}</td>
                <td className="px-2 py-1 text-center">{p.visitante?.Nombre}</td>
                <td className="px-2 py-1 text-center">{formatoFechaHora(p.Fecha)}</td>
                <td className="px-2 py-1 text-center">
                  {p.Terminado ? `${p.GolesLocal} - ${p.GolesVisitante}` : "Por definir"}
                </td>
                <td className="px-2 py-1 flex gap-2 justify-center">
                  <button className="bg-yellow-500 px-2 py-1 rounded hover:bg-yellow-600" onClick={()=>setPartidoEdit(p)}>Editar</button>
                  <button className="bg-red-500 px-2 py-1 rounded hover:bg-red-600" onClick={()=>onEliminar(p.ID)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Editar Partido */}
      {partidoEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-md flex flex-col gap-3">
            <h2 className="text-xl font-semibold mb-4">Editar Partido</h2>

            <label className="text-sm text-slate-300">Equipo Local</label>
            <select value={partidoEdit.IdEquipoLocal} onChange={e => setPartidoEdit(prev => ({ ...prev, IdEquipoLocal: parseInt(e.target.value) }))} className="p-2 rounded-lg bg-slate-700 border border-slate-600">
              {equipos.map(e => <option key={e.ID} value={e.ID}>{e.Nombre}</option>)}
            </select>

            <label className="text-sm text-slate-300">Equipo Visitante</label>
            <select value={partidoEdit.IdEquipoVisitante} onChange={e => setPartidoEdit(prev => ({ ...prev, IdEquipoVisitante: parseInt(e.target.value) }))} className="p-2 rounded-lg bg-slate-700 border border-slate-600">
              {equipos.map(e => <option key={e.ID} value={e.ID}>{e.Nombre}</option>)}
            </select>

            <label className="text-sm text-slate-300">Fecha</label>
            <input type="datetime-local" value={partidoEdit.Fecha} onChange={e => setPartidoEdit(prev => ({ ...prev, Fecha: e.target.value }))} className="p-2 rounded-lg bg-slate-700 border border-slate-600"/>

            <div className="flex gap-4">
              <div className="flex-1 flex flex-col">
                <label className="text-sm text-slate-300">Goles Local</label>
                <input
                  type="number"
                  value={partidoEdit.GolesLocal ?? ""}
                  onChange={e => setPartidoEdit(prev => ({ ...prev, GolesLocal: parseInt(e.target.value) || 0 }))}
                  className="p-2 rounded-lg bg-slate-700 border border-slate-600"
                />
              </div>

              <div className="flex-1 flex flex-col">
                <label className="text-sm text-slate-300">Goles Visitante</label>
                <input
                  type="number"
                  value={partidoEdit.GolesVisitante ?? ""}
                  onChange={e => setPartidoEdit(prev => ({ ...prev, GolesVisitante: parseInt(e.target.value) || 0 }))}
                  className="p-2 rounded-lg bg-slate-700 border border-slate-600"
                />
              </div>
            </div>


            <div className="flex justify-end gap-3 mt-4">
              <button className="bg-red-500 px-4 py-2 rounded hover:bg-red-600" onClick={() => setPartidoEdit(null)}>Cancelar</button>
              <button className="bg-emerald-500 px-4 py-2 rounded hover:bg-emerald-600"
                onClick={async () => {
                  await onEditar(partidoEdit.ID, partidoEdit.IdEquipoLocal, partidoEdit.IdEquipoVisitante, partidoEdit.Fecha);
                  if (partidoEdit.GolesLocal != null && partidoEdit.GolesVisitante != null) {
                    await onResultado(partidoEdit);
                  }
                  setPartidoEdit(null);
                }}>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
