// Single place that knows how the login session is persisted in localStorage.
// Key names are kept stable so existing sessions survive the refactor.
const KEYS = {
  token: "token",
  isLoggedIn: "isLoggedIn",
  userId: "userId",
  email: "userEmail",
  fullName: "fullName",
  role: "userRole",
};

export const SESSION_EXPIRED_EVENT = "auth:session-expired";

const safeGet = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/** Returns the JWT payload, or null if the token is missing or malformed. */
const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const isExpired = (token) => {
  const payload = decodeToken(token);
  return !payload?.exp || payload.exp * 1000 <= Date.now();
};

export const getToken = () => {
  const token = safeGet(KEYS.token);
  return token && !isExpired(token) ? token : null;
};

/** The stored user, or null when there is no valid (non-expired) session. */
export const getStoredUser = () => {
  if (!getToken()) return null;
  return {
    id: Number(safeGet(KEYS.userId)) || null,
    email: safeGet(KEYS.email) ?? "",
    fullName: safeGet(KEYS.fullName) ?? "",
    role: safeGet(KEYS.role) ?? "user",
  };
};

export const saveSession = (token, user) => {
  localStorage.setItem(KEYS.token, token);
  localStorage.setItem(KEYS.isLoggedIn, "true");
  localStorage.setItem(KEYS.userId, String(user.id));
  localStorage.setItem(KEYS.email, user.email);
  localStorage.setItem(KEYS.fullName, user.fullName);
  localStorage.setItem(KEYS.role, user.role);
};

export const clearSession = () => {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
};
