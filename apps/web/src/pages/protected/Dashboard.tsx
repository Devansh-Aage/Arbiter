import { useSignOut } from "@coinbase/cdp-hooks";
import { useCurrentUser } from "@coinbase/cdp-hooks";
import { useQuery } from "@tanstack/react-query";
import type { FunctionComponent } from "react";
import axios from "axios";
import { type User } from "@arbiter/db/src/types";
import { useAuth } from "@/context/AuthContext";

interface DashboardProps { }

const Dashboard: FunctionComponent<DashboardProps> = () => {
  const { currentUser } = useCurrentUser();
  const { signOut } = useSignOut();
  const { token, isAuthLoading } = useAuth();
  const { data: userData, isLoading: isUserDataLoading } = useQuery({
    queryKey: ["userData"],
    queryFn: async (): Promise<{ user: User }> => {
      const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}auth/user`, {
        headers: {
          "authToken": token
        }
      });
      return res.data
    },
    enabled: !!token
  })
  console.log(userData?.user);

  if (isUserDataLoading || isAuthLoading) {
    return <div>Loading...</div>
  }


  return (
    <div>
      <h2>Welcome!</h2>
      <p>User ID: {currentUser?.userId}</p>
      {currentUser?.authenticationMethods.google &&
        <p>Email: {currentUser?.authenticationMethods.google?.email}</p>
      }
      {currentUser?.authenticationMethods.email &&
        <p>Email: {currentUser?.authenticationMethods.email?.email}</p>
      }
      {currentUser?.authenticationMethods.x &&
        <p>Email: {currentUser?.authenticationMethods.x?.email}</p>
      }
      <p>Wallet Address: {currentUser?.evmSmartAccounts?.[0]}</p>
      <button className="p-3 bg-red-700" onClick={() => void signOut()}>
        Log out
      </button>
    </div>
  );
};

export default Dashboard;
