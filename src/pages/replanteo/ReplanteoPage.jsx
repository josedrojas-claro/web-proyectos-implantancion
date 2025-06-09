// src/pages/ReplanteoPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import {
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TextField,
  TableContainer,
  Button,
  CircularProgress,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  DialogActions,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import FormularioSerMate from "../../components/FormularioSerMate";
import DialogAsignarSupervisor from "./components/DialogAsignarSupervisor";
import { fetchServiciosByContratista } from "../../services/serviciosServices";
import { fetchSupervisoresContratista } from "../../services/userServices";

import {
  fetchServiciosPlantilla,
  fetchMaterialesPlantilla,
  createServicioPlantilla,
  createMaterialPlantilla,
} from "../../services/replanteoServices";
import { fetchMateriales } from "../../services/materialesServices";
import { updateAsignarSupervisorContratista } from "../../services/proyectoServices";
import { useAuthUser } from "../../services/authServices"; // Importa el hook para obtener el usuario autenticado
import { createMaterialesAsignados } from "../../services/materialesServices";
import { createServiciosAsignados } from "../../services/serviciosServices";

export default function ReplanteoPage() {
  const { ticketCode } = useParams();
  const location = useLocation();
  const proyecto = location.state?.proyecto;
  const navigate = useNavigate();

  const user = useAuthUser();

  const [supervisoresContratista, setSupervisoresContratista] = useState(null);
  const [filtroSupervisoresContratista, setFiltroSupervisoresContratista] = useState("");
  const [loadingSupervisoresContratista, setLoadingSupervisoresContratista] = useState(true);
  const [openDialogSupervisor, setOpenDialogSupervisor] = useState(false);
  const [supervisorSeleccionado, setSupervisorSeleccionado] = useState(null);

  const [servicios, setServicios] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  const [serviciosCatalogo, setServiciosCatalogo] = useState([]);
  const [openAgregarServicio, setOpenAgregarServicio] = useState(false);
  const [buscando, setBuscando] = useState(false);

  //materiales
  const [materialesCatalogo, setMaterialesCatalogo] = useState([]);
  const [filtroMaterial, setFiltroMaterial] = useState("");
  const [openAgregarMaterial, setOpenAgregarMaterial] = useState(false);
  const [loadingMaterialesCatalogo, setLoadingMaterialesCatalogo] = useState(false);
  const [buscandoMaterial, setBuscandoMaterial] = useState(false);

  const [alerta, setAlerta] = useState({ open: false, tipo: "success", mensaje: "" });

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ open: true, tipo, mensaje });
  };

  const cerrarAlerta = () => {
    setAlerta((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dataSupervisores, dataServicios, dataMateriales] = await Promise.all([
          fetchSupervisoresContratista(),
          fetchServiciosPlantilla(proyecto.id),
          fetchMaterialesPlantilla(proyecto.id),
        ]);

        setSupervisoresContratista(dataSupervisores);
        setServicios(dataServicios);
        setMateriales(dataMateriales);
      } catch (error) {
        setError("Error al cargar los datos del replanteo", error);
      } finally {
        setLoadingSupervisoresContratista(false);
        setLoadingData(false);
      }
    };

    fetchData();
  }, [proyecto.id]);

  const handleCantidadChange = (tipo, id, valor) => {
    const setter = tipo === "servicio" ? setServicios : setMateriales;
    const lista = tipo === "servicio" ? servicios : materiales;

    const actualizada = lista.map((item) => (item.id === id ? { ...item, cantidad: valor } : item));

    setter(actualizada);
  };

  /// cargar lista de servicios
  const [inputBusqueda, setInputBusqueda] = useState("");
  const [filtroServicio, setFiltroServicio] = useState("");

  const buscarServicios = async () => {
    setBuscando(true);
    try {
      const response = await fetchServiciosByContratista(proyecto.contratistaId, inputBusqueda);
      setServiciosCatalogo(response);
      setFiltroServicio(inputBusqueda); // solo si lo estás usando para otros filtros locales
    } catch (error) {
      console.error("Error buscando servicios:", error);
    } finally {
      setBuscando(false);
    }
  };

  const handleAgregarServicio = (servicio) => {
    const nuevoServicio = {
      serviciosId: servicio.id,
      proyectoId: proyecto.id,
      contratistaId: proyecto.contratistaId,
    };

    createServicioPlantilla(nuevoServicio)
      .then((response) => {
        mostrarAlerta("success", response.message);
        return fetchServiciosPlantilla(proyecto.id);
      })
      .then((nuevosServicios) => {
        setServicios((prevServicios) => {
          return nuevosServicios.map((nuevo) => {
            const existente = prevServicios.find((s) => s.id === nuevo.id);
            return {
              ...nuevo,
              cantidad: existente?.cantidad ?? "", // mantiene lo que escribió el usuario
            };
          });
        });
      })
      .catch((error) => {
        if (error.response?.status === 409) {
          mostrarAlerta("warning", error.response.data.message);
        } else {
          mostrarAlerta("error", "Error al agregar servicio.");
        }
      })
      .finally(() => {
        setOpenAgregarServicio(false);
      });
  };

  ///materiales
  useEffect(() => {
    if (openAgregarMaterial) {
      setLoadingMaterialesCatalogo(true);
      fetchMateriales()
        .then(setMaterialesCatalogo)
        .catch((err) => {
          console.error("Error al cargar catálogo de materiales", err);
        })
        .finally(() => {
          setLoadingMaterialesCatalogo(false);
        });
    }
  }, [openAgregarMaterial]);

  const [inputBusquedaMaterial, setInputBusquedaMaterial] = useState("");

  useEffect(() => {
    setBuscandoMaterial(true);
    const delayDebounce = setTimeout(() => {
      setFiltroMaterial(inputBusquedaMaterial);
      setBuscandoMaterial(false);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [inputBusquedaMaterial]);

  const materialesFiltrados = useMemo(
    () =>
      materialesCatalogo.filter((material) =>
        `${material.codigo} ${material.descripcion}`.toLowerCase().includes(filtroMaterial.toLowerCase())
      ),
    [materialesCatalogo, filtroMaterial]
  );

  const handleAgregarMaterial = (material) => {
    const nuevoMaterial = {
      materialId: material.id,
      proyectoId: proyecto.id,
      isClaro: false,
    };

    createMaterialPlantilla(nuevoMaterial)
      .then((response) => {
        mostrarAlerta("success", response.message);
        return fetchMaterialesPlantilla(proyecto.id);
      })
      .then((nuevosMateriales) => {
        setMateriales((prevMateriales) => {
          return nuevosMateriales.map((nuevo) => {
            const existente = prevMateriales.find((m) => m.id === nuevo.id);
            return {
              ...nuevo,
              cantidad: existente?.cantidad ?? "",
            };
          });
        });
      })
      .catch((error) => {
        if (error.response?.status === 409) {
          mostrarAlerta("warning", error.response.data.message);
        } else {
          mostrarAlerta("error", "Error al agregar material.");
        }
      })
      .finally(() => {
        setOpenAgregarMaterial(false);
      });
  };

  const guardarYEnviar = async () => {
    if (!supervisorSeleccionado) {
      mostrarAlerta("warning", "Debe asignar un supervisor antes de guardar.");
      return;
    }

    const serviciosAsignados = servicios
      .filter((s) => parseFloat(s.cantidad) > 0)
      .map((s) => ({
        serviciosId: s.id,
        cantidadAsignada: parseFloat(s.cantidad),
        proyectoId: proyecto.id,
        userId: user.id,
        contratistaId: proyecto.contratistaId,
      }));

    const materialesAsignados = materiales
      .filter((m) => parseFloat(m.cantidad) > 0)
      .map((m) => ({
        materialesId: m.id,
        cantidadAsignado: parseFloat(m.cantidad),
        proyectoId: proyecto.id,
        userId: user.id,
      }));

    if (serviciosAsignados.length === 0 && materialesAsignados.length === 0) {
      mostrarAlerta("warning", "Debe agregar al menos un servicio o material.");
      return;
    }
    try {
      if (serviciosAsignados.length > 0) {
        await createServiciosAsignados(serviciosAsignados);
      }

      if (materialesAsignados.length > 0) {
        await createMaterialesAsignados(materialesAsignados);
      }

      const data = {
        id: proyecto.id,
        supervisorContrataId: supervisorSeleccionado.id,
      };
      await updateAsignarSupervisorContratista(data);
      mostrarAlerta("success", "Datos enviados correctamente");
      navigate("/home");
    } catch (error) {
      mostrarAlerta("error", `Error al guardar datos: ${error.message}`);
    }
  };

  return (
    <MainLayout>
      <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
        <Typography variant="h7" gutterBottom>
          Favor llenar con los datos echos del Replanteo
        </Typography>
        <Typography variant="subtitle3" gutterBottom>
          Proyecto: {proyecto ? proyecto.nombre : "No disponible"} ticket: {ticketCode}
        </Typography>
        <Box
          sx={{ display: "flex", flexDirection: "row", gap: 1, mb: 2, flexWrap: "nowrap", justifyContent: "center" }}
        >
          <Button
            variant="contained"
            color="error"
            size="small"
            sx={{ px: 2, minWidth: 150 }}
            onClick={() => setOpenDialogSupervisor(true)}
          >
            Supervisor
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            sx={{ px: 2, minWidth: 150 }}
            onClick={() => setOpenAgregarServicio(true)}
          >
            + Servicio
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            sx={{ px: 2, minWidth: 150 }}
            onClick={() => setOpenAgregarMaterial(true)}
          >
            + Material
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{ px: 2, minWidth: 180 }}
            onClick={guardarYEnviar}
          >
            Guardar Replanteo
          </Button>
        </Box>

        {supervisorSeleccionado ? (
          <Typography sx={{ mt: 1 }} color="primary">
            Supervisor seleccionado: {supervisorSeleccionado.UserData.nombre}
          </Typography>
        ) : null}
        <Divider sx={{ my: 1, width: "100%" }} />

        <Typography variant="subtitle2">Plantillas precargadas de servicios y materiales</Typography>
        {loadingData ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <FormularioSerMate servicios={servicios} materiales={materiales} onCantidadChange={handleCantidadChange} />
        )}
      </Box>

      <DialogAsignarSupervisor
        open={openDialogSupervisor}
        onClose={() => setOpenDialogSupervisor(false)}
        supervisores={supervisoresContratista}
        filtro={filtroSupervisoresContratista}
        setFiltro={setFiltroSupervisoresContratista}
        loading={loadingSupervisoresContratista}
        proyecto={proyecto}
        onAsignar={(supervisor) => {
          setSupervisorSeleccionado(supervisor);
          setOpenDialogSupervisor(false);
        }}
      />

      {/* agregar serviocios */}
      <Dialog open={openAgregarServicio} onClose={() => setOpenAgregarServicio(false)} fullWidth maxWidth="sm">
        <DialogTitle>Agregar Servicio desde Catálogo</DialogTitle>
        <DialogContent>
          <>
            <TextField
              label="Buscar por nombre o ID"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              value={inputBusqueda}
              onChange={(e) => setInputBusqueda(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  buscarServicios();
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button onClick={buscarServicios} variant="contained" size="small" disabled={buscando}>
                      Buscar
                    </Button>
                  </InputAdornment>
                ),
              }}
            />

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Codigo</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {serviciosCatalogo.map((serv) => (
                    <TableRow key={serv.id}>
                      <TableCell>{serv.servicio}</TableCell>
                      <TableCell>{serv.descripcionServicio}</TableCell>
                      <TableCell align="center">
                        <Button variant="outlined" size="small" onClick={() => handleAgregarServicio(serv)}>
                          Agregar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAgregarServicio(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* ///materiales */}
      <Dialog open={openAgregarMaterial} onClose={() => setOpenAgregarMaterial(false)} fullWidth maxWidth="sm">
        <DialogTitle>Agregar Material desde Catálogo</DialogTitle>
        <DialogContent>
          {loadingMaterialesCatalogo ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TextField
                label="Buscar por código o descripción"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={inputBusquedaMaterial}
                onChange={(e) => setInputBusquedaMaterial(e.target.value)}
                InputProps={{
                  endAdornment: buscandoMaterial ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Código</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {materialesFiltrados.map((mat) => (
                      <TableRow key={mat.id}>
                        <TableCell>{mat.codigo}</TableCell>
                        <TableCell>{mat.descripcion}</TableCell>
                        <TableCell align="center">
                          <Button variant="outlined" size="small" onClick={() => handleAgregarMaterial(mat)}>
                            Agregar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAgregarMaterial(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alerta.open}
        autoHideDuration={4000}
        onClose={cerrarAlerta}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={cerrarAlerta} severity={alerta.tipo} sx={{ width: "100%" }}>
          {alerta.mensaje}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
