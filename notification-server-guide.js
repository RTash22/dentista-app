/**
 * GUÍA PARA IMPLEMENTAR NOTIFICACIONES PUSH CON EXPO EN EL BACKEND
 * 
 * Este archivo contiene ejemplos de cómo implementar los endpoints necesarios
 * para manejar tokens de notificación y enviar notificaciones push a través de Expo.
 */

/**
 * Endpoint 1: Registrar el token de notificación de un doctor
 * 
 * Ruta: POST /api/registrar-token-notificacion
 * Descripción: Guarda el token de notificación push de Expo asociado a un doctor en la base de datos
 * 
 * Ejemplo de implementación en Express (Node.js):
 */

// En el controlador de doctores o notificaciones:
const registrarTokenNotificacion = async (req, res) => {
  try {
    const { doctorId, token } = req.body;
    
    if (!doctorId || !token) {
      return res.status(400).json({
        status: 'error',
        message: 'Se requieren doctorId y token'
      });
    }
    
    // Actualizar el doctor en la base de datos con el token de notificación
    // Ejemplo con MySQL/MariaDB:
    const query = 'UPDATE doctores SET notification_token = ? WHERE id = ?';
    await db.query(query, [token, doctorId]);
    
    // O si usas Laravel/Eloquent:
    // Doctor::where('id', $doctorId)->update(['notification_token' => $token]);
    
    return res.json({
      status: 'success',
      message: 'Token de notificaciones registrado correctamente'
    });
  } catch (error) {
    console.error('Error al registrar token:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al registrar token de notificaciones'
    });
  }
};

/**
 * Endpoint 2: Enviar notificación push
 * 
 * Ruta: POST /api/enviar-notificacion
 * Descripción: Envía una notificación push a un dispositivo usando el servicio de Expo
 * 
 * Ejemplo de implementación en Express (Node.js):
 */

// Primero instalar el SDK de Expo para el servidor:
// npm install expo-server-sdk

// En el controlador de notificaciones:
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

const enviarNotificacion = async (req, res) => {
  try {
    const { token, title, body, data = {} } = req.body;
    
    // Validar el token de Expo
    if (!token || !Expo.isExpoPushToken(token)) {
      return res.status(400).json({
        status: 'error',
        message: 'Token de notificación inválido'
      });
    }
    
    // Crear el mensaje
    const message = {
      to: token,
      sound: 'default',
      title: title || 'Nueva notificación',
      body: body || 'Tienes una nueva notificación',
      data: data || {},
    };
    
    // Usar la API de Expo para enviar la notificación
    const chunks = expo.chunkPushNotifications([message]);
    const tickets = [];
    
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error enviando chunk:', error);
      }
    }
    
    return res.json({
      status: 'success',
      message: 'Notificación enviada correctamente',
      tickets: tickets
    });
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al enviar notificación'
    });
  }
};

/**
 * Para usar con Laravel/PHP:
 * 
 * 1. Instala el paquete laravel-expo-notifier:
 *    composer require trinityrank/laravel-expo-notifier
 * 
 * 2. Crea un controlador para manejar las notificaciones:
 */

/*
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use TrinityRank\LaravelExpoNotifier\ExpoNotifier;

class NotificacionesController extends Controller
{
    protected $expo;
    
    public function __construct(ExpoNotifier $expo)
    {
        $this->expo = $expo;
    }
    
    public function registrarToken(Request $request)
    {
        $request->validate([
            'doctorId' => 'required|exists:doctores,id',
            'token' => 'required|string'
        ]);
        
        try {
            // Actualizar el token en la base de datos
            \DB::table('doctores')
                ->where('id', $request->doctorId)
                ->update(['notification_token' => $request->token]);
                
            return response()->json([
                'status' => 'success',
                'message' => 'Token registrado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al registrar token: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function enviarNotificacion(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'title' => 'required|string',
            'body' => 'required|string',
            'data' => 'array'
        ]);
        
        try {
            // Enviar la notificación con Expo
            $response = $this->expo->send(
                [$request->token],
                [
                    'title' => $request->title,
                    'body' => $request->body,
                    'data' => $request->data ?? []
                ]
            );
            
            return response()->json([
                'status' => 'success',
                'message' => 'Notificación enviada correctamente',
                'response' => $response
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al enviar notificación: ' . $e->getMessage()
            ], 500);
        }
    }
}
*/

/**
 * Pasos finales para completar la implementación:
 * 
 * 1. Crear los endpoints en tu API REST:
 *    - POST /api/registrar-token-notificacion
 *    - POST /api/enviar-notificacion
 * 
 * 2. Agregar la columna notification_token a la tabla de doctores:
 *    - Tipo: VARCHAR(255)
 *    - Nullable: true
 * 
 * 3. Configurar la recepción de notificaciones en la app (ya está implementado en App.js)
 * 
 * 4. Probar el flujo completo:
 *    - Doctor inicia sesión -> se registra su token
 *    - Se crea una cita -> se envía notificación al doctor
 *    - Doctor recibe la notificación en su dispositivo
 */