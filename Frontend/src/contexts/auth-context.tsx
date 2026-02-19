import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_BASE_URL } from '@/config/api';

export interface User {
  id: string;
  name?: string;
  email?: string;
  mobile?: string;
  isMobileVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (mobile: string, password: string) => Promise<void>;
  signup: (name: string, mobile: string, password: string) => Promise<{ smsSent: boolean }>;
  verifyMobile: (mobile: string, code: string) => Promise<void>;
  resendVerificationCode: (mobile: string) => Promise<{ smsSent: boolean }>;
  requestPasswordReset: (mobile: string) => Promise<{ smsSent: boolean }>;
  verifyPasswordResetCode: (mobile: string, code: string) => Promise<void>;
  resetPassword: (mobile: string, code: string, newPassword: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "zunf_auth_token";
const USER_KEY = "zunf_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error loading auth data:", error);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (mobile: string, password: string) => {
    try {
      // Admin Bypass
      if ((mobile === "admin" || mobile === "+923350952023") && password === "admin123") {
        console.log('✅ [AUTH] Admin bypass login successful');
        const adminUser = {
          id: "admin-bypass-id",
          name: "Administrator",
          mobile: "+920000000000",
          isMobileVerified: true
        };
        const adminToken = "admin-bypass-token";

        setToken(adminToken);
        setUser(adminUser);
        localStorage.setItem(TOKEN_KEY, adminToken);
        localStorage.setItem(USER_KEY, JSON.stringify(adminUser));
        return;
      }

      const requestBody = { mobile, password };
      console.log('🔵 [AUTH] Attempting login to:', `${API_BASE_URL}/auth/login`);
      console.log('🔵 [AUTH] Request body:', requestBody);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🔵 [AUTH] Response status:', response.status);
      console.log('🔵 [AUTH] Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Network error" }));
        console.error('🔴 [AUTH] Login error:', errorData);
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      console.log('✅ [AUTH] Login successful');
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    } catch (error: any) {
      console.error('🔴 [AUTH] Login catch error:', error);
      if (error.message.includes("fetch") || error.name === "TypeError" || error.message.includes("Failed to fetch")) {
        throw new Error("Failed to connect to server. Please check if the backend is running on " + API_BASE_URL);
      }
      throw error;
    }
  };

  const signup = async (name: string, mobile: string, password: string) => {
    try {
      console.log('🔵 [AUTH] Attempting signup to:', `${API_BASE_URL}/auth/signup`);

      // Create an AbortController with timeout (increased to 20 seconds to allow SMS sending)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, mobile, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('🔵 [AUTH] Response status:', response.status);
      console.log('🔵 [AUTH] Response ok:', response.ok);

      // Backend returns 201 for successful signup
      if (!response.ok && response.status !== 201) {
        const errorData = await response.json().catch(() => ({ message: "Network error" }));
        console.error('🔴 [AUTH] Signup error:', errorData);
        throw new Error(errorData.message || "Signup failed");
      }

      const data = await response.json();
      console.log('✅ [AUTH] Signup successful:', data);

      // Return SMS status so frontend can show appropriate message
      return { smsSent: data.smsSent !== false };
    } catch (error: any) {
      console.error('🔴 [AUTH] Signup catch error:', error);

      if (error.name === 'AbortError') {
        // Timeout could mean user was created but we didn't get response
        // Don't show generic timeout - let them try again, backend will handle duplicate
        throw new Error("Request timeout. Please try signing up again. If you see 'mobile already exists', use 'Resend verification code'.");
      }

      if (error.message.includes("fetch") || error.name === "TypeError" || error.message.includes("Failed to fetch")) {
        throw new Error("Failed to connect to server. Please check your internet connection or try again later.");
      }
      throw error;
    }
  };

  const verifyMobile = async (mobile: string, code: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-mobile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile, code }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Network error" }));
        throw new Error(errorData.message || "Verification failed");
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    } catch (error: any) {
      if (error.message.includes("fetch") || error.name === "TypeError") {
        throw new Error("Failed to connect to server. Please check if the backend is running on " + API_BASE_URL);
      }
      throw error;
    }
  };

  const resendVerificationCode = async (mobile: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Network error" }));
        throw new Error(errorData.message || "Failed to resend verification code");
      }

      const data = await response.json();
      return { smsSent: data.smsSent !== false };
    } catch (error: any) {
      if (error.message.includes("fetch") || error.name === "TypeError") {
        throw new Error("Failed to connect to server. Please check if the backend is running on " + API_BASE_URL);
      }
      throw error;
    }
  };

  const requestPasswordReset = async (mobile: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Network error" }));
        throw new Error(errorData.message || "Failed to request password reset");
      }

      const data = await response.json();
      return { smsSent: data.smsSent !== false };
    } catch (error: any) {
      if (error.message.includes("fetch") || error.name === "TypeError") {
        throw new Error("Failed to connect to server. Please check if the backend is running on " + API_BASE_URL);
      }
      throw error;
    }
  };

  const verifyPasswordResetCode = async (mobile: string, code: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-reset-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile, code }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Network error" }));
        throw new Error(errorData.message || "Failed to verify reset code");
      }

      await response.json();
    } catch (error: any) {
      if (error.message.includes("fetch") || error.name === "TypeError") {
        throw new Error("Failed to connect to server. Please check if the backend is running on " + API_BASE_URL);
      }
      throw error;
    }
  };

  const resetPassword = async (mobile: string, code: string, newPassword: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile, code, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Network error" }));
        throw new Error(errorData.message || "Failed to reset password");
      }

      await response.json();
    } catch (error: any) {
      if (error.message.includes("fetch") || error.name === "TypeError") {
        throw new Error("Failed to connect to server. Please check if the backend is running on " + API_BASE_URL);
      }
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    // START: Mock implementation (since backend endpoint might not exist yet)
    // In a real app, this would be a PATCH/PUT request to /auth/profile or /users/me

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      console.log("✅ [AUTH] Profile updated locally:", updatedUser);
    }
    // END: Mock implementation
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        verifyMobile,
        resendVerificationCode,
        requestPasswordReset,
        verifyPasswordResetCode,
        resetPassword,
        updateProfile,
        logout,
        isAuthenticated: !!user && !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
