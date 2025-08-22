import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const RecuperarContrasena = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  const solicitarRecuperacion = async () => {
    if (!email) {
      Alert.alert('Error', 'Ingresa tu correo');
      return;
    }
    try {
      const res = await fetch('http://192.168.0.105:3000/recuperarContrasena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setEnviado(true);
      } else {
        Alert.alert('Error', 'No se pudo enviar el correo de recuperación');
      }
    } catch {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Recuperar contraseña</Text>
      <TextInput
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button mode="contained" onPress={solicitarRecuperacion}>
        Enviar correo de recuperación
      </Button>
      {enviado && (
        <Text style={{ color: 'green', marginTop: 16 }}>
          Si el correo existe, recibirás instrucciones para restablecer tu contraseña.
        </Text>
      )}
      <Button mode="text" onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
        Volver
      </Button>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', marginBottom: 16 },
});

export default RecuperarContrasena;