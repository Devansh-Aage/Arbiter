import "./App.css";
import { Navigate, Route, Routes } from "react-router";
import SignIn from "./pages/auth/SignIn";
import Dashboard from "./pages/protected/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import OrgDashboard from "./pages/protected/OrgDashboard";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/auth">
          <Route path="login" element={<SignIn />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} >
            <Route path="orgs" element={<OrgDashboard />} />
          </Route>
        </Route>
        <Route path='*' element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
