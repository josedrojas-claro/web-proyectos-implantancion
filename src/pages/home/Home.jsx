// src/pages/home/Home.jsx
import React from "react";
import { Typography, Card, CardContent, CardMedia, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout"; // ✅ Importa el layout
import { useAuthUser } from "../../services/authServices"; // Importa el hook para obtener el usuario autenticado
const features = [
  { title: "Nuevo Proyecto", icon: "src/assets/project.png", path: "/nuevo-proyecto" },
  { title: "Asignar Supervisor", icon: "src/assets/labor.png", path: "/asignar-supervisor" },
  { title: "Replanteo", icon: "src/assets/gear.png", path: "/lista-proyectos-replanteo" },
  { title: "Ejecución Diaria", icon: "src/assets/ejecucion.png", path: "/lista-proyectos-ejecucion" },
  { title: "RDO y/o Conciliación Mate", icon: "src/assets/wire.png", path: "/rdo-conciliacion" },
  { title: "Proyectos", icon: "src/assets/metric.png", path: "/proyectos" },
  { title: "Liquidación", icon: "src/assets/projectManagement.png", path: "/liquidacion" },
  { title: "-", icon: "src/assets/hand.png", path: "/finanzas" },
];

export default function Home() {
  const navigate = useNavigate();
  const user = useAuthUser();

  return (
    <MainLayout>
      <Typography variant="h5" fontWeight="bold" mb={3} textAlign="center">
        Panel Principal {user ? ` - Bienvenido ${user.UserData.nombre}` : ""}
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {features.map((item, idx) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 6,
                },
              }}
              onClick={() => navigate(item.path)}
            >
              <CardContent>
                <CardMedia
                  component="img"
                  src={item.icon}
                  alt={item.title}
                  sx={{ width: 100, height: 100, margin: "0 auto" }}
                />
                <Typography mt={2} fontWeight="bold" variant="body1">
                  {item.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </MainLayout>
  );
}
