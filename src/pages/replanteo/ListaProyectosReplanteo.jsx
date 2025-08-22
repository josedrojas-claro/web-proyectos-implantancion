import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
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
  useTheme,
  useMediaQuery,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
    (proy) =>
      proy.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      String(proy.ticketCode).includes(filtro)
  );

  // abrir modal para ver detalles del proyecto
  const handleVerDetalles = (proyecto) => {
    setProyectoSeleccionado(proyecto);
    setOpenDialog(true);
  };

  const cargarReplanteo = (proyecto) => {
    navigate(`/lista-proyectos-replanteo/replanteo-v2/${proyecto.ticketCode}`, {
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
        <TableContainer sx={{ maxWidth: "100%", overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  #
                </TableCell>

                <TableCell>Ticket</TableCell>
                <TableCell>Nombre proyecto</TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  Contratista
                </TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  Tecnología
                </TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  Asignado Por
                </TableCell>
                <TableCell>Detalles</TableCell>
              </TableRow>
            </TableHead>
            {proyectosFiltrados.map((proyecto, index) => (
              <TableRow
                key={proyecto.id}
                sx={{ bgcolor: index % 2 === 0 ? "#fafafa" : "white" }}
              >
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  {index + 1}
                </TableCell>
                <TableCell>{proyecto.ticketCode}</TableCell>
                <TableCell>{proyecto.nombre}</TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  {proyecto.Contratistas.nombre_contratista}
                </TableCell>
                <TableCell
                  sx={{
                    textTransform: "capitalize",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 150,
                    display: { xs: "none", sm: "table-cell" },
                  }}
                >
                  {proyecto.tecnologia}
                </TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  {proyecto.Planificador.UserData.nombre}
                </TableCell>
                <TableCell align="left">
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems="flex-start"
                  >
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
                        startIcon={isMobile ? null : <ImportContactsIcon />}
                        onClick={() => cargarReplanteo(proyecto)}
                      >
                        {isMobile ? "Replanteo" : "Cargar Replanteo"}
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
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
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
                    <Typography>
                      {proyectoSeleccionado.CodigosIngenieria?.codigo || "—"}
                    </Typography>
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
                    <Typography>
                      {proyectoSeleccionado.Sitios?.nombre_sitio || "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nemonico
                    </Typography>
                    <Typography>
                      {proyectoSeleccionado.Sitios?.nemonico || "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Municipio
                    </Typography>
                    <Typography>
                      {proyectoSeleccionado.Sitios?.Municipio?.municipio || "—"}
                    </Typography>
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
                    <Typography>
                      {proyectoSeleccionado.Contratistas?.nombre_contratista ||
                        "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Planificador
                    </Typography>
                    <Typography>
                      {proyectoSeleccionado.Planificador?.UserData?.nombre ||
                        "—"}
                    </Typography>
                  </Box>

                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Estado
                    </Typography>
                    <Typography>
                      {proyectoSeleccionado.estado?.nombre || "—"}
                    </Typography>
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
                    <Typography>
                      {new Date(
                        proyectoSeleccionado.fechaInicio
                      ).toLocaleDateString("es-NI")}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Descripción
                    </Typography>
                    <Typography>
                      {proyectoSeleccionado.descripcion || "—"}
                    </Typography>
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
