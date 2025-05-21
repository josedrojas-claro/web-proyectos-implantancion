import React from "react";
import { Typography, Card, CardContent, CardMedia, Toolbar } from "@mui/material";
import Grid from "@mui/material/Grid";
import MyAppBar from "../../components/MyAppBar";
import { useNavigate } from "react-router-dom";

const features = [
  { title: "Nuevo Proyecto", icon: "src/assets/project.png", path: "/nuevo-proyecto" },
  { title: "Asignar Supervisor", icon: "src/assets/labor.png", path: "/asignar-supervisor" },
  { title: "Replanteo", icon: "src/assets/gear.png", path: "/replanteo" },
  { title: "Ejecución Diaria", icon: "src/assets/ejecucion.png", path: "/ejecucion-diaria" },
  { title: "RDO y/o Conciliación Mate", icon: "src/assets/wire.png", path: "/rdo-conciliacion" },
  { title: "Proyectos", icon: "src/assets/metric.png", path: "/proyectos" },
  { title: "Liquidación", icon: "src/assets/projectManagement.png", path: "/liquidacion" },
  { title: "-", icon: "src/assets/hand.png", path: "/finanzas" },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <MyAppBar />

      <div
        style={{
          flex: 1,
          background: "linear-gradient(to right, #C06C00, #AF4B9E)",
          padding: 24,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 24,
            maxWidth: 1300,
            margin: "0 auto",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          }}
        >
          <Typography variant="h5" fontWeight="bold" mb={3} textAlign="center">
            Panel Principal
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
        </div>
      </div>
    </div>
  );
}
