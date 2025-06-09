import { useEffect, useState } from "react";
import { Typography, CircularProgress, Box } from "@mui/material";
import { fetchMaterialesEjecucionDiaria } from "../../../services/ejecucionDiariaServices"; // Asegúrate de importar correctamente

function ListaMaterialesUsados({ ejecucionId }) {
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await fetchMaterialesEjecucionDiaria(ejecucionId);
        setMateriales(data);
      } catch (error) {
        console.error("Error al cargar materiales:", error);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [ejecucionId]);

  if (loading) return <CircularProgress size={20} />;

  if (materiales.length === 0)
    return <Typography variant="body2">No se registraron materiales en esta ejecución.</Typography>;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography fontWeight="bold" sx={{ mb: 1 }}>
        Materiales usados:
      </Typography>
      {materiales.map((mat) => (
        <Box key={mat.id} sx={{ mb: 1, pl: 1, borderLeft: "3px solid #1976d2" }}>
          <Typography variant="body2" fontFamily="monospace">
            {mat.material.descripcion} ({mat.material.codigo}) — {mat.cantidadUsada} {mat.material.unidadMedida}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
export default ListaMaterialesUsados;
