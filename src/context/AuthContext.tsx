import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import axiosInstance from "../types/axiosInstance";
import { posts } from '../data/mockData';
import { useData } from './DataContext';

// Define User interface to match your backend /userDetail response
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string,
  bio: string,
  lat: string,
  lan: string,
  mainHobby: string,
  location: string,
  profilePicture: File | null,
  // posts: any[], // Adjust type based on your posts structure
  followersCount: number,
  followingCount: number,
  posts: number,
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginWithGoogleToken: (token: string) => Promise<boolean>;
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
    
  logout: () => void;
  loading: boolean;        // loading for login/register calls
  loadingUser: boolean;    // loading for initial user fetch
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Set base URL for axios (adjust if your backend URL changes)
// axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.baseURL = 'http://16.170.26.131:8080';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  // const { clearData } = useData();

  const [pendingRegistration, setPendingRegistration] = useState<any>(null);

const savePartialRegistration = (regdata: any) => {
  setPendingRegistration(regdata);
};


  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, []);


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
    try {
      const formData = new FormData();
      formData.append("registerRequest", new Blob([JSON.stringify({
        name, username, email, password, bio, lat, lon, mainHobby, location, profilePicture: undefined
      })], { type: "application/json" }));

      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      console.log('Form data Auth Context:', formData);

      const response = await axios.post('/api/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const { token, type } = response.data;
      const fullToken = `${type} ${token}`;

      localStorage.setItem('token', fullToken);
      axios.defaults.headers.common['Authorization'] = fullToken;

      console.log('User registered successfully:', response.data);

      await fetchUserDetails();
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginWithGoogleToken,
        login,
        savePartialRegistration,
        register,
        logout,
        loading,
        loadingUser,
        pendingRegistration,
       
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

