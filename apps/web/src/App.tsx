import "./App.css";
import { Navigate, Route, Routes } from "react-router";
import SignIn from "./pages/auth/SignIn";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import Organizations from "./pages/protected/org/Organizations";
import OrgDashboard from "./pages/protected/org/OrgDashboard";
import OrgLayout from "./pages/protected/org/OrgLayout";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/auth">
          <Route path="login" element={<SignIn />} />
        </Route>
        <Route path="dashboard" element={<ProtectedRoute />}>
          <Route path="orgs">
            <Route index element={<Organizations />} />
            <Route element={<OrgLayout />} >
              <Route path=":orgId/dashboard" element={<OrgDashboard />} />
              <Route path=":orgId/members" element={<OrgDashboard />} />
              <Route path=":orgId/settings" element={<OrgDashboard />} />
            </Route>
          </Route>
        </Route>
        <Route path='*' element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
