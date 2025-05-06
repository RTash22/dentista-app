import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base de la API
const API_URL = 'http://192.168.0.32:8000/api';

// Crear una instancia de axios con la URL base
const apiClient = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar el token de autenticación a todas las solicitudes
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Obtener el token desde AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      
      // Si hay un token, añadirlo a los encabezados de la solicitud
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      console.error('Error al obtener token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Si el error es 401 (No autorizado), el token podría haber expirado
    if (error.response && error.response.status === 401) {
      // Aquí podrías implementar lógica para refrescar el token o
      // redirigir al usuario al login
      console.log('Token expirado o inválido');
      
      // Ejemplo: limpiar el almacenamiento y redirigir al login
      // await AsyncStorage.clear();
      // navigation.navigate('Login'); // Esto requeriría acceso al objeto navigation
    }
    
    return Promise.reject(error);
  }
);

// Métodos API envueltos para una mejor gestión de errores
export const api = {
  get: async (url, config = {}) => {
    try {
      const response = await apiClient.get(url, config);
      return response.data;
    } catch (error) {
      console.error(`Error en GET ${url}:`, error);
      throw error;
    }
  },
  
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await apiClient.post(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`Error en POST ${url}:`, error);
      throw error;
    }
  },
  
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await apiClient.put(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`Error en PUT ${url}:`, error);
      throw error;
    }
  },
  
  delete: async (url, config = {}) => {
    try {
      const response = await apiClient.delete(url, config);
      return response.data;
    } catch (error) {
      console.error(`Error en DELETE ${url}:`, error);
      throw error;
    }
  }
};

export default api;