import { useState, useRef } from "react";
import SignaturePad from "react-signature-canvas";
import { Box, Button } from "@mui/material";

function FirmaComponent({ value: firmaActual }) {
  const [firma, setFirma] = useState(firmaActual || null);
  const [editando, setEditando] = useState(!firmaActual);
  const sigCanvas = useRef(null);

  const guardarFirma = () => {
    if (sigCanvas.current) {
      const nuevaFirma = sigCanvas.current
        .toDataURL("image/png")
        .replace(/^data:image\/png;base64,/, ""); // Quita el prefijo
      setFirma(nuevaFirma);
      setEditando(false);
    }
  };

  return (
    <div>
      {editando ? (
        <Box
          sx={{
            border: "2px dashed #9e9e9e",
            borderRadius: 2,
            backgroundColor: "#fff",
            width: "100%",
            height: 350,
            mb: 2,
            position: "relative",
          }}
        >
          <SignaturePad
            ref={sigCanvas}
            options={{
              minWidth: 1,
              maxWidth: 2.5,
              penColor: "black",
              backgroundColor: "#fff",
            }}
            canvasProps={{
              style: {
                borderRadius: "8px",
                width: "100%",
                height: "100%",
              },
            }}
          />
        </Box>
      ) : (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <img
            src={`data:image/png;base64,${firma}`}
            alt="Firma del usuario"
            style={{ border: "1px solid #ccc", maxHeight: 150 }}
          />
          <Button variant="outlined" onClick={() => setEditando(true)}>
            Editar Firma
          </Button>
        </Box>
      )}

      {editando && (
        <Button
          variant="contained"
          color="primary"
          onClick={guardarFirma}
          sx={{ mt: 2 }}
        >
          Guardar Firma
        </Button>
      )}
    </div>
  );
}

export default FirmaComponent;
