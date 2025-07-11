import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Cadastro from "./page/Cadastro";
import Header from "./components/Header";
import Login from "./page/Login/Login";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./page/Dashboard/Dashboard";
import ResetSenha from "./components/ResetSenha/ResetSenha"

function RoutesApp() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/reset-senha" element={<ResetSenha />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default RoutesApp;
