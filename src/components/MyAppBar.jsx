import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import ArticleIcon from "@mui/icons-material/Article";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import ConstructionIcon from "@mui/icons-material/Construction";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupIcon from "@mui/icons-material/Group";
import LogoutIcon from "@mui/icons-material/Logout";
import { useTheme } from "@mui/material/styles";
import { logout } from "../services/authServices";
import { useNavigate } from "react-router-dom";

export default function MyAppBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const navigate = useNavigate();

  const handleDrawerClick = (item) => {
    if (item.action === "logout") {
      logout().then(() => {
        navigate("/login", { replace: true });
      });
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const drawerItems = [
    { label: "Página Principal", path: "/home", icon: <HomeIcon /> },
    { label: "Servicios", path: "/home", icon: <ConstructionIcon /> },
    { label: "Materiales", path: "/home", icon: <WarehouseIcon /> },
    { label: "Sitios", path: "/home", icon: <LocationOnIcon /> },
    { label: "Contratistas", path: "/home", icon: <GroupIcon /> },
    { label: "Cerrar Sesión", action: "logout", icon: <LogoutIcon /> },
  ];

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {drawerItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={() => handleDrawerClick(item)}>
              <ListItemIcon>
                {/* 🔧 Aquí puedes reemplazar cada null por el ícono que desees */}
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#ff2d00" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              onClick={toggleDrawer(true)}
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "white",
                mr: 2,
              }}
            >
              <MenuIcon fontSize="medium" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: "bold", ml: isMobile ? 1 : 0 }}>
              PROYECTOS IMPLANTACIÓN
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button color="inherit" startIcon={<HomeIcon />} onClick={() => navigate("/home")}>
                Home
              </Button>
              <Button color="inherit" startIcon={<ArticleIcon />}>
                Proyectos
              </Button>
              <Button color="inherit" startIcon={<NoteAltIcon />}>
                Ejecución Diaria
              </Button>
              <Button color="inherit" startIcon={<DocumentScannerIcon />}>
                RDO
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer separado para que no esté anidado dentro del AppBar */}
      <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </>
  );
}
