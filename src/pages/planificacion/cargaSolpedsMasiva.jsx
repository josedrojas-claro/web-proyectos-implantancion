import React from "react";
import MainLayout from "../../layout/MainLayout";
import ProcesoMasivoSolpeds from "./components/ProcesoMasivoSolpeds";

export default function CargaSolpedsMasiva() {
  return (
    <MainLayout>
      <h2>Carga de Solped Masiva</h2>
      <ProcesoMasivoSolpeds />
    </MainLayout>
  );
}
