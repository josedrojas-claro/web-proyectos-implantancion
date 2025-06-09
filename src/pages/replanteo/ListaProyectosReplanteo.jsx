import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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
  DialogTitle,
  Grid,
} from "@mui/material";
import MainLayout from "../../layout/MainLayout";
import { fetchListaProyectosReplanteo } from "../../services/proyectoServices";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
export default function ListaProyectosReplanteo() {
  const [proyectos, setProyectos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  ///variables de estado para el dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [filtro, setFiltro] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchListaProyectosReplanteo();
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

  // abrir modal para ver detalles del proyecto
  const handleVerDetalles = (proyecto) => {
    setProyectoSeleccionado(proyecto);
    setOpenDialog(true);
  };

  const cargarReplanteo = (proyecto) => {
    navigate(`/replanteo/${proyecto.ticketCode}`, { state: { proyecto } });
  };

  return (
    <MainLayout>
      <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
        <h1>Lista Replanteo Page</h1>
        <TextField
          label="Buscar proyecto"
          placeholder="Buscar por nombre o ticket"
          variant="outlined"
          fullWidth
          sx={{ mb: 2, maxWidth: 400 }}
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </Box>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>

                <TableCell>Ticket</TableCell>
                <TableCell>Nombre proyecto</TableCell>
                <TableCell>Contratista</TableCell>
                <TableCell>Tecnología</TableCell>
                <TableCell>Asignado Por</TableCell>
                <TableCell>Detalles</TableCell>
              </TableRow>
            </TableHead>
            {proyectosFiltrados.map((proyecto, index) => (
              <TableRow key={proyecto.id} sx={{ bgcolor: index % 2 === 0 ? "#fafafa" : "white" }}>
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
                    <Tooltip title="Cargar replanteo">
                      <Button
                        size="small"
                        color="success"
                        component="label"
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<ImportContactsIcon />}
                        onClick={() => cargarReplanteo(proyecto)}
                      >
                        Cargar Replanteo
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
