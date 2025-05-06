import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

// Cambiamos de función nombrada a exportación por defecto
export default function LoginScreen() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    axios.get('http://192.168.0.32:8000/api/doctores-lista')
      .then(response => {
        if (response.data.status === 'success') {
          setDoctors(response.data.data);
        } else {
          Alert.alert('Error', 'No se pudieron cargar los doctores.');
        }
      })
      .catch(error => {
        console.error('Error obteniendo doctores:', error);
        Alert.alert('Error', 'Hubo un problema al conectar con el servidor.');
      });
  }, []);

  const handleLogin = async () => {
    if (!selectedDoctor || !password) {
      Alert.alert('Error', 'Por favor selecciona un doctor e ingresa la contraseña.');
      return;
    }

    try {
      // Realiza la solicitud de login con el id_doctor en lugar del email
      const response = await axios.post('http://192.168.0.32:8000/api/login', {
        id_doctor: selectedDoctor,
        password: password
      });

      console.log('Respuesta de login:', response.data);

      if (response.data.status === 'success') {
        // Extraer información del usuario y token
        const userData = response.data.data.user;
        const token = response.data.data.token || response.data.token;
        const isAdmin = userData.is_admin;
        const userRole = userData.rol;
        
        // Guardar el token de autenticación
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        console.log('Token guardado:', token);
        console.log('Tipo de usuario:', {
          esAdmin: isAdmin,
          rol: userRole,
          nombre: userData.doctor?.nombre || userData.usuario
        });
        
        // Navegar según el rol del usuario
        if (isAdmin === 1 || userRole === 'admin') {
          navigation.replace('Admin', { userData });
        } else {
          navigation.replace('Home', { userData });
        }
      } else {
        Alert.alert('Error', 'Credenciales incorrectas.');
      }
    } catch (error) {
      console.error('Error de login:', error.response?.data || error.message);
      
      let errorMessage = 'Hubo un problema al iniciar sesión.';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Credenciales incorrectas.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      <FlatList
        data={doctors}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.doctorItem,
              selectedDoctor === item.id && styles.selectedDoctorItem
            ]}
            onPress={() => setSelectedDoctor(item.id)}
          >
            <Text style={styles.doctorName}>{item.nombre}</Text>
            <Text style={styles.doctorEmail}>{item.correo}</Text>
          </TouchableOpacity>
        )}
        style={styles.doctorList}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#21588E',
  },
  doctorList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  doctorItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedDoctorItem: {
    borderColor: '#21588E',
    backgroundColor: '#e6f0f9',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  doctorEmail: {
    fontSize: 14,
    color: '#666',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#21588E',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});