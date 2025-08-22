import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MenuResidente from './MenuResidente';
import { FAB, Portal, Modal, TextInput, Button } from 'react-native-paper';
 
const InicioResidente = ({ navigation, route }) => {
  const { idResidente } = route.params;
  const [modalAgregarVisible, setModalAgregarVisible] = useState(false);
  const [DatosAnuncio, setDatosAnuncio] = useState({
    titulo: '',
    contenido: '',
  });

  //AGREGAR ANUNCIO 
    const FuncionAgregarAnuncio = async () => {
      if (!DatosAnuncio.titulo) {
        Alert.alert('Error', 'Debes ingresar el título del anuncio');
        return;
      }
      if (!DatosAnuncio.contenido) {
        Alert.alert('Error', 'Debes ingresar el contenido del anuncio');
        return;
      }
      const datosEnviar = {
        ...DatosAnuncio,
        fechaEnvio: new Date().toISOString(),
        tipo: 'general',
        idResidente,     
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
          fetchAnuncios && fetchAnuncios();
          setModalAgregarVisible(false);
          setDatosAnuncio({ titulo: '', contenido: '' });
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
      <MenuResidente navigation={navigation} idResidente={idResidente} />

      <View style={styles.content}>
        <Text style={styles.screenTitle}>Boton de panico</Text>
        <FAB
          icon="plus"
          style={styles.fab}
          size='large'
          onPress={() => setModalAgregarVisible(true)}
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
                placeholder="Título"
                value={DatosAnuncio.titulo}
                onChangeText={v => setDatosAnuncio({ ...DatosAnuncio, titulo: v })}
                style={styles.input}
              />
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
                <Button mode="contained" onPress={FuncionAgregarAnuncio}>
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
    position: 'center',
    margin: 16,
    right: 0,
    bottom: 0,
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

export default InicioResidente;