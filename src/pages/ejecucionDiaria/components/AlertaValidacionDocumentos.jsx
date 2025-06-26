import { Alert, AlertTitle, Box, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { blue } from "@mui/material/colors";

export default function AlertaValidacionDocumentos() {
  return (
    <Box
      sx={{
        backgroundColor: "#fdf6f6",
        p: 3,
        borderRadius: 2,
        mb: 3,
        border: "1px solid #f2caca",
      }}
    >
      <Alert
        icon={<WarningAmberIcon fontSize="inherit" />}
        severity="warning"
        sx={{ mb: 2, justifyContent: "center", textAlign: "center" }}
      >
        <AlertTitle>
          <strong>⚠️ Atención</strong>
        </AlertTitle>
        <Typography variant="body2">
          <DescriptionIcon fontSize="inherit" sx={{ mr: 1, verticalAlign: "middle" }} />
          En esta sección debes subir todos los documentos finales requeridos para el cierre del proyecto.
        </Typography>
      </Alert>

      <Typography variant="body2" textAlign="center" sx={{ mb: 1 }}>
        ⚠️ Una vez confirmada la carga, <strong>no podrás editar ni volver a subir archivos</strong>. Asegúrate de que
        los documentos estén completos y correctamente validados antes de continuar.
      </Typography>

      <Typography variant="body2" textAlign="center">
        <CheckBoxIcon fontSize="inherit" sx={{ mr: 1, verticalAlign: "middle" }} />
        Esta será la información oficial que quedará registrada en el sistema al cambiar el estado del proyecto a{" "}
        <span style={{ color: blue[600], fontWeight: "bold" }}>RDO</span>.
      </Typography>
    </Box>
  );
}
