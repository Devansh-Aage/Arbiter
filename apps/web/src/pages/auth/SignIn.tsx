import {
  useCurrentUser,
  useSignInWithEmail,
  useSignInWithOAuth,
  useVerifyEmailOTP,
} from "@coinbase/cdp-hooks";
import { useState, type FunctionComponent } from "react";
import AuthLayout from "@/components/AuthLayout";
import InputArbiter from "@/components/ui/InputArbiter";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface SignInProps { }

const SignIn: FunctionComponent<SignInProps> = () => {
  const { signInWithEmail } = useSignInWithEmail();
  const { verifyEmailOTP } = useVerifyEmailOTP();
  const { signInWithOAuth } = useSignInWithOAuth();
  const [flowId, setFlowId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailLoginActive, setIsEmailLoginActive] = useState(false);
  const { fetchToken } = useAuth();
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Start sign in flow
      const { flowId } = await signInWithEmail({ email: email.trim() });
      setFlowId(flowId);
      setIsEmailLoginActive(true);
    } catch (error) {
      console.error("Failed to send OTP:", error);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flowId) return;
    if (!otp.trim()) {
      setError("Please enter the OTP");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Complete sign in
      await verifyEmailOTP({
        flowId,
        otp: otp.trim(),
      });
      await fetchToken();
      toast.success("Logged in Arbiter");
    } catch (error) {
      console.error("Sign in failed:", error);
      setError("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // User will be redirected to Google to complete their login
    void signInWithOAuth("google");

  };

  const handleXSignIn = async () => {
    // User will be redirected to X to complete their login
    void signInWithOAuth("x");
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-muted-foreground">
            Choose your preferred sign-in method
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {!isEmailLoginActive ? (
          <div className="space-y-4">
            {/* Email Sign In Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <InputArbiter
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  htmlFor="email"
                  title="Email"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Sending..." : "Sign In with Email"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full"
            >
              Sign In with Google
            </Button>

            {/* X Sign In */}
            <Button
              className="w-full"
              onClick={handleXSignIn}
              disabled={isLoading}
            >
              Sign In with X
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                We've sent a verification code to
              </p>
              <p className="text-sm font-medium">{email}</p>
            </div>

            {/* OTP Input Form */}
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="otp"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Enter OTP
                </label>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e)}
                  className="w-full"
                >
                  <InputOTPGroup className="w-full flex-1">
                    <InputOTPSlot className="w-full flex-1" index={0} />
                    <InputOTPSlot className="w-full flex-1" index={1} />
                    <InputOTPSlot className="w-full flex-1" index={2} />
                    <InputOTPSlot className="w-full flex-1" index={3} />
                    <InputOTPSlot className="w-full flex-1" index={4} />
                    <InputOTPSlot className="w-full flex-1" index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>

            <Button
              onClick={() => {
                setIsEmailLoginActive(false);
                setFlowId(null);
                setOtp("");
                setError(null);
              }}
              disabled={isLoading}
              className="w-full mt-5"
            >
              Use a different email
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default SignIn;
