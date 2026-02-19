import { useState, useEffect, Suspense } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SiteHeader } from "@/components/sections/site-header";
import { Footer } from "@/components/sections/footer";
import { Loader2, ArrowLeft } from "lucide-react";

function AuthForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    login,
    signup,
    verifyMobile,
    resendVerificationCode,
    requestPasswordReset,
    verifyPasswordResetCode,
    resetPassword,
    isAuthenticated
  } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+92");
  const [mobile, setMobile] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [loginMobile, setLoginMobile] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [verifyingMobile, setVerifyingMobile] = useState("");

  useEffect(() => {
    if (location.pathname === '/signup') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(loginMobile, password);
        navigate("/");
      } else {
        if (password !== signupConfirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        const fullMobile = countryCode + mobile;
        const result = await signup(name, fullMobile, password);
        setVerifyingMobile(fullMobile);
        setShowVerification(true);
        if (result.smsSent) {
          setSuccess("Account created! Please check your mobile for verification code.");
        } else {
          setSuccess("Account created! SMS sending failed. Please use 'Resend verification code' below.");
          setError(""); // Clear any previous errors
        }
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || "An error occurred");
      if (error.message?.includes("verify")) {
        // If we know the mobile number (e.g. from signup attempt state), we could set it roughly,
        // but it's better to ask user to input it or handle it gracefully.
        // For now, assume it's the one they just typed if signing up.
        if (!isLogin) {
          setVerifyingMobile(countryCode + mobile);
          setShowVerification(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await verifyMobile(verifyingMobile, verificationCode);
      setSuccess("Mobile verified successfully! You can now login.");
      setShowVerification(false);
      setIsLogin(true);
      setVerificationCode("");
      // Pre-fill login mobile for convenience
      setLoginMobile(verifyingMobile);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const result = await resendVerificationCode(verifyingMobile);
      if (result.smsSent) {
        setSuccess("Verification code resent! Please check your mobile.");
      } else {
        setError("Failed to send SMS. Please try again or contact support.");
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Use loginMobile or prompt for it
      const mobileToReset = loginMobile || (countryCode + mobile); // Fallback logic

      // If we are in forgot password view, we need an input for mobile if not already set.
      // But let's assume we use a state for forgotPasswordMobile if we want to be clean.
      // For now reusing loginMobile since it's the most likely entry point.

      const result = await requestPasswordReset(loginMobile);
      setVerifyingMobile(loginMobile);

      if (result.smsSent) {
        setSuccess("Password reset code sent! Please check your mobile.");
        setShowResetPassword(true);
      } else {
        setSuccess("If an account exists with this mobile, a reset code has been sent.");
        setShowResetPassword(true);
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await verifyPasswordResetCode(verifyingMobile, verificationCode);
      setSuccess("Reset code verified! Please enter your new password.");
      // The form will automatically show password reset creation when verificationCode is set and showResetPassword is true
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to verify reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(verifyingMobile, verificationCode, newPassword);
      setSuccess("Password reset successfully! You can now login with your new password.");
      // Reset all states and go back to login
      setTimeout(() => {
        setShowForgotPassword(false);
        setShowResetPassword(false);
        navigate("/login");
        setVerificationCode("");
        setNewPassword("");
        setConfirmPassword("");
        setLoginMobile(verifyingMobile); // Pre-fill
        setError("");
        setSuccess("");
      }, 2000);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password - Reset Password Form (shown after code verification)
  if (showForgotPassword && showResetPassword && verificationCode && success && success.includes("verified")) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md p-6">
            <Link
              to="/login"
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
              onClick={() => {
                setShowForgotPassword(false);
                setShowResetPassword(false);
                setVerificationCode("");
                setNewPassword("");
                setConfirmPassword("");
                setError("");
                setSuccess("");
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
            <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                {success}
              </div>
            )}
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Forgot Password - Verify Reset Code (shown after requesting reset)
  if (showForgotPassword && showResetPassword && !(success && success.includes("verified"))) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md p-6">
            <Link
              to="/login"
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
              onClick={() => {
                setShowForgotPassword(false);
                setShowResetPassword(false);
                setVerificationCode("");
                setError("");
                setSuccess("");
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
            <h2 className="text-2xl font-bold mb-4">Enter Reset Code</h2>
            <p className="text-muted-foreground mb-6">
              We&apos;ve sent a password reset code to your mobile number <strong>{verifyingMobile}</strong>. Please enter it below.
            </p>
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                {success}
              </div>
            )}
            <form onSubmit={handleVerifyResetCode} className="space-y-4">
              <div>
                <Label htmlFor="resetCode">Reset Code</Label>
                <Input
                  id="resetCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                  maxLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>
            </form>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Forgot Password - Request Reset
  if (showForgotPassword) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md p-6">
            <Link
              to="/login"
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
              onClick={() => {
                setShowForgotPassword(false);
                setError("");
                setSuccess("");
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
            <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
            <p className="text-muted-foreground mb-6">
              Enter your mobile number and we&apos;ll send a reset code to you via SMS.
            </p>
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                {success}
              </div>
            )}
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label htmlFor="forgotMobile">Mobile Number</Label>
                <Input
                  id="forgotMobile"
                  type="tel"
                  value={loginMobile}
                  onChange={(e) => setLoginMobile(e.target.value)}
                  placeholder="+923001234567"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Include country code (e.g., +92)
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </Button>
            </form>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (showVerification) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md p-6">
            <Link to="/login" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
            <h2 className="text-2xl font-bold mb-4">Verify Your Mobile</h2>
            <p className="text-muted-foreground mb-6">
              We&apos;ve sent a verification code to <strong>{verifyingMobile}</strong>. Please enter it below.
            </p>
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                {success}
              </div>
            )}
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                  maxLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Mobile"
                )}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="text-sm text-primary hover:underline"
              >
                Resend verification code
              </button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-6">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <CardHeader>
            <CardTitle className="text-2xl">
              {isLogin ? "Login" : "Sign Up"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Login to your account"
                : "Create an account to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isLogin ? (
                <div>
                  <Label htmlFor="loginMobile">Mobile Number</Label>
                  <Input
                    id="loginMobile"
                    type="tel"
                    value={loginMobile}
                    onChange={(e) => setLoginMobile(e.target.value)}
                    placeholder="+923001234567"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Include country code (e.g., +92 for Pakistan)
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <Label htmlFor="signupName">Full Name</Label>
                    <Input
                      id="signupName"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground w-24"
                      >
                        <option value="+92">🇵🇰 +92</option>
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+966">🇸🇦 +966</option>
                      </select>
                      <Input
                        id="mobile"
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="3001234567"
                        required
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter your mobile number without country code
                    </p>
                  </div>
                </>
              )}
              {/* Removed Email Input */}
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              {!isLogin && (
                <div>
                  <Label htmlFor="signupConfirmPassword">Confirm Password</Label>
                  <Input
                    id="signupConfirmPassword"
                    type="password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              )}
              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setError("");
                      setSuccess("");
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Logging in..." : "Creating account..."}
                  </>
                ) : (
                  isLogin ? "Login" : "Sign Up"
                )}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  if (isLogin) {
                    navigate("/signup");
                  } else {
                    navigate("/login");
                  }
                  setError("");
                  setSuccess("");
                  setLoginMobile("");
                  setName(""); // Clear name
                  setMobile("");
                  setPassword("");
                }}
                className="text-sm text-primary hover:underline"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Login"}
              </button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
