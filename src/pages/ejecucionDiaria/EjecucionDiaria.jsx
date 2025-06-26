import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useParams, useLocation } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import {
  Box,
  CircularProgress,
  TextField,
  Divider,
  Slider,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";

import DialogSolicitarServicio from "./components/DialogSolictarServicio";
import DialogSolicitarMaterial from "./components/DialogSolictarMaterial";
//importa funcion para traer los servicio asignados
import { fetchServiciosAsignadosByProyecto } from "../../services/serviciosServices";
//importa funcion para traer los materiales asignados
import { fetchMaterialesAsignadosByProyecto } from "../../services/materialesServices";
//funcion para optener y crear las ejecucionDiarias
import { fetchEjecucionDiaria, createEjecucionDiaria } from "../../services/ejecucionDiariaServices";
//componete general para mostar los servicios y materiales
import FormularioSerMate from "../../components/FormularioSerMate";
//componete para ver las ejecuciones, solo es para este page
import EjecucionDiariaList from "./components/EjecucionDiariaList";
//funcion para optener el role
import { useAuthUser } from "../../services/authServices";
import {
  fetchServiciosSoclitados,
  fetchMaterialesSolicitados,
  deleteSolictdAproRecha,
} from "../../services/aproServiMate";
import SolicitudCard from "./components/SolicitudCard";

const EjecucionDiaria = () => {
  const { ticketCode } = useParams();
  const location = useLocation();
  const proyecto = location.state?.proyecto;

  const user = useAuthUser();

  //variable para abrir la alerta
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // valores posibles: "success", "warning", "error"
  });

  //cargar de servicios y materiales asignados al proyecto
  const [serviciosAsignados, setServiciosAsignados] = useState([]);
  const [materialesAsingados, setMaterialesAsingados] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  //cargar ejecuición diaria del proyecto
  const [ejecucionDiaria, setEjecucionDiaria] = useState([]);

  //variables para el slider de procentaje de ejecucion
  const [ultimoPorcentajeAprobado, setUltimoPorcentajeAprobado] = useState(0);
  const [porcentajeActual, setPorcentajeActual] = useState(ultimoPorcentajeAprobado);

  //variables para abrir el dialog
  const [openDialogConfirmar, setOpenDialogConfirmar] = useState(false);
  const [comentario, setComentario] = useState("");

  // //cargar solicitudes de servicios y materiales
  const [serviciosSolicitados, setServiciosSolicitados] = useState([]);
  const [materialesSolicitados, setMaterialesSolicitados] = useState([]);

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const servicios = await fetchServiciosAsignadosByProyecto(proyecto.id);
      const materiales = await fetchMaterialesAsignadosByProyecto(proyecto.id);
      //ejecución diaria
      const ejecucionDiaria = await fetchEjecucionDiaria(proyecto.id);

      //solicitudes de servicios y materiales
      const servicioSoli = await fetchServiciosSoclitados(proyecto.id);
      const materialSoli = await fetchMaterialesSolicitados(proyecto.id);
      const lastApproved = ejecucionDiaria
        .filter((e) => e.estado === "aprobada")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      setUltimoPorcentajeAprobado(lastApproved?.porcenEjecucion || 0);

      setServiciosAsignados(servicios);
      setMaterialesAsingados(materiales);
      setEjecucionDiaria(ejecucionDiaria);
      setServiciosSolicitados(servicioSoli);
      setMaterialesSolicitados(materialSoli);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    } finally {
      setLoadingData(false);
    }
  }, [proyecto?.id]);

  useEffect(() => {
    if (proyecto?.id) {
      fetchData();
    }
  }, [proyecto?.id, fetchData]);

  const handleCantidadChange = (tipo, id, valor) => {
    const setter = tipo === "servicio" ? setServiciosAsignados : setMaterialesAsingados;
    const lista = tipo === "servicio" ? serviciosAsignados : materialesAsingados;

    const actualizada = lista.map((item) => (item.id === id ? { ...item, cantidad: valor } : item));

    setter(actualizada);
  };

  //porcentajes para los colores del sliderr
  const getColor = () => {
    const p = porcentajeActual * 100;
    if (p < 40) return "error"; // rojo
    if (p < 70) return "warning"; // naranja
    return "success"; // verde
  };

  ///funciones para el speed dial para agregar servicio material y ejecucion diaria
  const guardarEjecucion = async () => {
    setOpenDialogConfirmar(false);

    const servicios = serviciosAsignados
      .filter((s) => parseFloat(s.cantidad) > 0)
      .map((s) => ({
        servicioAsignadoId: s.id,
        serviciosId: s.Servicios.id,
        cantidadUsada: parseFloat(s.cantidad),
        proyectoId: proyecto.id,
        userId: user.id,
        contratistaId: proyecto.contratistaId,
      }));

    const materiales = materialesAsingados
      .filter((m) => parseFloat(m.cantidad) > 0)
      .map((m) => ({
        materialesAsignadosId: m.id,
        materialesId: m.material.id,
        cantidadUsada: parseFloat(m.cantidad),
      }));

    try {
      const response = await createEjecucionDiaria(
        proyecto.id,
        comentario,
        user.id,
        porcentajeActual,
        servicios,
        materiales
      );

      setSnackbar({
        open: true,
        message: response.message,
        severity: "success", // verde
      });

      fetchData();
      setComentario("");
    } catch (error) {
      const mensaje = error?.response?.data?.message || "Ocurrió un error al cambiar el estado.";
      setSnackbar({
        open: true,
        message: mensaje,
        severity: error?.response?.status === 409 ? "warning" : "error", // naranja si es 409, rojo si otro error
      });
    }
  };

  //variables para sacar los servicios by contratistas para hacer solicitudes de nuevos

  const [openAgregarServicio, setOpenAgregarServicio] = useState(false);
  const [openAgregarMaterial, setOpenAgregarMaterial] = useState(false);

  const handleEliminarSolicitud = async (id, tipo) => {
    const confirmar = window.confirm("¿Estás seguro que deseas eliminar esta solicitud?", tipo);
    if (!confirmar) return;
    try {
      const response = await deleteSolictdAproRecha(id);
      setSnackbar({
        open: true,
        message: response.message || "Solicitud eliminada con éxito",
        severity: "success",
      });
      // Refrescar las solicitudes después de eliminar

      fetchData();
    } catch (error) {
      console.error("Error al eliminar:", error);
      const msg = error?.response?.data?.message || "Error inesperado al eliminar la solicitud";
      setSnackbar({ open: true, message: msg, severity: "error" });
    }
  };

  const navigate = useNavigate();

  //funcion para navegar a la página de bitacora final
  const cargarBitacoraFinal = (proyecto) => {
    navigate(`/lista-proyectos-ejecucion/ejecucion-diaria/bitacora-final/${proyecto.ticketCode}`, {
      state: { proyecto },
    });
  };

  return (
    <MainLayout>
      <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
        <h3>Ejecución Diaria</h3>
        <p>
          Proyecto: {proyecto?.nombre || "Proyecto no encontrado"} - Ticket: {ticketCode}
        </p>
        <TextField
          label="Comentario de ejecución diaria"
          fullWidth
          multiline
          rows={15}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          sx={{
            maxWidth: 800,
            marginTop: 2,
            marginBottom: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "& fieldset": { borderColor: "#d32f2f" },
              "&:hover fieldset": { borderColor: "#9a0007" },
            },
          }}
        />
        <Box sx={{ width: 400, mt: 2 }}>
          <Typography gutterBottom fontWeight="bold">
            Ultimo % de ejecución diaria: {Math.round(ultimoPorcentajeAprobado * 100)}%
          </Typography>
          <Slider
            color={getColor()} // 🔁 dinámico: rojo, naranja o verde
            value={porcentajeActual}
            onChange={(e, newValue) => setPorcentajeActual(newValue)}
            min={ultimoPorcentajeAprobado}
            max={1}
            step={0.05}
            marks={[
              { value: ultimoPorcentajeAprobado, label: `${Math.round(ultimoPorcentajeAprobado * 100)}%` },
              { value: 1, label: "100%" },
            ]}
            valueLabelDisplay="auto"
          />
        </Box>
        <Box display="flex" justifyContent="center" mt={2} pb={2}>
          {ultimoPorcentajeAprobado === 1 && (
            <Button
              variant="contained"
              color="error"
              size="small"
              sx={{ px: 2, minWidth: "auto" }}
              onClick={() => cargarBitacoraFinal(proyecto)}
            >
              Generar Bitácora Final
            </Button>
          )}
        </Box>
        <Box
          sx={{ display: "flex", flexDirection: "row", gap: 2, mb: 2, flexWrap: "nowrap", justifyContent: "center" }}
        >
          <Button
            variant="contained"
            color="error"
            size="small"
            sx={{ px: 2, minWidth: 170 }}
            onClick={() => {
              if (!comentario.trim()) {
                setSnackbar({
                  open: true,
                  message: "Debe ingresar un comentario antes de guardar la ejecución.",
                  severity: "warning",
                });
                return; // ⛔ no continúa si el campo está vacío
              }
              setOpenDialogConfirmar(true);
            }}
          >
            Añadir Ejecucion
          </Button>
          {/* Botón para abrir diálogo de solicitud de servicio */}
          {user.role !== "contratista" && user.role !== "contratista-lider" && (
            <>
              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{ px: 2, minWidth: 180 }}
                onClick={() => setOpenAgregarServicio(true)}
              >
                Solicitar Servicio
              </Button>

              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{ px: 2, minWidth: 160 }}
                onClick={() => setOpenAgregarMaterial(true)}
              >
                Solicitar material
              </Button>
            </>
          )}
        </Box>
        <Divider sx={{ width: "100%", marginTop: 2 }} />
        {loadingData ? (
          <CircularProgress />
        ) : (
          <FormularioSerMate
            servicios={serviciosAsignados}
            materiales={materialesAsingados}
            onCantidadChange={handleCantidadChange}
            tipoFormulario={proyecto.estado?.nombre}
          />
        )}
        <Divider sx={{ width: "100%", marginTop: 2 }} />
        <EjecucionDiariaList ejecuciones={ejecucionDiaria} user={user} refetch={fetchData} />
        <Divider sx={{ width: "100%", marginTop: 2 }} />
        <Box>
          <Typography variant="h5" fontWeight="bold" textAlign="center" mb={2}>
            Solicitud de servicios y materiales
          </Typography>
          <Typography variant="body2" textAlign="center" mb={1}>
            Aquí podrás visualizar el estado actual de tus solicitudes de servicios y materiales, ya sea que estén
            pendientes, aprobadas o rechazadas.
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Servicios a aprobar</Typography>
            {serviciosSolicitados.map((s) => (
              <SolicitudCard
                key={s.id}
                solicitud={s}
                tipo="servicio"
                onDelete={(id, tipo) => handleEliminarSolicitud(id, tipo)}
                user={user}
              />
            ))}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6">Materiales a aprobar</Typography>
            {materialesSolicitados.map((m) => (
              <SolicitudCard
                key={m.id}
                solicitud={m}
                tipo="material"
                onDelete={(id, tipo) => handleEliminarSolicitud(id, tipo)}
                user={user}
              />
            ))}
          </Grid>
        </Grid>
      </Box>

      {/* Dialog de materiales, para solcitar nuevos materiales */}
      <DialogSolicitarMaterial
        open={openAgregarMaterial}
        onClose={(success) => {
          setOpenAgregarMaterial(false);
          if (success) {
            setSnackbar({ open: true, message: "Solicitud enviada con éxito", severity: "success" });
            fetchData();
          }
        }}
        proyecto={proyecto}
        materialesAsignados={materialesAsingados}
      />

      {/* Diálogo de servicios, colocado fuera del Box para mantener el orden visual */}
      <DialogSolicitarServicio
        open={openAgregarServicio}
        onClose={(success) => {
          setOpenAgregarServicio(false);
          if (success) {
            setSnackbar({ open: true, message: "Solicitud enviada con éxito", severity: "success" });
            fetchData();
          }
        }}
        proyecto={proyecto}
        serviciosAsignados={serviciosAsignados}
      />

      {/* dialog para confirmar subida de ejeucion diaria */}
      <Dialog open={openDialogConfirmar} onClose={() => setOpenDialogConfirmar(false)}>
        <DialogTitle>Confirmar Ejecución</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {user?.role === "contratista" || user?.role === "contratista-lider"
              ? "Por favor, valide la información antes de guardar. Si los datos son correctos, notifique a supervisión para su aprobación."
              : "Por favor, valide la información antes de guardar. Al guardar, los cambios se aplicarán de manera inmediata, sin necesidad de aprobación previa."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialogConfirmar(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              guardarEjecucion();
            }}
            color="error"
            variant="contained"
          >
            Confirmar y Guardar
          </Button>
        </DialogActions>
      </Dialog>
      {/* snackbarr para mostrar alertar y respeustas */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default EjecucionDiaria;
