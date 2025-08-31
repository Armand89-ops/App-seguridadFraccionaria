import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MenuVigilante from './MenuVigilante';
import { Picker } from '@react-native-picker/picker';

const ConsultarPagos = ({ navigation, route }) => {
  const { idVigilante } = route.params;
  const [pagos, setPagos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [edificioFiltro, setEdificioFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetch('http://192.168.0.103:3000/verPagos')
      .then(res => res.json())
      .then(data => setPagos(data))
      .catch(() => setPagos([]));
    fetch('http://192.168.0.103:3000/verUsuarios')
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(() => setUsuarios([]));
  }, []);

  // Agrupa pagos por usuario/departamento y se queda con el más reciente
  const pagosUnicos = Object.values(
    pagos.reduce((acc, pago) => {
      const clave = `${pago.idUsuario}_${pago.departamento}_${pago.edificio}`;
      if (!acc[clave] || new Date(pago.vigencia) > new Date(acc[clave].vigencia)) {
        acc[clave] = pago;
      }
      return acc;
    }, {})
  );

  // Solo departamentos al corriente
  const hoy = new Date();
  const alCorriente = pagosUnicos.filter(p => new Date(p.vigencia) >= hoy);

  // Relaciona con usuario
  const lista = alCorriente.map(pago => {
    const usuario = usuarios.find(u => u._id === pago.idUsuario);
    return {
      ...pago,
      nombre: usuario ? usuario.NombreCompleto : '',
      edificio: usuario ? usuario.Edificio : pago.edificio,
      departamento: usuario ? usuario.Departamento : pago.departamento,
    };
  }).filter(item =>
    (edificioFiltro ? item.edificio === edificioFiltro : true) &&
    (busqueda ? item.departamento.toLowerCase().includes(busqueda.toLowerCase()) : true)
  );

  // Edificios únicos para el filtro
  const edificios = [...new Set(usuarios.map(u => u.Edificio))];

  return (
    <SafeAreaView style={styles.container}>
      <MenuVigilante navigation={navigation} idVigilante={idVigilante} titulo="Consultar Pagos" />
      <View style={styles.content}>
        <Text style={styles.screenTitle}>Departamentos al corriente</Text>
        <Picker
          selectedValue={edificioFiltro}
          style={styles.input}
          onValueChange={setEdificioFiltro}
        >
          <Picker.Item label="Todos los edificios" value="" />
          {edificios.map(edif => (
            <Picker.Item key={edif} label={edif} value={edif} />
          ))}
        </Picker>
        <TextInput
          style={styles.input}
          placeholder="Buscar por departamento..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
        <FlatList
          data={lista}
          keyExtractor={item => item._id || `${item.idUsuario}_${item.departamento}_${item.edificio}`}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.cell}>{item.nombre}</Text>
              <Text style={styles.cell}>{item.edificio}</Text>
              <Text style={styles.cell}>{item.departamento}</Text>
              <Text style={styles.cell}>Vigente hasta: {new Date(item.vigencia).toLocaleDateString()}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No hay departamentos al corriente.</Text>}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flex: 1, padding: 20 },
  screenTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  input: { backgroundColor: '#fff', marginVertical: 8, borderRadius: 6, padding: 8 },
  row: { flexDirection: 'column', backgroundColor: '#fff', marginVertical: 6, borderRadius: 6, padding: 10 },
  cell: { fontSize: 16, marginBottom: 2 },
});

export default ConsultarPagos;