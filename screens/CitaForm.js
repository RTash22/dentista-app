import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../services/api';

export default function CitaForm() {
  const navigation = useNavigation();
  const route = useRoute();
  const { cita, isEditing } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [formData, setFormData] = useState({
    id_paciente: '',
    id_doctor: '',
    id_procedimiento: '',
    descripcion_manual: '',
    observaciones: '',
    estado: 'pendiente',
    fecha: new Date(),
    hora: new Date(),
  });

  // Data para los pickers
  const [pacientes, setPacientes] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [procedimientos, setProcedimientos] = useState([]);

  // Estados para selección de fecha y hora
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      setPageLoading(true);
      try {
        // Cargar datos para los select
        await Promise.all([
          loadPacientes(),
          loadDoctores(),
          loadProcedimientos()
        ]);

        // Si estamos editando, cargar los datos de la cita
        if (isEditing && cita) {
          let citaData = { ...cita };
          
          // Convertir las fechas a objetos Date
          if (citaData.fecha) {
            citaData.fecha = new Date(citaData.fecha);
          }
          
          if (citaData.hora) {
            // Si hora es un string con formato HH:MM:SS, convertirlo a Date
            if (typeof citaData.hora === 'string' && citaData.hora.includes(':')) {
              const [hours, minutes] = citaData.hora.split(':');
              const horaDate = new Date();
              horaDate.setHours(parseInt(hours, 10));
              horaDate.setMinutes(parseInt(minutes, 10));
              citaData.hora = horaDate;
            } else {
              citaData.hora = new Date(citaData.hora);
            }
          }
          
          setFormData(citaData);
        }
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        Alert.alert('Error', 'Hubo un problema al cargar los datos iniciales');
      } finally {
        setPageLoading(false);
      }
    };

    loadInitialData();
  }, [isEditing, cita]);

  // Cargar lista de pacientes
  const loadPacientes = async () => {
    try {
      const response = await api.get('/pacientes');
      
      let pacientesData = [];
      if (Array.isArray(response)) {
        pacientesData = response;
      } else if (response && response.status === 'success' && Array.isArray(response.data)) {
        pacientesData = response.data;
      }
      
      setPacientes(pacientesData);
    } catch (error) {
      console.error('Error cargando pacientes:', error);
    }
  };

  // Cargar lista de doctores
  const loadDoctores = async () => {
    try {
      const response = await api.get('/doctores-lista');
      
      let doctoresData = [];
      if (Array.isArray(response)) {
        doctoresData = response;
      } else if (response && response.status === 'success' && Array.isArray(response.data)) {
        doctoresData = response.data;
      }
      
      setDoctores(doctoresData);
    } catch (error) {
      console.error('Error cargando doctores:', error);
    }
  };

  // Cargar lista de procedimientos
  const loadProcedimientos = async () => {
    try {
      const response = await api.get('/procedimientos');
      
      let procedimientosData = [];
      if (Array.isArray(response)) {
        procedimientosData = response;
      } else if (response && response.status === 'success' && Array.isArray(response.data)) {
        procedimientosData = response.data;
      }
      
      setProcedimientos(procedimientosData);
    } catch (error) {
      console.error('Error cargando procedimientos:', error);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Manejar cambio de fecha
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange('fecha', selectedDate);
    }
  };

  // Manejar cambio de hora
  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      handleChange('hora', selectedTime);
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('es-ES');
  };

  // Formatear hora para mostrar
  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  // Validar el formulario antes de enviar
  const validateForm = () => {
    const errors = [];

    if (!formData.id_paciente) {
      errors.push('Debe seleccionar un paciente');
    }
    
    if (!formData.id_doctor) {
      errors.push('Debe seleccionar un doctor');
    }
    
    if (!formData.id_procedimiento && !formData.descripcion_manual) {
      errors.push('Debe seleccionar un procedimiento o ingresar una descripción manual');
    }
    
    if (!formData.fecha) {
      errors.push('Debe seleccionar una fecha');
    }
    
    if (!formData.hora) {
      errors.push('Debe seleccionar una hora');
    }
    
    if (errors.length > 0) {
      Alert.alert('Campos incompletos', errors.join('\n'));
      return false;
    }
    
    return true;
  };

  // Enviar formulario
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      console.log('Enviando formulario de cita...');
      
      // Formatear la hora correctamente en formato de 24 horas (HH:MM)
      const horaFormateada = formData.hora.getHours().toString().padStart(2, '0') + ':' + 
                            formData.hora.getMinutes().toString().padStart(2, '0');
      
      // Preparar los datos para el envío
      const dataToSend = {
        id_paciente: formData.id_paciente,
        id_doctor: formData.id_doctor,
        fecha: formData.fecha.toISOString().split('T')[0], // Formato YYYY-MM-DD
        hora: horaFormateada, // Formato HH:MM en 24 horas
        estado: formData.estado,
        observaciones: formData.observaciones ? formData.observaciones.trim() : '',
      };
      
      // Agregar id_procedimiento solo si está seleccionado
      if (formData.id_procedimiento) {
        dataToSend.id_procedimiento = formData.id_procedimiento;
      }
      
      // Agregar descripción manual solo si está presente
      if (formData.descripcion_manual && formData.descripcion_manual.trim() !== '') {
        dataToSend.descripcion_manual = formData.descripcion_manual.trim();
      }
      
      console.log('Datos a enviar:', JSON.stringify(dataToSend, null, 2));
      
      let response;
      
      if (isEditing) {
        response = await api.put(`/citas/${cita.id}`, dataToSend);
        console.log('Respuesta de actualización:', JSON.stringify(response, null, 2));
      } else {
        response = await api.post('/citas', dataToSend);
        console.log('Respuesta de creación:', JSON.stringify(response, null, 2));
      }
      
      if (response && (response.status === 'success' || response.id)) {
        const message = isEditing ? 'Cita actualizada correctamente' : 'Cita creada correctamente';
        Alert.alert('Éxito', message, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', 'No se pudo guardar la cita');
      }
    } catch (error) {
      console.error('Error al guardar cita:', error);
      let errorMessage = 'Hubo un problema al guardar la cita.';
      
      if (error.response?.data?.errors) {
        // Mostrar errores de validación detallados
        const errorsArray = Object.entries(error.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        errorMessage = `Errores de validación:\n${errorsArray}`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#21588E" />
        <Text style={styles.loadingText}>Cargando formulario...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
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
          <Text style={styles.headerTitle}>
            {isEditing ? 'Editar Cita' : 'Nueva Cita'}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.formContainer}>
        {/* Selección de Paciente */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Paciente*</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.id_paciente}
              style={styles.picker}
              onValueChange={(value) => handleChange('id_paciente', value)}
            >
              <Picker.Item label="Seleccionar paciente" value="" />
              {pacientes.map(paciente => (
                <Picker.Item 
                  key={paciente.id} 
                  label={`${paciente.nombre} ${paciente.apellidos || ''}`} 
                  value={paciente.id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Selección de Doctor */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Doctor*</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.id_doctor}
              style={styles.picker}
              onValueChange={(value) => handleChange('id_doctor', value)}
            >
              <Picker.Item label="Seleccionar doctor" value="" />
              {doctores.map(doctor => (
                <Picker.Item 
                  key={doctor.id} 
                  label={doctor.nombre} 
                  value={doctor.id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Selección de Procedimiento */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Procedimiento</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.id_procedimiento}
              style={styles.picker}
              onValueChange={(value) => handleChange('id_procedimiento', value)}
            >
              <Picker.Item label="Seleccionar procedimiento" value="" />
              {procedimientos.map(procedimiento => (
                <Picker.Item 
                  key={procedimiento.id} 
                  label={procedimiento.nombre} 
                  value={procedimiento.id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Descripción Manual (si no selecciona procedimiento) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Descripción del procedimiento</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese una descripción si no seleccionó un procedimiento"
            value={formData.descripcion_manual}
            onChangeText={(value) => handleChange('descripcion_manual', value)}
          />
        </View>

        {/* Observaciones */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Observaciones</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ingrese observaciones adicionales"
            value={formData.observaciones}
            onChangeText={(value) => handleChange('observaciones', value)}
            multiline={true}
            numberOfLines={4}
          />
        </View>

        {/* Estado de la cita */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Estado de la cita</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.estado}
              style={styles.picker}
              onValueChange={(value) => handleChange('estado', value)}
            >
              <Picker.Item label="Pendiente" value="pendiente" />
              <Picker.Item label="Completada" value="completada" />
              <Picker.Item label="Cancelada" value="cancelada" />
            </Picker>
          </View>
        </View>

        {/* Fecha */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Fecha*</Text>
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateTimeText}>
              {formData.fecha ? formatDate(formData.fecha) : 'Seleccionar fecha'}
            </Text>
            <Ionicons name="calendar" size={24} color="#21588E" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={formData.fecha || new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Hora */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Hora*</Text>
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.dateTimeText}>
              {formData.hora ? formatTime(formData.hora) : 'Seleccionar hora'}
            </Text>
            <Ionicons name="time" size={24} color="#21588E" />
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={formData.hora || new Date()}
              mode="time"
              display="default"
              onChange={onTimeChange}
              is24Hour={true}
            />
          )}
        </View>

        {/* Botón de Guardar */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Actualizar Cita' : 'Guardar Cita'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Botón de Cancelar */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  dateTimeButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#21588E',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 30,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 18,
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
});