import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { AdminScreen } from './screens/AdminScreen';
import { Patients } from './screens/Patients';
import { PatientForm } from './screens/PatientForm';
import { PatientDetails } from './screens/PatientDetails';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="AdminScreen" component={AdminScreen} />
        <Stack.Screen name="Patients" component={Patients} />
        <Stack.Screen name="PatientForm" component={PatientForm} />
        <Stack.Screen name="PatientDetails" component={PatientDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
