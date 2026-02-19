import {
  useSignInWithOAuth,
} from "@coinbase/cdp-hooks";
import { useState, type FunctionComponent } from "react";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";

interface SignInProps { }

const SignIn: FunctionComponent<SignInProps> = () => {
  const { signInWithOAuth } = useSignInWithOAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    // User will be redirected to Google to complete their login
    void signInWithOAuth("google");
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Sign In</h1>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full"
        >
          Sign In with Google
        </Button>
      </div>
    </AuthLayout>
  );
};

export default SignIn;
