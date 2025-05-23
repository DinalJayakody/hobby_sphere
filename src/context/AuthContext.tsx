// import React, { createContext, useContext, useState, ReactNode } from 'react';
// import { currentUser } from '../data/mockData';
// import { User } from '../types';

// interface AuthContextType {
//   user: User | null;
//   isAuthenticated: boolean;
//   login: (username: string, password: string) => Promise<boolean>;
//   register: (name: string, username: string , email: string, password: string) => Promise<boolean>;
//   logout: () => void;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(false);

//   const login = async (username: string, password: string): Promise<boolean> => {
//     setLoading(true);

//     return new Promise((resolve) => {
//       // Simulate API call
//       setTimeout(() => {
//         if (username && password) {
//           setUser(currentUser);
//           setLoading(false);
//           resolve(true);
//         } else {
//           setLoading(false);
//           resolve(false);
//         }
//       }, 1000);
//     });
//   };

//   const register = async (
//     name: string, 
//     username: string, 
//     email: string, 
//     password: string
//   ): Promise<boolean> => {
//     setLoading(true);

//     return new Promise((resolve) => {
//       // Simulate API call
//       setTimeout(() => {
//         if (name && username && email && password) {
//           setUser({
//             ...currentUser,
//             name,
//             username
//           });
//           setLoading(false);
//           resolve(true);
//         } else {
//           setLoading(false);
//           resolve(false);
//         }
//       }, 1000);
//     });
//   };

//   const logout = () => {
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isAuthenticated: !!user,
//         login,
//         register,
//         logout,
//         loading
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// src/context/AuthContext.tsx

// ---------------------------------------------------------------------------------------------------------

// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import axios from 'axios';
// import { User } from '../types';

// interface AuthContextType {
//   user: User | null;
//   isAuthenticated: boolean;
//   login: (username: string, password: string) => Promise<boolean>;
//   register: (name: string, username: string, email: string, password: string) => Promise<boolean>;
//   logout: () => void;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const storedUser = localStorage.getItem('user');
//     if (token && storedUser) {
//       axios.defaults.headers.common['Authorization'] = token;
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);

//   const login = async (username: string, password: string): Promise<boolean> => {
//     setLoading(true);
//     try {
//       const response = await axios.post('http://localhost:8080/api/auth/login', {
//         username,
//         password,
//       });

//       const { token, type, id, username: name, email } = response.data;
//       const fullToken = `${type} ${token}`;
//       const user: User = { id, username: name, email };

//       localStorage.setItem('token', fullToken);
//       localStorage.setItem('user', JSON.stringify(user));
//       axios.defaults.headers.common['Authorization'] = fullToken;

//       setUser(user);
//       return true;
//     } catch (error) {
//       console.error('Login failed:', error);
//       return false;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const register = async (name: string, username: string, email: string, password: string): Promise<boolean> => {
//     setLoading(true);
//     try {
//       const response = await axios.post('http://localhost:8080/api/auth/register', {
//         name,
//         username,
//         email,
//         password,
//       });

//       const { token, type, id, username: resUsername, email: resEmail } = response.data;
//       const fullToken = `${type} ${token}`;
//       const newuser: User = { id, username: resUsername, email: resEmail  };

//       localStorage.setItem('token', fullToken);
//       localStorage.setItem('user', JSON.stringify(newuser));
//       axios.defaults.headers.common['Authorization'] = fullToken;

//       setUser(newuser);

//       return true;
//     } catch (error) {
//       console.error('Registration failed:', error);
//       return false;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     delete axios.defaults.headers.common['Authorization'];
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error('useAuth must be used within an AuthProvider');
//   return context;
// };

// ----------------------------------------------------------------------------------------------------------

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { posts } from '../data/mockData';

// Define User interface to match your backend /userDetail response
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string,
  profilePicture: string,
  // posts: any[], // Adjust type based on your posts structure
  followers: number,
  following: number,
  posts: number;
  // add other fields if needed
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (name: string, username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;        // loading for login/register calls
  loadingUser: boolean;    // loading for initial user fetch
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Set base URL for axios (adjust if your backend URL changes)
axios.defaults.baseURL = 'http://localhost:8080';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  // Fetch user details function
  const fetchUserDetails = async () => {
    try {
      const response = await axios.get<User>('/api/users/userDetail');
      //   const json = {
      //   id: 1,
      //   email: 'Dinal@example.com',
      //   username: 'dj123',
      //   name: 'Dinal Jay',
      //   profilePicture: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
      //   posts: posts,
      //   followers: [5],
      //   following: [2],
      // };
      setUser(response.data);
      // return { success: true, data: user };

    } catch (error) {
      console.error('Failed to fetch user details:', error);
      logout(); // Clear auth if token invalid
    }
  };

  // On mount, load token and fetch user details
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = token;
      fetchUserDetails().finally(() => setLoadingUser(false));
    } else {
      setLoadingUser(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      const { token, type } = response.data;
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
    password: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', { name, username, email, password });
      const { token, type } = response.data;
      const fullToken = `${type} ${token}`;

      localStorage.setItem('token', fullToken);
      axios.defaults.headers.common['Authorization'] = fullToken;

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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading,
        loadingUser,
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

