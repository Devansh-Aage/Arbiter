import "./App.css";
import { Route, Routes } from "react-router";
import SignIn from "./pages/auth/SignIn";
import Dashboard from "./pages/protected/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Routes>
        <Route path="/auth">
          <Route path="login" element={<SignIn />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<></>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
