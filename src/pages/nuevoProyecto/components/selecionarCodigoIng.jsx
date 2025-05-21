import React, { useState, useEffect } from "react";
import { Autocomplete, TextField, CircularProgress, Snackbar, Alert } from "@mui/material";
import { Paper } from "@mui/material";
import { fetchCodigoIng } from "../../../services/codigoIngServices"; // Asegúrate de que la ruta sea correcta

export default function SeleccionarCodigoIng({ onSelect }) {
  const [allCodigoIng, setAllCodigoIng] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const codigoIng = await fetchCodigoIng();
        setAllCodigoIng(codigoIng);
      } catch (err) {
        console.error("Error al cargar codigoIng", err);
        setAlertOpen(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtrado local
  const filterCodigoIng = (codigoIng, value) => {
    const search = value.toLowerCase();
    return codigoIng.filter((c) => c.codigo?.toLowerCase().includes(search));
  };

  return (
    <>
      <Autocomplete
        sx={{ width: "50ch" }}
        options={filterCodigoIng(allCodigoIng, inputValue)}
        getOptionLabel={(option) => `${option.codigo}`}
        onChange={(event, newValue) => onSelect && onSelect(newValue)}
        inputValue={inputValue}
        onInputChange={(event, newInput) => setInputValue(newInput)}
        loading={loading}
        slots={{ paper: Paper }} // ✅ NUEVO
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              borderRadius: 2,
              mt: 1,
            },
          },
        }}
        renderOption={(props, option) => (
          <li
            {...props}
            style={{
              borderBottom: "1px solid #e0e0e0",
              padding: "8px 16px",
            }}
          >
            {option.codigo}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Seleccionar Código Ingenieria"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={() => setAlertOpen(false)}>
        <Alert onClose={() => setAlertOpen(false)} severity="error">
          Error al cargar los códigos de ingeniería
        </Alert>
      </Snackbar>
    </>
  );
}
