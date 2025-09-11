import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";


export const AuthContext = createContext();

const API_BASE = "http://localhost:3000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("accessToken"));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refreshToken"));
  const [loading, setLoading] = useState(false);

  // Save tokens
  const saveTokens = (u, access, refresh) => {
    setUser(u);
    setAccessToken(access);
    setRefreshToken(refresh);
    if (u) localStorage.setItem("user", JSON.stringify(u));
    if (access) localStorage.setItem("accessToken", access);
    if (refresh) localStorage.setItem("refreshToken", refresh);
  };

  const clearTokens = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  // login wrapper (used by Login page)
  const login = (userData, tokens) => {
    saveTokens(userData, tokens.accessToken, tokens.refreshToken);
  };

  const logout = async () => {
    try {
      // notify backend to revoke refresh token (optional)
      if (refreshToken) {
        await axios.post(`${API_BASE}/api/auth/logout`, { refreshToken });
      }
    } catch (e) {
      /* ignore */
    } finally {
      clearTokens();
    }
  };

  // refresh access token using refresh token (callable by api)
  const refreshAccessToken = useCallback(async () => {
    try {
      if (!refreshToken) throw new Error("No refresh token");
      const res = await axios.post(`${API_BASE}/api/auth/refresh`, { refreshToken });
      const newAccess = res.data.accessToken;
      setAccessToken(newAccess);
      localStorage.setItem("accessToken", newAccess);
      return newAccess;
    } catch (err) {
      clearTokens();
      throw err;
    }
  }, [refreshToken]);

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      refreshToken,
      loading,
      login,
      logout,
      refreshAccessToken,
      saveTokens,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
