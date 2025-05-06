import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../services/api';

export default function CalendarScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const userData = route.params?.userData || {};
  
  const [loading, setLoading] = useState(true);
  const [citasByDay, setCitasByDay] = useState({});
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDayCitas, setSelectedDayCitas] = useState([]);

  // Formatea la fecha al formato YYYY-MM-DD para usar con el calendario
  const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  // Obtener todas las citas del doctor en sesión
  const fetchDoctorCitas = async () => {
    try {
      setLoading(true);
      const doctorId = userData.doctor?.id || userData.id;
      
      // Usar el método específico de la API en lugar de la ruta directa
      const response = await api.getCitasByDoctor(doctorId);
      
      // Verificar que la respuesta tenga formato correcto (success: true)
      if (response && response.success && response.data) {
        // La estructura puede ser directamente un array o tener un objeto anidado con citas
        const citasData = Array.isArray(response.data) ? response.data : response.data.citas;
        
        if (Array.isArray(citasData)) {
          // Organizar citas por fecha
          const citasPorDia = {};
          citasData.forEach(cita => {
            const fechaCita = formatDate(cita.fecha);
            if (!citasPorDia[fechaCita]) {
              citasPorDia[fechaCita] = [];
            }
            citasPorDia[fechaCita].push(cita);
          });
          
          setCitasByDay(citasPorDia);
          
          // Marcar las fechas en el calendario según la cantidad de citas
          const marked = {};
          Object.keys(citasPorDia).forEach(date => {
            const numCitas = citasPorDia[date].length;
            let color;
            
            if (numCitas > 5) {
              color = '#FF6B6B'; // Rojo
            } else if (numCitas >= 3 && numCitas <= 5) {
              color = '#FFD93D'; // Amarillo
            } else if (numCitas > 0 && numCitas < 3) {
              color = '#6BCB77'; // Verde
            }
            
            if (color) {
              marked[date] = {
                selected: true,
                selectedColor: color,
                dotColor: '#fff',
                marked: true
              };
            }
          });
          
          setMarkedDates(marked);
        } else {
          console.error('El formato de datos no es un array:', citasData);
          Alert.alert('Error', 'Los datos recibidos no tienen el formato esperado');
        }
      } else {
        const errorMsg = response?.message || 'No se pudieron cargar las citas';
        console.error('Error en la respuesta:', errorMsg);
        Alert.alert('Error', errorMsg);
      }
    } catch (error) {
      console.error('Error al cargar las citas del doctor:', error);
      Alert.alert('Error', 'No se pudieron cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorCitas();
  }, []);

  // Maneja la selección de una fecha en el calendario
  const handleDayPress = (day) => {
    const selectedDate = day.dateString;
    setSelectedDate(selectedDate);
    
    // Si hay citas para este día, mostrar la modal
    if (citasByDay[selectedDate] && citasByDay[selectedDate].length > 0) {
      setSelectedDayCitas(citasByDay[selectedDate]);
      setModalVisible(true);
    } else {
      Alert.alert('Información', 'No hay citas programadas para este día');
    }
  };

  // Formatea la hora para mostrar
  const formatTime = (dateString) => {
    if (!dateString) return 'Hora no disponible';
    const date = new Date(dateString);
    
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
          <Text style={styles.headerTitle}>Agenda de Citas</Text>
        </View>
      </LinearGradient>

      <View style={styles.calendarContainer}>
        <Text style={styles.calendarTitle}>
          Calendario de {userData.doctor?.nombre || userData.usuario || 'Doctor'}
        </Text>
        
        <Text style={styles.indicatorLabel}>Indicadores:</Text>
        <View style={styles.indicatorsContainer}>
          <View style={styles.indicator}>
            <View style={[styles.colorIndicator, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.indicatorText}>Más de 5 citas</Text>
          </View>
          <View style={styles.indicator}>
            <View style={[styles.colorIndicator, { backgroundColor: '#FFD93D' }]} />
            <Text style={styles.indicatorText}>Entre 3 y 5 citas</Text>
          </View>
          <View style={styles.indicator}>
            <View style={[styles.colorIndicator, { backgroundColor: '#6BCB77' }]} />
            <Text style={styles.indicatorText}>Entre 1 y 2 citas</Text>
          </View>
          <View style={styles.indicator}>
            <View style={[styles.colorIndicator, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CCCCCC' }]} />
            <Text style={styles.indicatorText}>Sin citas</Text>
          </View>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#21588E" />
            <Text style={styles.loadingText}>Cargando citas...</Text>
          </View>
        ) : (
          <Calendar
            style={styles.calendar}
            markedDates={markedDates}
            onDayPress={handleDayPress}
            monthFormat={'MMMM yyyy'}
            firstDay={1}
            onMonthChange={(month) => {
              console.log('Mes cambiado', month);
            }}
            hideExtraDays={true}
            enableSwipeMonths={true}
            theme={{
              calendarBackground: '#FFFFFF',
              textSectionTitleColor: '#21588E',
              textSectionTitleDisabledColor: '#d9e1e8',
              selectedDayBackgroundColor: '#21588E',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#21588E',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#21588E',
              selectedDotColor: '#ffffff',
              arrowColor: '#21588E',
              disabledArrowColor: '#d9e1e8',
              monthTextColor: '#21588E',
              indicatorColor: '#21588E',
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '500',
            }}
          />
        )}
      </View>

      {/* Modal para mostrar las citas del día seleccionado */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              Citas del {selectedDate && new Date(selectedDate).toLocaleDateString('es-ES')}
            </Text>
            <FlatList
              data={selectedDayCitas}
              keyExtractor={(item) => item.id.toString()}
              style={styles.citasList}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.citaCard}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('CitaDetails', { cita: item });
                  }}
                >
                  <View>
                    <Text style={styles.pacienteName}>
                      {item.paciente_nombre || 'Paciente'}
                    </Text>
                    <Text style={styles.citaHora}>
                      {formatTime(item.fecha)} - Procedimiento: {item.procedimiento || 'No especificado'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color="#21588E" />
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  calendarContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#21588E',
    marginBottom: 15,
  },
  calendar: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#21588E',
    marginBottom: 15,
    textAlign: 'center',
  },
  citasList: {
    maxHeight: 400,
  },
  citaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#21588E',
  },
  pacienteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  citaHora: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  closeButton: {
    backgroundColor: "#21588E",
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  indicatorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#21588E',
    marginBottom: 5,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
  colorIndicator: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    marginRight: 5,
  },
  indicatorText: {
    fontSize: 12,
    color: '#666',
  },
});