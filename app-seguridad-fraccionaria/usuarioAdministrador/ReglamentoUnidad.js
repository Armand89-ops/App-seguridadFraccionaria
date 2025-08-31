import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet,  Alert } from 'react-native';
import { Portal, FAB, TextInput, Dialog, Button, Modal } from 'react-native-paper';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import MenuAdministrador from './MenuAdministrador';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const ReglamentoUnidad = ({ navigation, route }) => {
  const { idAdmin } = route.params;
  const [reglas, setReglas] = useState([]);
  const [detalleRegla, setDetalleRegla] = useState(null);
  const [modalAgregarVisible, setModalAgregarVisible] = useState(false);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [modalVerVisible, setModalVerVisible] = useState(false);
  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  const [datosRegla, setDatosRegla] = useState({ regla: '' });
  const [editarReglaId, setEditarReglaId] = useState(null);

  // Obtener todas las reglas
  const VerReglas = async () => {
    try {
      const res = await fetch('http://192.168.0.103:3000/verReglas');
      const data = await res.json();
      setReglas(data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar las reglas');
    }
  };

  useEffect(() => {
    VerReglas();
  }, []);

  const AgregarRegla = async () => {
    try {
      const res = await fetch('http://192.168.0.103:3000/agregarRegla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regla: datosRegla.regla, idAdmin }),
      });
      if (res.ok) {
        setModalAgregarVisible(false);
        setDatosRegla({ regla: '' });
        VerReglas();
        Alert.alert('Éxito', 'Regla agregada');
      } else {
        Alert.alert('Error', 'No se pudo agregar la regla');
      }
    } catch {
      Alert.alert('Error', 'No se pudo agregar la regla');
    }
  };

  // Editar regla
  const EditarRegla = async () => {
    try {
      const res = await fetch('http://192.168.0.103:3000/editarRegla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editarReglaId, regla: datosRegla.regla, idAdmin }),
      });
      if (res.ok) {
        setModalEditarVisible(false);
        setEditarReglaId(null);
        setDatosRegla({ regla: '' });
        VerReglas();
        Alert.alert('Éxito', 'Regla editada');
      } else {
        Alert.alert('Error', 'No se pudo editar la regla');
      }
    } catch {
      Alert.alert('Error', 'No se pudo editar la regla');
    }
  };

  // Eliminar regla
  const EliminarRegla = async (id) => {
    try {
      const res = await fetch('http://192.168.0.103:3000/eliminarRegla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, idAdmin }),
      });
      if (res.ok) {
        setModalEliminarVisible(false);
        setDetalleRegla(null);
        VerReglas();
        Alert.alert('Éxito', 'Regla eliminada');
      } else {
        Alert.alert('Error', 'No se pudo eliminar la regla');
      }
    } catch {
      Alert.alert('Error', 'No se pudo eliminar la regla');
    }
  };

  // Acciones Swipe
  const AccionLadoDerecho = (item) => (
    <TouchableOpacity
      style={[styles.action, styles.edit]}
      onPress={() => {
        setEditarReglaId(item._id);
        setDatosRegla({ regla: item.regla });
        setModalEditarVisible(true);
      }}
    >
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <MaterialIcons name="edit-note" size={28} color="#fff" />
        <Text style={styles.text}>Editar</Text>
      </View>
    </TouchableOpacity>
  );

  const AccionLadoIzquierdo = (item) => (
    <TouchableOpacity
      style={[styles.action, styles.delete]}
      onPress={() => {
        setDetalleRegla(item);
        setModalEliminarVisible(true);
      }}
    >
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <MaterialIcons name="playlist-remove" size={28} color="#fff" />
        <Text style={styles.text}>Eliminar</Text>
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <Swipeable
      renderLeftActions={() => AccionLadoIzquierdo(item)}
      renderRightActions={() => AccionLadoDerecho(item)}
    >
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          setDetalleRegla(item);
          setModalVerVisible(true);
        }}
      >
        <View style={styles.row}>
          <View style={styles.iconLeft}>
            <MaterialIcons name="horizontal-rule" size={44} color="#1976d2" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.nombre} numberOfLines={2}>
              {item.regla}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <SafeAreaView style={styles.containerSafeArea}>
      <MenuAdministrador navigation={navigation} idAdmin={idAdmin} titulo="Reglamento de la unidad" />
      <View style={styles.content}>
        <FAB
          icon="playlist-plus"
          color="#000000ff"
          style={styles.fab}
          onPress={() => {
            setModalAgregarVisible(true);
            setDatosRegla({ regla: '' });
          }}
        />

        <FlatList
          data={reglas}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
        />

        {/* Modal para ver la regla */}
        <Portal>
          <Modal visible={modalVerVisible} onDismiss={() => setModalVerVisible(false)}>
            <View style={styles.detalleModalView}>
              <Text style={styles.modalTitle}>Detalles de la regla</Text>
              <Text style={styles.dataCellValue}>{detalleRegla?.regla}</Text>
              <Button
                style={[styles.cancelar, { marginTop: 10 }]}
                mode="contained"
                onPress={() => setModalVerVisible(false)}
                labelStyle={{ color: '#fff' }}
                icon="close"
              >
                Cerrar
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Dialog para eliminar la regla */}
        <Portal>
          <Dialog visible={modalEliminarVisible} onDismiss={() => setModalEliminarVisible(false)}>
            <Dialog.Title>Eliminar regla</Dialog.Title>
            <Dialog.Content>
              <Text>¿Estás seguro de que deseas eliminar esta regla?</Text>
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
                onPress={() => EliminarRegla(detalleRegla?._id)}
                labelStyle={{ color: '#d32f2f' }}
                icon="delete"
              >
                Eliminar
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {/* Modal para añadir una regla */}
        <Portal>
          <Modal
            visible={modalAgregarVisible}
            onDismiss={() => setModalAgregarVisible(false)}
            contentContainerStyle={styles.modalView}
          >
            <Text style={styles.modalTitle}>Añadir regla</Text>
            <TextInput
              mode="flat"
              style={styles.input} 
              placeholder="Ingrese la regla"
              value={datosRegla.regla}
              onChangeText={(text) => setDatosRegla({ ...datosRegla, regla: text })}
              multiline={true}
              numberOfLines={6}
              textAlignVertical="top"
              textAlign="left"
              scrollEnabled={true}
              returnKeyType="done"
              blurOnSubmit={true}
            />
            <View style={styles.modalBtns}>
              <Button
                style={[styles.cancelar, { flex: 1, marginRight: 8 }]}
                mode="contained"
                onPress={() => setModalAgregarVisible(false)}
                labelStyle={{ color: '#fff' }}
                icon="close"
              >
                Cancelar
              </Button>
              <Button
                style={[styles.agregar, { flex: 1, marginLeft: 8 }]}
                mode="contained"
                onPress={AgregarRegla}
                labelStyle={{ color: '#fff' }}
                icon='playlist-plus'
              >
                Añadir
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Modal para editar la regla */}
        <Portal>
          <Modal
            visible={modalEditarVisible}
            onDismiss={() => setModalEditarVisible(false)}
            contentContainerStyle={styles.EditarReglaModalView}
          >
            <Text style={styles.modalTitle}>Editar regla</Text>
            <TextInput
              mode="flat"
              style={styles.input}
              placeholder="Ingrese la regla"
              value={datosRegla.regla}
              onChangeText={(text) => setDatosRegla({ ...datosRegla, regla: text })}
              multiline={true}
              numberOfLines={6}
            />
            <View style={styles.modalBtns}>
              <Button
                style={[styles.cancelar, { flex: 1, marginRight: 8 }]}
                mode="contained"
                onPress={() => setModalEditarVisible(false)}
                labelStyle={{ color: '#fff' }}
                icon="close"
              >
                Cancelar
              </Button>
              <Button
                style={[styles.agregar, { flex: 1, marginLeft: 8 }]}
                mode="contained"
                onPress={EditarRegla}
                labelStyle={{ color: '#fff' }}
                icon="check"
              >
                Guardar
              </Button>
            </View>
          </Modal>
        </Portal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  containerSafeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: -10 },
  input: {
  borderColor: '#ccc',
  borderWidth: 1,
  borderRadius: 8,
  padding: 1,

  marginBottom: 180,
  textAlignVertical: 'top',
  fontSize: 16,
  backgroundColor: '#f7fafd',
  height: 50,
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: -150,
  },
  cancelar: {
    backgroundColor: '#f20000ff',
  },
  agregar: {
    backgroundColor: '#28aa0eff',
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
  edit: { backgroundColor: '#1976d2' },
  delete: { backgroundColor: '#d32f2f' },
  item: {
    backgroundColor: '#fff',
    padding: 20,
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
    flex: 1,
  },
  iconLeft: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 54,
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  nombre: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginBottom: 2,
  },
  dataCellValue: {
    fontSize: 15,
    color: '#333',
    marginTop: 8,
    marginBottom: 8,
  },
  text: { color: '#fff', fontSize: 13, textAlign: 'center', marginTop: 4 },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 2,
    backgroundColor: '#21f3f3ff',
    elevation: 8,
    zIndex: 999,
  },
  detalleModalView: {
  backgroundColor: '#fff',
  borderRadius: 18,
  padding: 30,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.18,
  shadowRadius: 6,
  elevation: 8,
  width: 350,     
  minHeight: 150, 
  maxHeight: 170, 
  alignSelf: 'center',
},
EditarReglaModalView: {
  backgroundColor: '#fff',
  borderRadius: 18,
  padding: 20,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.18,
  shadowRadius: 6,
  elevation: 20,
  width: 350,     
  height: 400,
  maxHeight: 400, 
  alignSelf: 'center',
},
  modalView: { margin: 30, backgroundColor: 'white', 
    backgroundColor: '#fff',
  borderRadius: 18,
  padding: 20,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.18,
  shadowRadius: 6,
  elevation: 20,
  width: 350,     
  height: 400,
  maxHeight: 400, 
  alignSelf: 'center',
  },
});

export default ReglamentoUnidad;