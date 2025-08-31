import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Avatar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MenuResidente from './MenuResidente';

const ModuloAnuncios = ({ navigation, route }) => {
  const { idResidente } = route.params;
  const [nombreEdificioResidente, setNombreEdificioResidente] = useState('');
  const [anuncios, setAnuncios] = useState([]);

  useEffect(() => {
    // 1. Obtener datos del residente
    fetch(`http://192.168.0.103:3000/verResidente/${idResidente}`)
      .then(res => res.json())
      .then(residente => {
        setNombreEdificioResidente(residente.Edificio || '');
        // 2. pedir los anuncios filtrados
        fetch(`http://192.168.0.103:3000/verAnunciosResidente/${encodeURIComponent(residente.Edificio)}`)
          .then(res => res.json())
          .then(data => setAnuncios(data))
          .catch(() => setAnuncios([]));
      })
      .catch(() => setNombreEdificioResidente(''));
  }, [idResidente]);

  return (
    <SafeAreaView style={styles.container}>
      <MenuResidente navigation={navigation} idResidente={idResidente} titulo="Anuncios" />

      <ScrollView contentContainerStyle={styles.content}>
        {anuncios.map((anuncio, idx) => (
          <Card key={anuncio._id || idx} style={styles.card}>
            <Card.Title
              title={anuncio.titulo || 'Sin título'}
              subtitle={anuncio.fechaEnvio ? new Date(anuncio.fechaEnvio).toLocaleString() : ''}
              left={props => <Avatar.Icon {...props} icon="alert" color="#fff" style={{ backgroundColor: '#e34040ff' }} />}
            />
            <Card.Content>
              <Text style={styles.contenido}>{anuncio.contenido}</Text>
              {anuncio.tipo === 'Edificio' && (
                <Text style={styles.edificioLabel}>Solo para: {anuncio.nombreEdificio}</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
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
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default ModuloAnuncios;