import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetAccessToken,
  useIsInitialized,
  useSignOut,
} from "@coinbase/cdp-hooks";
import { toast } from "sonner";
import { useNavigate } from "react-router";

type AuthContextType = {
  userId: string | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  logout?: () => Promise<void>;
  fetchToken: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const { getAccessToken } = useGetAccessToken();
  const [token, setToken] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { signOut } = useSignOut();
  const navigate = useNavigate();
  const { isInitialized } = useIsInitialized();

  const fetchToken = async () => {
    setIsAuthLoading(true);
    const token = await getAccessToken();
    if (token) {
      setToken(token);
    }
    console.log("running");

    setIsAuthLoading(false);
  };

  useEffect(() => {
    if (isInitialized) {
      fetchToken();
    }
  }, [isInitialized]);

  const logout = async () => {
    try {
      await signOut();
      setUserId(null);
      setToken(null);
      queryClient.clear();
      navigate("/auth/login");
      toast.info("Logged out!");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Something went wrong. Try again!");
    }
  };

  const value: AuthContextType = {
    userId,
    token,
    isAuthLoading,
    logout,
    fetchToken,
    isAuthenticated: !!userId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
