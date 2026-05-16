import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getShows } from '../services/api';

export default function ShowsScreen({ route, navigation }) {
  const { theatre } = route.params;
  const [shows, setShows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const data = await getShows({ theatreId: theatre.theatre_id, title: search });
        setShows(data);
      } catch (err) {
        Alert.alert('Σφάλμα', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [search, theatre.theatre_id]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Showtimes', { show: item })}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.meta}>
        <Text style={styles.metaText}>⏱ {item.duration} λεπτά</Text>
        <Text style={styles.metaText}>🔞 {item.age_rating}</Text>
      </View>
      {item.description ? <Text style={styles.desc} numberOfLines={2}>{item.description}</Text> : null}
      <Text style={styles.link}>Δείτε ώρες →</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{theatre.name}</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Αναζήτηση παράστασης..."
        value={search}
        onChangeText={setSearch}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0d1f3c" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={shows}
          keyExtractor={item => String(item.show_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>Δεν βρέθηκαν παραστάσεις.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1f3c', padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', color: '#0d1f3c', marginBottom: 12 },
  searchInput: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 16, borderWidth: 1, borderColor: '#c5cae9' },
  list: { paddingBottom: 20 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 14, padding: 16, marginBottom: 14, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#0d1f3c', marginBottom: 8 },
  meta: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  metaText: { fontSize: 13, color: '#b8a8ff', fontWeight: '500' },
  desc: { fontSize: 14, color: '#c5c5c5', lineHeight: 20, marginBottom: 10 },
  link: { color: '#0d1f3c', fontWeight: 'bold', fontSize: 14 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 16, color: '#666' },
});
