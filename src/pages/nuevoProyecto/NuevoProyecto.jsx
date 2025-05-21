import React from "react";
import MyAppBar from "../../components/MyAppBar";
import {
  Box,
  TextField,
  Stack,
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
  const handleGuardarProyecto = () => {
    if (!validarFormulario()) return; // ⛔ si no pasa validación, no continúa

    const proyectoData = {
      nombre: nombreProyecto, // Cambia esto por el valor real
      descripcion: descripcionProyecto, // Cambia esto por el valor real
      sitioId: sitioSeleccionado.id,
      contratistaId: contratistaSeleccionado.id,
      codigoIngenieriaId: codigoIngSeleccionado.id,
      tecnologia: tecnologiaSeleccionada.nombre_tecnologia,
      havePo: poStatus,
      userId: 2,
    };

    createProyecto(proyectoData)
      .then((response) => {
        if (response?.message && response?.data?.ticketCode) {
          setMensaje(response.message);
          setTicketCode(response.data.ticketCode);
          setOpenDialog(true); // Abrir el dialog
        }
      })
      .catch((error) => {
        console.error("Error al crear el proyecto:", error);
        // Aquí puedes manejar el error
      });
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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <MyAppBar />
      <h1>Nuevo Proyecto</h1>

      {/* Nombre Proyecto */}
      <Box sx={{ width: "90%", maxWidth: 500, mb: 2 }}>
        <TextField
          label="Nombre del Proyecto"
          fullWidth
          variant="outlined"
          required
          value={nombreProyecto} // 💡 aquí se enlaza el valor
          onChange={(e) => setNombreProyecto(e.target.value)} // 💡 aquí se actualiza
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "& fieldset": { borderColor: "#d32f2f" },
              "&:hover fieldset": { borderColor: "#9a0007" },
            },
          }}
          helperText={errores.nombre ? "Este campo es obligatorio" : ""}
        />
      </Box>

      {/* Descripción */}
      <Box sx={{ width: "90%", maxWidth: 500, mb: 1 }}>
        <TextField
          label="Descripcion Proyecto"
          fullWidth
          multiline
          rows={4}
          value={descripcionProyecto} // 💡 aquí se enlaza el valor}
          onChange={(e) => setDescripcionProyecto(e.target.value)} // 💡 aquí se actualiza
          helperText={
            errores.descripcion
              ? "Este campo es obligatorio"
              : "Puede poner un nombre más amplio o algo que describa más al proyecto"
          }
          error={errores.descripcion}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "& fieldset": { borderColor: "#d32f2f" },
              "&:hover fieldset": { borderColor: "#9a0007" },
            },
          }}
        />
      </Box>

      <Stack spacing={2} sx={{ width: "50ch" }}>
        {/* Seleccion de sitio  */}
        <SeleccionarSitios onSelect={(sitio) => setSitioSeleccionado(sitio)} />
        {errores.sitio && (
          <Typography variant="caption" color="error" sx={{ ml: 1 }}>
            Debe seleccionar un sitio
          </Typography>
        )}
        {/* Selecionar contratista */}
        <SeleccionarContratista onSelect={(contratista) => setContratistaSeleccionado(contratista)} />
        {errores.contratista && (
          <Typography variant="caption" color="error" sx={{ ml: 1 }}>
            Debe seleccionar un contratista
          </Typography>
        )}
        {/* seleccionar codigo ingeniería */}
        <SelecionarCodigoIng onSelect={(codigoIng) => setCodigoIngSeleccionado(codigoIng)} />
        {errores.codigo && (
          <Typography variant="caption" color="error" sx={{ ml: 1 }}>
            Debe seleccionar un código de ingeniería
          </Typography>
        )}
        {/* selecionar tecnologia */}
        <SeleccionarTecnologia onSelect={(tecnologia) => setTecnologiaSeleccionada(tecnologia)} />
        {errores.tecnologia && (
          <Typography variant="caption" color="error" sx={{ ml: 1 }}>
            Debe seleccionar una tecnología
          </Typography>
        )}
      </Stack>
      <Box sx={{ mt: 2 }} />

      {/* Selector PO */}
      <ToggleButtonGroup
        value={poStatus ? "true" : "false"}
        exclusive
        onChange={(e, newVal) => {
          if (newVal !== null) setPoStatus(newVal === "true");
        }}
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
            "&:hover": {
              bgcolor: "#f5f5f5",
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
            "&:hover": {
              bgcolor: "#f5f5f5",
            },
          }}
        >
          ✓ Sin PO
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Botón Guardar */}
      <Box sx={{ mt: 1 }}>
        <Button variant="contained" color="error" size="large" onClick={handleGuardarProyecto}>
          Guardar Proyecto
        </Button>
      </Box>
      <Box sx={{ mt: 2 }} />
      {/* dialgon para mostrar el mensaje */}
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
    </div>
  );
}
