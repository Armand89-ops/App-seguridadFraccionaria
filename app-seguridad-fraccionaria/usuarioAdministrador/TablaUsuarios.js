import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Image, Alert } from 'react-native';
import { Portal,FAB, RadioButton,DataTable, Button, TextInput, Dialog } from 'react-native-paper';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import MenuAdministrador from './MenuAdministrador';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

const TablaUsuarios = ({ navigation, route }) => {
  const { idAdmin } = route.params;
  const [nuevoEdificio, setNuevoEdificio] = useState('');
  const [edificios, setEdificios] = useState([]);
  const [modalAgregarVisible, setModalAgregarVisible] = useState(false);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [detalleUsuario, setDetalleUsuario] = useState(null);
  const [DatosUsuarios, setDatosUsuarios] = useState({
    NombreCompleto: '',
    Edificio: '',
    Departamento: '',
    Telefono: '',
    email: '',
    password: '',
    TipoUsuario: 'Residente',
    Ine: ''
  });
  const [editUserId, setEditUserId] = useState(null);
  const [imagenGrande, setImagenGrande] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [imagenAnterior, setImagenAnterior] = useState(null);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);

  const [dialogVisibleEditar, setDialogVisibleEditar] = useState(false);
  const [usuarioAEditar, setUsuarioAEditar] = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);


  useEffect(() => {
  fetch('http://192.168.0.103:3000/verEdificios')
    .then(res => res.json())
    .then(data => setEdificios(data))
    .catch(() => Alert.alert('Error', 'No se pudieron cargar los edificios'));
}, [modalAgregarVisible, modalEditarVisible]);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch('http://192.168.0.103:3000/verUsuarios');
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    }
  };

  const FuncionAgregarUsuario  = async () => {
    let urlIne = '';
    if (imagenSeleccionada) {
      const data = new FormData();
      data.append('imagen', {
        uri: imagenSeleccionada.uri,
        type: imagenSeleccionada.mimeType || 'image/jpeg',
        name: imagenSeleccionada.fileName || 'ine.jpg',
      });
      const response = await fetch('http://192.168.0.103:3000/subirIne', {
        method: 'POST',
        body: data,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const info = await response.json();
      urlIne = info.url;
    }

    const edificioFinal = DatosUsuarios.Edificio === 'agregar_nuevo' ? nuevoEdificio : DatosUsuarios.Edificio;

    const usuario = {
      ...DatosUsuarios,
      Edificio: edificioFinal,
      Ine: urlIne,
    };

    try {
      console.log('Datos enviados a backend:', usuario);
      const res = await fetch('http://192.168.0.103:3000/agregarUsuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
      });
      const data = await res.json();
      console.log('Respuesta backend añadirUsuarios:', data);
      if (res.ok) {
        fetchUsuarios();
        setModalAgregarVisible(false);
        setDatosUsuarios({
          NombreCompleto: '',
          Edificio: '',
          Departamento: '',
          Telefono: '',
          email: '',
          password: '',
          TipoUsuario: 'Residente',
          Ine: ''
        });
        setNuevoEdificio('');
      } else {
        Alert.alert('Error', 'No se pudo agregar el usuario');
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo agregar el usuario');
    }
  }

  const FuncionEditarUsuario = async () => {
    let edificioFinal = DatosUsuarios.Edificio === 'agregar_nuevo' ? nuevoEdificio : DatosUsuarios.Edificio;
  if (!edificioFinal) {
    Alert.alert('Error', 'Debes ingresar el nombre del edificio');
    return;
  }
    let urlIne = DatosUsuarios.Ine;
  // Si hay una nueva imagen seleccionada, súbela
  if (imagenSeleccionada) {
    const data = new FormData();
    data.append('imagen', {
      uri: imagenSeleccionada.uri,
      type: imagenSeleccionada.mimeType || 'image/jpeg',
      name: imagenSeleccionada.fileName || 'ine.jpg',
    });
    const response = await fetch('http://192.168.0.103:3000/subirIne', {
      method: 'POST',
      body: data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const info = await response.json();
    urlIne = info.url;

    // Elimina la imagen anterior si existe
    if (imagenAnterior) {
      await fetch('http://192.168.0.103:3000/eliminarImagenIne', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: imagenAnterior }),
      });
    }
  }

    try {
      const body = { ...DatosUsuarios, Ine: urlIne, Edificio: edificioFinal, id: editUserId };
      const res = await fetch('http://192.168.0.103:3000/editarUsuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchUsuarios();
        setModalEditarVisible(false);
        setEditUserId(null);
        setDatosUsuarios({
          NombreCompleto: '',
          Edificio: '',
          Departamento: '',
          Telefono: '',
          email: '',
          password: '',
          TipoUsuario: 'Residente',
          Ine: ''
        });
        setNuevoEdificio('');
      } else {
        Alert.alert('Error', 'No se pudo editar el usuario');
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo editar el usuario');
    }
  }

  const FuncionEliminarUsuario = async (id) => {
    try {
      const res = await fetch('http://192.168.0.103:3000/eliminarUsuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        console.log('ID a eliminar:', id);
        fetchUsuarios();
      } else {
        Alert.alert('Error', 'No se pudo eliminar el usuario');
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo eliminar el usuario');
    }
  };

  const AccionLadoDerecho = (user) => (
    <TouchableOpacity
      style={[styles.action, styles.edit]}
      onPress={() => {
        setUsuarioAEditar(user);
        setDialogVisibleEditar(true);
      }}
    >
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <MaterialIcons name="edit" size={24} color="#fff" />
        <Text style={styles.text}>Editar</Text>
      </View>
    </TouchableOpacity>
  );

  const AccionLadoIzquierdo = (user) => (
    <TouchableOpacity
    style={[styles.action, styles.delete]}
    onPress={() => {
      setUsuarioAEliminar(user._id || user.id);
      setDialogVisible(true);
    }}
  >
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <MaterialIcons name="delete" size={24} color="#fff" />
      <Text style={styles.text}>Eliminar</Text>
    </View>
  </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <Swipeable
      renderLeftActions={() => AccionLadoIzquierdo(item)}
      renderRightActions={() => AccionLadoDerecho(item)}
    >
      <TouchableOpacity style={styles.item} onPress={() => setDetalleUsuario(item)}>
        
        <View style={styles.row}>
          <View style={styles.iconRight}>
            <Image
              source={item.Ine ? { uri: item.Ine } : require('../assets/Ine-placeholder.png')}
              style={{ width: 120, height: 70, borderRadius: 8 }}
            />
          </View>
            <View style={{ flex: 0.9 }}>
              <Text style={styles.dataCellValue}>
                <Text style={styles.nombre}>Nombre:</Text> {item.NombreCompleto}{"   "}
                <Text style={styles.nombre}>Edificio:</Text> {item.Edificio}{"   "}
                <Text style={styles.nombre}>Departamento:</Text> {item.Departamento}
                </Text>
            </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  const seleccionarImagen = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a tus fotos.');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImagenSeleccionada(result.assets[0]);
        setDatosUsuarios(prev => ({
          ...prev,
          Ine: result.assets[0].uri
        }));
      } else {
        Alert.alert('No seleccionaste ninguna imagen');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.containerSafeArea}>
        <MenuAdministrador navigation={navigation} idAdmin={idAdmin} titulo="Tabla de Usuarios" />
        <View style={styles.content}>
        <FAB
          icon="account-plus"
          color='#000000ff'
          style={styles.fab}
          onPress={() =>  { 
            setModalAgregarVisible(true); 
            setDatosUsuarios({
            NombreCompleto: '',
            Edificio: '',
            Departamento: '',
            Telefono: '',
            email: '',
            password: '',
            TipoUsuario: 'Residente',
            Ine: ''
          });
          setImagenSeleccionada(null);
        }}
        />

        <FlatList
          data={usuarios}
          keyExtractor={item => item.id?.toString() || item._id?.toString()}
          renderItem={renderItem}
      />

      {/* Modal para ver detalles del usuario */}
      <Portal>
        <Modal
        visible={!!detalleUsuario}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Detalles del usuario</Text>
          {detalleUsuario?.Ine ? (
            <TouchableOpacity onPress={() => setImagenGrande(detalleUsuario.Ine)}>
              <Image source={{ uri: detalleUsuario.Ine }} style={{ width: 250, height: 152 }} />
            </TouchableOpacity>
          ) : null}
          <DataTable style={styles.dataTable}>

            <DataTable.Row style={styles.dataRow}>
              <DataTable.Cell>
                <Text style={styles.dataCellTitle}>Nombre: </Text>
                <Text style={styles.dataCellValue}>{detalleUsuario?.NombreCompleto}</Text>
              </DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row style={styles.dataRow}>
              <DataTable.Cell>
                <Text style={styles.dataCellTitle}>Edificio:  </Text>
                 <Text style={styles.dataCellValue}>{detalleUsuario?.Edificio}</Text>
              </DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row style={styles.dataRow}>
              <DataTable.Cell>
                <Text style={styles.dataCellTitle}>Departamento:  </Text>
                <Text style={styles.dataCellValue}>{detalleUsuario?.Departamento}</Text>
              </DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row style={styles.dataRow}>
              <DataTable.Cell>
                <Text style={styles.dataCellTitle}>Teléfono:  </Text>
                <Text style={styles.dataCellValue}>{detalleUsuario?.Telefono}</Text>
              </DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row style={styles.dataRow}>
              <DataTable.Cell>
                <Text style={styles.dataCellTitle}>Correo:  </Text>
                <Text style={styles.dataCellValue} numberOfLines={1}>{detalleUsuario?.email}</Text>
              </DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row style={styles.dataRow}>
              <DataTable.Cell>
                <Text style={styles.dataCellTitle}>Tipo:  </Text>
                <Text style={styles.dataCellValue}>{detalleUsuario?.TipoUsuario}</Text>
              </DataTable.Cell>
            </DataTable.Row>

          </DataTable>
          <Button style={{ backgroundColor: '#2732f1ff' }} icon="keyboard-backspace" mode="contained" onPress={() => setDetalleUsuario(null)}>
            Regresar
          </Button>
        </View>
        </Modal>
      </Portal>

      {/* Modal para mostrar la imagen en grande */}
      <Modal
        visible={!!imagenGrande}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImagenGrande(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }}>
          <Image source={{ uri: imagenGrande }} style={{ width: 300, height: 400, resizeMode: 'contain' }} />
          <Button title="Cerrar" onPress={() => setImagenGrande(null)} color="#007bffff" />
        </View>
      </Modal>

      {/* Modal para agregar */}
      <Portal>
        <Modal
          visible={modalAgregarVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Agregar usuario</Text>
            <TextInput mode="outlined" label="Nombre completo" style={styles.input} value={DatosUsuarios.NombreCompleto} onChangeText={v => setDatosUsuarios({ ...DatosUsuarios, NombreCompleto: v })} />

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '80%' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 15 }}>Edificio:  </Text>
                <Picker
                  selectedValue={DatosUsuarios.Edificio}
                  onValueChange={v => setDatosUsuarios({ ...DatosUsuarios, Edificio: v })}
                  style={styles.picker}
                >
                  {edificios.map((nombre, idx) => (
                <Picker.Item key={idx} label={nombre} value={nombre} />
                ))}
                <Picker.Item label="Agregar nuevo edificio:" value="agregar_nuevo" />
                </Picker>
            </View>

          {DatosUsuarios.Edificio === 'agregar_nuevo' && (
            <TextInput
             de="outlined"
              label="Nombre del nuevo edificio"
              value={nuevoEdificio}
              onChangeText={setNuevoEdificio}
              style={styles.input}
            />
          )}

            <TextInput mode="outlined" label="Departamento" style={styles.input} value={DatosUsuarios.Departamento} onChangeText={v => setDatosUsuarios({ ...DatosUsuarios, Departamento: v })} />
            <TextInput mode="outlined" label="Teléfono" style={styles.input} value={DatosUsuarios.Telefono} onChangeText={v => setDatosUsuarios({ ...DatosUsuarios, Telefono: v })} />
            <TextInput mode="outlined" label="Correo electrónico" style={styles.input} value={DatosUsuarios.email} onChangeText={v => setDatosUsuarios({ ...DatosUsuarios, email: v })} />
            <TextInput  mode="outlined" label="Contraseña" value={DatosUsuarios.password} onChangeText={v => setDatosUsuarios({ ...DatosUsuarios, password: v })} style={styles.input} />
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '80%' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 17, minWidth: 110 }}>Tipo usuario:</Text>
                <RadioButton.Group
                onValueChange={value => setDatosUsuarios({ ...DatosUsuarios, TipoUsuario: value })}
                value={DatosUsuarios.TipoUsuario}
                >
              <View style={{ alignItems: 'center' }}>
                <RadioButton.Item color='#007bffff' label="Residente" value="Residente"  />
                <RadioButton.Item color='#007bffff' label="Vigilante" value="Vigilante"  />
              </View>
              </RadioButton.Group>
            </View>

            <Button style={{ backgroundColor: '#00eaffff' }} icon="image-size-select-actual" mode="elevated" onPress={seleccionarImagen} labelStyle={{ color: '#000000ff' }}>
                Seleccionar imagen INE
              </Button>

              {DatosUsuarios.Ine ? (
                <View style={{ alignItems: 'center', marginVertical: 10 }}>
                  <Image
                    source={{ uri: DatosUsuarios.Ine }}
                    style={{ width: 150, height: 100, borderRadius: 8, marginBottom: 5 }}
                  />
                  
                </View>
              ) : null}

            <View style={styles.modalBtns}>
              <Button
                style={[styles.cancelar, { flex: 1, marginRight: 8 }]}
                icon="cancel"
                mode="elevated"
                onPress={() => setModalAgregarVisible(false)}
                labelStyle={{ color: '#fff' }}
              >
                Cancelar
              </Button>
              <Button
                style={[styles.agregar, { flex: 1, marginLeft: 8 }]}
                icon="account-plus"
                mode="elevated"
                onPress={FuncionAgregarUsuario}
                labelStyle={{ color: '#fff' }}
              >
              Agregar
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* Modal para editar */}
      <Portal>
        <Modal
          visible={modalEditarVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Editar usuario</Text>
            <TextInput mode="outlined" label="Nombre completo" value={DatosUsuarios.NombreCompleto} onChangeText={v => setDatosUsuarios({ ...DatosUsuarios, NombreCompleto: v })} style={styles.input} />
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '80%' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 15 }}>Edificio:  </Text>
                <Picker
                  selectedValue={DatosUsuarios.Edificio}
                  onValueChange={v => setDatosUsuarios({ ...DatosUsuarios, Edificio: v })}
                  style={styles.picker}
                >
                  {edificios.map((nombre, idx) => (
                <Picker.Item key={idx} label={nombre} value={nombre} />
                ))}
                <Picker.Item label="Agregar nuevo edificio:" value="agregar_nuevo" />
                </Picker>
            </View>

          {DatosUsuarios.Edificio === 'agregar_nuevo' && (
            <TextInput
              mode="outlined"
              placeholder="Nombre del nuevo edificio"
              value={nuevoEdificio}
              onChangeText={setNuevoEdificio}
              style={styles.input}
            />
          )}

            <TextInput mode="outlined" label="Departamento" value={DatosUsuarios.Departamento} onChangeText={v => setDatosUsuarios({ ...DatosUsuarios, Departamento: v })} style={styles.input} />
            <TextInput mode="outlined" label="Teléfono" value={DatosUsuarios.Telefono} onChangeText={v => setDatosUsuarios({ ...DatosUsuarios, Telefono: v })} style={styles.input} />
            <TextInput mode="outlined" label="Correo electrónico" value={DatosUsuarios.email} onChangeText={v => setDatosUsuarios({ ...DatosUsuarios, email: v })} style={styles.input} />
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '80%' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 17, minWidth: 110 }}>Tipo usuario:</Text>
                <RadioButton.Group
                onValueChange={value => setDatosUsuarios({ ...DatosUsuarios, TipoUsuario: value })}
                value={DatosUsuarios.TipoUsuario}
                >
              <View style={{ flexDirection: 'row',alignItems: 'center' }}>
                <RadioButton.Item color='#007bffff' label="Residente" value="Residente"  />
                <RadioButton.Item color='#007bffff' label="Vigilante" value="Vigilante"  />
              </View>
              </RadioButton.Group>
            </View>


            <Button style={{ backgroundColor: '#00eaffff' }} icon="image-size-select-actual" mode="elevated" onPress={seleccionarImagen} labelStyle={{ color: '#000000ff' }}>
                Seleccionar imagen INE
              </Button>

              {DatosUsuarios.Ine ? (
                <View style={{ alignItems: 'center', marginVertical: 10 }}>
                  <Image
                    source={{ uri: DatosUsuarios.Ine }}
                    style={{ width: 150, height: 100, borderRadius: 8, marginBottom: 5 }}
                  />
                  
                </View>
              ) : null}
            
            <View style={styles.modalBtns}>
              <Button
                style={[styles.cancelar, { flex: 1, marginRight: 8 }]}
                icon="cancel"
                mode="elevated"
                onPress={() => setModalEditarVisible(false)}
                labelStyle={{ color: '#fff' }}
              >
                Cancelar
              </Button>
              <Button
                style={[styles.agregar, { flex: 1, marginLeft: 8 }]}
                icon="account-edit"
                mode="elevated"
                onPress={FuncionEditarUsuario}
                labelStyle={{ color: '#fff' }}
              >
              Editar
              </Button>
            </View>
            </View>
      </Modal>
    </Portal>

