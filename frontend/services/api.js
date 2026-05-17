import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:3000'
  : 'http://10.0.2.2:3000'; // Android emulator → localhost

const storage = {
  getItem: (key) =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.getItem(key))
      : SecureStore.getItemAsync(key),
  setItem: (key, value) =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.setItem(key, value))
      : SecureStore.setItemAsync(key, value),
  deleteItem: (key) =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.removeItem(key))
      : SecureStore.deleteItemAsync(key),
};

async function getToken() {
  return await storage.getItem('jwt_token');
}

async function authFetch(path, options = {}) {
  const token = await getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// Auth
export async function register(name, email, password) {
  return authFetch('/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login(email, password) {
  const data = await authFetch('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await storage.setItem('jwt_token', data.token);
  await storage.setItem('user_data', JSON.stringify(data.user));
  return data;
}

export function isAdmin(user) {
  return user?.role === 'admin';
}

export async function logout() {
  await storage.deleteItem('jwt_token');
  await storage.deleteItem('user_data');
}

export async function getStoredUser() {
  const raw = await storage.getItem('user_data');
  return raw ? JSON.parse(raw) : null;
}

// Theatres
export function getTheatres(search) {
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  return authFetch(`/theatres${q}`);
}

// Shows
export function getShows({ theatreId, title, date } = {}) {
  const params = new URLSearchParams();
  if (theatreId) params.append('theatreId', theatreId);
  if (title)     params.append('title', title);
  if (date)      params.append('date', date);
  const q = params.toString() ? `?${params}` : '';
  return authFetch(`/shows${q}`);
}

// Showtimes
export function getShowtimes(showId) {
  return authFetch(`/showtimes?showId=${showId}`);
}

// Seats
export function getSeats(showtimeId) {
  return authFetch(`/seats?showtimeId=${showtimeId}`);
}

// Reservations
export function createReservation(showtimeId, seatIds) {
  return authFetch('/reservations', {
    method: 'POST',
    body: JSON.stringify({ showtimeId, seatIds }),
  });
}

export function getMyReservations() {
  return authFetch('/reservations/my');
}

export function cancelReservation(id) {
  return authFetch(`/reservations/${id}`, { method: 'DELETE' });
}

// ── ADMIN ─────────────────────────────────────────────────────────────────────

export function adminGetStats() { return authFetch('/admin/stats'); }

export function adminGetTheatres() { return authFetch('/admin/theatres'); }
export function adminCreateTheatre(data) { return authFetch('/admin/theatres', { method: 'POST', body: JSON.stringify(data) }); }
export function adminUpdateTheatre(id, data) { return authFetch(`/admin/theatres/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export function adminDeleteTheatre(id) { return authFetch(`/admin/theatres/${id}`, { method: 'DELETE' }); }

export function adminGetShows() { return authFetch('/admin/shows'); }
export function adminCreateShow(data) { return authFetch('/admin/shows', { method: 'POST', body: JSON.stringify(data) }); }
export function adminUpdateShow(id, data) { return authFetch(`/admin/shows/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export function adminDeleteShow(id) { return authFetch(`/admin/shows/${id}`, { method: 'DELETE' }); }

export function adminGetShowtimes() { return authFetch('/admin/showtimes'); }
export function adminCreateShowtime(data) { return authFetch('/admin/showtimes', { method: 'POST', body: JSON.stringify(data) }); }
export function adminUpdateShowtime(id, data) { return authFetch(`/admin/showtimes/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export function adminDeleteShowtime(id) { return authFetch(`/admin/showtimes/${id}`, { method: 'DELETE' }); }
export function adminGenerateSeats(id, data) { return authFetch(`/admin/showtimes/${id}/seats/generate`, { method: 'POST', body: JSON.stringify(data) }); }

export function adminGetReservations() { return authFetch('/admin/reservations'); }
export function adminCancelReservation(id) { return authFetch(`/admin/reservations/${id}`, { method: 'DELETE' }); }

export function adminGetUsers() { return authFetch('/admin/users'); }
export function adminUpdateUserRole(id, role) { return authFetch(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }); }
export function adminDeleteUser(id) { return authFetch(`/admin/users/${id}`, { method: 'DELETE' }); }
