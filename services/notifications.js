import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import api from './api';

// Configurar el manejador de notificaciones para la app
export const configurarNotificaciones = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

// Verificar y solicitar permisos de notificación
export const solicitarPermisosNotificacion = async () => {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('¡No se obtuvieron permisos de notificación push!');
      return false;
    }
    return true;
  } else {
    console.log('Las notificaciones solo funcionan en dispositivos físicos');
    return false;
  }
};

// Obtener token de notificación push de Expo
export const obtenerTokenNotificacion = async () => {
  try {
    if (!Device.isDevice) {
      console.log('Token solo disponible en dispositivos físicos');
      return null;
    }

    // Verificar permisos primero
    const tienePermiso = await solicitarPermisosNotificacion();
    if (!tienePermiso) return null;
    
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: projectId, // Si estás usando EAS (opcional)
    });
    
    // En dispositivos Android necesitas configurar canales de notificación
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#21588E',
      });
    }
    
    return token.data;
  } catch (error) {
    console.log('Error al obtener el token de notificación:', error);
    return null;
  }
};

// Guardar token de notificación en AsyncStorage
export const guardarTokenLocalmente = async (token) => {
  if (token) {
    await AsyncStorage.setItem('notificationToken', token);
  }
};

// Registrar token en el servidor (para doctores)
export const registrarTokenEnServidor = async (doctorId, token) => {
  try {
    if (!token || !doctorId) return false;
    
    const response = await api.post('/registrar-token-notificacion', {
      doctorId: doctorId,
      token: token
    });
    
    return response.success;
  } catch (error) {
    console.error('Error al registrar token en el servidor:', error);
    return false;
  }
};

// Enviar notificación local (útil para pruebas)
export const enviarNotificacionLocal = async (titulo, cuerpo, datos = {}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: titulo,
      body: cuerpo,
      data: datos,
    },
    trigger: null, // Inmediatamente
  });
};

// Función completa para inicializar notificaciones para un doctor
export const inicializarNotificacionesDoctor = async (doctorId) => {
  try {
    // Configurar notificaciones
    configurarNotificaciones();
    
    // Obtener token
    const token = await obtenerTokenNotificacion();
    if (!token) return false;
    
    // Guardar en local
    await guardarTokenLocalmente(token);
    
    // Registrar en servidor
    const registrado = await registrarTokenEnServidor(doctorId, token);
    
    return registrado;
  } catch (error) {
    console.error('Error al inicializar notificaciones:', error);
    return false;
  }
};