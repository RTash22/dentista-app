import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function DoctoresScreen() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      checkUserRole();
      fetchDoctors();
    }, [])
  );

  const checkUserRole = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setIsAdmin(user.rol === 'admin' || user.is_admin === 1);
      }
    } catch (error) {
      console.error('Error verificando rol de usuario:', error);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      console.log('Intentando obtener la lista de doctores de la API...');
      const response = await api.get('/doctores-lista');
      console.log('Respuesta completa de API doctores-lista:', JSON.stringify(response, null, 2));
      
      // Verificación flexible que maneja múltiples formatos de respuesta
      if (response.data && (response.data.status === "success" || response.data.status === 200 || response.status === 200)) {
        // Esto maneja ambos casos
        const doctoresData = response.data.data || response.data;
        console.log(`Doctores obtenidos exitosamente. Cantidad: ${doctoresData?.length || 0}`);
        if (doctoresData && doctoresData.length > 0) {
          console.log('Estructura del primer doctor:', JSON.stringify(doctoresData[0], null, 2));
        }
        setDoctors(doctoresData || []);
      } else {
        console.error('Error en la respuesta de la API:', response);
        Alert.alert('Error', 'No se pudieron cargar los doctores');
      }
    } catch (error) {
      console.error('Error detallado al obtener doctores:', {
        message: error.message,
        stack: error.stack,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data
        } : 'Sin respuesta del servidor',
      });
      Alert.alert('Error', 'Hubo un problema al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doctorId) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Está seguro de que desea eliminar este doctor? Esta acción no se puede deshacer y eliminará también el usuario asociado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await api.delete(`/doctores/${doctorId}`);
              console.log('Respuesta de eliminación:', JSON.stringify(response, null, 2));
              
              // Verificar el código HTTP
              if (response && response.status === 200) {
                Alert.alert('Éxito', 'Doctor eliminado correctamente');
                fetchDoctors(); // Recargar la lista
              } else {
                console.error('Error al eliminar doctor, respuesta no válida:', response);
                Alert.alert('Error', 'No se pudo eliminar el doctor');
              }
            } catch (error) {
              console.error('Error eliminando doctor:', error);
              Alert.alert('Error', 'Hubo un problema al eliminar el doctor');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const searchLower = searchQuery.toLowerCase();
      return (
        doctor.nombre?.toLowerCase().includes(searchLower) ||
        doctor.especialidad?.toLowerCase().includes(searchLower) ||
        doctor.correo?.toLowerCase().includes(searchLower)
      );
    });
  }, [doctors, searchQuery]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'activo': return '#4CAF50'; // Verde
      case 'inactivo': return '#F44336'; // Rojo
      case 'vacaciones': return '#FF9800'; // Naranja
      case 'licencia': return '#2196F3'; // Azul
      default: return '#9E9E9E'; // Gris
    }
  };

  const renderDoctorItem = ({ item }) => {
    console.log('Doctor seleccionado:', {
      id: item.id,
      tipoDeId: typeof item.id,
      nombre: item.nombre,
      todoDatos: item
    });
    
    return (
      <TouchableOpacity
        style={styles.doctorCard}
        onPress={() => {
          console.log('Navegando a DoctorDetails con id:', item.id);
          navigation.navigate('DoctorDetails', { doctorId: item.id });
        }}
      >
        <View style={styles.doctorCardContent}>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{item.nombre}</Text>
            <Text style={styles.doctorSpecialty}>{item.especialidad || 'Sin especialidad'}</Text>
            <Text style={styles.doctorEmail}>{item.correo}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
              <Text style={styles.statusText}>{item.status || 'Desconocido'}</Text>
            </View>
          </View>

          {isAdmin && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => navigation.navigate('DoctorForm', { doctor: item })}
              >
                <Ionicons name="create-outline" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar doctores..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#21588E" />
        </View>
      ) : (
        <FlatList
          data={filteredDoctors}
          keyExtractor={item => item.id.toString()}
          renderItem={renderDoctorItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No se encontraron doctores</Text>
            </View>
          }
        />
      )}

      {isAdmin && (
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => navigation.navigate('DoctorForm')}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    padding: 15,
  },
  doctorCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  doctorCardContent: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#21588E',
    marginBottom: 5,
  },
  doctorSpecialty: {
    fontSize: 16,
    color: '#555',
    marginBottom: 3,
  },
  doctorEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 90,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#21588E',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#21588E',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});