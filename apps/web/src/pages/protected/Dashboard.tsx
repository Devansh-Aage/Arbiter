import { useSignOut } from "@coinbase/cdp-hooks";
import { useCurrentUser } from "@coinbase/cdp-hooks";
import type { FunctionComponent } from "react";

interface DashboardProps { }

const Dashboard: FunctionComponent<DashboardProps> = () => {
  const { currentUser } = useCurrentUser();
  const { signOut } = useSignOut();
  console.log(currentUser);

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
