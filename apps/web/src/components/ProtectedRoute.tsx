import {
  useCurrentUser,
  useIsInitialized,
  useIsSignedIn,
} from "@coinbase/cdp-hooks";
import { type FC } from "react";
import { Navigate, Outlet } from "react-router";
import Sidebar from "./dashboard/Sidebar";

interface ProtectedRouteProps { }

const ProtectedRoute: FC<ProtectedRouteProps> = ({ }) => {
  const { isInitialized } = useIsInitialized();
  const { isSignedIn } = useIsSignedIn();
  const { currentUser } = useCurrentUser();

  if (!isInitialized || currentUser === undefined) {
    return <div>Restoring session...</div>;
  }



  return isSignedIn ? (
    <div className=' w-full h-screen font-nunito flex '>
      <Sidebar />
      <Outlet />
    </div>
  ) : <Navigate to="/auth/login" replace />;
};

export default ProtectedRoute;
