import axios from 'axios';

// Vite env vars en React (soporta VITE_API_URL o VITE_API_BASE_URL)
const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') ||
  'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 180_000, // 3 min — LangGraph + AI inference puede tardar (Ollama local hasta 2 min)
});

// Interceptor Global de Response para centralizar captura de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Aquí puedes disparar un toast genérico de error a futuro si lo deseas
    console.error('API Error details:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
