import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Alert, TextInput } from 'react-native';
import { Portal, FAB, Dialog, Button, DataTable } from 'react-native-paper';
import MenuAdministrador from './MenuAdministrador';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { MaterialIcons } from '@expo/vector-icons';

const MonitoreoChats = ({ navigation, route }) => {
  const { idAdmin } = route.params;
  const [chats, setChats] = useState([]);
  const [modalVerVisible, setModalVerVisible] = useState(false);
  const [modalMensajesVisible, setModalMensajesVisible] = useState(false);
  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  const [modalAgregarVisible, setModalAgregarVisible] = useState(false);
  const [chatSeleccionado, setChatSeleccionado] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [tipoChat, setTipoChat] = useState('general');
  const [edificios, setEdificios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [nombreEdificio, setNombreEdificio] = useState('');
  const [usuariosPrivado, setUsuariosPrivado] = useState({ usuario1: '', usuario2: '' });
  const [mensajeNuevo, setMensajeNuevo] = useState('');

  // Cargar chats al iniciar
  useEffect(() => {
    fetch('http://192.168.0.103:3000/verChats')
      .then(res => res.json())
      .then(data => setChats(data))
      .catch(() => Alert.alert('Error', 'No se pudieron cargar los chats'));
  }, []);

  // Cargar edificios cuando se abre el modal y el tipo es edificio
  useEffect(() => {
    if (modalAgregarVisible && tipoChat === 'edificio') {
      fetch('http://192.168.0.103:3000/verEdificios')
        .then(res => res.json())
        .then(data => setEdificios(data))
        .catch(() => Alert.alert('Error', 'No se pudieron cargar los edificios'));
    }
  }, [modalAgregarVisible, tipoChat]);

  // Cargar usuarios cuando se abre el modal y el tipo es privado
  useEffect(() => {
    if (modalAgregarVisible && tipoChat === 'privado') {
      fetch('http://192.168.0.103:3000/nombresUsuario')
        .then(res => res.json())
        .then(data => setUsuarios(data))
        .catch(() => Alert.alert('Error', 'No se pudieron cargar los usuarios'));
    }
  }, [modalAgregarVisible, tipoChat]);

  // 1. Carga la lista de usuarios al iniciar 
  useEffect(() => {
    fetch('http://192.168.0.103:3000/nombresUsuario')
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(() => setUsuarios([]));
  }, []);

  // 2. Función para obtener nombres por IDs
  const obtenerNombresUsuarios = (ids) => {
    if (!Array.isArray(ids)) return '';
    return ids
      .map(id => {
        const usuario = usuarios.find(u => u._id === id || u._id === String(id));
        return usuario ? usuario.nombre : id;
      })
      .join(', ');
  };

  // Busca el nombre del usuario por su id
  const obtenerNombrePorId = (id) => {
    const usuario = usuarios.find(u => u._id === id || u._id === String(id));
    return usuario ? usuario.nombre : id;
  };

  // Función para agregar chat
  const agregarChat = async () => {
    let body = { tipo: tipoChat };
    if (tipoChat === 'edificio') {
      if (!nombreEdificio) {
        Alert.alert('Error', 'Selecciona un edificio');
        return;
      }
      body.nombreEdificio = nombreEdificio;
    }
    if (tipoChat === 'privado') {
      if (!usuariosPrivado.usuario1 || !usuariosPrivado.usuario2 || usuariosPrivado.usuario1 === usuariosPrivado.usuario2) {
        Alert.alert('Error', 'Selecciona dos usuarios diferentes');
        return;
      }
      body.usuarios = [usuariosPrivado.usuario1, usuariosPrivado.usuario2];
    }
    try {
      body.idAdmin = idAdmin;
      const res = await fetch('http://192.168.0.103:3000/crearChat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setModalAgregarVisible(false);
        setTipoChat('general');
        setNombreEdificio('');
        setUsuariosPrivado({ usuario1: '', usuario2: '' });
        fetch('http://192.168.0.103:3000/verChats')
          .then(res => res.json())
          .then(data => setChats(data));
        Alert.alert('Éxito', 'Chat creado');
      } else {
        Alert.alert('Error', 'No se pudo crear el chat');
      }
    } catch {
      Alert.alert('Error', 'No se pudo crear el chat');
    }
  };

  // Ver mensajes de un chat
  const verMensajes = async (idChat, chatObj) => {
    try {
      setChatSeleccionado(chatObj); // <-- así siempre tienes el chat seleccionado
      const res = await fetch(`http://192.168.0.103:3000/verMensajes/${idChat}`);
      const data = await res.json();
      setMensajes(data);
      setModalMensajesVisible(true);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los mensajes');
    }
  };

  // Eliminar chat
  const eliminarChat = async (id) => {
    try {
      await fetch('http://192.168.0.103:3000/eliminarChat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setModalEliminarVisible(false);
      setChatSeleccionado(null);
      // Refresca la lista
      fetch('http://192.168.0.103:3000/verChats')
        .then(res => res.json())
        .then(data => setChats(data));
      Alert.alert('Éxito', 'Chat eliminado');
    } catch {
      Alert.alert('Error', 'No se pudo eliminar el chat');
    }
  };

  const enviarMensaje = async () => {
    if (!mensajeNuevo.trim()) return;
    try {
      await fetch('http://192.168.0.103:3000/agregarMensaje', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idChat: chatSeleccionado._id,
          contenido: mensajeNuevo,
          idUsuario: idAdmin,
        }),
      });
      setMensajeNuevo('');
      verMensajes(chatSeleccionado._id); // Refresca mensajes
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el mensaje: ' + error.message);
    }
  };

  const AccionLadoIzquierdo = (item) => (
    <TouchableOpacity
      style={[styles.action, styles.delete]}
      onPress={() => {
        setChatSeleccionado(item);
        setModalEliminarVisible(true);
      }}
    >
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <MaterialIcons name="delete" size={24} color="#fff" />
        <Text style={styles.text}>Eliminar</Text>
      </View>
    </TouchableOpacity>
  );

  const AccionLadoDerecho = (item) => {
    if (item.tipo === 'privado') return null; // No mostrar botón para chats privados
    return (
      <TouchableOpacity
        style={[styles.action, styles.ver]}
        onPress={() => {
          verMensajes(item._id, item);
        }}
      >
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <MaterialIcons name="chat" size={24} color="#fff" />
          <Text style={styles.text}>Ver mensajes</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => (
    <Swipeable
      renderLeftActions={() => AccionLadoIzquierdo(item)}
      renderRightActions={() => AccionLadoDerecho(item)}
    >
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          setChatSeleccionado(item);
          setModalVerVisible(true);
        }}
      >
        <Text style={styles.nombre}>
          {item.tipo === 'general'
            ? 'Chat General'
            : item.tipo === 'edificio'
            ? `Chat Edificio: ${item.nombreEdificio}`
            : `Chat Privado (${obtenerNombresUsuarios(item.usuarios)})`}
        </Text>
        <Text style={styles.tipo}>Tipo: {item.tipo}</Text>
        <Text style={styles.fecha}>Creado: {new Date(item.fechaCreacion).toLocaleString()}</Text>
      </TouchableOpacity>
    </Swipeable>
  );
  return (
    <SafeAreaView style={styles.containerSafeArea}>
      <MenuAdministrador navigation={navigation} idAdmin={idAdmin} titulo="Monitoreo de chats" />
      <View style={styles.content}>
        <FlatList
          data={chats}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          style={{ width: '100%' }}
        />
        {/* FAB para agregar nuevo chat */}
        <FAB
          icon="playlist-plus"
          color='#ffffffff'
          style={styles.fab}
          onPress={() => setModalAgregarVisible(true)}
        />
      </View>

      {/* Modal para agregar chat */}
      <Portal>
        <Modal visible={modalAgregarVisible} transparent={true} animationType="slide">
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Agregar nuevo chat</Text>
            {/* Picker para tipo de chat */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '90%' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 15, marginRight: 8, minWidth: 90 }}>Tipo de chat:</Text>
              <Picker
                selectedValue={tipoChat}
                onValueChange={setTipoChat}
                style={{ flex: 1, backgroundColor: '#f7fafd', borderRadius: 8 }}
                dropdownIconColor="#1976d2"
              >
                <Picker.Item label="General" value="general" />
                <Picker.Item label="Edificio" value="edificio" />
                <Picker.Item label="Privado" value="privado" />
              </Picker>
            </View>

            {/* Picker para edificio */}
            {tipoChat === 'edificio' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '90%' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 15, marginRight: 8, minWidth: 70 }}>Edificio:</Text>
                <Picker
                  selectedValue={nombreEdificio}
                  onValueChange={setNombreEdificio}
                  style={{ flex: 1, backgroundColor: '#f7fafd', borderRadius: 8 }}
                  dropdownIconColor="#1976d2"
                >
                  <Picker.Item label="Selecciona un edificio..." value="" />
                  {edificios.map((ed, idx) => (
                    <Picker.Item key={idx} label={ed} value={ed} />
                  ))}
                </Picker>
              </View>
            )}

            {/* Picker para usuarios privados */}
            {tipoChat === 'privado' && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '90%' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 15, marginRight: 8, minWidth: 70 }}>Usuario 1:</Text>
                  <Picker
                    selectedValue={usuariosPrivado.usuario1}
                    onValueChange={v => setUsuariosPrivado({ ...usuariosPrivado, usuario1: v })}
                    style={{ flex: 1, backgroundColor: '#f7fafd', borderRadius: 8 }}
                    dropdownIconColor="#1976d2"
                  >
                    <Picker.Item label="Selecciona usuario..." value="" />
                    {usuarios.map((usuario, idx) => (
                      <Picker.Item key={usuario._id} label={usuario.nombre} value={usuario._id} />
                    ))}
                  </Picker>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '90%' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 15, marginRight: 8, minWidth: 70 }}>Usuario 2:</Text>
                  <Picker
                    selectedValue={usuariosPrivado.usuario2}
                    onValueChange={v => setUsuariosPrivado({ ...usuariosPrivado, usuario2: v })}
                    style={{ flex: 1, backgroundColor: '#f7fafd', borderRadius: 8 }}
                    dropdownIconColor="#1976d2"
                  >
                    <Picker.Item label="Selecciona usuario..." value="" />
                    {usuarios.map((usuario, idx) => (
                      <Picker.Item key={usuario._id} label={usuario.nombre} value={usuario._id} />
                    ))}
                  </Picker>
                </View>
              </>
            )}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelar} onPress={() => setModalAgregarVisible(false)}>
                <Text style={{ color: '#fff', textAlign: 'center', padding: 10 }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.agregar} onPress={agregarChat}>
                <Text style={{ color: '#fff', textAlign: 'center', padding: 10 }}>Crear chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* Modal para ver detalles del chat */}
      <Portal>
        <Modal visible={modalVerVisible} transparent={true} animationType="slide">
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Detalles del chat</Text>
            <DataTable style={styles.dataTable}>
              <DataTable.Row style={styles.dataRow}>
                <DataTable.Cell>
                  <Text style={styles.dataCellTitle}>Tipo:</Text>
                </DataTable.Cell>
                <DataTable.Cell>
                  <Text style={styles.dataCellValue}>
                    {chatSeleccionado?.tipo === 'general'
                      ? 'General'
                      : chatSeleccionado?.tipo === 'edificio'
                        ? 'Edificio'
                        : chatSeleccionado?.tipo === 'privado'
                          ? 'Privado'
                          : ''}
                  </Text>
                </DataTable.Cell>
              </DataTable.Row>
              {chatSeleccionado?.tipo === 'edificio' && (
                <DataTable.Row>
                  <DataTable.Cell>
                    <Text style={{ fontWeight: 'bold' }}>Edificio:</Text>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <Text>{chatSeleccionado?.nombreEdificio}</Text>
                  </DataTable.Cell>
                </DataTable.Row>
              )}
              <DataTable.Row>
                <DataTable.Cell>
                  <Text style={{ fontWeight: 'bold' }}>Usuarios:</Text>
                </DataTable.Cell>
                <DataTable.Cell style={{ flex: 2 }}>
                  <Text
                    style={styles.dataCellValue}
                    numberOfLines={3}
                    ellipsizeMode="tail"
                  >
                    {obtenerNombresUsuarios(chatSeleccionado?.usuarios) || 'Todos'}
                  </Text>
                </DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row>
                <DataTable.Cell>
                  <Text style={{ fontWeight: 'bold' }}>Fecha creación:</Text>
                </DataTable.Cell>
                <DataTable.Cell>
                  <Text>
                    {chatSeleccionado?.fechaCreacion && new Date(chatSeleccionado.fechaCreacion).toLocaleString()}
                  </Text>
                </DataTable.Cell>
              </DataTable.Row>
            </DataTable>
            <Button
              style={{ backgroundColor: '#2732f1ff', marginTop: 16 }}
              icon="keyboard-backspace"
              mode="contained"
              onPress={() => setModalVerVisible(false)}
              labelStyle={{ color: '#fff' }}
            >
              Regresar
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Modal para ver mensajes */}
      <Portal>
        <Modal visible={modalMensajesVisible} transparent={true} animationType="slide">
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Mensajes del chat</Text>
            {chatSeleccionado?.tipo === 'privado' ? (
              <Text>No tienes permiso para ver los mensajes de este chat privado.</Text>
            ) : (
              <>
                <FlatList
                  data={mensajes}
                  keyExtractor={item => item._id}
                  renderItem={({ item }) => (
                    <View style={styles.mensajeItem}>
                      <Text style={styles.mensajeUsuario}>{obtenerNombrePorId(item.idUsuario)}:</Text>
                      <Text style={styles.mensajeContenido}>{item.contenido}</Text>
                      <Text style={styles.mensajeFecha}>{new Date(item.fechaEnvio).toLocaleString()}</Text>
                    </View>
                  )}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Escribe un mensaje..."
                    value={mensajeNuevo}
                    onChangeText={setMensajeNuevo}
                  />
                  <Button
                    mode="contained"
                    style={{ backgroundColor: '#1976d2', marginLeft: 8 }}
                    icon="send"
                    onPress={enviarMensaje}
                    labelStyle={{ color: '#fff' }}
                  >
                    Enviar
                  </Button>
                </View>
                <Button
                  style={{ backgroundColor: '#2732f1ff', marginTop: 16 }}
                  icon="keyboard-backspace"
                  mode="contained"
                  onPress={() => setModalMensajesVisible(false)}
                  labelStyle={{ color: '#fff' }}
                >
                  Regresar
                </Button>
              </>
            )}
          </View>
        </Modal>
      </Portal>

      {/* Modal para eliminar chat */}
      <Portal>
        <Dialog visible={modalEliminarVisible} onDismiss={() => setModalEliminarVisible(false)}>
          <Dialog.Title>Eliminar chat</Dialog.Title>
          <Dialog.Content>
            <Text>¿Estás seguro de que deseas eliminar este chat?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setModalEliminarVisible(false)}
              labelStyle={{ color: '#1976d2' }}
              icon="close"
            >
              Cancelar
            </Button>
            <Button
              onPress={() => eliminarChat(chatSeleccionado?._id)}
              labelStyle={{ color: '#d32f2f' }}
              icon="delete"
            >
              Eliminar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  containerSafeArea: {flex: 1, backgroundColor: '#f5f5f5'},
  content: { flex: 1, padding: 20 },
  screenTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
  screenDescription: { fontSize: 16, color: '#666', lineHeight: 24, textAlign: 'center', marginBottom: 20 },
  item: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 10, elevation: 2 },
  nombre: { fontWeight: 'bold', fontSize: 16 },
  tipo: { color: '#555', marginTop: 2 },
  fecha: { color: '#888', fontSize: 12, marginTop: 2 },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 10, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  mensajeItem: { marginBottom: 10, backgroundColor: '#f0f0f0', borderRadius: 6, padding: 8 },
  mensajeUsuario: { fontWeight: 'bold' },
  mensajeContenido: { marginLeft: 8 },
  mensajeFecha: { fontSize: 10, color: '#888', marginLeft: 8 },
  fab: { position: 'absolute', bottom: 16, right: 16, backgroundColor: '#00beeeff' },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    textAlignVertical: 'top',
    fontSize: 16,
    backgroundColor: '#f7fafd',
    width: '100%',
    minHeight: 40,
    maxHeight: 100,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    margin: 5,
    minWidth: 80,
    justifyContent: 'center',
  },
  ver: { backgroundColor: '#1976d2' },
  delete: { backgroundColor: '#F44336' },
  text: { color: 'white', marginLeft: 6, fontWeight: 'bold' },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  cancelar: {
    backgroundColor: '#f20000ff',
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
  },
  agregar: {
    backgroundColor: '#28aa0eff',
    flex: 1,
    marginLeft: 8,
    borderRadius: 8,
  },
  dataTable: {
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 20,
    backgroundColor: '#f7fafd',
    elevation: 4,
  },
  dataRow: {
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  dataCellTitle: {
    fontWeight: 'bold',
    color: '#000000ff',
    fontSize: 15,
    textAlign: 'right',
  },
  dataCellValue: {
    color: '#333',
    fontSize: 15,
    textAlign: 'left',
    fontStyle: 'italic',
  },
});
 
export default MonitoreoChats;