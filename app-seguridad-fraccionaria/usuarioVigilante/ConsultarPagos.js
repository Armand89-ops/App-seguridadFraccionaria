import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MenuVigilante from './MenuVigilante';

const ConsultarPagos = ({ navigation, route }) => {
  const { idVigilante } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <MenuVigilante navigation={navigation} idVigilante={idVigilante} titulo="Consultar Pagos" />

      <View style={styles.content}>
        <Text style={styles.screenTitle}>Consultar Pagos</Text>
        <Text style={styles.screenDescription}>
          AAquí están los pagos
        </Text>
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
});

export default ConsultarPagos;