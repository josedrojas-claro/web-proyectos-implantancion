import React, { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import { fetchProyectosGenerales } from "../../services/proyectoServices";
import PaginadorNumerado from "./components/PaginadorNumerado";
import FiltroChips from "./components/FiltroChips";
import FiltroBotones from "./components/FiltroBotones";
const PAGE_SIZE = 20;
import VisibilityIcon from "@mui/icons-material/Visibility";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import { useNavigate } from "react-router-dom";
import { getEstadoColor } from "../../utils/colorUtils";

export default function ListaProyectosGenerales() {
  const navigate = useNavigate();

  // Datos y paginación
  const [proyectos, setProyectos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);

  // Filtros aplicados (solo cambian al buscar o limpiar)
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState([]);
  const [tecnologia, setTecnologia] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Inputs para edición (cambian al tipear)
  const [searchInput, setSearchInput] = useState("");
  const [estadoInput, setEstadoInput] = useState([]);
  const [tecnologiaInput, setTecnologiaInput] = useState([]);
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");

  // Opciones de selects
  const [estadosOpts, setEstadosOpts] = useState([]);
  const [tecnologiasOpts, setTecnologiasOpts] = useState([]);

  // Actualiza opciones (no pisa la selección)
  const actualizarOpciones = (data) => {
    setEstadosOpts(
      (data.estados || []).map((e) => ({
        value: e.estado.nombre,
        label: e.estado.nombre,
        cantidad: e.cantidad ?? 0, // <-- IMPORTANTE
      }))
    );
    setTecnologiasOpts(
      (data.tecnologias || []).map((t) => ({
        value: t.tecnologia,
        label: t.tecnologia,
        cantidad: t.cantidad ?? 0, // 👈 importante!
      }))
    );
  };

  // Llama a la API con los filtros "aplicados"
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchProyectosGenerales({
        search,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        estados: estado.join(","),
        tecnologias: tecnologia.join(","),
        startDate,
        endDate,
      });
      setProyectos(data.proyectos);
      setTotal(data.totalFiltrados ?? data.total ?? 0);
      actualizarOpciones(data);
    } catch (e) {
      console.error(e);
      setProyectos([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [page, rowsPerPage, search, estado, tecnologia, startDate, endDate]);

  // Buscar: solo aquí aplicamos los filtros nuevos
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
    setEstado(estadoInput);
    setTecnologia(tecnologiaInput);
    setStartDate(startDateInput);
    setEndDate(endDateInput);
  };

  // Limpiar: resetea todo (inputs y aplicados)
  const handleClear = () => {
    setSearchInput("");
    setEstadoInput([]);
    setTecnologiaInput([]);
    setStartDateInput("");
    setEndDateInput("");
    setPage(0);
    setSearch("");
    setEstado([]);
    setTecnologia([]);
    setStartDate("");
    setEndDate("");
  };

  // Botón limpiar se habilita si hay filtros aplicados
  const tieneFiltrosAplicados =
    !!search ||
    estado.length > 0 ||
    tecnologia.length > 0 ||
    !!startDate ||
    !!endDate;

  //variables para manejar el dialog de detalles
  const [proyectoSeleccionado, setProyectoSeleccionado] = React.useState(null);
  const [openDialog, setOpenDialog] = React.useState(false);
  //funcion para abrir el dialog de detalles
  const handleVerDetalles = (proyecto) => {
    setProyectoSeleccionado(proyecto);
    setOpenDialog(true);
  };

  //funcion para abrir detalles del proyecto
  //funcion para navegar a la página de ejecución diaria
  const cargarDetalles = (proyecto) => {
    navigate(`/lista-proyectos-generales/detalles/${proyecto.ticketCode}`, {
      state: { proyecto },
    });
  };

  return (
    <MainLayout>
      <Stack spacing={1} divider={<Divider />}>
        {/* El formulario de búsqueda es el primer elemento del Stack */}
        <Box
          component="form"
          onSubmit={handleSearch}
          display="flex"
          gap={2}
          alignItems="center"
        >
          <TextField
            label="Buscar"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="small"
          />
          <TextField
            label="Fecha inicial"
            type="date"
            value={startDateInput}
            onChange={(e) => setStartDateInput(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Fecha final"
            type="date"
            value={endDateInput}
            onChange={(e) => setEndDateInput(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ width: 120 }}
          >
            Buscar
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClear}
            disabled={!tieneFiltrosAplicados}
            sx={{ width: 120 }}
          >
            Limpiar
          </Button>
        </Box>

        {/* Los componentes de filtro son los siguientes elementos. */}
        {/* Ya no necesitas los <Divider /> manuales entre ellos. */}

        {/* Filtro para estados */}
        <FiltroChips
          value={estadoInput}
          onChange={(newValue) => setEstadoInput(newValue)}
          options={estadosOpts}
          label="Estados"
          getEstadoColor={getEstadoColor}
        />

        {/* Tecnologías */}
        <FiltroBotones
          value={tecnologiaInput}
          onChange={(newValue) => setTecnologiaInput(newValue)}
          options={tecnologiasOpts}
          label="Tecnologías"
        />
      </Stack>
      <Divider sx={{ mt: "10px" }} />
      <Typography variant="h5" color="text.secondary" sx={{ mt: "10px" }}>
        Total Proyectos: {total}
      </Typography>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ticket</TableCell>
                <TableCell>Nombre del proyecto</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Tecnologia</TableCell>
                <TableCell>%Ejecucion</TableCell>
                <TableCell>Detalles</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6}>Cargando...</TableCell>
                </TableRow>
              ) : proyectos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>Sin datos</TableCell>
                </TableRow>
              ) : (
                proyectos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.ticketCode}</TableCell>
                    <TableCell>{p.nombre}</TableCell>
                    <TableCell>
                      {" "}
                      <Chip
                        label={p.estado?.nombre}
                        size="small"
                        sx={{
                          backgroundColor: getEstadoColor(p.estado?.nombre),
                          color: ["#FFEB3B", "#FF9800"].includes(
                            getEstadoColor(p.estado?.nombre)
                          ) // colores claros: negro, los demás: blanco
                            ? "#222"
                            : "#fff",
                          fontWeight: 600,
                          minWidth: 110,
                          justifyContent: "center",
                        }}
                      />
                    </TableCell>
                    <TableCell>{p.tecnologia}</TableCell>
                    <TableCell>
                      {p.EjecucionDiaria?.length > 0 ? (
                        <Box sx={{ minWidth: 100 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 0.5,
                            }}
                          >
                            <Box sx={{ width: "100%", mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={
                                  p.EjecucionDiaria[0].porcenEjecucion * 100
                                }
                                sx={{
                                  height: 10,
                                  borderRadius: 5,
                                  backgroundColor: "#eee",
                                  "& .MuiLinearProgress-bar": {
                                    backgroundColor:
                                      p.EjecucionDiaria[0].porcenEjecucion < 0.5
                                        ? "#f44336" // rojo
                                        : p.EjecucionDiaria[0].porcenEjecucion <
                                          0.8
                                        ? "#ff9800" // anaranjado
                                        : "#4caf50", // verde
                                  },
                                }}
                              />
                            </Box>
                            <Box sx={{ minWidth: 30 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {Math.round(
                                  p.EjecucionDiaria[0].porcenEjecucion * 100
                                )}
                                %
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
                        <Tooltip title="Vista Rapida">
                          <Button
                            size="small"
                            component="label"
                            variant="contained"
                            tabIndex={-1}
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleVerDetalles(p)}
                          >
                            Ver
                          </Button>
                        </Tooltip>
                        <Tooltip title="Ver detalles">
                          <Button
                            size="small"
                            component="label"
                            variant="contained"
                            tabIndex={-1}
                            color="success"
                            startIcon={<ImportContactsIcon />}
                            onClick={() => cargarDetalles(p)}
                          >
                            Detalles
                          </Button>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box width={600}>
          <PaginadorNumerado
            count={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onChangePage={setPage}
            onChangeRowsPerPage={(val) => {
              setRowsPerPage(val);
              setPage(0);
            }}
          />
        </Box>
      </Paper>

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
                    <Typography>
                      {proyectoSeleccionado.ticketCode ?? "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nombre
                    </Typography>
                    <Typography>
                      {proyectoSeleccionado.nombre ?? "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tecnología
                    </Typography>
                    <Typography>
                      {proyectoSeleccionado.tecnologia ?? "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Rubro
                    </Typography>
                    <Typography>
                      {proyectoSeleccionado.CodigosIngenieria?.codigo ?? "—"}
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
                      {proyectoSeleccionado.Sitios?.nombre_sitio ?? "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nemonico
                    </Typography>
                    <Typography>
                      {proyectoSeleccionado.Sitios?.nemonico ?? "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Municipio
                    </Typography>
                    <Typography>
                      {proyectoSeleccionado.Sitios?.Municipio?.municipio ?? "—"}
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
                      {proyectoSeleccionado.Contratistas?.nombre_contratista ??
                        "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Planificador
                    </Typography>
                    <Typography>
                      {proyectoSeleccionado.Planificador?.UserData?.nombre ??
                        "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Estado
                    </Typography>
                    <Typography>
                      {proyectoSeleccionado.estado?.nombre ?? "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Asignado a
                    </Typography>
                    <Typography>
                      {proyectoSeleccionado?.Supervisor?.UserData?.nombre ??
                        "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Supervisor Contratista
                    </Typography>
                    <Typography>
                      {proyectoSeleccionado?.SupervisorContratista?.UserData
                        ?.nombre ?? "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Recibido por
                    </Typography>
                    <Typography>
                      {proyectoSeleccionado?.BitacoraFinalProyecto?.[0]
                        ?.nombreOperaciones ?? "—"}
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
                      {proyectoSeleccionado.fechaInicio
                        ? new Date(
                            proyectoSeleccionado.fechaInicio
                          ).toLocaleDateString("es-NI")
                        : "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 250 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Descripción
                    </Typography>
                    <Typography>
                      {proyectoSeleccionado.descripcion ?? "—"}
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
