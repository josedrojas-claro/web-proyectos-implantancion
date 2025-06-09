import React, { useState, useEffect, useCallback } from "react";
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
} from "@mui/material";
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
//funcion de servicio por contratsita
import { fetchServiciosByContratista } from "../../services/serviciosServices";
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

  //variables para sacar los servicios by contratistas para hacer solicitudes de nuevos
  const [serviciosCatalogo, setServiciosCatalogo] = useState([]);
  const [filtroServicio, setFiltroServicio] = useState("");
  const [openAgregarServicio, setOpenAgregarServicio] = useState(false);
  const [loadingServiciosCatalogo, setLoadingServiciosCatalogo] = useState(false);

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const servicios = await fetchServiciosAsignadosByProyecto(proyecto.id);
      const materiales = await fetchMaterialesAsignadosByProyecto(proyecto.id);
      //ejecución diaria
      const ejecucionDiaria = await fetchEjecucionDiaria(proyecto.id);

      const lastApproved = ejecucionDiaria
        .filter((e) => e.estado === "aprobada")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      setUltimoPorcentajeAprobado(lastApproved?.porcenEjecucion || 0);

      setServiciosAsignados(servicios);
      setMaterialesAsingados(materiales);
      setEjecucionDiaria(ejecucionDiaria);
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

  const solicitarServicio = async (serv) => {
    try {
      // Aquí puedes hacer un POST a tu backend para solicitarlo formalmente
      // o agregarlo al estado `serviciosAsignados` si es inmediato
      setSnackbar({
        open: true,
        message: `Servicio "${serv.servicio}" solicitado correctamente.`,
        severity: "success",
      });
      setOpenAgregarServicio(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "No se pudo solicitar el servicio.",
        error,
        severity: "error",
      });
    }
  };

  //funcion para cargar lo servicios
  const cargarCatalogoServicios = async () => {
    setLoadingServiciosCatalogo(true);
    try {
      const data = await fetchServiciosByContratista(proyecto.contratistaId);
      setServiciosCatalogo(data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al cargar servicios del catálogo.",
        error,
        severity: "error",
      });
    } finally {
      setLoadingServiciosCatalogo(false);
    }
  };

  // const agregarMateriales = () => {
  //   console.log("guardar material");
  // };

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
            step={0.01}
            marks={[
              { value: ultimoPorcentajeAprobado, label: `${Math.round(ultimoPorcentajeAprobado * 100)}%` },
              { value: 1, label: "100%" },
            ]}
            valueLabelDisplay="auto"
          />
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
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{ px: 2, minWidth: 180 }}
            onClick={() => {
              setOpenAgregarServicio(true);
              cargarCatalogoServicios();
            }}
          >
            Solicitar servicio
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{ px: 2, minWidth: 160 }}
            // onClick={() => setOpenDialogSupervisor(true)}
          >
            Solicitar material
          </Button>
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
      </Box>

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
      {/* dialog para cargar los servicios por contratista */}
      <Dialog open={openAgregarServicio} onClose={() => setOpenAgregarServicio(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Solicitar nuevo servicio</DialogTitle>
        <DialogContent>
          <TextField
            label="Buscar servicio"
            fullWidth
            margin="normal"
            value={filtroServicio}
            onChange={(e) => setFiltroServicio(e.target.value)}
          />
          <Box sx={{ maxHeight: 300, overflowY: "auto", mt: 2 }}>
            {loadingServiciosCatalogo ? (
              <CircularProgress />
            ) : (
              serviciosCatalogo
                .filter(
                  (s) =>
                    s.servicio.toLowerCase().includes(filtroServicio.toLowerCase()) ||
                    s.descripcionServicio.toLowerCase().includes(filtroServicio.toLowerCase())
                )
                .map((serv) => (
                  <Box
                    key={serv.id}
                    sx={{
                      p: 1,
                      borderBottom: "1px solid #ddd",
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#f5f5f5" },
                    }}
                    onClick={() => solicitarServicio(serv)}
                  >
                    <Typography variant="body1" fontWeight="bold">
                      {serv.servicio}
                    </Typography>
                    <Typography variant="body2">{serv.descripcionServicio}</Typography>
                  </Box>
                ))
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAgregarServicio(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default EjecucionDiaria;
