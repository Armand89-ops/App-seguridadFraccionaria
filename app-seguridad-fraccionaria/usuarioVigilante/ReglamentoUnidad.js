import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MenuVigilante from './MenuVigilante';
import { DataTable } from 'react-native-paper';

const ReglamentoUnidadVigilante = ({ navigation, route }) => {
  const { idVigilante } = route.params;
  const [reglas, setReglas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://192.168.0.103:3000/verReglas')
      .then(res => res.json())
      .then(data => {
        setReglas(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <MenuVigilante navigation={navigation} idVigilante={idVigilante} titulo="Reglamento de la unidad" />

      <View style={styles.content}>
        <Text style={styles.screenTitle}>Reglamento de la unidad</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 30 }} />
        ) : (
          <DataTable style={styles.table}>
            <DataTable.Header>
              <DataTable.Title style={{ flex: 1 }}>#</DataTable.Title>
              <DataTable.Title style={{ flex: 5 }}>Regla</DataTable.Title>
            </DataTable.Header>
            {reglas.map((item, idx) => (
              <DataTable.Row key={item._id || idx}>
                <DataTable.Cell style={{ flex: 1 }}>{idx + 1}</DataTable.Cell>
                <DataTable.Cell style={{ flex: 5 }}>
                  <Text style={styles.reglaText}>
                    {item.regla || item.nombre || ''}
                  </Text>
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
  reglaText: {
    flexWrap: 'wrap',
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
});

export default ReglamentoUnidadVigilante;