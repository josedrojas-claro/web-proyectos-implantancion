// src/components/MyDrawer.jsx
import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Typography,
  Divider,
} from "@mui/material";
import {
  Home as HomeIcon,
  Construction as ConstructionIcon,
  Warehouse as WarehouseIcon,
  LocationOn as LocationOnIcon,
  Group as GroupIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authServices";
import { useAuthUser } from "../services/authServices";

export default function MyDrawer({ open, toggleDrawer }) {
  const navigate = useNavigate();

  const user = useAuthUser();

  const drawerItems = [
    { label: "Página Principal", path: "/home", icon: <HomeIcon /> },
    {
      label: "Servicios",
      path: "/lista-servicios",
      icon: <ConstructionIcon />,
    },
    { label: "Materiales", path: "/lista-materiales", icon: <WarehouseIcon /> },
    { label: "Sitios", path: "/lista-sitios", icon: <LocationOnIcon /> },
    { label: "Contratistas", path: "/lista-contratistas", icon: <GroupIcon /> },
    // El ítem de Configuración solo se añade al arreglo si el rol del usuario es 'admin'
    ...(user?.role === "admin"
      ? [
          {
            label: "Configuracion",
            path: "/configuraciones", // Corregí la ruta para que sea única
            icon: <SettingsIcon />,
          },
        ]
      : []), // Si no es admin, se añade un arreglo vacío (o sea, nada)
    { label: "Cerrar Sesión", action: "logout", icon: <LogoutIcon /> },
  ];

  const handleClick = (item) => {
    if (item.action === "logout") {
      logout().then(() => navigate("/login", { replace: true }));
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
      <Box
        sx={{ width: 250 }}
        role="presentation"
        onClick={toggleDrawer(false)}
      >
        {/* Avatar y datos del usuario */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Avatar sx={{ bgcolor: "#1976d2", width: 56, height: 56 }}>
            {user?.UserData.nombre?.[0]?.toUpperCase()}
          </Avatar>
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            {user?.UserData.nombre || "Usuario"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email || "correo@ejemplo.com"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Role: {user?.role || "correo@ejemplo.com"}
          </Typography>
          <Divider sx={{ my: 2, width: "100%" }} />
        </Box>

        {/* Menú de navegación */}
        <List>
          {drawerItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton onClick={() => handleClick(item)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
