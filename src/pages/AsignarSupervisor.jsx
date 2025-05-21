import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  TableContainer,
  Tooltip,
  Stack,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Grid,
} from "@mui/material";
import { fetchProyectosLideres, updateAsignarSupervisor } from "../services/proyectoServices";
import { fetchSupervisoresClaro } from "../services/userServices";
import MyAppBar from "../components/MyAppBar";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

export default function ListaProyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("");
  ///variables de estado para el dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  //variables de estado para el supervisor
  const [supervisores, setSupervisores] = useState([]);
  const [filtroSupervisores, setFiltroSupervisores] = useState("");
  const [loadingSupervisores, setLoadingSupervisores] = useState(true);
  const [openDialogSupervisor, setOpenDialogSupervisor] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [supervisorSeleccionado, setSupervisorSeleccionado] = useState(null);
  // alerta para mostrar mensajes
  const [alerta, setAlerta] = useState({ open: false, mensaje: "", tipo: "" });

  useEffect(() => {
    fetchProyectosLideres()
      .then((data) => setProyectos(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    fetchSupervisoresClaro()
      .then((data) => setSupervisores(data))
      .finally(() => setLoadingSupervisores(false));
  }, []);

  const proyectosFiltrados = proyectos.filter(
    (proy) => proy.nombre.toLowerCase().includes(filtro.toLowerCase()) || String(proy.ticketCode).includes(filtro)
  );

  // Filtrado local de supervisores
  const supervisoresFiltrados = supervisores.filter((supervisor) =>
    supervisor.UserData.nombre.toLowerCase().includes(filtroSupervisores.toLowerCase())
  );
  const handleVerDetalles = (proyecto) => {
    setProyectoSeleccionado(proyecto);
    setOpenDialog(true);
  };
  const handleAsignarSupervisor = (proyecto) => {
    setProyectoSeleccionado(proyecto); // Guarda el proyecto actual
    setOpenDialogSupervisor(true); // ✅ Abre el diálogo correctamente
  };

  return (
    <>
      <MyAppBar />
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography variant="h4" gutterBottom>
          Lista de Proyectos pendientes de asignar supervisor
        </Typography>

        <TextField
          label="Buscar proyecto"
          placeholder="Buscar por nombre o ticket"
          variant="outlined"
          fullWidth
          sx={{ mb: 2, maxWidth: 400 }}
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        {/* Tabla de proyectos */}
      </Box>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Paper elevation={3}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>
                    <strong>Ticket</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Nombre</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Contratista</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Tecnología</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Sitio</strong>
                  </TableCell>

                  <TableCell align="center">
                    <strong>Acciones</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proyectosFiltrados.map((proy, index) => (
                  <TableRow key={proy.id} sx={{ bgcolor: index % 2 === 0 ? "#fafafa" : "white" }}>
                    <TableCell>{proy.ticketCode}</TableCell>
                    <TableCell>{proy.nombre}</TableCell>
                    <TableCell>{proy.Contratistas.nombre_contratista}</TableCell>
                    <TableCell
                      sx={{
                        textTransform: "capitalize",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 150,
                      }}
                    >
                      {proy.tecnologia}
                    </TableCell>
                    <TableCell>{proy.Sitios.nombre_sitio}</TableCell>

                    <TableCell align="left">
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Ver detalles">
                          <Button
                            size="small"
                            component="label"
                            variant="contained"
                            tabIndex={-1}
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleVerDetalles(proy)}
                          >
                            Ver
                          </Button>
                        </Tooltip>
                        <Tooltip title="Ver detalles">
                          <Button
                            size="small"
                            color="success"
                            component="label"
                            variant="contained"
                            tabIndex={-1}
                            startIcon={<PersonAddAltIcon />}
                            onClick={() => handleAsignarSupervisor(proy)}
                          >
                            Asignar supervisor
                          </Button>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      {/* // Dialogo para ver detalles del proyecto */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Detalles del Proyecto</DialogTitle>
        <DialogContent dividers>
          {proyectoSeleccionado ? (
            <Grid container spacing={2}>
              {/* Sección: Datos generales */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Datos Generales
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ticket
                    </Typography>
                    <Typography>{proyectoSeleccionado.ticketCode}</Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nombre
                    </Typography>
                    <Typography>{proyectoSeleccionado.nombre}</Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tecnología
                    </Typography>
                    <Typography>{proyectoSeleccionado.tecnologia}</Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Rubro
                    </Typography>
                    <Typography>{proyectoSeleccionado.CodigosIngenieria?.codigo || "—"}</Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Sección: Sitio */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Información del Sitio
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nombre Sitio
                    </Typography>
                    <Typography>{proyectoSeleccionado.Sitios?.nombre_sitio || "—"}</Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nemonico
                    </Typography>
                    <Typography>{proyectoSeleccionado.Sitios?.nemonico || "—"}</Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Municipio
                    </Typography>
                    <Typography>{proyectoSeleccionado.Sitios?.Municipio?.municipio || "—"}</Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Sección: Responsables */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Responsables y Estado
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Contratista
                    </Typography>
                    <Typography>{proyectoSeleccionado.Contratistas?.nombre_contratista || "—"}</Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Planificador
                    </Typography>
                    <Typography>{proyectoSeleccionado.Planificador?.UserData?.nombre || "—"}</Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Estado
                    </Typography>
                    <Typography>{proyectoSeleccionado.estado?.nombre || "—"}</Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Sección: Otros */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Otros
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Fecha Inicio
                    </Typography>
                    <Typography>{new Date(proyectoSeleccionado.fechaInicio).toLocaleDateString("es-NI")}</Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Descripción
                    </Typography>
                    <Typography>{proyectoSeleccionado.descripcion || "—"}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Typography>Cargando datos...</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="error">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
      {/* // Dialogo para asignar supervisor */}
      <Dialog open={openDialogSupervisor} onClose={() => setOpenDialogSupervisor(false)} fullWidth maxWidth="sm">
        <DialogTitle>Asignar Supervisor al proyecto: {proyectoSeleccionado?.nombre}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Selecciona un supervisor
          </Typography>

          <TextField
            label="Buscar supervisor"
            placeholder="Buscar por nombre"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={filtroSupervisores}
            onChange={(e) => setFiltroSupervisores(e.target.value)}
          />

          {loadingSupervisores ? (
            <CircularProgress />
          ) : (
            <TableContainer>
              <Table stickyHeader>
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell>
                      <strong>Nombre</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Acciones</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {supervisoresFiltrados.map((supervisor, index) => (
                    <TableRow key={supervisor.id} sx={{ bgcolor: index % 2 === 0 ? "#fafafa" : "white" }}>
                      <TableCell>{supervisor.UserData.nombre}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PersonAddAltIcon />}
                          onClick={() => {
                            setSupervisorSeleccionado(supervisor);
                            setOpenConfirmDialog(true); // Abrir el confirm dialog
                          }}
                        >
                          Asignar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>
      {/* ///confirmacion de asignar supervisor */}
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>¿Confirmar asignación?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas asignar al supervisor <strong>{supervisorSeleccionado?.UserData.nombre}</strong>{" "}
            al proyecto <strong>{proyectoSeleccionado?.nombre}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              await updateAsignarSupervisor({
                id: proyectoSeleccionado?.id,
                supervisorId: supervisorSeleccionado?.id,
              });
              setAlerta({
                open: true,
                mensaje: `Supervisor ${supervisorSeleccionado?.UserData.nombre} asignado correctamente al proyecto ${proyectoSeleccionado?.nombre}`,
                tipo: "success",
              });
              const nuevosProyectos = await fetchProyectosLideres();
              setProyectos(nuevosProyectos);
              setOpenConfirmDialog(false);
              setOpenDialogSupervisor(false);
            }}
            color="success"
            variant="contained"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
      {/* Fin de confirmacion de asignar supervisor */}
      <Snackbar
        open={alerta.open}
        autoHideDuration={4000}
        onClose={() => setAlerta({ ...alerta, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setAlerta({ ...alerta, open: false })} severity={alerta.tipo} sx={{ width: "100%" }}>
          {alerta.mensaje}
        </Alert>
      </Snackbar>
    </>
  );
}
