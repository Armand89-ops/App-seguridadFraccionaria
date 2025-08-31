import React, { useEffect, useState } from 'react';                          
import { StyleSheet, Text, View, SafeAreaView, StatusBar, Platform } from 'react-native';         
import { NavigationContainer } from '@react-navigation/native';   
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 
import { Provider as PaperProvider, TextInput, Button } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

import inicioUsuarioAdmin from './usuarioAdministrador/InicioAdmin';
import inicioUsuarioResidente from './usuarioResidente/InicioResidente';
import inicioUsuarioVigilante from './usuarioVigilante/InicioVigilante';

// Imports de las pantallas del administrador
import TablaUsuarios from './usuarioAdministrador/TablaUsuarios';
import EnvioAnuncios from './usuarioAdministrador/EnvioAnuncios';
import ReglamentoUnidad from './usuarioAdministrador/ReglamentoUnidad';
import MonitoreoChats from './usuarioAdministrador/MonitoreoChats';
import ModuloPagos from './usuarioAdministrador/ModuloPagos';

//Importaciones de las pantallas del residente
import Chats from './usuarioResidente/Chats';
import HistorialPagos from './usuarioResidente/HistorialPagos';
import ModuloAnuncios from './usuarioResidente/ModuloAnuncios';
import ReglamentoUnidadResidente from './usuarioResidente/ReglamentoUnidad';

//Importaciones de las pantallas del vigilante
import AlertasVigilante from './usuarioVigilante/Alertas';
import ChatsVigilante from './usuarioVigilante/Chats';
import ConsultarPagosVigilante from './usuarioVigilante/ConsultarPagos';
import ReglamentoUnidadVigilante from './usuarioVigilante/ReglamentoUnidad';

//Improtacion para recuperar contraseña
import RecuperarContrasena from './RecuperarContraseña';

const Stack = createNativeStackNavigator();

function PantallaLogeo ({ navigation }) {

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [mostrarContraseña, setMostrarContraseña] = useState(false);

const funcionLogin = async() => {
  try {
      const response = await fetch('http://192.168.0.103:3000/login', {
        method: 'POST',                                     
        headers: { 'Content-Type': 'application/json' },   
        body: JSON.stringify({ 
          email,                                          
          password
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Navegación condicional según el tipo de usuario
        switch (data.tipoUsuario) {
          case 'Administrador':
            navigation.navigate('Administrador', { idAdmin: data.id });
            break;
          case 'Residente':
            navigation.navigate('Residente', { idResidente: data.id });
            break;
          case 'Vigilante':
            navigation.navigate('Vigilante', { idVigilante: data.id });
            break;
          default:
            alert('Tipo de usuario no válido');
        }
      } else {
        alert('Usuario o contraseña incorrectos');
      }
    } catch (error) {
      alert('Error de conexión');
    }
};

return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <Text style={styles.title}>Iniciar sesión</Text>
        
        <TextInput
          mode="outlined"                                  
          label="email"                                
          value={email}                                     
          onChangeText={setEmail}                      
          style={styles.input}                               
        />
        
        <TextInput
          mode="outlined"                                 
          label="Contraseña"                           
          value={password}                          
          onChangeText={setPassword}                     
          secureTextEntry={!mostrarContraseña}          
          style={styles.input}                       
          right={
            <TextInput.Icon 
              icon={mostrarContraseña ? "eye-off" : "eye"}  
              onPress={() => setMostrarContraseña(!mostrarContraseña)}
            />
          }
        />
        
        <Button mode="text" onPress={() => navigation.navigate('RecuperarContrasena')}>
          Recuperar contraseña
        </Button>
        
        <View style={{ height: 16 }} />
        
        <Button mode="contained" onPress={funcionLogin}>
          Iniciar sesión
        </Button>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  useEffect(() => {
    async function registerForPushNotificationsAsync() {
      let token;
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          alert('¡No se pudo obtener el token para notificaciones push!');
          return;
        }
        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Expo Push Token:', token);
        // Guarda este token en tu backend si quieres enviar notificaciones desde el servidor
      } else {
        alert('Debes usar un dispositivo físico para las notificaciones push');
      }
    }
    registerForPushNotificationsAsync();

    // Listener para recibir notificaciones en primer plano
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida:', notification);
    });

    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          
          {/* Pantalla inicial - Login */}
          <Stack.Screen 
            name="Inicio de sesion"           // Nombre interno de la pantalla
            component={PantallaLogeo}         // Componente a renderizar
          />
          
          {/* Pantalla de Administrador */}
          <Stack.Screen 
            name="Administrador" 
            component={inicioUsuarioAdmin}
          />
          
          {/* Pantallas del Administrador */}
          <Stack.Screen 
            name="TablaUsuarios" 
            component={TablaUsuarios}
          />

          <Stack.Screen 
            name="EnvioAnuncios" 
            component={EnvioAnuncios}
          />
          
          <Stack.Screen 
            name="ReglamentoUnidad" 
            component={ReglamentoUnidad}
          />
          
          <Stack.Screen 
            name="CreacionChats" 
            component={MonitoreoChats}
          />
          
          <Stack.Screen 
            name="ModulosPagos" 
            component={ModuloPagos}
          />
          
          
          <Stack.Screen 
            name="Residente" 
            component={inicioUsuarioResidente}
          />

          {/* Pantallas del Residente */}
          <Stack.Screen 
            name="Chats" 
            component={Chats}
          />

          <Stack.Screen 
            name="HistorialPagos" 
            component={HistorialPagos}
          />

          <Stack.Screen 
            name="ModuloAnuncios" 
            component={ModuloAnuncios}
          />

          <Stack.Screen 
            name="ReglamentoUnidadResidente" 
            component={ReglamentoUnidadResidente}
          />
          
          {/* Pantalla de Vigilante */}
          <Stack.Screen 
            name="Vigilante" 
            component={inicioUsuarioVigilante}
          />
          
          <Stack.Screen 
            name="AlertasVigilante" 
            component={AlertasVigilante}
          />

          <Stack.Screen 
            name="ChatsVigilante" 
            component={ChatsVigilante}
          />
          
          <Stack.Screen 
            name="ConsultarPagosVigilante" 
            component={ConsultarPagosVigilante}
          />

          {/* Pantalla de recuperación de contraseña */}
          <Stack.Screen 
            name="RecuperarContrasena" 
            component={RecuperarContrasena}
          />

          <Stack.Screen 
            name="ReglamentoUnidadVigilante" 
            component={ReglamentoUnidadVigilante}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  
  container: {
    flex: 1,                                             
    justifyContent: 'center',                              
    alignItems: 'center',                                 
    padding: 20,                                        
    backgroundColor: '#ffffff',                      
  },
  
  title: {
    fontSize: 24,                                          
    marginBottom: 20,                                     
    fontWeight: 'bold',                                    
  },
  
  input: {
    width: '100%',                                        
    marginBottom: 16,                                     
  },
});