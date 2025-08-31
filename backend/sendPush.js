const axios = require('axios');

async function enviarNotificacionExpo(expoPushToken, titulo, mensaje) {
  try {
    const response = await axios.post('https://exp.host/--/api/v2/push/send', {
      to: expoPushToken,
      title: titulo,
      body: mensaje,
      sound: 'default',
    });
    console.log('Respuesta de Expo:', response.data);
  } catch (error) {
    console.error('Error enviando notificación:', error.response?.data || error.message);
  }
}

// Ejemplo de uso:
enviarNotificacionExpo(
  'ExponentPushToken[X4xYmXO-QbN2n0qnt0J21Z]', // token real
  '¡Hola!',
  'Esta es una notificación de prueba'
);