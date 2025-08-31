import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Avatar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MenuVigilante from './MenuVigilante';

const Alertas = ({ navigation, route }) => {
  const { idVigilante } = route.params;
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    fetch('http://192.168.0.103:3000/verAnuncios')
      .then(res => res.json())
      .then(data => setAlertas(data))
      .catch(() => setAlertas([]));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <MenuVigilante navigation={navigation} idVigilante={idVigilante} titulo="Alertas" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.screenTitle}>Alertas</Text>
        {alertas.length === 0 && (
          <Text style={styles.screenDescription}>No hay alertas recientes.</Text>
        )}
        {alertas.map((alerta, idx) => (
          <Card key={alerta._id || idx} style={styles.card}>
            <Card.Title
              title={alerta.titulo || 'Sin título'}
              subtitle={alerta.fechaEnvio ? new Date(alerta.fechaEnvio).toLocaleString() : ''}
              left={props => <Avatar.Icon {...props} icon="alert" color="#fff" style={{ backgroundColor: '#e34040ff' }} />}
            />
            <Card.Content>
              <Text style={styles.contenido}>{alerta.contenido}</Text>
              {alerta.tipo === 'Edificio' && (
                <Text style={styles.edificioLabel}>Solo para: {alerta.nombreEdificio}</Text>
              )}
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
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
  screenDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
    elevation: 3,
    borderRadius: 12,
    width: '100%',
  },
  contenido: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
  edificioLabel: {
    fontSize: 13,
    color: '#1976d2',
    marginTop: 6,
    fontStyle: 'italic',
  },
});

export default Alertas;