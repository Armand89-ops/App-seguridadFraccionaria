import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MenuResidente from './MenuResidente';
import { DataTable } from 'react-native-paper';

const HistorialPagos = ({ navigation, route }) => {
  const { idResidente } = route.params;
  const [pagos, setPagos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://192.168.0.103:3000/verPagosResidente/${idResidente}`)
      .then(res => res.json())
      .then(data => {
        setPagos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [idResidente]);

  useEffect(() => {
    fetch('http://192.168.0.103:3000/verUsuarios')
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(() => setUsuarios([]));
  }, []);

  // Relaciona cada pago con su usuario
  const pagosConUsuario = pagos.map(pago => {
    const usuario = usuarios.find(u => u._id === pago.idUsuario);
    return {
      ...pago,
      nombreUsuario: usuario ? usuario.NombreCompleto : 'Desconocido',
      edificio: usuario ? usuario.Edificio : '',
      departamento: usuario ? usuario.Departamento : '',
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <MenuResidente navigation={navigation} idResidente={idResidente} titulo="Historial de pagos" />

      <View style={styles.content}>
        <Text style={styles.screenTitle}>Historial de pagos</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 30 }} />
        ) : (
          <DataTable style={styles.table}>
            <DataTable.Header>
              <DataTable.Title style={{ flex: 2 }}>Tipo</DataTable.Title>
              <DataTable.Title style={{ flex: 2 }}>Método</DataTable.Title>
              <DataTable.Title style={{ flex: 2 }}>Monto</DataTable.Title>
              <DataTable.Title style={{ flex: 3 }}>Fecha de pago</DataTable.Title>
            </DataTable.Header>
            {pagosConUsuario.map((pago, idx) => (
              <DataTable.Row key={pago._id || idx}>
                <DataTable.Cell style={{ flex: 2 }}>{pago.tipoPago}</DataTable.Cell>
                <DataTable.Cell style={{ flex: 2 }}>{pago.metodoPago}</DataTable.Cell>
                <DataTable.Cell style={{ flex: 2 }}>${pago.monto}</DataTable.Cell>
                <DataTable.Cell style={{ flex: 3 }}>
                  {pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString() : ''}
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        )}
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
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  table: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    marginTop: 10,
  },
});

export default HistorialPagos;