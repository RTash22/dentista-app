import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export function PatientDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { patient } = route.params || {};

  // Verificar si tenemos datos del paciente
  if (!patient) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#e74c3c" />
        <Text style={styles.errorText}>No se encontró información del paciente</Text>
        <TouchableOpacity
          style={styles.backToListButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backToListButtonText}>Volver a la lista</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Detalles del Paciente</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('PatientForm', { 
              patient, 
              refresh: () => navigation.goBack() 
            })}
          >
            <Ionicons name="create-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Sección de información personal */}
        <View style={styles.infoSection}>
          <View style={styles.patientProfileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {patient.nombre?.charAt(0) || ''}
                  {patient.apellidos?.charAt(0) || ''}
                </Text>
              </View>
            </View>
            <View style={styles.patientNameContainer}>
              <Text style={styles.patientName}>
                {patient.nombre} {patient.apellidos}
              </Text>
              <Text style={styles.patientId}>ID: {patient.id}</Text>
              <Text style={styles.registrationDate}>
                Fecha de registro: {patient.fecha_registro || 'No disponible'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Información de contacto */}
          <Text style={styles.sectionTitle}>Información de Contacto</Text>
          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={20} color="#21588E" />
            <Text style={styles.infoLabel}>Teléfono:</Text>
            <Text style={styles.infoValue}>{patient.telefono || 'No disponible'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={20} color="#21588E" />
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{patient.correo || patient.email || 'No disponible'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="home-outline" size={20} color="#21588E" />
            <Text style={styles.infoLabel}>Dirección:</Text>
            <Text style={styles.infoValue}>{patient.direccion || 'No disponible'}</Text>
          </View>

          <View style={styles.divider} />

          {/* Sección de historial médico (futura implementación) */}
          <Text style={styles.sectionTitle}>Historial Médico</Text>
          <View style={styles.infoItem}>
            <Ionicons name="document-text-outline" size={20} color="#21588E" />
            <Text style={styles.infoLabel}>Descripción:</Text>
            <Text style={styles.infoValue}>{patient.descripcion || 'Sin información médica'}</Text>
          </View>

          <View style={styles.divider} />

          {/* Historial de citas */}
          <View style={styles.appointmentsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Historial de Citas</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            
            {/* Mensaje de citas no disponibles */}
            <View style={styles.noAppointmentsContainer}>
              <Ionicons name="calendar-outline" size={40} color="#cccccc" />
              <Text style={styles.noAppointmentsText}>
                No hay citas disponibles
              </Text>
              <Text style={styles.noAppointmentsSubText}>
                El historial de citas estará disponible próximamente
              </Text>
            </View>

            {/* Aquí irían las citas cuando estén disponibles */}
            <View style={styles.appointmentPlaceholder}>
              <View style={styles.appointmentPlaceholderHeader}>
                <Ionicons name="calendar" size={24} color="#21588E" />
                <Text style={styles.appointmentPlaceholderDate}>Próxima cita (ejemplo)</Text>
              </View>
              <View style={styles.appointmentPlaceholderBody}>
                <Text style={styles.appointmentPlaceholderText}>Fecha: 15/06/2025</Text>
                <Text style={styles.appointmentPlaceholderText}>Hora: 10:30 AM</Text>
                <Text style={styles.appointmentPlaceholderText}>Doctor: Dr. García</Text>
                <Text style={styles.appointmentPlaceholderText}>Tratamiento: Limpieza dental</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  backToListButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#21588E',
    borderRadius: 10,
  },
  backToListButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  patientProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#21588E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  patientNameContainer: {
    flex: 1,
  },
  patientName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  patientId: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  registrationDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#21588E',
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    marginLeft: 10,
    width: 80,
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    flexWrap: 'wrap',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  appointmentsSection: {
    marginTop: 10,
  },
  seeAllButton: {
    padding: 5,
  },
  seeAllText: {
    color: '#2FA0AD',
    fontWeight: '500',
  },
  noAppointmentsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 20,
  },
  noAppointmentsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 10,
  },
  noAppointmentsSubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  appointmentPlaceholder: {
    backgroundColor: '#f2f8ff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#21588E',
  },
  appointmentPlaceholderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  appointmentPlaceholderDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  appointmentPlaceholderBody: {
    marginLeft: 34,
  },
  appointmentPlaceholderText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
});