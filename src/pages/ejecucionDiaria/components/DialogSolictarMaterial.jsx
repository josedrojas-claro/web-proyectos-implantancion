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
import { fetchMaterialesByFiltro } from "../../../services/materialesServices";
import MaterialSolicitudCard from "./MaterialSolicitudCard";

export default function DialogSolicitarMaterial({
  open,
  onClose,
  proyecto,
  materialesAsignados,
}) {
  const [materialesCatalogo, setMaterialesCatalogo] = useState([]);
  const [inputBusqueda, setInputBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    if (open) {
      buscarMateriales();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const buscarMateriales = async () => {
    setBuscando(true);
    try {
      const response = await fetchMaterialesByFiltro(inputBusqueda);
      setMaterialesCatalogo(response);
    } catch (error) {
      console.log("Error buscando material: ", error);
    } finally {
      setBuscando(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="sm">
      <DialogTitle>Agregar Material desde Catálogo</DialogTitle>
      <DialogContent>
        <TextField
          label="Buscar por código"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={inputBusqueda}
          onChange={(e) => setInputBusqueda(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") buscarMateriales();
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  onClick={buscarMateriales}
                  variant="contained"
                  size="small"
                  disabled={buscando}
                >
                  Buscar
                </Button>
              </InputAdornment>
            ),
          }}
        />

        {buscando ? (
          <CircularProgress />
        ) : materialesCatalogo.length === 0 ? (
          <Typography variant="body2">
            Favor marcar o buscar el material deseado.
          </Typography>
        ) : (
          materialesCatalogo.map((material) => {
            const asignado = materialesAsignados.find(
              (m) => m.materialesId === material.id
            );
            const cantidadYaAsignada = asignado
              ? parseFloat(asignado.cantidadAsignado)
              : 0;

            return (
              <MaterialSolicitudCard
                key={material.id}
                material={material}
                cantidadAsignada={cantidadYaAsignada}
                proyectoId={proyecto.id}
                contratistaId={proyecto.contratistaId}
                onSuccess={() => onClose(true)}
              />
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
