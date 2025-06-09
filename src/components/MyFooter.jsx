// src/components/MyFooter.jsx
import React from "react";
import { Box, Typography } from "@mui/material";

export default function MyFooter() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#f5f5f5",
        py: 1,
        px: 2,
        mt: "auto",
        textAlign: "center",
        borderTop: "1px solid #ddd",
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Claro Nicaragua - Gerencia Implantación
      </Typography>
    </Box>
  );
}
