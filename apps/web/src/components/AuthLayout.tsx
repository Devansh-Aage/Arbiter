import { useIsInitialized, useIsSignedIn } from "@coinbase/cdp-hooks";
import { type FC, type ReactNode } from "react";
import { Navigate } from "react-router";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
  const { isInitialized } = useIsInitialized();
  const { isSignedIn } = useIsSignedIn();
  if (!isInitialized) {
    return <div>Loading...</div>;
  }
  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="font-nunito h-screen w-full bg-light-bg dark:bg-dark-bg">
      <p className="text-3xl font-medium pt-5 pl-5">Arbiter</p>
      <div className="mt-20 flex justify-center">{children}</div>
    </div>
  );
};

export default AuthLayout;
