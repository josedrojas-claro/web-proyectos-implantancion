import React, { useState, useEffect, useRef } from "react";
import MainLayout from "../../layout/MainLayout";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  fetchBitacoraFinal,
  patchFirmaBitacora,
  descargarPdfBitacora,
  cambioEstadoGeneral,
} from "../../services/bitacoraFinalServices";
import { useAuthUser } from "../../services/authServices";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Alert,
  Snackbar,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  DialogContentText,
} from "@mui/material";
import SignaturePad from "react-signature-pad-wrapper";
import CircularProgress from "@mui/material/CircularProgress";
const BitacoraFinal = () => {
  const { ticketCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthUser();

  const proyecto = location.state?.proyecto;

  //variable para abrir la alerta
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // valores posibles: "success", "warning", "error"
  });

  //estados para firma de operaciones o cliente
  const [rolFirma, setRolFirma] = useState("operaciones");
  const [nombre, setNombre] = useState("");
  const [carnet, setCarnet] = useState("");

  const sigCanvas = useRef();
  // ⛔ Si no viene el proyecto, redirigimos (no se debe acceder directo)
  /// Estado para manejar la firma de la bitácora
  const [bitacora, setBitacora] = useState(null);
  const [comentario, setComentario] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  //variable para manejar el cambio de estado del proyecto
  const [loadingNuevoEstado, setLoadingNuevoEstado] = useState(false);
  //variable para abirl el modal para confirma cambio de estado
  const [openConfirmacionCambioEstado, setOpenConfirmacionCambioEstado] =
    useState(false);
  React.useEffect(() => {
    if (!proyecto) {
      navigate("/lista-proyectos-ejecucion", {
        replace: true,
        state: {
          error: "Acceso inválido a bitácora final. Usa el flujo correcto.",
        },
      });
    }
  }, [proyecto, navigate]);

  useEffect(() => {
    if (!proyecto) return;
    const cargarBitacora = async () => {
      try {
        const data = await fetchBitacoraFinal(proyecto.id);
        setBitacora(data);
        setComentario(data?.[0]?.comentario || "");
      } catch (error) {
        console.error("Error al cargar bitácora:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarBitacora();
  }, [proyecto]);

  if (!proyecto) return null; // Evita render mientras redirige

  //firma del contratista
  const firmaContratista = bitacora?.[0]?.firmaContratista;
  const usuarioEsContratista = user.id === proyecto.supervisorContrataId;

  //firma del supervisor
  const firmaSupervisor = bitacora?.[0]?.firmaClaro;
  const usuarioEsSupervisor = user.id === proyecto.supervisorId;

  // firma del  usuario de operaciones o cliente
  const firmaOperaciones = bitacora?.[0]?.firmaOperaciones;

  const handleAceptarFirma = async () => {
    const yaFirmaronContratistaYSupervisor =
      !!firmaSupervisor && !!firmaContratista;

    // Siempre se debe enviar comentario
    if (!comentario.trim()) {
      alert("Por favor, escribe un comentario antes de guardar.");
      return;
    }

    const payload = {
      proyectoId: proyecto.id,
      comentario: comentario.trim(),
    };

    // Si ya firmaron contratista y supervisor, validamos firma de operaciones
    if (yaFirmaronContratistaYSupervisor) {
      if (sigCanvas.current.isEmpty()) {
        setSnackbar({
          open: true,
          message: "Por favor, firme antes de guardar.",
          severity: "error",
        });
        return;
      }
      const firma = sigCanvas.current
        .toDataURL("image/png")
        .replace(/^data:image\/png;base64,/, "");

      payload.firmaOperaciones = firma;
      payload.nombreOperaciones = nombre.trim();
      payload.carnet = carnet.trim();
      payload.tipoCliente = rolFirma;
    }

    try {
      const response = await patchFirmaBitacora(payload);
      const dataActualizada = await fetchBitacoraFinal(proyecto.id);
      setBitacora(dataActualizada);
      setShowConfirmDialog(false);
      setSnackbar({
        open: true,
        message: response?.message || "Firma guardada exitosamente.",
        severity: "success",
      });
    } catch (error) {
      console.error("Error al guardar firma:", error);
      const mensaje =
        error?.response?.data?.message || "Error al guardar firma en servidor.";
      setSnackbar({
        open: true,
        message: mensaje,
        severity: "error",
      });
    }
  };

  if (loading) return <Typography>Cargando bitácora...</Typography>;

  const handleDescargar = async () => {
    try {
      await descargarPdfBitacora(proyecto.id);
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
    }
  };

  //funcion para realizar el cambio de estado del proyecto
  const cargarBitacoraFinal = async (proyecto) => {
    try {
      setLoadingNuevoEstado(true);
      const response = await cambioEstadoGeneral(proyecto.id, {
        nuevoEstadoNombre: "Validacion Documentos",
      });
      setSnackbar({
        open: true,
        message: response.message || "Proyecto cambia de estado.",
        severity: "success",
      });
      setTimeout(() => {
        navigate("/lista-proyectos-ejecucion");
      }, 3000); // redirige después de 3 segundos
    } catch (error) {
      console.error("Error al cambiar estado del proyecto:", error);
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message ||
          "Error al cambiar estado del proyecto.",
        severity: "error",
      });
    }
  };

  return (
    <MainLayout>
      <div>
        <h4>
          Proyecto: {proyecto.nombre} Ticket: {ticketCode}
        </h4>

        <div>
          <h3>Registros de Bitácora</h3>

          <TextField
            fullWidth
            multiline
            minRows={6}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            sx={{ mb: 3, border: "1px solid red", borderRadius: 2, padding: 1 }}
          />
          {firmaContratista && firmaSupervisor && firmaOperaciones && (
            <Box display="flex" justifyContent="center" mt={2} pb={2}>
              <Box display="flex" gap={2}>
                {!["contratista", "contratista-lider"].includes(user.role) && (
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    sx={{ width: 200 }}
                    disabled={loadingNuevoEstado}
                    startIcon={
                      loadingNuevoEstado && <CircularProgress size={16} />
                    }
                    onClick={() => setOpenConfirmacionCambioEstado(true)}
                  >
                    {loadingNuevoEstado
                      ? "Cambiando estado..."
                      : "Proyecto Ejecutado"}
                  </Button>
                )}

                <Button
                  variant="contained"
                  size="small"
                  sx={{ width: 200 }}
                  disabled={loadingNuevoEstado}
                  startIcon={
                    loadingNuevoEstado && <CircularProgress size={16} />
                  }
                  onClick={handleDescargar}
                >
                  {loadingNuevoEstado ? "Cambiando estado..." : "Descargar PDF"}
                </Button>
              </Box>
            </Box>
          )}

          {/* firmas ya registradas */}
          <Grid
            container
            spacing={3}
            justifyContent="space-around"
            alignItems="center"
            sx={{ mt: 4, px: 2 }}
          >
            {/* firma contratista */}
            {!firmaContratista && (
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    border: "1px solid #ef5350",
                    borderRadius: 2,
                    padding: 1,
                    backgroundColor: "#fff",
                    color: "#d32f2f",
                    display: "inline-block",
                    maxWidth: "400px",
                    minWidth: "400px",
                    textAlign: "center",
                  }}
                >
                  {proyecto.SupervisorContratista.UserData.nombre ||
                    "Contratista sin nombre"}
                </Box>
                <Alert severity="warning" sx={{ mt: 1, maxWidth: "400px" }}>
                  Antes de seguir el flujo, el supervisor del contratista debe
                  aceptar la bitácora final primero.
                </Alert>
                {usuarioEsContratista && !firmaContratista && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                      if (!comentario.trim()) {
                        setSnackbar({
                          open: true,
                          message: "Por favor, ingresa un comentario.",
                          severity: "warning",
                        });
                        return;
                      }
                      setShowConfirmDialog(true);
                    }}
                    sx={{ maxWidth: "400px" }}
                  >
                    Aceptar términos y firmar
                  </Button>
                )}
              </Box>
            )}
            {/* Firma Contratista */}
            {firmaContratista && (
              <Grid item xs={12} sm={6} md={4}>
                <Box textAlign="center">
                  <Typography fontSize={13} color="textSecondary" mb={0.5}>
                    Contratista:
                  </Typography>
                  <img
                    src={`data:image/png;base64,${bitacora[0].firmaContratista}`}
                    alt="Firma Contratista"
                    style={{ maxHeight: 120 }}
                  />
                  <Typography fontWeight="bold" mt={1}>
                    {bitacora[0].nombreContratista}
                  </Typography>
                  <Typography fontSize={13}>
                    {proyecto.SupervisorContratista.UserData.carnet}
                  </Typography>
                </Box>
              </Grid>
            )}
            {/* firma de supervisor */}
            {!firmaSupervisor && firmaContratista && (
              <Box sx={{ mt: 4 }}>
                <Box
                  sx={{
                    border: "1px solid #ef5350",
                    borderRadius: 2,
                    padding: 1,
                    backgroundColor: "#fff",
                    color: "#d32f2f",
                    display: "inline-block",
                    maxWidth: "400px",
                    minWidth: "400px",
                    textAlign: "center",
                  }}
                >
                  {proyecto.Supervisor.UserData.nombre ||
                    "Supervisor sin nombre"}
                </Box>
                <Alert severity="warning" sx={{ mt: 1, maxWidth: "400px" }}>
                  El supervisor debe aceptar la bitácora final.
                </Alert>
                {usuarioEsSupervisor && !firmaSupervisor && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                      if (!comentario.trim()) {
                        setSnackbar({
                          open: true,
                          message: "Por favor, ingresa un comentario.",
                          severity: "warning",
                        });
                        return;
                      }
                      setShowConfirmDialog(true);
                    }}
                    sx={{ maxWidth: "400px" }}
                  >
                    Aceptar términos y firmar
                  </Button>
                )}
              </Box>
            )}
            {/* Firma Supervisor */}
            {firmaSupervisor && (
              <Grid item xs={12} sm={6} md={4}>
                <Box textAlign="center">
                  <Typography fontSize={13} color="textSecondary" mb={0.5}>
                    Supervisor:
                  </Typography>
                  <img
                    src={`data:image/png;base64,${bitacora[0].firmaClaro}`}
                    alt="Firma Supervisor"
                    style={{ maxHeight: 120 }}
                  />
                  <Typography fontWeight="bold" mt={1}>
                    {proyecto.Supervisor.UserData.nombre}
                  </Typography>
                  <Typography fontSize={13}>
                    {proyecto.Supervisor.UserData.carnet}
                  </Typography>
                </Box>
              </Grid>
            )}
            {/* firma de operaciones o cliente */}
            {firmaContratista && firmaSupervisor && !firmaOperaciones && (
              <Box sx={{ mt: 4, textAlign: "center" }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selecciona el Rol:
                </Typography>{" "}
                {/* selector del role */}
                <ToggleButtonGroup
                  value={rolFirma}
                  exclusive
                  onChange={(e, value) => value && setRolFirma(value)}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="operaciones">Operaciones</ToggleButton>
                  <ToggleButton value="cliente">Cliente</ToggleButton>
                </ToggleButtonGroup>
                {/* nombre del usaurioa aregistar */}
                <TextField
                  fullWidth
                  label="Escriba nombre del personal recibir"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  sx={{ mb: 2 }}
                  variant="outlined"
                />
                {/* cedula del usuario a registrar */}
                <TextField
                  fullWidth
                  label="Carnet o Cédula"
                  value={carnet}
                  onChange={(e) => setCarnet(e.target.value)}
                  sx={{ mb: 2 }}
                  variant="outlined"
                />
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ mb: 1 }}
                >
                  Firma
                </Typography>
                <Box
                  sx={{
                    border: "2px dashed #9e9e9e",
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    width: "100%",
                    height: 350,
                    mb: 2,
                    position: "relative",
                  }}
                >
                  <SignaturePad
                    ref={sigCanvas}
                    options={{
                      minWidth: 1,
                      maxWidth: 2.5,
                      penColor: "black",
                      backgroundColor: "#fff",
                    }}
                    canvasProps={{
                      style: {
                        borderRadius: "8px",
                        width: "100%",
                        height: "100%",
                      },
                    }}
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" gap={2}>
                  <Button
                    onClick={() => sigCanvas.current.clear()}
                    variant="outlined"
                    color="secondary"
                    fullWidth
                  >
                    Limpiar
                  </Button>
                  <Button
                    onClick={handleAceptarFirma}
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Guardar Firma
                  </Button>
                </Box>
              </Box>
            )}
            {/* Firma Operaciones */}
            {firmaOperaciones && (
              <Grid item xs={12} sm={6} md={4}>
                <Box textAlign="center">
                  <img
                    src={`data:image/png;base64,${bitacora[0].firmaOperaciones}`}
                    alt="Firma Operaciones"
                    style={{ maxHeight: 120 }}
                  />
                  <Typography fontWeight="bold" mt={1}>
                    {bitacora[0].nombreOperaciones}
                  </Typography>
                  <Typography fontSize={13}>{bitacora[0].carnet}</Typography>
                  <Typography fontSize={13}>
                    {bitacora[0].tipoCliente}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </div>
      </div>

      {/* dialog para confirmar la firma */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
      >
        <DialogTitle>¿Estás seguro de firmar esta bitácora?</DialogTitle>
        <DialogContent>
          <Typography fontWeight="bold" gutterBottom>
            Al guardar la firma, confirma que:
          </Typography>
          <Typography>- Ha revisado la bitácora correctamente.</Typography>
          <Typography>- Acepta los términos registrados.</Typography>
          <Typography>
            - Si es necesario realizar cambios, puede editar el último
            comentario antes de proceder.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleAceptarFirma}
            variant="contained"
            color="error"
          >
            Confirmar firma
          </Button>
        </DialogActions>
      </Dialog>

      {/* dialog para confirmar el cambio de estado del proyecto */}
      <Dialog
        open={openConfirmacionCambioEstado}
        onClose={() => setOpenConfirmacionCambioEstado(false)}
      >
        <DialogTitle>¿Confirmar ejecución?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Estás a punto de marcar este proyecto como{" "}
            <strong>Ejecutado</strong>. Esta acción cambiará su estado. ¿Estás
            seguro de continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenConfirmacionCambioEstado(false)}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              setOpenConfirmacionCambioEstado(false);
              cargarBitacoraFinal(proyecto);
            }}
            color="error"
            variant="contained"
            disabled={loadingNuevoEstado}
          >
            Confirmar
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

export default BitacoraFinal;
