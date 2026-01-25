import {
  useSignInWithEmail,
  useSignInWithOAuth,
  useVerifyEmailOTP,
} from "@coinbase/cdp-hooks";
import { useState, type FunctionComponent } from "react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import AuthLayout from "@/components/AuthLayout";

interface SignInProps {}

const SignIn: FunctionComponent<SignInProps> = () => {
  const { signInWithEmail } = useSignInWithEmail();
  const { verifyEmailOTP } = useVerifyEmailOTP();
  const { signInWithOAuth } = useSignInWithOAuth();
  const navigate = useNavigate();
  const [flowId, setFlowId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailLoginActive, setIsEmailLoginActive] = useState(false);

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
      const { user, isNewUser } = await verifyEmailOTP({
        flowId,
        otp: otp.trim(),
      });

      console.log("Signed in user:", user);
      console.log("Is new user:", isNewUser);

      // Redirect to Dashboard after successful sign in
      navigate("/dashboard");
    } catch (error) {
      console.error("Sign in failed:", error);
      setError("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // User will be redirected to Google to complete their login
    void signInWithOAuth("google");

    // Post-login, they will be redirected back to your app, and the login process
    // will be completed automatically.
  };

  const handleXSignIn = () => {
    // User will be redirected to X to complete their login
    void signInWithOAuth("x");

    // Post-login, they will be redirected back to your app, and the login process
    // will be completed automatically.
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
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                    "placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:pointer-events-none disabled:opacity-50",
                  "h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {isLoading ? "Sending..." : "Sign In with Email"}
              </button>
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
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className={cn(
                "w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                "h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              )}
            >
              Sign In with Google
            </button>

            {/* X Sign In */}
            <button
              onClick={handleXSignIn}
              disabled={isLoading}
              className={cn(
                "w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                "h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              )}
            >
              Sign In with X
            </button>
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
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter verification code"
                  maxLength={6}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                    "placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:pointer-events-none disabled:opacity-50",
                  "h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>

            <button
              onClick={() => {
                setIsEmailLoginActive(false);
                setFlowId(null);
                setOtp("");
                setError(null);
              }}
              disabled={isLoading}
              className={cn(
                "w-full text-sm text-muted-foreground hover:text-foreground transition-colors",
                "disabled:opacity-50"
              )}
            >
              Use a different email
            </button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default SignIn;
