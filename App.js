import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

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

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Admin" component={AdminScreen} options={{ headerShown: false }} />

        <Stack.Screen name="DoctoresScreen" component={DoctoresScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DoctorDetails" component={DoctorDetails} options={{ headerShown: false }} />
        <Stack.Screen name="DoctorForm" component={DoctorForm} options={{ headerShown: false }} />
        
        <Stack.Screen name="Patients" component={Patients} options={{ headerShown: false }} />
        <Stack.Screen name="PatientDetails" component={PatientDetails} options={{ headerShown: false }} />
        <Stack.Screen name="PatientForm" component={PatientForm} options={{ headerShown: false }} />
        
        <Stack.Screen name="Procedures" component={Procedures} options={{ headerShown: false }} />
        <Stack.Screen name="ProcedureForm" component={ProcedureForm} options={{ headerShown: false }} />
        
        {/* Pantallas de gestión de citas */}
        <Stack.Screen name="ConsultasScreen" component={ConsultasScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CitaForm" component={CitaForm} options={{ headerShown: false }} />
        <Stack.Screen name="CitaDetails" component={CitaDetails} options={{ headerShown: false }} />
        <Stack.Screen name="CitasDocs" component={CitasDocs} options={{ headerShown: false }} />
        
        {/* Nueva pantalla de historial médico detallado */}
        <Stack.Screen name="HistorialMedicoScreen" component={HistorialMedicoScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}