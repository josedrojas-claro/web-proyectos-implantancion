// components/DialogSolicitarServicio.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import ServicioSolicitudCard from "./ServiciosSolicitudCard";
import { fetchServiciosByContratista } from "../../../services/serviciosServices";

export default function DialogSolicitarServicio({ open, onClose, proyecto, serviciosAsignados }) {
  const [serviciosCatalogo, setServiciosCatalogo] = useState([]);
  const [inputBusqueda, setInputBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    if (open && proyecto?.contratistaId) {
      buscarServicios();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const buscarServicios = async () => {
    setBuscando(true);
    try {
      const response = await fetchServiciosByContratista(proyecto.contratistaId, inputBusqueda);
      setServiciosCatalogo(response);
    } catch (error) {
      console.error("Error buscando servicios:", error);
    } finally {
      setBuscando(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="sm">
      <DialogTitle>Agregar Servicio desde Catálogo</DialogTitle>
      <DialogContent>
        <TextField
          label="Buscar por nombre o codigo"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={inputBusqueda}
          onChange={(e) => setInputBusqueda(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") buscarServicios();
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

        {buscando ? (
          <CircularProgress />
        ) : serviciosCatalogo.length === 0 ? (
          <Typography variant="body2">Favor marcar o buscar el servicio deseado.</Typography>
        ) : (
          serviciosCatalogo.map((serv) => {
            const asignado = serviciosAsignados.find((s) => s.serviciosId === serv.id);
            const cantidadYaAsignada = asignado ? parseFloat(asignado.cantidadAsignada) : 0;

            return (
              <>
                <ServicioSolicitudCard
                  key={serv.id}
                  servicio={serv}
                  cantidadAsignada={cantidadYaAsignada}
                  proyectoId={proyecto.id}
                  contratistaId={proyecto.contratistaId}
                  onSuccess={() => onClose(true)}
                />
              </>
            );
          })
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
