// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import appRoutes from "./routes/appRoutes";
import PrivateRoute from "./routes/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {appRoutes.map(({ path, element, isPrivate }) => (
          <Route key={path} path={path} element={isPrivate ? <PrivateRoute>{element}</PrivateRoute> : element} />
        ))}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
