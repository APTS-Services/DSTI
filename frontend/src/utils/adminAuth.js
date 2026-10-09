// src/utils/adminAuth.js
// Prototype CMS authentication. Client-side demo accounts with roles.
// When the backend is wired up this becomes a real JWT login against /api/user.
import { useEffect, useState } from 'react';

const TOKEN_KEY = 'dsti.admin.token';
const ROLE_KEY = 'dsti.admin.role';
const NAME_KEY = 'dsti.admin.name';

// Demo accounts (prototype only).
const ACCOUNTS = [
  { username: 'admin', password: 'admin@123', role: 'Administrator', name: 'System Administrator' },
  { username: 'editor', password: 'editor@123', role: 'Editor', name: 'Content Editor' },
  { username: 'publisher', password: 'publish@123', role: 'Publisher', name: 'Publication Officer' },
];

export const ROLES = ['Administrator', 'Editor', 'Publisher'];

export function login(username, password) {
  const user = ACCOUNTS.find((a) => a.username === username && a.password === password);
  if (!user) return null;
  localStorage.setItem(TOKEN_KEY, `demo-${user.username}-${Date.now()}`);
  localStorage.setItem(ROLE_KEY, user.role);
  localStorage.setItem(NAME_KEY, user.name);
  return user;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(NAME_KEY);
}

export function isAuthed() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY) || null;
}

export function getUserName() {
  return localStorage.getItem(NAME_KEY) || 'User';
}

/** Hook to subscribe a component to auth state. */
export function useAuth() {
  const [authed, setAuthed] = useState(isAuthed());
  useEffect(() => {
    const onStorage = () => setAuthed(isAuthed());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return { authed, role: getRole(), name: getUserName(), login, logout, setAuthed };
}
