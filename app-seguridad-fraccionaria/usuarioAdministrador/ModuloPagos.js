import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MenuAdministrador from './MenuAdministrador';
import { DataTable } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { Portal, Modal, Button, TextInput, FAB, RadioButton } from 'react-native-paper';

const ModuloPagos = ({ navigation, route }) => {
  const { idAdmin } = route.params;
  const [pagos, setPagos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [edificioFiltro, setEdificioFiltro] = useState('');
  const [departamentoFiltro, setDepartamentoFiltro] = useState('');
  const [modalAgregarVisible, setModalAgregarVisible] = useState(false);
  const [datosPago, setDatosPago] = useState({
    edificio: '',
    departamento: '',
    idUsuario: '',
    nombreUsuario: '',
    tipoPago: '',
    metodoPago: '',
    monto: '',
    fechaPago: '',
    vigencia: '',
    estatus: 'vigente',
    procesadoPor: idAdmin,
    referenciaStripe: ''
  });

  useEffect(() => {
    fetch('http://192.168.0.103:3000/verPagos')
      .then(res => res.json())
      .then(data => setPagos(data))
      .catch(() => setPagos([]));
  }, []);

  useEffect(() => {
    fetch('http://192.168.0.103:3000/verUsuarios')
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(() => setUsuarios([]));
  }, []);

  const agregarPago = async ({
    edificio,
    departamento,
    idUsuario,
    nombreUsuario,
    tipoPago,
    metodoPago,
    monto,
    fechaPago,
    vigencia,
    estatus,
    procesadoPor,
    referenciaStripe
  }) => {
    try {
      const res = await fetch('http://192.168.0.103:3000/agregarPago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          edificio,
          departamento,
          idUsuario,
          nombreUsuario,
          tipoPago,
          metodoPago,
          monto,
          fechaPago,   
          vigencia,   
          estatus,
          procesadoPor,
          referenciaStripe
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.mensaje || 'No se pudo agregar el pago');
      }
      return data;
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el pago: ' + error.message);
      return null;
    }
  };

  // Obtener edificios y departamentos únicos para los filtros
  const edificios = [...new Set(pagos.map(p => p.edificio))];
  const departamentos = edificioFiltro
    ? [...new Set(pagos.filter(p => p.edificio === edificioFiltro).map(p => p.departamento))]
    : [...new Set(pagos.map(p => p.departamento))];

  // Filtrar pagos según los filtros seleccionados
  const pagosFiltrados = pagos.filter(p =>
    (edificioFiltro ? p.edificio === edificioFiltro : true) &&
    (departamentoFiltro ? p.departamento === departamentoFiltro : true)
  );

  return (
    <SafeAreaView style={styles.container}>
      <MenuAdministrador navigation={navigation} idAdmin={idAdmin} titulo="Módulos de Pagos" />
      <View style={styles.content}>
        <FAB
          icon="plus"
          color='#000000ff'
          style={styles.fab}
          onPress={() => {
            setModalAgregarVisible(true);
            setDatosPago({
              edificio: '',
              departamento: '',
              idUsuario: '',
              nombreUsuario: '',
              tipoPago: '',
              metodoPago: '',
              monto: '',
              fechaPago: '',
              vigencia: '',
              estatus: 'vigente',
              procesadoPor: idAdmin,
              referenciaStripe: ''
            });
          }}
        />
        <View style={styles.filtros}>
          <View style={styles.filtro}>
            <Text>Edificio:</Text>
            <Picker
              selectedValue={edificioFiltro}
              style={styles.picker}
              onValueChange={v => {
                setEdificioFiltro(v);
                setDepartamentoFiltro('');
              }}
            >
              <Picker.Item label="Todos" value="" />
              {edificios.map((ed, idx) => (
                <Picker.Item key={idx} label={ed} value={ed} />
              ))}
            </Picker>
          </View>
          <View style={styles.filtro}>
            <Text>Departamento:</Text>
            <Picker
              selectedValue={departamentoFiltro}
              style={styles.picker}
              onValueChange={setDepartamentoFiltro}
              enabled={edificios.length > 0}
            >
              <Picker.Item label="Todos" value="" />
              {departamentos.map((dep, idx) => (
                <Picker.Item key={idx} label={dep} value={dep} />
              ))}
            </Picker>
          </View>
        </View>
        <DataTable style={styles.table}>
          <DataTable.Header>
            <DataTable.Title>Edificio</DataTable.Title>
            <DataTable.Title>Departamento</DataTable.Title>
            <DataTable.Title>Estatus</DataTable.Title>
          </DataTable.Header>
          {pagosFiltrados.map((pago, idx) => (
            <DataTable.Row key={idx}>
              <DataTable.Cell>{pago.edificio}</DataTable.Cell>
              <DataTable.Cell>{pago.departamento}</DataTable.Cell>
              <DataTable.Cell>
                <Text style={{
                  color: pago.estatus === 'vigente' ? 'green' : 'red',
                  fontWeight: 'bold'
                }}>
                  {pago.estatus === 'vigente' ? 'Vigente' : 'No pagado'}
                </Text>
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
        <Portal>
          <Modal visible={modalAgregarVisible} transparent={true} animationType="slide">
            <View style={[styles.modalView, { padding: 20 }]}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Agregar pago manual</Text>
              <Picker
                selectedValue={datosPago.idUsuario}
                style={styles.input}
                onValueChange={usuarioId => {
                  const usuario = usuarios.find(u => u._id === usuarioId);
                  setDatosPago({
                    ...datosPago,
                    idUsuario: usuarioId,
                    nombreUsuario: usuario?.NombreCompleto || '',
                    edificio: usuario?.Edificio || '',
                    departamento: usuario?.Departamento || ''
                  });
                }}
              >
                <Picker.Item label="Selecciona un usuario..." value="" />
                {usuarios.map(u => (
                  <Picker.Item
                    key={u._id}
                    label={`${u.NombreCompleto} - ${u.Edificio} - Depto ${u.Departamento}`}
                    value={u._id}
                  />
                ))}
              </Picker>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '80%' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 17, minWidth: 110 }}>Tipo de pago:</Text>
                <RadioButton.Group
                  onValueChange={value => setDatosPago({ ...datosPago, tipoPago: value })}
                  value={datosPago.tipoPago}
                >
                  <View style={{ alignItems: 'center' }}>
                    <RadioButton.Item color='#007bffff' label="Semanal" value="Semanal" />
                    <RadioButton.Item color='#007bffff' label="Mensual" value="Mensual" />
                    <RadioButton.Item color='#007bffff' label="Anual" value="Anual" />
                  </View>
                </RadioButton.Group>
              </View>
              
              <TextInput
                label="Método de pago"
                value={datosPago.metodoPago}
                onChangeText={v => setDatosPago({ ...datosPago, metodoPago: v })}
                style={styles.input}
              />
              <TextInput
                label="Monto"
                value={datosPago.monto}
                onChangeText={v => setDatosPago({ ...datosPago, monto: v })}
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                label="Vigencia (YYYY-MM-DD)"
                value={datosPago.vigencia}
                onChangeText={v => setDatosPago({ ...datosPago, vigencia: v })}
                style={styles.input}
              />
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <Button
                  icon='cancel'
                  style={{ flex: 1, backgroundColor: '#d32f2f', marginRight: 8 }}
                  mode="contained"
                  onPress={() => setModalAgregarVisible(false)}
                >
                  Cancelar
                </Button>
                <Button
                  style={{ flex: 1, backgroundColor: '#28aa0e', marginLeft: 8 }}
                  mode="contained"
                  icon='credit-card-plus'
                  onPress={async () => {
                    const exito = await agregarPago({
                      ...datosPago,
                      monto: parseFloat(datosPago.monto),
                      fechaPago: new Date().toISOString(), // Fecha actual
                      vigencia: new Date(datosPago.vigencia).toISOString(),
                      procesadoPor: idAdmin,
                      referenciaStripe: '' 
                    });
                    if (exito) {
                      setModalAgregarVisible(false);
                      // Recarga la lista de pagos
                      fetch('http://192.168.0.103:3000/verPagos')
                        .then(res => res.json())
                        .then(data => setPagos(data))
                        .catch(() => setPagos([]));
                    }
                  }}
                >
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
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  table: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  filtros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filtro: {
    flex: 1,
    marginHorizontal: 5,
    marginVertical: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  modalView: {
    marginHorizontal: 20,
    marginTop: 80,
    marginBottom: 80,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: 400,
    minWidth: 280,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#f7fafd',
    width: '100%',
    minHeight: 40,
    maxHeight: 100,
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
});

export default ModuloPagos;