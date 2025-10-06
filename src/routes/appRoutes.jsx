import Login from "../pages/login/Login";
import Home from "../pages/home/Home";
import NuevoProyecto from "../pages/nuevoProyecto/NuevoProyecto";
import AsignarSupervisor from "../pages/AsignarSupervisor";
//replanteo
import ReplanteoPage from "../pages/replanteo/ReplanteoPage";
import ListaProyectosReplanteo from "../pages/replanteo/ListaProyectosReplanteo";
import ListaProyectosEjecucion from "../pages/ejecucionDiaria/ListaProyectosEjecucion";
import ReplanteoPageV2 from "../pages/replanteo/ReplanteoPageV2";
//gestion reserva
import ListaProyectoGestionReserva from "../pages/gestionReserva/listaProyectoGestioReserva";
import GestionReserva from "../pages/gestionReserva/gestionReserva";
//ejecucionDiaria
import EjecucionDiaria from "../pages/ejecucionDiaria/EjecucionDiaria";
import BitacoraFinal from "../pages/ejecucionDiaria/BitacoraFinal";
import ValidacionDocumentos from "../pages/ejecucionDiaria/ValidacionDocumentos";
//rdo
import ListaProyectosRdoConci from "../pages/rdo/ListaProyectosRdoConci";
import RdoPage from "../pages/rdo/RdoPage";
//proyectos generales
import ListaProyectosGenerales from "../pages/proyectos/ListaProyectosGeneral";
import ProyectoDetalles from "../pages/proyectos/ProyectosDetalles";
//Reporte
import ReportePage from "../pages/reporte/ReportePage";
import ListaProyectoHoras from "../pages/reporte/ListaProyectoHoras";
//lista configuraciones
import Configuracion from "../pages/configuracion/configuracion";
import EstadosProyectos from "../pages/configuracion/EstadosProyectos/estadosProyectos";

//planificaciones
import ListaPlanificacion from "../pages/planificacion/listaPlanificacion";
import CargarAlcancesPreliminares from "../pages/planificacion/cargarAlcancesPreliminares";
import VerSolpedsCorrelativo from "../pages/planificacion/verSolpedsCorrelativo";
import CargaSolpedsMasiva from "../pages/planificacion/cargaSolpedsMasiva";
import CargaPoMasiva from "../pages/planificacion/cargaPoMasiva";
import PendientePlanifacion from "../pages/planificacion/pendientePlanificacion";
//Miscelane
import ListaContratistaPage from "../pages/miscelaneo/contratista/listaContratistaPage";
import ListaSitios from "../pages/miscelaneo/sitios/listaSitios";
//conciliacion materiales
import ListaConciliacionMateriales from "../pages/conciliacionMateriales/ListaConciliacionMateriales";
import DetallesConciliacionMateriales from "../pages/conciliacionMateriales/detallesConciliacionMateriales";
//liquidacion de proyectos
import ListaProyectosLiquidar from "../pages/liquidacion/listaProyectosLiquidar";
import DetallesParaLiquidar from "../pages/liquidacion/detallesParaLiquidar";
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
    path: "/lista-proyectos-replanteo/replanteo-v2/:ticketCode",
    element: <ReplanteoPageV2 />,
    isPrivate: true,
  },
  //gestion reserva
  {
    path: "/lista-proyectos-gestion-reserva",
    element: <ListaProyectoGestionReserva />,
    isPrivate: true,
  },
  {
    path: "/lista-proyectos-gestion-reserva/gestion-reserva/:ticketCode",
    element: <GestionReserva />,
    isPrivate: true,
  },
  //ejecucionDiaria
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
  //planificacion
  {
    path: "/lista-proyectos-planificacion",
    element: <ListaPlanificacion />,
    isPrivate: true,
  },
  {
    path: "/lista-proyectos-planificacion/alances-preliminares/:ticketCode",
    element: <CargarAlcancesPreliminares />,
    isPrivate: true,
  },
  {
    path: "/lista-proyectos-planificacion/ver-solpeds/:ticketCode",
    element: <VerSolpedsCorrelativo />,
    isPrivate: true,
  },
  {
    path: "/lista-proyectos-planificacion/carga-solpeds-masiva",
    element: <CargaSolpedsMasiva />,
    isPrivate: true,
  },
  {
    path: "/lista-proyectos-planificacion/carga-po-masiva",
    element: <CargaPoMasiva />,
    isPrivate: true,
  },
  {
    path: "/lista-proyectos-planificacion/pendiente-planificacion/:ticketCode",
    element: <PendientePlanifacion />,
    isPrivate: true,
  },
  //miscelaneo
  {
    path: "/lista-contratistas",
    element: <ListaContratistaPage />,
    isPrivate: true,
  },
  {
    path: "/lista-sitios",
    element: <ListaSitios />,
    isPrivate: true,
  },
  //conciliacion materiales  DetallesConciliacionMateriales
  {
    path: "/lista-conciliacion-materiales",
    element: <ListaConciliacionMateriales />,
    isPrivate: true,
  },
  {
    path: "/lista-conciliacion-materiales/detalles/:ticketCode",
    element: <DetallesConciliacionMateriales />,
    isPrivate: true,
  },
  //liquidacion de proyectos
  {
    path: "/lista-liquidacion-proyectos",
    element: <ListaProyectosLiquidar />,
    isPrivate: true,
  },
  {
    path: "/lista-liquidacion-proyectos/detalles-para-liquidar/:ticketCode",
    element: <DetallesParaLiquidar />,
    isPrivate: true,
  },
];

export default appRoutes;