{/* Dialog de confirmación para eliminar un usuario */}
    <Portal>
  <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
    <Dialog.Title>Confirmar eliminación</Dialog.Title>
    <Dialog.Content>
      <Text>¿Estás seguro de que deseas eliminar este usuario?</Text>
    </Dialog.Content>
    <Dialog.Actions>
      <Button onPress={() => setDialogVisible(false)} labelStyle={{ color: '#1976d2' }} icon='close'>Cancelar</Button>
      <Button
        onPress={() => {
          setDialogVisible(false);
          FuncionEliminarUsuario(usuarioAEliminar);
        }}
        labelStyle={{ color: '#d32f2f' }}
        icon="delete"
      >
        Eliminar
      </Button>
    </Dialog.Actions>
  </Dialog>
</Portal>

{/* Dialog de confirmación para editar un usuario */}
    <Portal>
  <Dialog visible={dialogVisibleEditar} onDismiss={() => setDialogVisibleEditar(false)}>
    <Dialog.Title>Confirmar edición</Dialog.Title>
    <Dialog.Content>
      <Text>¿Estás seguro de que deseas editar este usuario?</Text>
    </Dialog.Content>
    <Dialog.Actions>
      <Button onPress={() => setDialogVisibleEditar(false)}>Cancelar</Button>
      <Button
        onPress={() => {
          setDialogVisibleEditar(false);
          // Carga los datos del usuario a editar y abre el modal
          setEditUserId(usuarioAEditar._id || usuarioAEditar.id);
          setDatosUsuarios({
            NombreCompleto: usuarioAEditar.NombreCompleto || '',
            Edificio: usuarioAEditar.Edificio || '',
            Departamento: usuarioAEditar.Departamento || '',
            Telefono: usuarioAEditar.Telefono || '',
            email: usuarioAEditar.email || '',
            password: usuarioAEditar.password || '',
            TipoUsuario: usuarioAEditar.TipoUsuario || '',
            Ine: usuarioAEditar.Ine || ''
          });
          setImagenAnterior(usuarioAEditar.Ine || null);
          setModalEditarVisible(true);
          setImagenSeleccionada(null);
        }}
      >
        Editar
      </Button>
    </Dialog.Actions>
  </Dialog>
