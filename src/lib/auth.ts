// Simple admin authentication
// Para un único usuario, usamos una contraseña simple
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '#morfika202519185311';
const AUTH_KEY = 'morfika_auth';
const AUTH_TOKEN = 'morfika_token';

export const login = (password: string): boolean => {
  if (password === ADMIN_PASSWORD) {
    // Generar token simple
    const token = btoa(`morfika_admin_${Date.now()}`);
    sessionStorage.setItem(AUTH_KEY, 'true');
    sessionStorage.setItem(AUTH_TOKEN, token);
    return true;
  }
  return false;
};

export const checkAuth = (): boolean => {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
};

export const logout = (): void => {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_TOKEN);
};

export const getAuthToken = (): string | null => {
  return sessionStorage.getItem(AUTH_TOKEN);
};
