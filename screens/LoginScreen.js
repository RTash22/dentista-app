import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

export function LoginScreen() {
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
        Alert.alert('Error', 'Hubo un problema al conectar con el servidor.');
      });
  }, []);

  const handleLogin = () => {
    if (!selectedDoctor || !password) {
      Alert.alert('Error', 'Por favor selecciona un doctor e ingresa la contraseña.');
      return;
    }

    axios.post('http://192.168.0.32:8000/api/login', {
      id_doctor: selectedDoctor,
      password: password
    })
      .then(response => {
        if (response.data.status === 'success') {
          // Extract user information
          const userData = response.data.data.user;
          const isAdmin = userData.is_admin;
          const userRole = userData.rol;
          const userName = userData.doctor?.nombre || userData.usuario;
          
          console.log('Tipo de usuario:', {
            esAdmin: isAdmin,
            rol: userRole,
            nombre: userName
          });
          
          // Navigate based on user role
          if (isAdmin === 1 || userRole === 'admin') {
            navigation.replace('AdminScreen', { userData });
          } else {
            navigation.replace('HomeScreen', { userData });
          }
        } else {
          Alert.alert('Error', 'Credenciales incorrectas.');
        }
      })
      .catch(error => {
        console.error('Error de login:', error.response?.data || error.message);
        Alert.alert('Error', 'Hubo un problema al iniciar sesión.');
      });
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
          </TouchableOpacity>
        )}
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  doctorItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedDoctorItem: {
    borderColor: '#21588E',
    backgroundColor: '#E8F4FF',
  },
  doctorName: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  loginButton: {
    backgroundColor: '#21588E',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});