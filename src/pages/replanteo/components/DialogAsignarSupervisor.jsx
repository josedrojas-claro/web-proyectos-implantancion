import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

export default function DialogAsignarSupervisor({
  open,
  onClose,
  supervisores,
  filtro,
  setFiltro,
  loading,
  onAsignar,
  proyecto,
}) {
  const supervisoresFiltrados = (supervisores ?? []).filter((supervisor) =>
    supervisor.UserData.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Asignar Supervisor al proyecto: {proyecto?.nombre}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Selecciona un supervisor
        </Typography>

        <TextField
          label="Buscar supervisor"
          placeholder="Buscar por nombre"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />

        {loading ? (
          <CircularProgress />
        ) : (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Nombre</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Acciones</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {supervisoresFiltrados.map((supervisor, index) => (
                  <TableRow key={supervisor.id} sx={{ bgcolor: index % 2 === 0 ? "#fafafa" : "white" }}>
                    <TableCell>{supervisor.UserData.nombre}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<PersonAddAltIcon />}
                        onClick={() => onAsignar(supervisor)}
                      >
                        Asignar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
}
