// src/components/MyAppBar.jsx
import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArticleIcon from "@mui/icons-material/Article";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import HomeIcon from "@mui/icons-material/Home";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

export default function MyAppBar({ toggleDrawer }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  return (
    <AppBar position="fixed" sx={{ backgroundColor: "#ff2d00" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box
          onClick={toggleDrawer(true)} // ✅ Aquí activamos el Drawer
          sx={{ display: "flex", alignItems: "center" }}
        >
          <MenuIcon fontSize="medium" sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            PROYECTOS IMPLANTACIÓN
          </Typography>
        </Box>

        {!isMobile && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              color="inherit"
              startIcon={<HomeIcon />}
              onClick={() => navigate("/home")}
            >
              Home
            </Button>
            <Button
              color="inherit"
              startIcon={<ArticleIcon />}
              onClick={() => navigate("/lista-proyectos-generales")}
            >
              Proyectos
            </Button>

            <Button
              color="inherit"
              startIcon={<NoteAltIcon />}
              onClick={() => navigate("/lista-proyectos-ejecucion")}
            >
              Ejecución Diaria
            </Button>
            <Button
              color="inherit"
              startIcon={<DocumentScannerIcon />}
              onClick={() =>
                navigate("/lista-proyectos-rdo-conciliacion-materiales")
              }
            >
              RDO
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
