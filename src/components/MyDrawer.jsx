// src/components/MyDrawer.jsx
import React from "react";
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box } from "@mui/material";
import {
  Home as HomeIcon,
  Construction as ConstructionIcon,
  Warehouse as WarehouseIcon,
  LocationOn as LocationOnIcon,
  Group as GroupIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authServices";

export default function MyDrawer({ open, toggleDrawer }) {
  const navigate = useNavigate();

  const drawerItems = [
    { label: "Página Principal", path: "/home", icon: <HomeIcon /> },
    { label: "Servicios", path: "/servicios", icon: <ConstructionIcon /> },
    { label: "Materiales", path: "/materiales", icon: <WarehouseIcon /> },
    { label: "Sitios", path: "/sitios", icon: <LocationOnIcon /> },
    { label: "Contratistas", path: "/contratistas", icon: <GroupIcon /> },
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
      <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
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
