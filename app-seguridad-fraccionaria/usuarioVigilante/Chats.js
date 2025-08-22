import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Button, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MenuVigilante from './MenuVigilante';

const Chats = ({ navigation, route }) => {
  const { idVigilante } = route.params;
  const [chats, setChats] = useState([]);
  const [chatSeleccionado, setChatSeleccionado] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [usuarios, setUsuarios] = useState([]);

  // Cargar chats donde participa el vigilante
  useEffect(() => {
    if (!idVigilante) return;
    fetch(`http://192.168.0.103:3000/verChatsVigilante/${idVigilante}`)
      .then(res => res.json())
      .then(data => setChats(data));
    // Cargar usuarios para mostrar nombres
    fetch('http://192.168.0.103:3000/nombresUsuario')
      .then(res => res.json())
      .then(data => setUsuarios(data));
  }, [idVigilante]);

  // Cargar mensajes del chat seleccionado
  useEffect(() => {
    if (!chatSeleccionado) return;
    fetch(`http://192.168.0.103:3000/verMensajes/${chatSeleccionado._id}`)
      .then(res => res.json())
      .then(data => setMensajes(data));
  }, [chatSeleccionado]);

  // Obtener nombres de usuarios por ID
  const obtenerNombresUsuarios = (ids) => {
    if (!Array.isArray(ids)) return '';
    return ids
      .map(id => {
        const usuario = usuarios.find(u => u._id === id || u._id === String(id));
        return usuario ? usuario.nombre : id;
      })
      .join(', ');
  };

  // Enviar mensaje
  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !chatSeleccionado) return;
    await fetch('http://192.168.0.103:3000/agregarMensaje', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idChat: chatSeleccionado._id,
        idUsuario: idVigilante,
        contenido: nuevoMensaje
      })
    });
    setNuevoMensaje('');
    // Recarga mensajes
    fetch(`http://192.168.0.103:3000/verMensajes/${chatSeleccionado._id}`)
      .then(res => res.json())
      .then(data => setMensajes(data));
  };

  if (chatSeleccionado) {
    // Pantalla de chat
    return (
      <SafeAreaView style={styles.container}>
        <MenuVigilante navigation={navigation} idVigilante={idVigilante} titulo="Chat" />
        <View style={styles.content}>
          <Text style={styles.screenTitle}>
            {chatSeleccionado.tipo === 'general'
              ? 'Chat General'
              : chatSeleccionado.tipo === 'edificio'
              ? `Chat Edificio: ${chatSeleccionado.nombreEdificio}`
              : `Chat Privado (${obtenerNombresUsuarios(chatSeleccionado.usuarios.filter(u => u !== idVigilante))})`}
          </Text>
          <FlatList
            data={mensajes}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <View style={[
                styles.mensaje,
                item.idUsuario === idVigilante ? styles.mensajePropio : styles.mensajeOtro
              ]}>
                <Text style={styles.mensajeAutor}>
                  {item.nombreUsuario || obtenerNombresUsuarios([item.idUsuario])}
                </Text>
                <Text>{item.contenido}</Text>
                <Text style={styles.mensajeFecha}>
                  {new Date(item.fechaEnvio).toLocaleString()}
                </Text>
              </View>
            )}
            style={{ flex: 1, width: '100%' }}
          />
          <KeyboardAvoidingView behavior="padding" style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={nuevoMensaje}
              onChangeText={setNuevoMensaje}
              placeholder="Escribe un mensaje..."
            />
            <Button title="Enviar" onPress={enviarMensaje} />
          </KeyboardAvoidingView>
          <Button title="Volver a chats" onPress={() => setChatSeleccionado(null)} />
        </View>
      </SafeAreaView>
    );
  }

  // Pantalla de lista de chats
  return (
    <SafeAreaView style={styles.container}>
      <MenuVigilante navigation={navigation} idVigilante={idVigilante} titulo="Chats" />
      <View style={styles.content}>
        <FlatList
          data={chats}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() => setChatSeleccionado(item)}
            >
              <Text style={styles.chatTitle}>
                {item.tipo === 'general'
                  ? 'Chat General'
                  : item.tipo === 'edificio'
                  ? `Chat Edificio: ${item.nombreEdificio}`
                  : `Chat Privado (${obtenerNombresUsuarios(item.usuarios.filter(u => u !== idVigilante))})`}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flex: 1, padding: 20 },
  screenTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
  chatItem: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 10, elevation: 2 },
  chatTitle: { fontWeight: 'bold', fontSize: 16 },
  mensaje: { marginBottom: 10, borderRadius: 6, padding: 8 },
  mensajePropio: { backgroundColor: '#d0f5d8', alignSelf: 'flex-end' },
  mensajeOtro: { backgroundColor: '#f0f0f0', alignSelf: 'flex-start' },
  mensajeAutor: { fontWeight: 'bold', marginBottom: 2 },
  mensajeFecha: { fontSize: 10, color: '#888', marginTop: 2 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginRight: 8 },
});

export default Chats;