const BASE_URL = 'https://24.objects.htmlacademy.pro/big-trip';
const ENDPOINTS = {
  POINTS: '/points',
  DESTINATIONS: '/destinations',
  OFFERS: '/offers',
};

const generateAuthToken = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Basic ${result}`;
};

const AUTH_TOKEN = generateAuthToken();

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
  return await response.json();
};

export const fetchPoints = () => load(ENDPOINTS.POINTS);
export const fetchDestinations = () => load(ENDPOINTS.DESTINATIONS);
export const fetchOffers = () => load(ENDPOINTS.OFFERS);
export const updatePoint = (point) => load(`${ENDPOINTS.POINTS}/${point.id}`, 'PUT', point);
