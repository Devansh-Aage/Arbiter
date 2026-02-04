import "./App.css";
import { Navigate, Route, Routes } from "react-router";
import SignIn from "./pages/auth/SignIn";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import Organizations from "./pages/protected/org/Organizations";
import OrgDashboard from "./pages/protected/org/OrgDashboard";
import OrgLayout from "./pages/protected/org/OrgLayout";
import Layout from "./pages/protected/Layout";
import OrgMembers from "./pages/protected/org/OrgMembers";
import OrgSettings from "./pages/protected/org/OrgSettings";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/auth">
          <Route path="login" element={<SignIn />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Layout />}>
            <Route path="orgs">
              <Route index element={<Organizations />} />
              <Route element={<OrgLayout />} >
                <Route path=":orgId/dashboard" element={<OrgDashboard />} />
                <Route path=":orgId/members" element={<OrgMembers />} />
                <Route path=":orgId/settings" element={<OrgSettings />} />
              </Route>
            </Route>
          </Route>
        </Route>
        <Route path='*' element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
