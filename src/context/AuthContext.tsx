import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import axiosInstance from "../types/axiosInstance";
import { User } from '../types';
import { API_BASE_URL } from '../config';

// Define User interface to match your backend /userDetail response
// export interface User {
//   id: string;
//   username: string;
//   email: string;
//   fullName: string,
//   bio: string,
//   lat: string,
//   lan: string,
//   mainHobby: string,
//   location: string,
//   profilePicture: File | null,
//   // posts: any[], // Adjust type based on your posts structure
//   followersCount: number,
//   followingCount: number,
//   posts: number,
// }

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginWithGoogleToken: (token: string) => Promise<boolean>;
  loginWithApple: (payload: {
    identityToken: string;
    authorizationCode?: string;
    givenName?: string;
    familyName?: string;
    email?: string;
  }) => Promise<boolean>;
  login: (username: string, password: string) => Promise<boolean>;
  pendingRegistration: any; // For partial registration data
  savePartialRegistration: (regdata: any) => void;
  register: (name: string,
    username: string,
    email: string,
    password: string,
    bio: string,
    profilePicture: File | null,
    lat: string,
    lan: string,
    mainHobby: string,
    location: string) => Promise<boolean>;

  logout: () => void

  // 🔹 Forgot password flow
  forgotEmail: string | null;
  forgotPassword: (email: string) => Promise<boolean>;
  verifyResetCode: (otp: string) => Promise<boolean>;
  resetPassword: (newPassword: string) => Promise<boolean>;

  loading: boolean;        // loading for login/register calls
  loadingUser: boolean;    // loading for initial user fetch
  registerError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Set base URL for axios (adjust via VITE_BACKEND_URL, see src/config.ts)
