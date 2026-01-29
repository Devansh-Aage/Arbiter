import {
  useCurrentUser,
  useIsInitialized,
  useIsSignedIn,
} from "@coinbase/cdp-hooks";
import { type FC } from "react";
import { Navigate, Outlet } from "react-router";

interface ProtectedRouteProps {}

const ProtectedRoute: FC<ProtectedRouteProps> = ({}) => {
  const { isInitialized } = useIsInitialized();
  const { isSignedIn } = useIsSignedIn();
  const { currentUser } = useCurrentUser();
  if (!isInitialized || currentUser === undefined) {
    return <div>Restoring session...</div>;
  }
  console.log(isSignedIn);

  return isSignedIn ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

export default ProtectedRoute;
