import { TOKEN_LENGTH } from '../const.js';

const BASE_URL = 'https://24.objects.htmlacademy.pro/big-trip';
const ENDPOINTS = {
  POINTS: '/points',
  DESTINATIONS: '/destinations',
  OFFERS: '/offers',
};

const AUTH_TOKEN_KEY = 'big-trip-auth-token';
let AUTH_TOKEN = localStorage.getItem(AUTH_TOKEN_KEY);

if (!AUTH_TOKEN) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < TOKEN_LENGTH; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  AUTH_TOKEN = `Basic ${result}`;
  localStorage.setItem(AUTH_TOKEN_KEY, AUTH_TOKEN);
}

const load = async (route, method = 'GET', body = null) => {
  const url = `${BASE_URL}${route}`;
  const config = {
    method,
    headers: {
      'Authorization': AUTH_TOKEN,
      'Content-Type': 'application/json',
    },
  };
  if (body) {
    config.body = JSON.stringify(body);
  }
  const response = await fetch(url, config);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const fetchPoints = () => load(ENDPOINTS.POINTS);
export const fetchDestinations = () => load(ENDPOINTS.DESTINATIONS);
export const fetchOffers = () => load(ENDPOINTS.OFFERS);
export const updatePoint = (point) => load(`${ENDPOINTS.POINTS}/${point.id}`, 'PUT', point);
export const createPoint = (point) => load(ENDPOINTS.POINTS, 'POST', point);
export const deletePoint = (id) => load(`${ENDPOINTS.POINTS}/${id}`, 'DELETE');