axios.defaults.baseURL = API_BASE_URL;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  // FOrgot passwrod context
  const [forgotEmail, setForgotEmail] = useState<string | null>(null);

  const [pendingRegistration, setPendingRegistration] = useState<any>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const savePartialRegistration = (regdata: any) => {
    setPendingRegistration(regdata);
  };

  // Fetch user details function
  const fetchUserDetails = async () => {
    try {

      console.log("🔎 Fetching user details with token:", axios.defaults.headers.common['Authorization']);

      const response = await axiosInstance.get<User>('/api/users/userDetail');

      setUser(response.data);
    } catch (error: any) {
      console.error('Failed to fetch user details:', error);


      // Only logout if it's a real auth error (401 / 403)
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logout();
      }
    }
  };

  // On mount, load token and fetch user details
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // ✅ Always prefix with Bearer
      axios.defaults.headers.common['Authorization'] =
        token.startsWith("Bearer") ? token : `Bearer ${token}`;
      // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      fetchUserDetails().finally(() => setLoadingUser(false));
    } else {
      setLoadingUser(false);
    }
  }, []);


  // inside your AuthProvider
  const loginWithGoogleToken = async (token: string) => {
    try {
      // store token (secure cookie or localStorage depending on your strategy)
      localStorage.setItem("token", token);

      // set default header for future requests (if you use axios)
      axios.defaults.headers.common['Authorization'] = token;


      // fetch current user
      // const res = await axios.get("/api/auth/me"); // backend: return current user info for token
      // setUser(res.data);
      // return true;
      await fetchUserDetails();
      return true;
    } catch (err) {
      console.error("loginWithToken error", err);
      return false;
    }
  };


  const loginWithApple = async (payload: {
    identityToken: string;
    authorizationCode?: string;
    givenName?: string;
    familyName?: string;
    email?: string;
  }): Promise<boolean> => {
    try {
      const response = await axios.post('/api/auth/apple', {
        identity_token: payload.identityToken,
        authorization_code: payload.authorizationCode,
        given_name: payload.givenName,
        family_name: payload.familyName,
        email: payload.email,
      });
      const { token, type } = response.data;
      const fullToken = `${type} ${token}`;

      localStorage.setItem('token', fullToken);
      axios.defaults.headers.common['Authorization'] = fullToken;

      await fetchUserDetails();
      return true;
    } catch (err) {
      console.error('Apple login failed:', err);
      return false;
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      const { profilePicture, ...userWithoutImage } = response.data;
      const { token, type } = userWithoutImage;
      const fullToken = `${type} ${token}`;

      localStorage.setItem('token', fullToken);
      axios.defaults.headers.common['Authorization'] = fullToken;

      await fetchUserDetails();
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    username: string,
    email: string,
    password: string,
    bio: string,
    profilePicture: File | null,
    lat: string,
    lon: string,
    mainHobby: string,
    location: string
  ): Promise<boolean> => {
    setLoading(true);
    setRegisterError(null);
    try {
      const formData = new FormData();
      formData.append("registerRequest", new Blob([JSON.stringify({
        name, username, email, password, bio, lat, lon, mainHobby, location, profilePicture: undefined
      })], { type: "application/json" }));

      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      const response = await axios.post('/api/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const { token, type } = response.data;

      // Known backend quirk: on a duplicate username/email, this endpoint
      // responds 200 OK with the human-readable error message sitting in
      // the `token` field (e.g. {"token":"Username is already taken!",
      // "type":"Bearer"}) instead of a 4xx. Detect that by checking `token`
      // actually looks like a JWT (three dot-separated segments) before
      // treating this as a success.
      const looksLikeJwt = typeof token === 'string' && /^[\w-]+\.[\w-]+\.[\w-]+$/.test(token);
      if (!looksLikeJwt) {
        setRegisterError(token || 'Registration failed. Please try again.');
        return false;
      }

      const fullToken = `${type} ${token}`;
      localStorage.setItem('token', fullToken);
      axios.defaults.headers.common['Authorization'] = fullToken;

      await fetchUserDetails();
      return true;
    } catch (error) {
      console.error('Registration failed:', error);

      // The backend has a separate known quirk: it can save the new account
      // to the database successfully and still respond with a 500 if a
      // non-critical side effect (welcome email / message-queue publish)
      // throws after the save. From the user's point of view registration
      // then looks like it failed even though the account is fully usable.
      // As a safety net, try logging in with the same credentials before
      // giving up — if that succeeds, the account really was created and we
      // can proceed as if registration had succeeded outright.
      try {
        const loggedIn = await login(username, password);
        if (loggedIn) return true;
      } catch {
        // fall through to the real failure below
      }

      setRegisterError('Registration failed. Please check your details and try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    //  clearData();
  };

  //Forgot password functions added here
  const forgotPassword = async (email: string): Promise<boolean> => {
    setLoading(true);
    try {
      await axios.post("/api/auth/forgot-password", { email });

      // store email temporarily
      setForgotEmail(email);

      return true;
    } catch (error: any) {
      console.error("Forgot password error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  const verifyResetCode = async (otp: string): Promise<boolean> => {
    if (!forgotEmail) throw new Error("Email missing");

    setLoading(true);
    try {
      await axios.post("/api/auth/verify-reset-code", {
        email: forgotEmail,
        otp,
      });

      return true;
    } catch (error: any) {
      console.error("OTP verification failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (newPassword: string): Promise<boolean> => {
    if (!forgotEmail) throw new Error("Email missing");

    setLoading(true);
    try {
      await axios.post("/api/auth/reset-password", {
        email: forgotEmail,
        newPassword,
      });

      // cleanup
      setForgotEmail(null);

      return true;
    } catch (error: any) {
      console.error("Reset password failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginWithGoogleToken,
        loginWithApple,
        login,
        savePartialRegistration,
        register,
        logout,
        forgotEmail,
        forgotPassword,
        verifyResetCode,
        resetPassword,
        loading,
        loadingUser,
        pendingRegistration,
        registerError,

      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


// export const useAuth = () => useContext(AuthContext);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;

};

