import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getShowtimes } from '../services/api';

export default function ShowtimesScreen({ route, navigation }) {
  const { show } = route.params;
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getShowtimes(show.show_id);
        setShowtimes(data);
      } catch (err) {
        Alert.alert('Σφάλμα', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [show.show_id]);

  function formatDate(dt) {
    const d = new Date(dt);
    return d.toLocaleString('el-GR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Seats', { showtime: item, show })}>
      <View style={styles.row}>
        <Text style={styles.datetime}>📅 {formatDate(item.datetime)}</Text>
        <Text style={styles.price}>€{parseFloat(item.price).toFixed(2)}</Text>
      </View>
      <Text style={styles.hall}>🏛 {item.hall}</Text>
      <Text style={styles.link}>Επιλογή θέσεων →</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{show.title}</Text>
      <Text style={styles.subtitle}>Διαθέσιμες Ώρες</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#1a237e" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={showtimes}
          keyExtractor={item => String(item.showtime_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Δεν υπάρχουν διαθέσιμες ώρες.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1a237e', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#5c6bc0', marginBottom: 16 },
  list: { paddingBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  datetime: { fontSize: 16, fontWeight: '600', color: '#202124' },
  price: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32' },
  hall: { fontSize: 14, color: '#5f6368', marginBottom: 10 },
  link: { color: '#1a237e', fontWeight: 'bold', fontSize: 14 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 16, color: '#9e9e9e' },
});
