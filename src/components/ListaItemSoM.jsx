import { Box, Paper, TextField, Typography } from "@mui/material";

export default function ListaItemSoM({
  tipo,
  items,
  onCantidadChange,
  tipoFormulario,
}) {
  return (
    <>
      {items.map((item, index) => {
        const data =
          tipo === "servicio"
            ? item.Servicios || item.servicio
            : item.Materiales || item.material;

        const cantidad =
          tipoFormulario === "replanteo"
            ? item.cantidadReplanteo
            : tipoFormulario === "asignado"
            ? item.cantidadAsignado || item.cantidadAsignada
            : item.cantidad;

        const cantidadAsignada =
          tipo === "servicio"
            ? item.cantidadAsignada ?? 0
            : item.cantidadAsignado || 0;
        const cantidadEjecutada = item.cantidadEjecutada ?? 0;
        const diferencia = cantidadAsignada - cantidadEjecutada;

        return (
          <Paper
            key={item.id}
            sx={{
              p: 2,
              borderRadius: 2,
              mb: 1,
              backgroundColor: "#f9f6ff",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography variant="subtitle2">
              <strong>{index + 1}.</strong>{" "}
              {tipo === "servicio"
                ? `Servicio: ${data?.servicio || data?.descripcion}`
                : `Material: ${data?.codigo}`}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {tipo === "servicio"
                ? `Descripción: ${
                    data?.descripcionServicio || data?.descripcion
                  }`
                : `Descripción: ${data?.descripcion}`}
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1,
              }}
            >
              <TextField
                size="small"
                type="number"
                label="Cantidad"
                sx={{ maxWidth: 100 }}
                value={cantidad || ""}
                onChange={(e) => {
                  const inputValue = e.target.value;

                  if (
                    (/^\d*\.?\d*$/.test(inputValue) &&
                      parseFloat(inputValue) >= 0) ||
                    inputValue === ""
                  ) {
                    onCantidadChange(tipo, item.id, inputValue);
                  }
                }}
              />

              {(tipoFormulario === "Replanteo" ||
                tipoFormulario === "Ejecucion") && (
                <Box sx={{ display: "flex", gap: 4 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Asignada
                    </Typography>
                    <Typography variant="body2">{cantidadAsignada}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Ejecutada
                    </Typography>
                    <Typography variant="body2">{cantidadEjecutada}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Diferencia
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      {diferencia}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        );
      })}
    </>
  );
}
