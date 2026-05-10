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
