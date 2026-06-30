import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import Dashboard from "./pages/Dashboard/Dashboard";

import Financeiro from "./pages/Dashboard/Financeiro/Financeiro";
import Hospedes from "./pages/Dashboard/Hospedes/Hospedes";
import Quartos from "./pages/Dashboard/Quartos/Quartos";
import Calendario from "./pages/Dashboard/Calendario/Calendario";
import WhiteLabel from "./pages/Dashboard/WhiteLabel/WhiteLabel";
import Perfil from "./pages/Dashboard/Perfil/Perfil";
import VitrinePublica from "./pages/Vitrine/VitrinePublica";

import ProtectedRoute from "./routes/protecaoderotas";

import "./pages/Dashboard/Dashboard.css";

export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* raiz */}
        <Route
          path="/"
          element={
            <Navigate to="/login" />
          }
        />

        {/* publicas */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/registro"
          element={<Register />}
        />

        <Route
          path="/esqueci-senha"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

      {/* vitrine publica de cada hotel sem login, isolada por ""slug" */}
        <Route
          path="/v/:slug"
          element={<VitrinePublica />}
        />

        {/* protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/financeiro"
          element={
            <ProtectedRoute>
              <Financeiro />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hospedes"
          element={
            <ProtectedRoute>
              <Hospedes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quartos"
          element={
            <ProtectedRoute>
              <Quartos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendario"
          element={
            <ProtectedRoute>
              <Calendario />
            </ProtectedRoute>
          }
        />

        <Route
          path="/whitelabel"
          element={
            <ProtectedRoute>
              <WhiteLabel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>

  );

}