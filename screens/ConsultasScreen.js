import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';

export default function ConsultasScreen() {
  const navigation = useNavigation();
  const [citas, setCitas] = useState([]);
  const [filteredCitas, setFilteredCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar las citas cuando la pantalla obtiene el foco
  useFocusEffect(
    React.useCallback(() => {
      fetchCitas();
    }, [])
  );

  // Función para obtener las citas desde la API
  const fetchCitas = async () => {
    setLoading(true);
    try {
      console.log('Obteniendo citas...');
      const response = await api.get('/citas');
      
      console.log('Respuesta de citas:', response);
      
      // Simulación de respuesta con formato estandarizado para propósitos de depuración
      console.log('LOG  Respuesta de citas: {"data": [{"created_at": "2025-05-06T09:36:47.000000Z", "descripcion_manual": "Pues es una descripcion vea y pus ajam", "doctor": [Object], "estado": "pendiente", "fecha": "2025-05-17T00:00:00.000000Z", "hora": "08:31", "id": 2, "id_doctor": 1, "id_paciente": 5, "id_procedimiento": 3, "observaciones": "Pus ahi esta. vea nomas", "paciente": [Object], "procedimiento": [Object], "updated_at": "2025-05-06T09:36:47.000000Z"}], "message": "Listado de citas recuperado exitosamente", "success": true}');
      
      if (Array.isArray(response)) {
        // Si la respuesta es directamente un array
        setCitas(response);
        setFilteredCitas(response);
      } else if (response && response.status === 'success' && Array.isArray(response.data)) {
        // Si la respuesta tiene formato { status: 'success', data: [...] }
        setCitas(response.data);
        setFilteredCitas(response.data);
      } else if (response && response.success && Array.isArray(response.data)) {
        // Si la respuesta tiene formato { success: true, data: [...] }
        setCitas(response.data);
        setFilteredCitas(response.data);
      } else {
        Alert.alert('Error', 'El formato de respuesta no es el esperado');
      }
    } catch (error) {
      console.error('Error obteniendo citas:', error);
      let errorMessage = 'Hubo un problema al cargar las citas.';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          Alert.alert('Sesión expirada', errorMessage, [
            { text: 'OK', onPress: () => navigation.replace('Login') }
          ]);
          return;
        } else {
          errorMessage += ` Error ${error.response.status}`;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de citas por búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCitas(citas);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = citas.filter(cita => 
        (cita.paciente?.nombre?.toLowerCase().includes(query) || 
        cita.paciente?.apellidos?.toLowerCase().includes(query) ||
        cita.doctor?.nombre?.toLowerCase().includes(query) ||
        cita.procedimiento?.nombre?.toLowerCase().includes(query) ||
        cita.descripcion_manual?.toLowerCase().includes(query) ||
        cita.fecha?.includes(query))
      );
      setFilteredCitas(filtered);
    }
  }, [searchQuery, citas]);

  // Función para eliminar una cita
  const handleDeleteCita = (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar esta cita?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await api.delete(`/citas/${id}`);
              
              if (response.status === 'success') {
                setCitas(prevCitas => prevCitas.filter(cita => cita.id !== id));
                Alert.alert('Éxito', 'Cita eliminada correctamente');
              } else {
                Alert.alert('Error', 'No se pudo eliminar la cita');
              }
            } catch (error) {
              console.error('Error al eliminar cita:', error);
              Alert.alert('Error', 'Ocurrió un problema al eliminar la cita');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Navegar al formulario de nueva cita
  const handleAddCita = () => {
    navigation.navigate('CitaForm');
  };

  // Navegar al formulario de edición de cita
  const handleEditCita = (cita) => {
    navigation.navigate('CitaForm', { cita, isEditing: true });
  };

  // Navegar a los detalles de la cita
  const handleViewCita = (cita) => {
    navigation.navigate('CitaDetails', { citaId: cita.id });
  };

  // Función para obtener el color según el estado de la cita
  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return '#FF9800'; // Naranja
      case 'completada': return '#4CAF50'; // Verde
      case 'cancelada': return '#F44336'; // Rojo
      default: return '#757575'; // Gris
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    
    // Formatear fecha como DD/MM/YYYY
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Función para formatear la hora
  const formatTime = (timeString) => {
    if (!timeString) return 'Sin hora';
    
    // Si la hora viene en formato HH:mm:ss, extraer solo HH:mm
    if (timeString.includes(':')) {
      return timeString.substring(0, 5);
    }
    
    // Si es un string de fecha ISO
    const date = new Date(timeString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  // Renderizar cada item de la lista de citas
  const renderCitaItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.citaCard}
      onPress={() => handleViewCita(item)}
    >
      <View style={styles.citaInfo}>
        <View style={styles.citaHeader}>
          <Text style={styles.citaDate}>
            {formatDate(item.fecha)} - {formatTime(item.hora)}
          </Text>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
            <Text style={styles.estadoText}>{item.estado || 'Pendiente'}</Text>
          </View>
        </View>

        <Text style={styles.pacienteName}>
          {item.paciente?.nombre} {item.paciente?.apellidos || 'Sin paciente asignado'}
        </Text>
        
        <Text style={styles.doctorName}>
          Doctor: {item.doctor?.nombre || 'Sin doctor asignado'}
        </Text>
        
        <Text style={styles.procedimientoName}>
          {item.procedimiento?.nombre || item.descripcion_manual || 'Sin procedimiento'}
        </Text>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.viewButton]} 
          onPress={() => handleViewCita(item)}
        >
          <Ionicons name="eye-outline" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]} 
          onPress={() => handleEditCita(item)}
        >
          <Ionicons name="create-outline" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={() => handleDeleteCita(item.id)}
        >
          <Ionicons name="trash-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#21588E', '#2FA0AD']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Citas</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddCita}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar citas..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666"
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#21588E" />
          <Text style={styles.loadingText}>Cargando citas...</Text>
        </View>
      ) : (
        <>
          {filteredCitas.length > 0 ? (
            <FlatList
              data={filteredCitas}
              keyExtractor={(item) => item.id?.toString()}
              renderItem={renderCitaItem}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={60} color="#cccccc" />
              <Text style={styles.emptyText}>
                No se encontraron citas
              </Text>
              {searchQuery ? (
                <Text style={styles.emptySubText}>
                  Intenta con otra búsqueda
                </Text>
              ) : (
                <Text style={styles.emptySubText}>
                  Agrega tu primera cita con el botón +
                </Text>
              )}
            </View>
          )}
        </>
      )}

      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={handleAddCita}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerGradient: {
    height: 120,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 80, // Espacio para el botón flotante
  },
  citaCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  citaInfo: {
    flex: 1,
  },
  citaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  citaDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#21588E',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  estadoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  pacienteName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    marginBottom: 3,
  },
  doctorName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  procedimientoName: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  actionButtons: {
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 3,
  },
  viewButton: {
    backgroundColor: '#2FA0AD',
  },
  editButton: {
    backgroundColor: '#378DD0',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginTop: 15,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#21588E',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});