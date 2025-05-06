import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base de la API
const API_URL = 'http://192.168.1.138:8000/api';
console.log('API URL configurada:', API_URL);

// Crear una instancia de axios con la URL base
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Añadimos timeout para detectar problemas de conexión
});

// Interceptor para agregar el token de autenticación a todas las solicitudes
apiClient.interceptors.request.use(
  async (config) => {
    try {
      console.log(`🚀 Realizando solicitud a: ${config.baseURL}${config.url}`);
      // Obtener el token desde AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      
      // Si hay un token, añadirlo a los encabezados de la solicitud
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Token añadido a la solicitud');
      } else {
        console.log('No hay token disponible');
      }
      
      return config;
    } catch (error) {
      console.error('Error al obtener token:', error);
      return config;
    }
  },
  (error) => {
    console.error('Error en interceptor de solicitud:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Respuesta exitosa de ${response.config.url}:`, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      dataPreview: typeof response.data === 'object' ? 'Objeto JSON recibido' : typeof response.data
    });
    return response;
  },
  async (error) => {
    console.error(`❌ Error en solicitud a ${error.config?.url || 'desconocido'}:`, {
      message: error.message,
      code: error.code,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : 'Sin respuesta del servidor'
    });
    
    // Si el error es 401 (No autorizado), el token podría haber expirado
    if (error.response && error.response.status === 401) {
      console.log('Token expirado o inválido');
    }
    
    // Si es un error de conexión
    if (error.code === 'ECONNABORTED') {
      console.error('Timeout de conexión - Verifica si el servidor está disponible');
    }
    
    if (error.code === 'ERR_NETWORK' || !error.response) {
      console.error('Error de red - Verifica la conexión o si la URL de la API es correcta');
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
  // GET request
  async get(endpoint) {
    try {
      const response = await apiClient.get(endpoint);
      return processApiResponse(response.data);
    } catch (error) {
      console.error(`Error en GET ${endpoint}:`, error);
      return { 
        success: false, 
        data: null, 
        message: error.response?.data?.message || error.message || 'Error al obtener datos' 
      };
    }
  },

  // POST request
  async post(endpoint, data) {
    try {
      const response = await apiClient.post(endpoint, data);
      return processApiResponse(response.data);
    } catch (error) {
      console.error(`Error en POST ${endpoint}:`, error);
      return { 
        success: false, 
        data: null, 
        message: error.response?.data?.message || error.message || 'Error al enviar datos' 
      };
    }
  },

  // PUT request
  async put(endpoint, data) {
    try {
      const response = await apiClient.put(endpoint, data);
      return processApiResponse(response.data);
    } catch (error) {
      console.error(`Error en PUT ${endpoint}:`, error);
      return { 
        success: false, 
        data: null, 
        message: error.response?.data?.message || error.message || 'Error al actualizar datos' 
      };
    }
  },

  // DELETE request
  async delete(endpoint) {
    try {
      const response = await apiClient.delete(endpoint);
      return processApiResponse(response.data);
    } catch (error) {
      console.error(`Error en DELETE ${endpoint}:`, error);
      return { 
        success: false, 
        data: null, 
        message: error.response?.data?.message || error.message || 'Error al eliminar datos' 
      };
    }
  },

  // Obtener citas por doctor
  async getCitasByDoctor(doctorId, fecha) {
    return this.get(`/citas-doctor/${doctorId}${fecha ? `?fecha=${fecha}` : ''}`);
  },

  // Obtener citas completadas por doctor
  async getCitasCompletadasDoctor(doctorId) {
    return this.get(`/citas-completadas-doctor/${doctorId}`);
  },

  // Obtener citas pendientes
  async getCitasPendientes() {
    return this.get('/citas-pendientes');
  }
};

export default api;