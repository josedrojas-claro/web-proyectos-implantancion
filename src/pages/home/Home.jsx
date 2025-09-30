// src/pages/home/Home.jsx
import React from "react";
import { Typography, Card, CardContent, CardMedia, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout"; // ✅ Importa el layout
import { useAuthUser } from "../../services/authServices"; // Importa el hook para obtener el usuario autenticado
import nuevoProyectoIcon from "../../assets/project.png";
import asigarSupervisorIcon from "../../assets/labor.png";
import replanteoIcon from "../../assets/gear.png";
import ejecucionDiariaIcon from "../../assets/ejecucion.png";
import rdoConciliacionIcon from "../../assets/wire.png";
import proyectosIcon from "../../assets/metric.png";
import reportesIcon from "../../assets/reporteNegocio.png";
import reservaIcon from "../../assets/reserva.png";
import planificacionIcon from "../../assets/dta.png";

// Define los roles de ejemplo que podrías usar. ¡Asegúrate de que estos coincidan con los roles reales de tus usuarios!
const ROLES = {
  admin: "admin",
  lider: "lider",
  supervisorClaro: "supervisor",
  supervisoContratista: "contratista",
  liderContratista: "contratista-lider",
  planificador: "planificador",
  coordinadorIng: "coordinador-ing",
  coordinadorSup: "coordinador-sup",
};

const features = [
  {
    title: "Nuevo Proyecto",
    icon: nuevoProyectoIcon,
    path: "/nuevo-proyecto",
    allowedRoles: [ROLES.admin, ROLES.planificador, ROLES.coordinadorIng], // Solo el administrador puede crear nuevos proyectos
  },
  {
    title: "Planificacion",
    icon: planificacionIcon,
    path: "/lista-proyectos-planificacion",
    allowedRoles: [ROLES.admin, ROLES.planificador, ROLES.coordinadorIng], // Solo el administrador puede asignar supervisores
  },
  {
    title: "Asignar Supervisor",
    icon: asigarSupervisorIcon,
    path: "/asignar-supervisor",

    allowedRoles: [ROLES.admin, ROLES.lider, ROLES.coordinadorSup], // Solo el administrador puede asignar supervisores
  },
  {
    title: "Replanteo",
    icon: replanteoIcon,
    path: "/lista-proyectos-replanteo",
    allowedRoles: [
      ROLES.admin,
      ROLES.supervisorClaro,
      ROLES.lider,
      ROLES.coordinadorIng,
      ROLES.coordinadorSup,
    ], // Admin y Supervisor pueden ver replanteo
  },
  {
    title: "Gestion Reserva",
    icon: reservaIcon,
    path: "/lista-proyectos-gestion-reserva",
    allowedRoles: [
      ROLES.admin,
      ROLES.planificador,
      ROLES.lider,
      ROLES.coordinadorIng,
      ROLES.coordinadorSup,
      ROLES.supervisorClaro,
      ROLES.supervisoContratista,
      ROLES.liderContratista,
    ],
  },
  {
    title: "Ejecución Diaria",
    icon: ejecucionDiariaIcon,
    path: "/lista-proyectos-ejecucion",
    allowedRoles: [
      ROLES.admin,
      ROLES.supervisorClaro,
      ROLES.supervisoContratista,
      ROLES.lider,
      ROLES.liderContratista,
      ROLES.planificador,
      ROLES.coordinadorIng,
      ROLES.coordinadorSup,
    ], // Admin, Supervisor y Ejecutor
  },
  {
    title: "RDO Final",
    icon: rdoConciliacionIcon,
    path: "/lista-proyectos-rdo-conciliacion-materiales",
    allowedRoles: [
      ROLES.admin,
      ROLES.supervisorClaro,
      ROLES.supervisoContratista,
      ROLES.lider,
      ROLES.liderContratista,
      ROLES.planificador,
      ROLES.coordinadorIng,
      ROLES.coordinadorSup,
    ],
  },
  {
    title: "Conciliacion Materiales",
    icon: "src/assets/conciliacionMateriales.png",
    path: "/lista-conciliacion-materiales",
    allowedRoles: [
      ROLES.admin,
      ROLES.planificador,
      ROLES.coordinadorSup,
      ROLES.coordinadorIng,
      ROLES.lider,
      ROLES.liderContratista,
      ROLES.supervisorClaro,
      ROLES.supervisoContratista,
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
    icon: proyectosIcon,
    path: "/lista-proyectos-generales",
    allowedRoles: [
      ROLES.admin,
      ROLES.supervisorClaro,
      ROLES.supervisoContratista,
      ROLES.lider,
      ROLES.liderContratista,
      ROLES.planificador,
      ROLES.coordinadorIng,
      ROLES.coordinadorSup,
    ],
  },
  {
    title: "Reportes",
    icon: reportesIcon,
    path: "/reporte-horas-retraso",
    allowedRoles: [
      ROLES.admin,
      ROLES.coordinadorIng,
      ROLES.coordinadorSup,
      ROLES.lider,
    ],
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
