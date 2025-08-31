import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MenuVigilante from './MenuVigilante';
import { FAB, Portal, Modal, TextInput, Button } from 'react-native-paper';

const InicioVigilante = ({ navigation, route }) => {
  const { idVigilante } = route.params;
  const [modalAgregarVisible, setModalAgregarVisible] = useState(false);
  const [DatosAnuncio, setDatosAnuncio] = useState({
    contenido: '',
    idAdmin: idVigilante,
  });

  // AGREGAR ANUNCIO
  const FuncionAgregarAnuncioResidente = async () => {
    if (!DatosAnuncio.contenido) {
      Alert.alert('Error', 'Debes ingresar el contenido del anuncio');
      return;
    }
    const datosEnviar = {
      ...DatosAnuncio,
      fechaEnvio: new Date().toISOString(),
      titulo: 'Noticia urgente',
      tipo: 'General',
      idVigilante,
    };
    try {
      const res = await fetch('http://192.168.0.103:3000/agregarAnuncio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEnviar),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Respuesta backend:', data);
        setModalAgregarVisible(false);
        setDatosAnuncio({ contenido: '' });
        Alert.alert('Éxito', 'El anuncio fue agregado correctamente');
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.log('Error backend:', errorData);
        Alert.alert('Error', 'No se pudo agregar el anuncio');
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo agregar el anuncio');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <MenuVigilante navigation={navigation} idVigilante={idVigilante} />

      <View style={styles.content}>
        <Text style={styles.screenTitle}>Botón de pánico</Text>
        <FAB
          icon="alert"
          style={styles.fab}
          size='large'
          onPress={() => setModalAgregarVisible(true)}
          color='white' 
        />

        <Portal>
          <Modal
            visible={modalAgregarVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Agregar anuncio</Text>
              <TextInput
                placeholder="Contenido"
                value={DatosAnuncio.contenido}
                onChangeText={v => setDatosAnuncio({ ...DatosAnuncio, contenido: v })}
                style={styles.input}
              />
              <View style={styles.modalBtns}>
                <Button mode="outlined" onPress={() => setModalAgregarVisible(false)} style={{ marginRight: 10 }}>
                  Cancelar
                </Button>
                <Button mode="contained" onPress={FuncionAgregarAnuncioResidente}>
                  Agregar
                </Button>
              </View>
            </View>
          </Modal>
        </Portal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  screenDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
  },
  fab: {
    margin: 16,
    backgroundColor: '#e34040ff',
    alignSelf: 'center',
    position: 'relative',
    elevation: 4,
  },
  modalView: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    width: 250,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
});

export default InicioVigilante;