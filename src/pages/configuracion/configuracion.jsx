import React from "react";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Paper,
  Divider,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";

// Importación de los iconos de Material-UI
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn"; // Para Estados Proyectos
import MapIcon from "@mui/icons-material/Map"; // Para Zonificaciones
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings"; // Para Roles

export default function Configuracion() {
  // Hook de react-router-dom para manejar la navegación
  const navigate = useNavigate();

  // Es una buena práctica definir los elementos del menú en un arreglo.
  // Facilita añadir, quitar o modificar opciones en el futuro.
  const menuItems = [
    {
      text: "Estados Proyectos",
      icon: <AssignmentTurnedInIcon />,
      path: "/configuraciones/estados",
      description: "Gestionar los diferentes estados de los proyectos.",
    },
    {
      text: "Zonificaciones",
      icon: <MapIcon />,
      path: "/configuraciones/zonificaciones",
      description: "Administrar las zonas geográficas y sus propiedades.",
    },
    {
      text: "Roles de Usuario",
      icon: <AdminPanelSettingsIcon />,
      path: "/configuraciones/roles",
      description: "Definir permisos y roles para los usuarios del sistema.",
    },
  ];

  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ padding: 3, borderRadius: "16px" }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Panel de Configuración
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Selecciona una sección para administrar sus parámetros.
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List component="nav" aria-label="menú de configuración">
            {menuItems.map((item, index) => (
              <ListItemButton
                key={index}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: "8px",
                  marginBottom: 1,
                  "&:hover": { backgroundColor: "action.hover" },
                }}
              >
                <ListItemIcon sx={{ color: "primary.main", minWidth: "40px" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  secondary={item.description}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </Container>
    </MainLayout>
  );
}
