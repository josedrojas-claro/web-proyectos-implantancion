import Login from "../pages/login/Login";
import Home from "../pages/home/Home";
import NuevoProyecto from "../pages/nuevoProyecto/NuevoProyecto";
import AsignarSupervisor from "../pages/AsignarSupervisor";
import ReplanteoPage from "../pages/replanteo/ReplanteoPage";
import ListaProyectosReplanteo from "../pages/replanteo/ListaProyectosReplanteo";
import ListaProyectosEjecucion from "../pages/ejecucionDiaria/ListaProyectosEjecucion";
import EjecucionDiaria from "../pages/ejecucionDiaria/EjecucionDiaria";
import BitacoraFinal from "../pages/ejecucionDiaria/BitacoraFinal";
import ValidacionDocumentos from "../pages/ejecucionDiaria/ValidacionDocumentos";
import ListaProyectosRdoConci from "../pages/rdo/ListaProyectosRdoConci";
import RdoPage from "../pages/rdo/RdoPage";
import ListaProyectosGenerales from "../pages/proyectos/ListaProyectosGeneral";
import ProyectoDetalles from "../pages/proyectos/ProyectosDetalles";
import ReportePage from "../pages/reporte/ReportePage";
import ListaProyectoHoras from "../pages/reporte/ListaProyectoHoras";
//lista configuraciones
import Configuracion from "../pages/configuracion/configuracion";
import EstadosProyectos from "../pages/configuracion/EstadosProyectos/estadosProyectos";
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
  {
    path: "/lista-proyectos-ejecucion/ejecucion-diaria/bitacora-final/:ticketCode",
    element: <BitacoraFinal />,
    isPrivate: true,
  },
  {
    path: "/lista-proyectos-ejecucion/validacion-documentos/:ticketCode",
    element: <ValidacionDocumentos />,
    isPrivate: true,
  },
  {
    path: "/lista-proyectos-rdo-conciliacion-materiales",
    element: <ListaProyectosRdoConci />,
    isPrivate: true,
  },
  {
    path: "/lista-proyectos-rdo-conciliacion-materiales/rdo/:ticketCode",
    element: <RdoPage />,
    isPrivate: true,
  },
  {
    path: "/lista-proyectos-generales",
    element: <ListaProyectosGenerales />,
    isPrivate: true,
  },
  {
    path: "/lista-proyectos-generales/detalles/:ticketCode",
    element: <ProyectoDetalles />,
    isPrivate: true,
  },
  {
    path: "/reporte-horas-retraso",
    element: <ReportePage />,
    isPrivate: true,
  },
  {
    path: "/lista-proyectos-reporte-horas-retraso",
    element: <ListaProyectoHoras />,
    isPrivate: true,
  },
  //configuraciones
  {
    path: "/configuraciones",
    element: <Configuracion />,
    isPrivate: true,
  },
  {
    path: "/configuraciones/estados",
    element: <EstadosProyectos />,
    isPrivate: true,
  },
];

export default appRoutes;
