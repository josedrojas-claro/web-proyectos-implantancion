// components/SolicitudCard.jsx
import { Box, Typography, IconButton, Chip, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function SolicitudCard({ solicitud, tipo, onDelete, user }) {
  // const isPendiente = solicitud.estado === "pendiente";
  const isAprobado = solicitud.estado === "aprobado";
  const isRechazado = solicitud.estado === "rechazado";

  const colorEstado = isAprobado ? "success" : isRechazado ? "error" : "warning";
  const labelEstado = solicitud.estado.toUpperCase();

  const codigo = tipo === "servicio" ? solicitud.servicio?.servicio : solicitud.material?.codigo;
  const descripcion = tipo === "servicio" ? solicitud.servicio?.descripcionServicio : solicitud.material?.descripcion;
  const esContratista = ["contratista", "contratista-lider"].includes(user.role);

  return (
    <Box
      sx={{
        backgroundColor: tipo === "material" ? "#f9f6fb" : "#f8fafa",
        borderRadius: 2,
        p: 2,
        boxShadow: 1,
        mb: 2,
        position: "relative",
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Chip label={labelEstado} color={colorEstado} variant="outlined" />
        {!isAprobado && onDelete && !esContratista && (
          <Tooltip title="Eliminar solicitud" arrow>
            <span
              onClick={() => onDelete(solicitud.id, tipo)}
              style={{
                cursor: "pointer",
                color: "#f44336",
                fontWeight: "bold",
                fontSize: "1.5rem",
                marginLeft: "auto",
                padding: "0 4px",
                userSelect: "none",
              }}
            >
              <DeleteIcon />
            </span>
          </Tooltip>
        )}
      </Box>

      <Typography variant="subtitle1" fontWeight="bold" mt={1}>
        {codigo}
      </Typography>
      <Typography variant="body2" color="textSecondary" noWrap>
        {descripcion}
      </Typography>
      <Typography variant="body2" mt={1}>
        📋 Cantidad solicitada: {parseFloat(solicitud.cantidad).toFixed(2)}
      </Typography>
      <Typography variant="body2" color="textSecondary" noWrap>
        Motivo: {solicitud.comentarioUsuario}
      </Typography>
      <Typography variant="body2" color="textSecondary" noWrap>
        Comentario Aprobador: {solicitud.comentarioAprobador}
      </Typography>
    </Box>
  );
}
