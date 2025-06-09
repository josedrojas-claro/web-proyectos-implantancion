import { useEffect, useState } from "react";
import { Typography, CircularProgress, Box } from "@mui/material";
import { fetchServiciosEjecucionDiaria } from "../../../services/ejecucionDiariaServices"; // Asegúrate de importar correctamente

function ListaServiciosUsados({ ejecucionId }) {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await fetchServiciosEjecucionDiaria(ejecucionId);
        setServicios(data);
      } catch (error) {
        console.error("Error al cargar servicios:", error);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [ejecucionId]);

  if (loading) return <CircularProgress size={20} />;

  if (servicios.length === 0)
    return <Typography variant="body2">No se registraron servicios en esta ejecución.</Typography>;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography fontWeight="bold" sx={{ mb: 1 }}>
        Servicios usados:
      </Typography>
      {servicios.map((serv) => (
        <Box key={serv.id} sx={{ mb: 1, pl: 1, borderLeft: "3px solid #1976d2" }}>
          <Typography variant="body2" fontFamily="monospace">
            {serv.Servicios.descripcionServicio} ({serv.Servicios.servicio}) — {serv.cantidadUsada}{" "}
            {serv.Servicios.unidadMedida}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default ListaServiciosUsados;
