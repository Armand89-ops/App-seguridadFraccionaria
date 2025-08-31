import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Image, Alert } from 'react-native';
import { Portal, FAB, RadioButton,DataTable, TextInput,Dialog, Button } from 'react-native-paper';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import MenuAdministrador from './MenuAdministrador';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const TablaAnuncios = ({ navigation, route }) => {
  const { idAdmin } = route.params;
  const [edificios, setEdificios] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [modalAgregarVisible, setModalAgregarVisible] = useState(false);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [detalleAnuncio, setDetalleAnuncio] = useState(null);
  const [DatosAnuncio, setDatosAnuncio] = useState({
    titulo: '',
    contenido: '',
    tipo: '',
    nombreEdificio: '',
    fechaEnvio: '',
    programado: false,
    fechaProgramada: '',
    idAdmin: ''
  });
  const [editAnuncioId, setEditAnuncioId] = useState(null);
  
  const [dialogVisible, setDialogVisible] = useState(false);
  const [anuncioAEliminar, setAnuncioAEliminar] = useState(null);

  useEffect(() => {
    fetch('http://192.168.0.103:3000/verEdificios')
      .then(res => res.json())
      .then(data => setEdificios(data))
      .catch(() => Alert.alert('Error', 'No se pudieron cargar los edificios'));
  }, [modalAgregarVisible, modalEditarVisible]);

  useEffect(() => {
    fetchAnuncios();
  }, []);

  // Sincroniza los datos del anuncio a editar cuando cambia el id o los edificios
  useEffect(() => {
    if (editAnuncioId) {
      const anuncio = anuncios.find(a => (a._id || a.id) === editAnuncioId);
      if (anuncio) {
        setDatosAnuncio({
          titulo: anuncio.titulo || '',
          contenido: anuncio.contenido || '',
          tipo: anuncio.tipo || '',
          nombreEdificio: edificios.includes(anuncio.nombreEdificio) ? anuncio.nombreEdificio : '',
          fechaEnvio: anuncio.fechaEnvio || '',
          programado: anuncio.programado || false,
          fechaProgramada: anuncio.fechaProgramada || '',
          idAdmin: anuncio.idAdmin || idAdmin
        });
      }
    }
  }, [editAnuncioId, edificios]);

  const fetchAnuncios = async () => {
    try {
      const res = await fetch('http://192.168.0.103:3000/verAnuncios');
      const data = await res.json();
      setAnuncios(data);
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar los anuncios');
    }
  };

  // ----------- AGREGAR ANUNCIO -----------
  const FuncionAgregarAnuncio = async () => {
    if (!DatosAnuncio.titulo) {
      Alert.alert('Error', 'Selecciona el título del anuncio');
      return;
    }
    let nombreEdificioFinal = DatosAnuncio.nombreEdificio;
    if (DatosAnuncio.tipo === 'Edificio' && !nombreEdificioFinal) {
      Alert.alert('Error', 'Debes ingresar el nombre del edificio');
      return;
    }
    const datosEnviar = {
      ...DatosAnuncio,
      nombreEdificio: nombreEdificioFinal,
      fechaEnvio: DatosAnuncio.programado
        ? null
        : new Date().toISOString(),
      fechaProgramada: DatosAnuncio.programado && DatosAnuncio.fechaProgramada
        ? new Date(DatosAnuncio.fechaProgramada).toISOString()
        : null
    };
    try {
      const res = await fetch('http://192.168.0.103:3000/agregarAnuncio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEnviar),
      });
      if (res.ok) {
        fetchAnuncios();
        setModalAgregarVisible(false);
        setDatosAnuncio({
          titulo: '',
          contenido: '',
          tipo: '',
          nombreEdificio: '',
          fechaEnvio: '',
          programado: false,
          fechaProgramada: '',
          idAdmin: ''
        });
      } else {
        Alert.alert('Error', 'No se pudo agregar el anuncio');
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo agregar el anuncio');
    }
  };

  // ----------- EDITAR ANUNCIO -----------
  const FuncionEditarAnuncio = async () => {
    if (DatosAnuncio.tipo === 'Edificio' && !DatosAnuncio.nombreEdificio) {
      Alert.alert('Error', 'Debes ingresar el nombre del edificio');
      return;
    }
    const datosEnviar = {
      ...DatosAnuncio,
      id: editAnuncioId,
      nombreEdificio: DatosAnuncio.nombreEdificio,
      fechaEnvio: DatosAnuncio.fechaEnvio ? new Date(DatosAnuncio.fechaEnvio).toISOString() : '',
      fechaProgramada: DatosAnuncio.fechaProgramada ? new Date(DatosAnuncio.fechaProgramada).toISOString() : ''
    };
    try {
      const res = await fetch('http://192.168.0.103:3000/editarAnuncio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEnviar),
      });
      if (res.ok) {
        fetchAnuncios();
        setModalEditarVisible(false);
        setEditAnuncioId(null);
        setDatosAnuncio({
          titulo: '',
          contenido: '',
          tipo: '',
          nombreEdificio: '',
          fechaEnvio: '',
          programado: false,
          fechaProgramada: '',
          idAdmin: ''
        });
      } else {
        Alert.alert('Error', 'No se pudo editar el anuncio');
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo editar el anuncio');
    }
  };

  // ----------- ELIMINAR ANUNCIO -----------
  const FuncionEliminarAnuncio = async (id) => {
    try {
      const res = await fetch('http://192.168.0.103:3000/eliminarAnuncio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchAnuncios();
      } else {
        Alert.alert('Error', 'No se pudo eliminar el anuncio');
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo eliminar el anuncio');
    }
  };

  
  const AccionLadoDerecho = (anuncio) => (
    <TouchableOpacity style={[styles.action, styles.edit]} onPress={() => {
      setEditAnuncioId(anuncio._id || anuncio.id);
      setModalEditarVisible(true);
    }}>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <MaterialIcons name="edit-notifications" size={24} color="#fff" />
              <Text style={styles.text}>Editar</Text>
            </View>
    </TouchableOpacity>
  );

  const AccionLadoIzquierdo = (anuncio) => (
    <TouchableOpacity style={[styles.action, styles.delete]} 
    onPress={() => {
      setAnuncioAEliminar(anuncio);
      setDialogVisible(true);
    }}>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <MaterialIcons name="notifications-off" size={24} color="#fff" />
              <Text style={styles.text}>Eliminar</Text>
            </View>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <Swipeable
      renderLeftActions={() => AccionLadoIzquierdo(item)}
      renderRightActions={() => AccionLadoDerecho(item)}
    >
      <TouchableOpacity style={styles.item} onPress={() => setDetalleAnuncio(item)}>
        <View style={styles.row}>
          <View style={styles.iconRight}>
            <MaterialIcons name="notifications-on" size={50} color="#3a3a3aff" />
          </View>
          <View style={{ flex: 0.9 }}>
            <Text style={styles.dataCellValue}>
            <Text style={styles.nombre}>Titulo:</Text> {item.titulo}{"   "}
            <Text style={styles.nombre}>Contenido:</Text> {item.contenido}{"   "}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  function formatearFecha(fechaIso) {
  if (!fechaIso) return '';
  const fecha = new Date(fechaIso);
  let horas = fecha.getHours();
  const minutos = fecha.getMinutes().toString().padStart(2, '0');
  const ampm = horas >= 12 ? 'PM' : 'AM';
  horas = horas % 12;
  horas = horas ? horas : 12; // El '0' se convierte en '12'
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const anio = fecha.getFullYear();
  return `a las: ${horas}:${minutos} ${ampm} el ${dia} de ${mes} de ${anio}`;
}

  return (
    <SafeAreaView style={styles.containerSafeArea}>
        <MenuAdministrador navigation={navigation} idAdmin={idAdmin} titulo="Tabla de Anuncios" />
        <View style={styles.content}>
        <FAB
          icon="bell-plus"
          color='#000000ff'
          style={styles.fab}
          onPress={() => {
            setDatosAnuncio({
              titulo: '',
              contenido: '',
              tipo: '',
              nombreEdificio: '',
              fechaEnvio: '',
              programado: false,
              fechaProgramada: '',
              idAdmin: idAdmin
            });
            setModalAgregarVisible(true);
          }}
        />
        <FlatList
          data={anuncios}
          keyExtractor={item => item.id?.toString() || item._id?.toString()}
          renderItem={renderItem}
        />

        {/* Modal para agregar anuncio */}
        <Portal>
          <Modal
            visible={modalAgregarVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Agregar anuncio</Text>
              <TextInput mode="outlined" label="Titulo" value={DatosAnuncio.titulo} onChangeText={v => setDatosAnuncio({ ...DatosAnuncio, titulo: v })} style={styles.input} />
              <TextInput mode="outlined" label="Contenido" value={DatosAnuncio.contenido} onChangeText={v => setDatosAnuncio({ ...DatosAnuncio, contenido: v })} style={styles.input} />
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '80%' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 17, minWidth: 110 }}>Tipo anuncio:</Text>
                <RadioButton.Group
                  onValueChange={value => setDatosAnuncio({ ...DatosAnuncio, tipo: value })}
                  value={DatosAnuncio.tipo}
                >
                <View style={{ alignItems: 'flex-start', width: '100%' }}>
                  <RadioButton.Item position='leading' color='#007bffff' label="Edificio" value="Edificio"  />
                  <RadioButton.Item position='leading' color='#007bffff' label="General" value="General"  />
                </View>
                 </RadioButton.Group>
              </View>

              {DatosAnuncio.tipo === 'Edificio' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '80%' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 15 }}>Edificio:  </Text>
                  <Picker
                    selectedValue={DatosAnuncio.nombreEdificio}
                    onValueChange={v => setDatosAnuncio({ ...DatosAnuncio, nombreEdificio: v })}
                    style={styles.picker}
                  >
                    {edificios.map((nombre, idx) => (
                      <Picker.Item key={idx} label={nombre} value={nombre} />
                    ))}
                  </Picker>
                </View>
              )}

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '95%' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 17, minWidth: 100 }}>¿Cuándo enviar?: </Text>
                <RadioButton.Group
                  onValueChange={value => setDatosAnuncio({ ...DatosAnuncio, programado: value === 'Programada' })}
                  value={DatosAnuncio.programado ? 'Programada' : 'Inmediata'}
                >
                <View style={{ alignItems: 'flex-start', width: '100%'}}>
                  <RadioButton.Item position='leading' color='#007bffff' label="Inmediata" value="Inmediata"  />
                  <RadioButton.Item position='leading' color='#007bffff' label="Programada" value="Programada"  />
                </View>
                 </RadioButton.Group>
              </View>

              {DatosAnuncio.programado && (
                <TextInput
                  mode="outlined"
                  placeholder="Fecha programada (YYYY-MM-DD)"
                  value={DatosAnuncio.fechaProgramada}
                  onChangeText={v => setDatosAnuncio({ ...DatosAnuncio, fechaProgramada: v })}
                  style={styles.input}
                />
              )}

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
                  icon="bell-plus"
                  mode="elevated"
                  onPress={FuncionAgregarAnuncio}
                  labelStyle={{ color: '#fff' }}
                 >
                  Agregar
                </Button>
              </View>

            </View>
          </Modal>
        </Portal>

        {/* Modal para editar anuncio */}
        <Portal>
          <Modal
            visible={modalEditarVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Editar anuncio</Text>
              <TextInput mode="outlined" label="Titulo" value={DatosAnuncio.titulo} onChangeText={v => setDatosAnuncio({ ...DatosAnuncio, titulo: v })} style={styles.input} />
              <TextInput mode="outlined" label="Contenido" value={DatosAnuncio.contenido} onChangeText={v => setDatosAnuncio({ ...DatosAnuncio, contenido: v })} style={styles.input} />
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '95%' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 17, minWidth: 100 }}>Tipo de anuncio: </Text>
                <RadioButton.Group
                  onValueChange={value => setDatosAnuncio({ ...DatosAnuncio, tipo: value })}
                  value={DatosAnuncio.tipo}
                >
                <View style={{ alignItems: 'flex-start', width: '100%' }}>
                  <RadioButton.Item position='leading' color='#007bffff' label="Edificio" value="Edificio"  />
                  <RadioButton.Item position='leading' color='#007bffff' label="General" value="General"  />
                </View>
                 </RadioButton.Group>
              </View>


              {DatosAnuncio.tipo === 'Edificio' && (
                <>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '80%' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 15 }}>Nombre edificio:  </Text>
                  <Picker
                    selectedValue={DatosAnuncio.nombreEdificio}
                    onValueChange={v => setDatosAnuncio({ ...DatosAnuncio, nombreEdificio: v })}
                    style={styles.picker}
                  >
                    {edificios.map((nombre, idx) => (
                      <Picker.Item key={idx} label={nombre} value={nombre} />
                    ))}
                  </Picker>
                </View>
                </>
              )}

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '95%' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 17, minWidth: 100 }}>¿Cuándo enviar? </Text>
                <RadioButton.Group
                  onValueChange={value => setDatosAnuncio({ ...DatosAnuncio, programado: value === 'Programada' })}
                  value={DatosAnuncio.programado ? 'Programada' : 'Inmediata'}
                >
                <View style={{ alignItems: 'flex-start', width: '100%' }}>
                  <RadioButton.Item position='leading' color='#007bffff' label="Inmediata" value="Inmediata"  />
                  <RadioButton.Item position='leading' color='#007bffff' label="Programada" value="Programada"  />
                </View>
                 </RadioButton.Group>
              </View>

              {DatosAnuncio.programado && (
                <TextInput
                  mode="outlined"
                  label="Fecha programada (YYYY-MM-DD)"
                  value={DatosAnuncio.fechaProgramada}
                  onChangeText={v => setDatosAnuncio({ ...DatosAnuncio, fechaProgramada: v })}
                  style={styles.input}
                />
              )}
              
              <View style={styles.modalBtns}>
                <Button
                  style={[styles.cancelar, { flex: 1, marginRight: 8 }]}
                  icon="cancel"
                  mode="elevated"
                   onPress={() => {
                  setModalEditarVisible(false);
                  setEditAnuncioId(null);
                  setDatosAnuncio({
                    titulo: '',
                    contenido: '',
                    tipo: '',
                    nombreEdificio: '',
                    fechaEnvio: '',
                    programado: false,
                    fechaProgramada: '',
                    idAdmin: ''
                  });
                }} 
                  labelStyle={{ color: '#fff' }}
                >
                  Cancelar
                </Button>
                <Button
                  style={[styles.agregar, { flex: 1, marginLeft: 8 }]}
                  icon="bell-plus"
                  mode="elevated"
                  onPress={FuncionEditarAnuncio}
                  labelStyle={{ color: '#fff' }}
                 >
                  Guardar
                </Button>
              </View>

            </View>
          </Modal>
        </Portal>

        {/* Modal para ver detalles del anuncio */}
        {detalleAnuncio && (
          <Portal>
            <Modal visible={!!detalleAnuncio} animationType="slide" transparent={true}>
              <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Detalles del anuncio</Text>

                        <DataTable style={styles.dataTable}>
                          <DataTable.Row style={styles.dataRow}>
                            <DataTable.Cell style={{ flex: 2 }}>
                              <Text style={styles.dataCellTitle}>Titulo: </Text>
                            </DataTable.Cell>
                            <DataTable.Cell style={{ flex: 4 }}>
                              <Text style={styles.dataCellValue}>{detalleAnuncio?.titulo}</Text>
                            </DataTable.Cell>
                          </DataTable.Row>
              
                          <DataTable.Row style={styles.dataRow}>
                            <DataTable.Cell style={{ flex: 2 }}>
                              <Text style={styles.dataCellTitle}>Contenido: </Text>
                            </DataTable.Cell>
                            <DataTable.Cell style={{ flex: 4 }}>
                              <Text style={styles.dataCellValue}>{detalleAnuncio?.contenido}</Text>
                            </DataTable.Cell>
                          </DataTable.Row>
              
                          <DataTable.Row style={styles.dataRow}>
                            <DataTable.Cell style={{ flex: 2 }}>
                              <Text style={styles.dataCellTitle}>Tipo: </Text>
                            </DataTable.Cell>
                            <DataTable.Cell style={{ flex: 4 }}>
                              <Text style={styles.dataCellValue}>{detalleAnuncio?.tipo}</Text>
                            </DataTable.Cell>
                          </DataTable.Row>
              
                          <DataTable.Row style={styles.dataRow}>
                            <DataTable.Cell style={{ flex: 2 }}>
                              <Text style={styles.dataCellTitle}>Nombre del edificio: </Text>
                            </DataTable.Cell>
                            <DataTable.Cell style={{ flex: 4 }}>
                              <Text style={styles.dataCellValue}>{detalleAnuncio?.nombreEdificio}</Text>
                            </DataTable.Cell>
                          </DataTable.Row>
              
                          <DataTable.Row style={styles.dataRow}>
                            <DataTable.Cell style={{ flex: 2 }}>
                              <Text style={styles.dataCellTitle}>Fecha de envio:  </Text>
                            </DataTable.Cell>
                            <DataTable.Cell style={{ flex: 4 }}>
                              <Text style={styles.dataCellValue}> Enviado {formatearFecha(detalleAnuncio?.fechaEnvio)}
                              </Text>
                            </DataTable.Cell>
                          </DataTable.Row>
              
                          <DataTable.Row style={styles.dataRow}>
                            <DataTable.Cell style={{ flex: 2 }}>
                              <Text style={styles.dataCellTitle}>Programado: </Text>
                            </DataTable.Cell>
                            <DataTable.Cell style={{ flex: 4 }}>
                              <Text style={styles.dataCellValue}>{detalleAnuncio?.programado ? 'Sí' : 'No'}</Text>
                            </DataTable.Cell>
                          </DataTable.Row>

                          <DataTable.Row style={styles.dataRow}>
                            <DataTable.Cell style={{ flex: 2 }}>
                              <Text style={styles.dataCellTitle}>Fecha programada: </Text>
                            </DataTable.Cell>
                            <DataTable.Cell style={{ flex: 4 }}>
                              <Text style={styles.dataCellValue}>{detalleAnuncio?.fechaProgramada}</Text>
                            </DataTable.Cell>
                          </DataTable.Row>

                        </DataTable>

                        <Button style={{ backgroundColor: '#2732f1ff' }} icon="keyboard-backspace" mode="contained" onPress={() => setDetalleAnuncio(null)}>
                          Regresar
                        </Button>
                      </View>
            </Modal>
          </Portal>
        )}


        {/* Dialog de confirmación para eliminar un anuncio */}
            <Portal>
          <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
            <Dialog.Title>Confirmar eliminación</Dialog.Title>
            <Dialog.Content>
              <Text>¿Estás seguro de que deseas eliminar este anuncio?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDialogVisible(false)} labelStyle={{ color: '#1976d2' }} icon='close'>Cancelar</Button>
              <Button
                onPress={() => {
                  setDialogVisible(false);
                  FuncionEliminarAnuncio(anuncioAEliminar._id || anuncioAEliminar.id);
                }}
                labelStyle={{ color: '#d32f2f' }}
                icon='delete'
              >
                Eliminar
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
  nombre: { fontWeight: 'bold', width: '80%' },
  editBtn: { backgroundColor: 'blue', justifyContent: 'center', alignItems: 'center', width: 100 },
  deleteBtn: { backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', width: 100 },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 10, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { width: 290, height: 36, borderRadius: 10, marginBottom: 5 },
  modalBtns: {
  flexDirection: 'row',
  justifyContent: 'space-between', 
  width: '100%',                  
  marginTop: 10,
},
  containerSafeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: { flex: 1, padding: 20 },
  text: { color: '#fff', fontSize: 12 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 10,
    margin: 14,
    minWidth: 30,
    justifyContent: 'center',
  },
  ver: { backgroundColor: '#4CAF50' },
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
  delete: { backgroundColor: '#d32f2f' },
  edit: { backgroundColor: '#1976d2' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  iconRight: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    height: 80,
    marginRight: 16,
    backgroundColor: '#ffffffff',
    borderRadius: 8,
  },
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
  },
  dataCellValue: {
    color: '#333',
    fontSize: 15,
    textAlign: 'left',
    fontStyle: 'italic',
  },
  cancelar:{
    backgroundColor: '#f20000ff',
  },
  agregar:{
    backgroundColor: '#28aa0eff',
  },
  picker: {
    width: 150,
    height: 55,
    borderRadius: 10,
    marginBottom: 5,
  },
});

export default TablaAnuncios;