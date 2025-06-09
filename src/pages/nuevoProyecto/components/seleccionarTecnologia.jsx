import React, { useState, useEffect } from "react";
import { Autocomplete, TextField, CircularProgress, Snackbar, Alert } from "@mui/material";
import { fetchTecnologias } from "../../../services/miscelaneo/tecnologias";
import { Paper } from "@mui/material";

export default function SeleccionarTecnologia({ onSelect }) {
  const [allTecnologias, setAllTecnologias] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const tecnologias = await fetchTecnologias();
        setAllTecnologias(tecnologias);
      } catch (err) {
        console.error("Error al cargar tecnologias", err);
        setAlertOpen(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filterTecnologias = (tecnologias, value) => {
    const search = value.toLowerCase();
    return tecnologias.filter((t) => t.nombre_tecnologia?.toLowerCase().includes(search));
  };

  return (
    <>
      <Autocomplete
        sx={{
          width: "50ch",
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            "& fieldset": { borderColor: "#d32f2f" },
            "&:hover fieldset": { borderColor: "#9a0007" },
          },
        }}
        options={filterTecnologias(allTecnologias, inputValue)}
        getOptionLabel={(option) => `${option.nombre_tecnologia}`}
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
            endAdornment: <>{loading && <CircularProgress color="inherit" size={20} />}</>,
          },
        }}
        renderOption={(props, option) => (
          <li
            {...props}
            style={{
              borderBottom: "1px solid #e0e0e0",
              padding: "10px 14px",
              fontSize: "15px",
              color: "#333",
            }}
          >
            {option.nombre_tecnologia}
          </li>
        )}
        renderInput={(params) => <TextField {...params} label="Seleccionar Tecnología" fullWidth />}
      />

      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={() => setAlertOpen(false)}>
        <Alert onClose={() => setAlertOpen(false)} severity="error" sx={{ width: "100%" }}>
          Error al cargar tecnologias
        </Alert>
      </Snackbar>
    </>
  );
}
