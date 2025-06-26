import React from "react";
import {
  Box,
  TextField,
  Grid,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SeleccionarSitios from "./components/seleccionarSitios";
import SeleccionarContratista from "./components/seleccionarContratista";
import SelecionarCodigoIng from "./components/selecionarCodigoIng";
import SeleccionarTecnologia from "./components/seleccionarTecnologia";
import { createProyecto } from "../../services/proyectoServices";
import MainLayout from "../../layout/MainLayout";
import { useAuthUser } from "../../services/authServices";
import Swal from "sweetalert2";

export default function NuevoProyecto() {
  const [sitioSeleccionado, setSitioSeleccionado] = React.useState(null);
  const [contratistaSeleccionado, setContratistaSeleccionado] = React.useState(null);
  const [codigoIngSeleccionado, setCodigoIngSeleccionado] = React.useState(null);
  const [tecnologiaSeleccionada, setTecnologiaSeleccionada] = React.useState(null);
  const [poStatus, setPoStatus] = React.useState(false); // false = sin PO
  const [nombreProyecto, setNombreProyecto] = React.useState("");
  const [descripcionProyecto, setDescripcionProyecto] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [ticketCode, setTicketCode] = React.useState(null);
  const [mensaje, setMensaje] = React.useState("");
  const [errores, setErrores] = React.useState({
    nombre: false,
    descripcion: false,
    sitio: false,
    contratista: false,
    codigo: false,
    tecnologia: false,
  });
  const user = useAuthUser();

  const handleGuardarProyecto = async () => {
    if (!validarFormulario()) return;

    // Paso 1: Confirmar con el usuario
    const confirmacion = await Swal.fire({
      title: "¿Deseas registrar este proyecto?",
      text: `Se generará un nuevo ticket, el nombre de proyecto: ${nombreProyecto} ¿Estás seguro?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, registrar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    // Paso 2: Preparar datos
    const proyectoData = {
      nombre: nombreProyecto,
      descripcion: descripcionProyecto,
      sitioId: sitioSeleccionado.id,
      contratistaId: contratistaSeleccionado.id,
      codigoIngenieriaId: codigoIngSeleccionado.id,
      tecnologia: tecnologiaSeleccionada.nombre_tecnologia,
      havePo: poStatus,
      userId: user.id,
    };

    // Paso 3: Guardar y mostrar resultado
    try {
      const response = await createProyecto(proyectoData);

      if (response?.message && response?.data?.ticketCode) {
        Swal.fire({
          title: "✅ Registro de ticket",
          html: `<strong>${response.message}</strong><br/>Código generado: <code>${response.data.ticketCode}</code>`,
          icon: "success",
          confirmButtonText: "Aceptar",
        });
      }
    } catch (error) {
      console.error("Error al crear el proyecto:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo registrar el proyecto. Intenta nuevamente.",
        icon: "error",
      });
    }
  };

  const resetFormulario = () => {
    setNombreProyecto("");
    setDescripcionProyecto("");

    setPoStatus(false);
    setTicketCode(null);
    setMensaje("");
  };

  const validarFormulario = () => {
    const nuevosErrores = {
      nombre: !nombreProyecto.trim(),
      descripcion: !descripcionProyecto.trim(),
      sitio: !sitioSeleccionado,
      contratista: !contratistaSeleccionado,
      codigo: !codigoIngSeleccionado,
      tecnologia: !tecnologiaSeleccionada,
    };

    setErrores(nuevosErrores);

    // Si hay al menos un campo con error, retornar false
    return !Object.values(nuevosErrores).some((val) => val);
  };

  return (
    <MainLayout>
      <Typography variant="h5" textAlign="center" fontWeight="bold" mb={3}>
        Nuevo Proyecto
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {/* Columna izquierda */}
        <Grid item xs={12} md={6} display="flex" flexDirection="column" gap={2} alignItems="center">
          <TextField
            label="Nombre del Proyecto"
            fullWidth
            value={nombreProyecto}
            onChange={(e) => setNombreProyecto(e.target.value)}
            error={errores.nombre}
            helperText={errores.nombre ? "Este campo es obligatorio" : ""}
            sx={{
              width: "50ch",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "& fieldset": { borderColor: "#d32f2f" },
                "&:hover fieldset": { borderColor: "#9a0007" },
              },
            }}
          />

          <SeleccionarSitios onSelect={setSitioSeleccionado} />
          {errores.sitio && (
            <Typography color="error" variant="caption">
              Debe seleccionar un sitio
            </Typography>
          )}

          <SeleccionarContratista onSelect={setContratistaSeleccionado} />
          {errores.contratista && (
            <Typography color="error" variant="caption">
              Debe seleccionar un contratista
            </Typography>
          )}

          <SelecionarCodigoIng onSelect={setCodigoIngSeleccionado} />
          {errores.codigo && (
            <Typography color="error" variant="caption">
              Debe seleccionar un código
            </Typography>
          )}

          <SeleccionarTecnologia onSelect={setTecnologiaSeleccionada} />
          {errores.tecnologia && (
            <Typography color="error" variant="caption">
              Debe seleccionar una tecnología
            </Typography>
          )}
        </Grid>

        {/* Columna derecha */}
        <Grid item xs={12} md={6} display="flex" flexDirection="column" gap={2} alignItems="center">
          <TextField
            label="Descripción Proyecto"
            fullWidth
            multiline
            rows={6}
            value={descripcionProyecto}
            onChange={(e) => setDescripcionProyecto(e.target.value)}
            error={errores.descripcion}
            helperText={
              errores.descripcion
                ? "Este campo es obligatorio"
                : "Puede poner un nombre más amplio o algo que describa más al proyecto"
            }
            sx={{
              width: "50ch",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "& fieldset": { borderColor: "#d32f2f" },
                "&:hover fieldset": { borderColor: "#9a0007" },
              },
            }}
          />

          <ToggleButtonGroup
            value={poStatus ? "true" : "false"}
            exclusive
            onChange={(e, newVal) => {
              if (newVal !== null) setPoStatus(newVal === "true");
            }}
            sx={{ mt: 2 }}
          >
            <ToggleButton
              value="true"
              sx={{
                color: "#d32f2f",
                borderColor: "#d32f2f",
                "&.Mui-selected": {
                  bgcolor: "#d32f2f",
                  color: "#fff",
                },
              }}
            >
              Con PO
            </ToggleButton>
            <ToggleButton
              value="false"
              sx={{
                color: "#d32f2f",
                borderColor: "#d32f2f",
                "&.Mui-selected": {
                  bgcolor: "#d32f2f",
                  color: "#fff",
                },
              }}
            >
              ✓ Sin PO
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>

      {/* Botón Guardar */}
      <Box mt={4} display="flex" justifyContent="center">
        <Button variant="contained" color="error" size="large" onClick={handleGuardarProyecto} sx={{ width: "250px" }}>
          Guardar Proyecto
        </Button>
      </Box>

      {/* Diálogo */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          resetFormulario();
        }}
      >
        <DialogTitle color="success.main">Proyecto Registrado</DialogTitle>
        <DialogContent>
          <Typography>{mensaje}</Typography>
          <Typography fontWeight="bold" color="primary" mt={2}>
            Código generado: {ticketCode}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
              resetFormulario();
            }}
            color="error"
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
