import { useIsInitialized, useIsSignedIn } from "@coinbase/cdp-hooks";
import { type FC } from "react";
import { Navigate, Outlet } from "react-router";

interface ProtectedRouteProps {}

const ProtectedRoute: FC<ProtectedRouteProps> = ({}) => {
  const { isInitialized } = useIsInitialized();
  const { isSignedIn } = useIsSignedIn();
  if (!isInitialized) {
    return <div>Loading...</div>;
  }
  console.log("isSignedIn", isSignedIn);
  return isSignedIn ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

export default ProtectedRoute;
