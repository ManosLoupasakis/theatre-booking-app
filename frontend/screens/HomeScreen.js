import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getTheatres } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [theatres, setTheatres] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTheatres = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTheatres(search);
      setTheatres(data);
    } catch (err) {
      Alert.alert('Σφάλμα', err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchTheatres(); }, [fetchTheatres]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Shows', { theatre: item })}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.locationBadge}>📍 {item.location}</Text>
      </View>
      {item.description ? <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text> : null}
      <Text style={styles.cardLink}>Δείτε παραστάσεις →</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Αναζήτηση θεάτρου ή τοποθεσίας..."
        value={search}
        onChangeText={setSearch}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#1a237e" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={theatres}
          keyExtractor={item => String(item.theatre_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>Δεν βρέθηκαν θέατρα.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 16 },
  searchInput: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 16, borderWidth: 1, borderColor: '#c5cae9' },
  list: { paddingBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a237e', flex: 1 },
  locationBadge: { fontSize: 13, color: '#5c6bc0', marginLeft: 8 },
  cardDesc: { fontSize: 14, color: '#5f6368', marginBottom: 10, lineHeight: 20 },
  cardLink: { color: '#1a237e', fontWeight: 'bold', fontSize: 14 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 16, color: '#9e9e9e' },
});
