import React, { useState } from "react";
import MainLayout from "../../layout/MainLayout";
import { useNavigate } from "react-router-dom";
import { Button, Steps, theme, Typography } from "antd";
import Step1DescargaExcel from "./components/step1DescargaExcel";
import Step2SubirPo from "./components/step2SubirPO";
import Step3Finalizar from "./components/step3Finalizar";
const { Title } = Typography;

export default function CargaPoMasiva() {
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);
  // ✨ 1. Nuevo estado para controlar si el paso 1 se completó
  const [step1Completed, setStep1Completed] = useState(false);
  const [step2Completed, setStep2Completed] = useState(false);
  // ✨ 2. Definimos los pasos aquí para pasar las props necesarias

  const navigate = useNavigate();

  const steps = [
    {
      title: "Descarga SOLPEDS",
      content: <Step1DescargaExcel onDownloadComplete={setStep1Completed} />, // Le pasamos la función
    },
    {
      title: "Carga de PO",
      content: <Step2SubirPo onUploadComplete={setStep2Completed} />,
    },
    {
      title: "Finalizar",
      content: <Step3Finalizar />,
    },
  ];

  const next = () => setCurrent(current + 1);
  const prev = () => setCurrent(current - 1);
  const items = steps.map((item) => ({ key: item.title, title: item.title }));
  const contentStyle = {
    color: token.colorTextTertiary,
    backgroundColor: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: `1px dashed ${token.colorBorder}`,
    marginTop: 16,
  };

  const handleFinish = () => {
    navigate("/lista-proyectos-planificacion");
  };

  return (
    <MainLayout>
      <Title level={2}>Carga de PO Masiva</Title>
      <>
        <Steps current={current} items={items} />
        <div style={contentStyle}>{steps[current].content}</div>
        <div style={{ marginTop: 24 }}>
          {current < steps.length - 1 && (
            <Button
              type="primary"
              onClick={() => next()}
              // El botón se deshabilita si estamos en el paso 0 y no se ha completado step1,
              // o si estamos en el paso 1 y no se ha completado step2
              disabled={
                (current === 0 && !step1Completed) ||
                (current === 1 && !step2Completed)
              }
            >
              Siguiente
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button type="primary" onClick={handleFinish}>
              Finalizar
            </Button>
          )}
          {current > 0 && (
            <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
              Anterior
            </Button>
          )}
        </div>
      </>
    </MainLayout>
  );
}
