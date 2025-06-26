import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import {
  Box,
  TextField,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableCell,
  TableRow,
  LinearProgress,
  Typography,
  Button,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
} from "@mui/material";
import { fetchListaProyectosEjecucion } from "../../services/proyectoServices";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import { useLocation } from "react-router-dom";

export default function ListaProyectosEjecucion() {
  const [proyectos, setProyectos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [filtro, setFiltro] = useState("");
  //variables para abrir el dialog de detalles
  const [openDialog, setOpenDialog] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

  const navigate = useNavigate();

  // Función para cargar los proyectos de ejecución diaria
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchListaProyectosEjecucion();
        setProyectos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // filtrar proyectos por nombre
  const proyectosFiltrados = proyectos.filter(
    (proy) => proy.nombre.toLowerCase().includes(filtro.toLowerCase()) || String(proy.ticketCode).includes(filtro)
  );

  //funcion para abrir el dialog de detalles
  const handleVerDetalles = (proyecto) => {
    setProyectoSeleccionado(proyecto);
    setOpenDialog(true);
  };

  //funcion para navegar a la página de ejecución diaria
  const cargarEjecucion = (proyecto) => {
    navigate(`/lista-proyectos-ejecucion/ejecucion-diaria/${proyecto.ticketCode}`, {
      state: { proyecto },
    });
  };

  const cargarValidacionDocumentos = (proyecto) => {
    navigate(`/lista-proyectos-ejecucion/validacion-documentos/${proyecto.ticketCode}`, {
      state: { proyecto },
    });
  };

  const location = useLocation();
  const errorMessage = location.state?.error;

  useEffect(() => {
    if (errorMessage) {
      alert(errorMessage); // o un Snackbar, como prefieras
    }
  }, [errorMessage]);

  return (
    <MainLayout>
      <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
        <h1>Lista de Proyectos de Ejecución Diaria</h1>
        <TextField
          label="Buscar proyecto"
          placeholder="Buscar por nombre o ticket"
          variant="outlined"
          fullWidth
          sx={{ mb: 5, maxWidth: 400 }}
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </Box>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Box sx={{ color: "red", textAlign: "center" }}>
          <h2>Error al cargar los proyectos: {error}</h2>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>

                <TableCell>Ticket</TableCell>
                <TableCell>Nombre del Proyecto</TableCell>
                <TableCell>Contratista</TableCell>
                <TableCell>Tecnologia</TableCell>
                <TableCell>Planificador</TableCell>
                <TableCell>%Ejecucion</TableCell>
                <TableCell>Detalles</TableCell>
              </TableRow>
            </TableHead>
            {proyectosFiltrados.map((proyecto, index) => (
              <TableRow key={proyecto.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{proyecto.ticketCode}</TableCell>
                <TableCell>{proyecto.nombre}</TableCell>
                <TableCell>{proyecto.Contratistas.nombre_contratista}</TableCell>
                <TableCell
                  sx={{
                    textTransform: "capitalize",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 150,
                  }}
                >
                  {proyecto.tecnologia}
                </TableCell>
                <TableCell>{proyecto.Planificador.UserData.nombre}</TableCell>
                <TableCell>
                  {proyecto.EjecucionDiaria?.length > 0 ? (
                    <Box sx={{ minWidth: 100 }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                        <Box sx={{ width: "100%", mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={proyecto.EjecucionDiaria[0].porcenEjecucion * 100}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: "#eee",
                              "& .MuiLinearProgress-bar": {
                                backgroundColor:
                                  proyecto.EjecucionDiaria[0].porcenEjecucion < 0.5
                                    ? "#f44336" // rojo
                                    : proyecto.EjecucionDiaria[0].porcenEjecucion < 0.8
                                    ? "#ff9800" // anaranjado
                                    : "#4caf50", // verde
                              },
                            }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 30 }}>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(proyecto.EjecucionDiaria[0].porcenEjecucion * 100)}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.disabled">
                      0%
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="left">
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Ver detalles">
                      <Button
                        size="small"
                        component="label"
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleVerDetalles(proyecto)}
                      >
                        Ver
                      </Button>
                    </Tooltip>

                    <Tooltip title="Cargar Ejecución Diaria">
                      <Button
                        size="small"
                        color="success"
                        component="label"
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<ImportContactsIcon />}
                        sx={{
                          display: proyecto.estado?.nombre === "Validacion Documentos" ? "none" : "inline-flex",
                        }}
                        onClick={() => cargarEjecucion(proyecto)}
                      >
                        Ejecución
                      </Button>
                    </Tooltip>

                    <Tooltip title="Validar Documentos">
                      <Button
                        size="small"
                        component="label"
                        variant="contained"
                        sx={{
                          backgroundColor: "purple",
                          color: "white",
                          "&:hover": { backgroundColor: "#6a1b9a" },
                          display: proyecto.estado?.nombre === "Validacion Documentos" ? "inline-flex" : "none",
                        }}
                        startIcon={<ImportContactsIcon />}
                        onClick={() => cargarValidacionDocumentos(proyecto)}
                      >
                        Vali. Docu
                      </Button>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </TableContainer>
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
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Asignado a
                    </Typography>
                    <Typography>{proyectoSeleccionado.Supervisor.UserData.nombre}</Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Supervisor Contratista
                    </Typography>
                    <Typography>{proyectoSeleccionado.SupervisorContratista.UserData.nombre}</Typography>
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
    </MainLayout>
  );
}
