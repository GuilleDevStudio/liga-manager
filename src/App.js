import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Clasificacion from "./pages/Clasificacion";
import Calendario from "./pages/Calendario";
import Estadisticas from "./pages/Estadisticas";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />

        <Routes>
          <Route path="/" element={<Clasificacion />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
