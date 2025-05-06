import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import { configurarNotificaciones } from './services/notifications';

// Import screens - corregido para importar por defecto
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import DoctoresScreen from './screens/DoctoresScreen';
import DoctorDetails from './screens/DoctorDetails';
import DoctorForm from './screens/DoctorForm';
import Patients from './screens/Patients';
import PatientDetails from './screens/PatientDetails';
import PatientForm from './screens/PatientForm';
import Procedures from './screens/Procedures';
import ProcedureForm from './screens/ProcedureForm';
import AdminScreen from './screens/AdminScreen';
import ConsultasScreen from './screens/ConsultasScreen';
import CitaForm from './screens/CitaForm';
import CitaDetails from './screens/CitaDetails';
import CitasDocs from './screens/CitasDocs';
import HistorialMedicoScreen from './screens/HistorialMedicoScreen';
import HistorialCitasDoctor from './screens/HistorialCitasDoctor';
import CalendarScreen from './screens/Calendar';  // Importando el componente Calendar
import AdminCalendar from './screens/AdminCalendar';

const Stack = createStackNavigator();

export default function App() {
  // Referencias para manejar notificaciones
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Configurar manejador de notificaciones al iniciar la app
    configurarNotificaciones();

    // Configurar escucha para notificaciones recibidas mientras la app está en primer plano
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      const { title, body } = notification.request.content;
      console.log(`Notificación recibida en primer plano: ${title} - ${body}`);
      // Puedes mostrar una alerta o banner personalizado aquí si lo deseas
    });

    // Configurar escucha para cuando el usuario toca una notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const { data } = response.notification.request.content;
      console.log('Datos de la notificación:', data);
      
      // Aquí puedes manejar la navegación basada en los datos de la notificación
      // Por ejemplo, si es una nueva cita, navegar a los detalles de la cita
    });

    // Limpieza al desmontar
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Admin" component={AdminScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Calendar" component={CalendarScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AdminCalendar" component={AdminCalendar} options={{ headerShown: false }} />
        
        <Stack.Screen name="DoctoresScreen" component={DoctoresScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DoctorDetails" component={DoctorDetails} options={{ headerShown: false }} />
        <Stack.Screen name="DoctorForm" component={DoctorForm} options={{ headerShown: false }} />
        
        <Stack.Screen name="Patients" component={Patients} options={{ headerShown: false }} />
        <Stack.Screen name="PatientDetails" component={PatientDetails} options={{ headerShown: false }} />
        <Stack.Screen name="PatientForm" component={PatientForm} options={{ headerShown: false }} />
        
        <Stack.Screen name="Procedures" component={Procedures} options={{ headerShown: false }} />
        <Stack.Screen name="ProcedureForm" component={ProcedureForm} options={{ headerShown: false }} />
        
        <Stack.Screen name="ConsultasScreen" component={ConsultasScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CitaForm" component={CitaForm} options={{ headerShown: false }} />
        <Stack.Screen name="CitaDetails" component={CitaDetails} options={{ headerShown: false }} />
        <Stack.Screen name="CitasDocs" component={CitasDocs} options={{ headerShown: false }} />
        
        <Stack.Screen name="HistorialMedicoScreen" component={HistorialMedicoScreen} options={{ headerShown: false }} />
        
        <Stack.Screen name="HistorialCitasDoctor" component={HistorialCitasDoctor} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}