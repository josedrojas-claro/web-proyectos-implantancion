import Login from "../pages/login/Login";
import Home from "../pages/home/Home";
import NuevoProyecto from "../pages/nuevoProyecto/NuevoProyecto";
import AsignarSupervisor from "../pages/AsignarSupervisor";
import ReplanteoPage from "../pages/replanteo/ReplanteoPage";
import ListaProyectosReplanteo from "../pages/replanteo/ListaProyectosReplanteo";
import ListaProyectosEjecucion from "../pages/ejecucionDiaria/ListaProyectosEjecucion";
import EjecucionDiaria from "../pages/ejecucionDiaria/EjecucionDiaria";

const appRoutes = [
  { path: "/login", element: <Login />, isPrivate: false },
  {
    path: "/home",
    element: <Home />,
    isPrivate: true,
  },
  {
    path: "/nuevo-proyecto",
    element: <NuevoProyecto />,
    isPrivate: true,
  },
  {
    path: "/asignar-supervisor",
    element: <AsignarSupervisor />,
    isPrivate: true,
  },
  {
    path: "/lista-proyectos-replanteo",
    element: <ListaProyectosReplanteo />,
    isPrivate: true,
  },
  {
    path: "/replanteo/:ticketCode",
    element: <ReplanteoPage />,
    isPrivate: true,
  },
  {
    path: "/lista-proyectos-ejecucion",
    element: <ListaProyectosEjecucion />,
    isPrivate: true,
  },
  {
    path: "/lista-proyectos-ejecucion/ejecucion-diaria/:ticketCode",
    element: <EjecucionDiaria />,
    isPrivate: true,
  },
];

export default appRoutes;
