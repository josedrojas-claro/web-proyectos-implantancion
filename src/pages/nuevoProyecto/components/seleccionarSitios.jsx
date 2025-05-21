import React, { useEffect, useState } from "react";
import { Autocomplete, TextField, CircularProgress, Snackbar, Alert, Paper } from "@mui/material";
import { fetchSitios } from "../../../services/sitiosServices";

export default function SeleccionarSitios({ onSelect }) {
  const [allSitios, setAllSitios] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const sitios = await fetchSitios();
        setAllSitios(sitios);
      } catch (err) {
        console.error("Error al cargar sitios", err);
        setAlertOpen(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filterSitios = (sitios, value) => {
    const search = value.toLowerCase();
    return sitios.filter(
      (s) => s.nombreSitio?.toLowerCase().includes(search) || s.nemonico?.toLowerCase().includes(search)
    );
  };

  return (
    <>
      <Autocomplete
        sx={{ width: "50ch" }}
        options={filterSitios(allSitios, inputValue)}
        getOptionLabel={(option) => `${option.nemonico} - ${option.nombreSitio}`}
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
            endAdornment: <>{loading && <CircularProgress size={20} />}</>,
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
            {option.nemonico} - {option.nombreSitio}
          </li>
        )}
        renderInput={(params) => <TextField {...params} label="Seleccionar sitio" fullWidth />}
      />

      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setAlertOpen(false)}>
          Error al cargar los sitios.
        </Alert>
      </Snackbar>
    </>
  );
}
