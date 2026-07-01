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

        {/* parte raiz */}
        <Route
          path="/"
          element={
            <Navigate to="/login" />
          }
        />

        {/* parte login/auth */}
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

        {/* parte vitrine */}
        <Route
          path="/v/:slug"
          element={<VitrinePublica />}
        />

        {/* parte dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* parte financeiro */}
        <Route
          path="/financeiro"
          element={
            <ProtectedRoute>
              <Financeiro />
            </ProtectedRoute>
          }
        />

        {/* parte hospedes */}
        <Route
          path="/hospedes"
          element={
            <ProtectedRoute>
              <Hospedes />
            </ProtectedRoute>
          }
        />

        {/* parte quartos */}
        <Route
          path="/quartos"
          element={
            <ProtectedRoute>
              <Quartos />
            </ProtectedRoute>
          }
        />

        {/* parte calendario */}
        <Route
          path="/calendario"
          element={
            <ProtectedRoute>
              <Calendario />
            </ProtectedRoute>
          }
        />

        {/* parte whitelabel */}
        <Route
          path="/whitelabel"
          element={
            <ProtectedRoute>
              <WhiteLabel />
            </ProtectedRoute>
          }
        />

        {/* parte perfil */}
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