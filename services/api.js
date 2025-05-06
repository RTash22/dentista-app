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
      console.log('Token expirado o inválido');
    }
    
    return Promise.reject(error);
  }
);

/**
 * Procesa la respuesta de la API para estandarizar el formato de datos
 * @param {Object} response - La respuesta de la API
 * @returns {Object} - Datos estandarizados { success: boolean, data: any, message: string }
 */
const processApiResponse = (response) => {
  // Si no hay respuesta, devolvemos un error estándar
  if (!response) {
    return { success: false, data: null, message: 'No se recibió respuesta del servidor' };
  }

  // Si la respuesta es un array directamente (como en /doctores-lista)
  if (Array.isArray(response)) {
    return { success: true, data: response, message: 'Datos obtenidos correctamente' };
  }

  // Si la respuesta tiene formato {status: 'success', data: [...]}
  if (response.status === 'success' || response.status === 200) {
    return { 
      success: true, 
      data: response.data || response, 
      message: response.message || 'Operación exitosa'
    };
  }

  // Si la respuesta tiene un ID (como al crear un registro)
  if (response.id) {
    return { success: true, data: response, message: 'Operación exitosa' };
  }

  // En cualquier otro caso, consideramos que fue exitoso si hay datos
  return { 
    success: !!response, 
    data: response, 
    message: 'Datos procesados'
  };
};

// Métodos API envueltos para una mejor gestión de errores
export const api = {
  get: async (url, config = {}) => {
    console.log(`[API] Iniciando GET a ${url}`);
    try {
      console.log(`[API] Configuración de solicitud:`, {
        url: `${API_URL}${url}`,
        headers: config.headers || 'Usando headers por defecto',
        params: config.params || 'Sin parámetros'
      });
      
      const response = await apiClient.get(url, config);
      console.log(`[API] Respuesta exitosa de GET ${url}:`, JSON.stringify(response.data, null, 2));
      return processApiResponse(response.data);
    } catch (error) {
      console.error(`[API] Error en GET ${url}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: `${API_URL}${url}`
      });
      throw error;
    }
  },
  
  post: async (url, data = {}, config = {}) => {
    try {
      // Asegurar que los encabezados estén configurados correctamente
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...config.headers
      };
      
      // Registrar la solicitud para depuración
      console.log(`[API] Enviando POST a ${url}:`, JSON.stringify(data, null, 2));
      
      const response = await apiClient.post(url, data, { 
        ...config, 
        headers 
      });
      
      // Registrar la respuesta para depuración
      console.log(`[API] Respuesta de POST ${url}:`, JSON.stringify(response.data, null, 2));
      
      return processApiResponse(response.data);
    } catch (error) {
      console.error(`[API] Error en POST ${url}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: `${API_URL}${url}`
      });
      throw error;
    }
  },
  
  put: async (url, data = {}, config = {}) => {
    try {
      console.log(`[API] Enviando PUT a ${url}:`, JSON.stringify(data, null, 2));
      
      const response = await apiClient.put(url, data, config);
      
      console.log(`[API] Respuesta de PUT ${url}:`, JSON.stringify(response.data, null, 2));
      
      return processApiResponse(response.data);
    } catch (error) {
      console.error(`[API] Error en PUT ${url}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },
  
  delete: async (url, config = {}) => {
    try {
      console.log(`[API] Enviando DELETE a ${url}`);
      
      const response = await apiClient.delete(url, config);
      
      console.log(`[API] Respuesta de DELETE ${url}:`, JSON.stringify(response.data, null, 2));
      
      return processApiResponse(response.data);
    } catch (error) {
      console.error(`[API] Error en DELETE ${url}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }
};

export default api;