// src/pages/home/Home.jsx
import React from "react";
import { Typography, Card, CardContent, CardMedia, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout"; // ✅ Importa el layout
import { useAuthUser } from "../../services/authServices"; // Importa el hook para obtener el usuario autenticado

// Define los roles de ejemplo que podrías usar. ¡Asegúrate de que estos coincidan con los roles reales de tus usuarios!
const ROLES = {
  admin: "admin",
  lider: "lider",
  supervisorClaro: "supervisor",
  supervisoContratista: "contratista",
  liderConstratista: "contratista-lider",
  planificador: "planificador",
};

const features = [
  {
    title: "Nuevo Proyecto",
    icon: "src/assets/project.png",
    path: "/nuevo-proyecto",
    allowedRoles: [ROLES.admin, ROLES.planificador], // Solo el administrador puede crear nuevos proyectos
  },
  {
    title: "Asignar Supervisor",
    icon: "src/assets/labor.png",
    path: "/asignar-supervisor",
    allowedRoles: [ROLES.admin, ROLES.lider], // Solo el administrador puede asignar supervisores
  },
  {
    title: "Replanteo",
    icon: "src/assets/gear.png",
    path: "/lista-proyectos-replanteo",
    allowedRoles: [ROLES.admin, ROLES.supervisorClaro, ROLES.lider], // Admin y Supervisor pueden ver replanteo
  },
  {
    title: "Ejecución Diaria",
    icon: "src/assets/ejecucion.png",
    path: "/lista-proyectos-ejecucion",
    allowedRoles: [
      ROLES.admin,
      ROLES.supervisorClaro,
      ROLES.supervisoContratista,
      ROLES.lider,
      ROLES.liderConstratista,
      ROLES.planificador,
    ], // Admin, Supervisor y Ejecutor
  },
  {
    title: "RDO y/o Conciliación Mate",
    icon: "src/assets/wire.png",
    path: "/lista-proyectos-rdo-conciliacion-materiales",
    allowedRoles: [
      ROLES.admin,
      ROLES.supervisorClaro,
      ROLES.supervisoContratista,
      ROLES.lider,
      ROLES.liderConstratista,
      ROLES.planificador,
    ],
  },
  // {
  //   title: "Liquidacion",
  //   icon: "src/assets/taxes.png",
  //   path: "/finanzas",
  //   allowedRoles: [ROLES.admin, ROLES.planificador, ROLES.lider], // Solo Admin y Finanzas
  // },
  {
    title: "Proyectos",
    icon: "src/assets/metric.png",
    path: "/lista-proyectos-generales",
    allowedRoles: [
      ROLES.admin,
      ROLES.supervisorClaro,
      ROLES.supervisoContratista,
      ROLES.lider,
      ROLES.liderConstratista,
      ROLES.planificador,
    ], // Todos pueden ver la lista general de proyectos
  },
  {
    title: "Reportes",
    icon: "src/assets/reporteNegocio.png",
    path: "/reporte-horas-retraso",
    allowedRoles: [ROLES.admin],
  },
];

export default function Home() {
  const navigate = useNavigate();
  const user = useAuthUser(); // Obtiene la información del usuario autenticado

  // Asegúrate de que user y user.UserData existan antes de intentar acceder a user.UserData.rol
  const userRole = user?.role;

  // Filtra las características basándose en el rol del usuario
  const accessibleFeatures = features.filter((item) => {
    // Si la característica no tiene roles definidos (por ejemplo, si quieres que sea visible para todos por defecto)
    // o si el rol del usuario está incluido en la lista de allowedRoles.
    return !item.allowedRoles || item.allowedRoles.includes(userRole);
  });

  return (
    <MainLayout>
      <Typography variant="h5" fontWeight="bold" mb={3} textAlign="center">
        Panel Principal {user ? ` - Bienvenido ${user.UserData.nombre}` : ""}
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {accessibleFeatures.map(
          (
            item,
            idx // Usa accessibleFeatures aquí
          ) => (
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
          )
        )}
      </Grid>
    </MainLayout>
  );
}
