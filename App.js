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

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="DoctoresScreen" component={DoctoresScreen} options={{ title: 'Doctores' }} />
        <Stack.Screen name="DoctorDetails" component={DoctorDetails} options={{ title: 'Detalles del Doctor' }} />
        <Stack.Screen name="DoctorForm" component={DoctorForm} options={{ title: 'Formulario de Doctor' }} />
        <Stack.Screen name="Patients" component={Patients} options={{ title: 'Pacientes' }} />
        <Stack.Screen name="PatientDetails" component={PatientDetails} options={{ title: 'Detalles del Paciente' }} />
        <Stack.Screen name="PatientForm" component={PatientForm} options={{ title: 'Formulario de Paciente' }} />
        <Stack.Screen name="Procedures" component={Procedures} options={{ title: 'Procedimientos' }} />
        <Stack.Screen name="ProcedureForm" component={ProcedureForm} options={{ title: 'Formulario de Procedimiento' }} />
        <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Administración' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}