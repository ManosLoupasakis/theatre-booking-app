import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
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
      <Image
        source={{ uri: 'https://www.newsit.gr/wp-content/uploads/2020/10/THEATRO_PEIRAIA-scaled.jpg' }}
        style={styles.headerImage}
      />
      <View style={styles.headerOverlay} />

      <TextInput
        style={styles.searchInput}
        placeholder="Αναζήτηση θεάτρου ή τοποθεσίας..."
        value={search}
        onChangeText={setSearch}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#ffd700" style={{ marginTop: 40 }} />
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
  container: { flex: 1, backgroundColor: '#0d1f3c', paddingBottom: 16 },
  headerImage: { width: '100%', height: 200, resizeMode: 'cover' },
  headerOverlay: { height: 80, backgroundColor: 'rgba(13, 31, 60, 0.3)', paddingHorizontal: 16 },
  searchInput: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginHorizontal: 16, marginTop: -40, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#ffd700', elevation: 5, shadowColor: '#ffd700', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 14, padding: 16, marginBottom: 14, elevation: 4, shadowColor: '#ffd700', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 5, borderLeftWidth: 4, borderLeftColor: '#ffd700' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffd700', flex: 1 },
  locationBadge: { fontSize: 13, color: '#b8a8ff', marginLeft: 8 },
  cardDesc: { fontSize: 14, color: '#c5c5c5', marginBottom: 10, lineHeight: 20 },
  cardLink: { color: '#ffd700', fontWeight: 'bold', fontSize: 14 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 16, color: '#7a7a7a' },
});
