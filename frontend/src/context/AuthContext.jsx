import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { clearSession, getStoredUser, saveSession, SESSION_EXPIRED_EVENT } from "../auth/session";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(getStoredUser);

  /** @param {string} token JWT from the API  @param {{userID:number,email:string,fullName:string,role:string}} apiUser */
  const login = useCallback((token, apiUser) => {
    const user = {
      id: apiUser.userID,
      email: apiUser.email,
      fullName: apiUser.fullName,
      role: (apiUser.role ?? "user").toLowerCase(),
    };
    saveSession(token, user);
    setCurrentUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
  }, []);

  const updateCurrentUser = useCallback((changes) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...changes };
      if (changes.fullName) localStorage.setItem("fullName", changes.fullName);
      return next;
    });
  }, []);

  // The API client clears the session on 401; mirror that in React state.
  useEffect(() => {
    const onExpired = () => setCurrentUser(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isLoggedIn: Boolean(currentUser),
      userRole: currentUser?.role ?? null,
      userId: currentUser?.id ?? null,
      login,
      logout,
      updateCurrentUser,
    }),
    [currentUser, login, logout, updateCurrentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
