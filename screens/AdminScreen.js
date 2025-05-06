import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default  function AdminScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const userData = route.params?.userData || {};
  const [searchQuery, setSearchQuery] = useState('');
  
  const upcomingAppointments = [
    { id: '1', patientName: 'Juan Pérez', date: '27/04/2025', time: '09:00' },
    { id: '2', patientName: 'María García', date: '27/04/2025', time: '10:30' },
    { id: '3', patientName: 'Carlos López', date: '28/04/2025', time: '11:00' },
    { id: '4', patientName: 'Ana Martínez', date: '28/04/2025', time: '12:30' }
  ];

  const services = [
    { id: 1, name: 'Agenda', icon: 'calendar' },
    { id: 2, name: 'Citas', icon: 'medical' },  
    { id: 3, name: 'Pacientes', icon: 'people' },
    { id: 4, name: 'Historial', icon: 'time' },
    { id: 5, name: 'Doctores', icon: 'medkit' },
    { id: 6, name: 'Procedimientos', icon: 'flask' }
  ];

  const filteredServices = useMemo(() => {
    return services.filter(service =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Buenos días';
    if (hour >= 12 && hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const handleServicePress = (serviceName) => {
    if (serviceName === 'Agenda') {
      navigation.navigate('Calendar');
    }
    if (serviceName === 'Citas') {
      navigation.navigate('ConsultasScreen');
    }
    if (serviceName === 'Pacientes') {
      navigation.navigate('Patients');
    }
    if (serviceName === 'Historial') {
      // Navegar a la pantalla de selección de doctor
      navigation.navigate('DoctoresScreen', {
        mode: 'select',
        onSelect: (doctor) => {
          // Asegurar que tenemos el ID del doctor
          if (!doctor || !doctor.id) {
            Alert.alert('Error', 'No se pudo obtener el ID del doctor');
            return;
          }
          
          // Navegar directamente a la pantalla de historial con el ID del doctor
          navigation.navigate('HistorialCitasDoctor', {
            doctorId: doctor.id,
            doctorNombre: doctor.nombre || 'Doctor'
          });
        }
      });
    }
    if (serviceName === 'Doctores') {
      navigation.navigate('DoctoresScreen');
    }
    if (serviceName === 'Procedimientos') {
      navigation.navigate('Procedures');
    }
  };

  const handleLogout = () => {
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#21588E', '#2FA0AD']}
        style={styles.headerGradient}
      >
        <View style={styles.greetingContainer}>
          <Text style={[styles.smallGreeting, { color: '#fff' }]}>¡Hola!</Text>
          <Text style={[styles.greeting, { color: '#fff' }]}>
            {getTimeBasedGreeting()}, {userData.doctor?.nombre || userData.usuario || 'Administrador'}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar servicios..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666"
        />
      </View>

      <Text style={styles.sectionTitle}>Servicios</Text>

      <View style={styles.gridContainer}>
        {filteredServices.map(service => (
          <TouchableOpacity 
            key={service.id} 
            style={styles.gridItem}
            onPress={() => handleServicePress(service.name)}
          >
            <Ionicons name={service.icon} size={32} color="#378DD0" />
            <Text style={styles.gridItemText}>{service.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.appointmentsContainer}>
        <Text style={styles.appointmentsTitle}>Próximas Citas</Text>
        <FlatList
          data={upcomingAppointments}
          keyExtractor={(item) => item.id}
          style={styles.appointmentsList}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View style={[
              styles.appointmentCard,
              { 
                borderColor: index % 2 === 0 ? '#21588E' : '#2FA0AD',
                backgroundColor: index % 2 === 0 ? '#21588E' : '#2FA0AD'
              }
            ]}>
              <Text style={[styles.patientName, { color: 'white' }]}>
                {item.patientName}
              </Text>
              <Text style={[styles.appointmentTime, { color: 'white' }]}>
                {item.date} - {item.time}
              </Text>
            </View>
          )}
        />
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greetingContainer: {
    position: 'absolute',
    top: 90,
    left: 30,
  },
  smallGreeting: {
    fontSize: 17,  
    fontWeight: '400',
    color: '#333',
    marginBottom: 5,
  },
  greeting: {
    fontSize: 28,  
    fontWeight: 'bold', 
    color: '#333',
  },
  searchContainer: {
    position: 'absolute',
    top: 175,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    borderRadius: 15,
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
  sectionTitle: {
    position: 'absolute',
    top: 230,
    left: 20,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  gridContainer: {
    position: 'absolute',
    top: 290, 
    left: 20,
    right: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  gridItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginRight: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3.5,
    borderColor: '#77C4FF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    transform: [{ scale: 0.98 }],
  },
  gridItemText: {
    marginTop: 8,
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  appointmentsContainer: {
    position: 'absolute',
    bottom: 90, 
    left: 20,
    right: 20,
    height: 120,
  },
  appointmentsTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  appointmentsList: {
    flex: 1,
  },
  appointmentCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 15,
    marginRight: 15,
    borderWidth: 0,
    width: 200,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  patientName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  appointmentTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});