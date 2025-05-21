import Login from "../pages/login/Login";
import Home from "../pages/home/Home";
import NuevoProyecto from "../pages/nuevoProyecto/NuevoProyecto";
import AsignarSupervisor from "../pages/AsignarSupervisor";

const appRoutes = [
  { path: "/login", element: <Login />, isPrivate: false },
  { path: "/home", element: <Home />, isPrivate: true },
  { path: "/nuevo-proyecto", element: <NuevoProyecto />, isPrivate: true },
  { path: "/asignar-supervisor", element: <AsignarSupervisor />, isPrivate: true },
];

export default appRoutes;
