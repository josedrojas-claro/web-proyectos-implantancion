import React, { useState, useEffect } from "react";
import { Autocomplete, TextField, CircularProgress, Snackbar, Alert } from "@mui/material";
import { fetchContratista } from "../../../services/miscelaneo/contratistaServices"; // Asegúrate de que la ruta sea correcta
import { Paper } from "@mui/material";

export default function SeleccionarContratista({ onSelect }) {
  const [allContratistas, setAllContratistas] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const contratistas = await fetchContratista();
        setAllContratistas(contratistas);
      } catch (err) {
        console.error("Error al cargar contratistas", err);
        setAlertOpen(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtrado local por nombreContratista o nemonico
  const filterContratistas = (contratistas, value) => {
    const search = value.toLowerCase();
    return contratistas.filter((c) => c.nombreContratista?.toLowerCase().includes(search));
  };

  return (
    <>
      <Autocomplete
        sx={{ width: "50ch" }}
        options={filterContratistas(allContratistas, inputValue)}
        getOptionLabel={(option) => `${option.nombreContratista}`}
        onChange={(event, newValue) => onSelect && onSelect(newValue)}
        inputValue={inputValue}
        onInputChange={(event, newInput) => setInputValue(newInput)}
        loading={loading}
        slots={{ paper: Paper }}
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              borderRadius: 2,
              mt: 1,
            },
          },
          input: {
            endAdornment: <>{loading ? <CircularProgress size={20} /> : null}</>,
          },
        }}
        renderInput={(params) => <TextField {...params} label="Seleccionar contratista" fullWidth />}
      />

      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={() => setAlertOpen(false)}>
        <Alert onClose={() => setAlertOpen(false)} severity="error">
          Error al cargar los contratistas
        </Alert>
      </Snackbar>
    </>
  );
}
