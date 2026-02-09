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
  useIsSignedIn,
} from "@coinbase/cdp-hooks";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import axios, { AxiosError } from "axios";

type AuthContextType = {
  userId: string | null;
  email: string | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  logout?: () => Promise<void>;
  setContextState: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const { getAccessToken } = useGetAccessToken();
  const queryClient = useQueryClient();
  const { signOut } = useSignOut();
  const navigate = useNavigate();
  const { isInitialized } = useIsInitialized();
  const { isSignedIn } = useIsSignedIn();

  const setContextState = async () => {
    try {
      setIsAuthLoading(true);
      const token = await getAccessToken();
      if (token) {
        setToken(token);
        console.log("token", token);
        const res = await axios.get(
          `${import.meta.env.VITE_HTTP_URL}auth/user`,
          {
            headers: {
              authToken: token,
            },
          },
        );
        const userData = res.data;

        if (userData) {
          setUserId(userData.user.id);
          setEmail(userData.user.email);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      toast.error("Failed to authenticate");
      if (error instanceof AxiosError) {
        if (error.status === 409) {
          toast.error(error.response?.data.error);
        }
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized && isSignedIn) {
      setContextState();
    }
  }, [isInitialized, isSignedIn]);

  const logout = async () => {
    try {
      await signOut();
      setUserId(null);
      setToken(null);
      queryClient.clear();
      navigate("/auth/login");
      toast.success("Logged out!");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Something went wrong. Try again!");
    }
  };

  const value: AuthContextType = {
    userId,
    token,
    email,
    isAuthLoading,
    logout,
    setContextState,
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
