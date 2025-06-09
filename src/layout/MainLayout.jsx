import React from "react";
import { Box, Toolbar, Container } from "@mui/material";
import MyAppBar from "../components/MyAppBar";
import MyDrawer from "../components/MyDrawer";
import MyFooter from "../components/MyFooter";

export default function MainLayout({ children }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <MyAppBar toggleDrawer={toggleDrawer} />
      <Box sx={{ display: "flex", flex: 1 }}>
        <MyDrawer open={drawerOpen} toggleDrawer={toggleDrawer} />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Container maxWidth="xl">{children}</Container>
        </Box>
      </Box>
      <MyFooter />
    </Box>
  );
}
