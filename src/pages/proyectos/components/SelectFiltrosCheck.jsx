import React from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import Box from "@mui/material/Box";

export default function SelectFiltrosCheck({ value, onChange, options, label = "Tecnologías" }) {
  return (
    <FormControl sx={{ minWidth: 220, maxWidth: 230 }}>
      <InputLabel size="small">{label}</InputLabel>
      <Select
        multiple
        value={value}
        onChange={onChange}
        size="small"
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => (
          <Box sx={{ display: "inline", gap: 0.5 }}>
            {selected.map((val, i) => {
              const found = options.find((o) => o.value === val);
              const cantidad = typeof found?.cantidad === "number" ? found.cantidad : 0;
              return (
                <span key={val}>
                  {found?.label || val}
                  {` (${cantidad})`}
                  {i < selected.length - 1 ? ", " : ""}
                </span>
              );
            })}
          </Box>
        )}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 250,
              width: 260,
            },
          },
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            <Checkbox checked={value.includes(opt.value)} size="small" />
            <ListItemText
              primary={
                <Box sx={{ display: "flex", justifyContent: "space-between", width: 150 }}>
                  <span style={{ fontSize: 13 }}>{opt.label}</span>
                  <span style={{ color: "#888", fontSize: 13 }}>
                    {typeof opt.cantidad === "number" ? opt.cantidad : 0}
                  </span>
                </Box>
              }
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
