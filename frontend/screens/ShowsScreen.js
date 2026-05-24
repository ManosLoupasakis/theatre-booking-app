import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TextInput, FlatList, RefreshControl, TouchableOpacity, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import { getShows } from '../services/api';
import { Toast, useToast } from '../components/Feedback';

export default function ShowsScreen({ route, navigation }) {
  const { theatre } = route.params;
  const [shows, setShows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast, showToast } = useToast();

  const fetchShows = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getShows({ theatreId: theatre.theatre_id, title: search });
      setShows(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, theatre.theatre_id]);

  useFocusEffect(useCallback(() => { fetchShows(); }, [fetchShows]));

  const onRefresh = useCallback(() => { setRefreshing(true); fetchShows(); }, [fetchShows]);

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
    <ImageBackground
      source={{ uri: 'https://www.newsit.gr/wp-content/uploads/2020/10/THEATRO_PEIRAIA-scaled.jpg' }}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <Text style={styles.header}>{theatre.name}</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Αναζήτηση παράστασης..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#999"
        />
        {loading ? (
          <ActivityIndicator size="large" color="#ffd700" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffd700" colors={['#ffd700']} />}
            data={shows}
            keyExtractor={item => String(item.show_id)}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={styles.empty}>Δεν βρέθηκαν παραστάσεις.</Text>}
          />
        )}
        <Toast visible={toast.visible} message={toast.message} type={toast.type} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { resizeMode: 'cover', opacity: 0.4 },
  overlay: { flex: 1, backgroundColor: 'rgba(13, 31, 60, 0.5)', padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', color: '#ffd700', marginBottom: 12 },
  searchInput: { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 16, borderWidth: 1.5, borderColor: '#ffd700', color: '#333', placeholderTextColor: '#999' },
  list: { paddingBottom: 20 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 14, padding: 16, marginBottom: 14, elevation: 3, shadowColor: '#ffd700', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, borderLeftWidth: 3, borderLeftColor: '#ffd700' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffd700', marginBottom: 8 },
  meta: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  metaText: { fontSize: 13, color: '#b8a8ff', fontWeight: '500' },
  desc: { fontSize: 14, color: '#c5c5c5', lineHeight: 20, marginBottom: 10 },
  link: { color: '#ffd700', fontWeight: 'bold', fontSize: 14 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 16, color: '#fff' },
});