</Portal>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10 },
  headerText: { fontWeight: 'bold', width: '33%' },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  iconRight: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
    height: 80,
    marginRight: 16,
    backgroundColor: '#ffffffff',
    borderRadius: 8,
  },
  nombre: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginBottom: 2,
  },
  editBtn: { backgroundColor: 'blue', justifyContent: 'center', alignItems: 'center', width: 100 },
  deleteBtn: { backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', width: 100 },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 10, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, alignSelf: 'center' },
  input: { width: 290, height: 36, borderRadius: 10, marginBottom: 5 },
  containerSafeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: { flex: 1, padding: 20 },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 10,
    margin: 14,
    minWidth: 30,
    justifyContent: 'center',
  },
  delete: { backgroundColor: '#d32f2f' },
  edit: { backgroundColor: '#1976d2' },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 2,
    backgroundColor: '#21f3f3ff',
    elevation: 8, 
    zIndex: 999,
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
  picker: {
    width: 220,
    height: 55,
    borderRadius: 10,
    marginBottom: 5,
  },
  cancelar:{
    backgroundColor: '#f20000ff',
  },
  agregar:{
    backgroundColor: '#28aa0eff',
  },
  modalBtns: {
  flexDirection: 'row',
  justifyContent: 'space-between', 
  width: '100%',                  
  marginTop: 10,
},
});

export default TablaUsuarios;
