import React from "react";
import MainLayout from "../../layout/MainLayout";
import { fetchListaProyectosRdoConci } from "../../services/proyectoServices";
import {
  Box,
  TextField,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import FormatListBulletedAddIcon from "@mui/icons-material/FormatListBulletedAdd";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";

export default function ListaProyectosRdoConci() {
  const [proyectos, setProyectos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [filtro, setFiltro] = React.useState("");

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchListaProyectosRdoConci();
        setProyectos(data);
      } catch (error) {
        setError(error);
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

  //variables para manejar el dialog de detalles
  const [proyectoSeleccionado, setProyectoSeleccionado] = React.useState(null);
  const [openDialog, setOpenDialog] = React.useState(false);
  //funcion para abrir el dialog de detalles
  const handleVerDetalles = (proyecto) => {
    setProyectoSeleccionado(proyecto);
    setOpenDialog(true);
  };
  const navigate = useNavigate();

  //funcion para navegar a la página de RDo
  const cargarPageRDO = (proyecto) => {
    navigate(`/lista-proyectos-rdo-conciliacion-materiales/rdo/${proyecto.ticketCode}`, {
      state: { proyecto },
    });
  };

  return (
    <MainLayout>
      <Box
        sx={{
          px: 2,
          maxWidth: "100%",
          overflowX: "auto",
        }}
      >
        <h2>Lista de Proyectos en RDO o Conciliación de Materiales</h2>
        <TextField
          label="Filtrar por nombre o ticket"
          variant="outlined"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          sx={{ mb: 2, maxWidth: 400, width: "100%" }}
        />
      </Box>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Box sx={{ color: "red", textAlign: "center" }}>
          <h2>Error al cargar los proyectos: {error}</h2>
        </Box>
      ) : proyectosFiltrados.length === 0 ? (
        <Box sx={{ textAlign: "center" }}>
          <h2>No se encontraron proyectos</h2>
        </Box>
      ) : (
        <TableContainer sx={{ maxWidth: "100%", overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>#</TableCell>
                <TableCell>Ticket</TableCell>
                <TableCell>Nombre del Proyecto</TableCell>

                {/* Ocultar en móviles */}
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Contratista</TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Tecnología</TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Supervisado por:</TableCell>

                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>%Ejecución</TableCell>
                <TableCell>Detalles</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {proyectosFiltrados.map((proyecto, index) => (
                <TableRow key={proyecto.id}>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>{index + 1}</TableCell>
                  <TableCell>{proyecto.ticketCode}</TableCell>
                  <TableCell>{proyecto.nombre}</TableCell>

                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    {proyecto.Contratistas.nombre_contratista}
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{proyecto.tecnologia}</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    {proyecto.Supervisor.UserData.nombre}
                  </TableCell>

                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    {proyecto.EjecucionDiaria?.length > 0 ? (
                      <Typography variant="body2">
                        {Math.round(proyecto.EjecucionDiaria[0].porcenEjecucion * 100)}%
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        0%
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="flex-start">
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleVerDetalles(proyecto)}
                      >
                        Ver
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<FormatListBulletedAddIcon />}
                        sx={{
                          display: proyecto.estado?.nombre === "RDO" ? "none" : "inline-flex",
                        }}
                        onClick={() => cargarPageRDO(proyecto)}
                      >
                        RDO
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
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
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Recibido por
                    </Typography>
                    <Typography>{proyectoSeleccionado.BitacoraFinalProyecto?.[0]?.nombreOperaciones}</Typography>
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
