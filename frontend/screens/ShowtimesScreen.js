import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import { getShowtimes } from '../services/api';
import { Toast, useToast } from '../components/Feedback';

export default function ShowtimesScreen({ route, navigation }) {
  const { show } = route.params;
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast, showToast } = useToast();

  const fetchShowtimes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getShowtimes(show.show_id);
      setShowtimes(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [show.show_id]);

  useFocusEffect(useCallback(() => { fetchShowtimes(); }, [fetchShowtimes]));

  const onRefresh = useCallback(() => { setRefreshing(true); fetchShowtimes(); }, [fetchShowtimes]);

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
    <ImageBackground
      source={{ uri: 'https://www.newsit.gr/wp-content/uploads/2020/10/THEATRO_PEIRAIA-scaled.jpg' }}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>{show.title}</Text>
        <Text style={styles.subtitle}>Διαθέσιμες Ώρες</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#ffd700" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffd700" colors={['#ffd700']} />}
            data={showtimes}
            keyExtractor={item => String(item.showtime_id)}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>Δεν υπάρχουν διαθέσιμες ώρες.</Text>}
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
  title: { fontSize: 20, fontWeight: 'bold', color: '#ffd700', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#b8a8ff', marginBottom: 16 },
  list: { paddingBottom: 20 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 3, shadowColor: '#ffd700', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, borderLeftWidth: 3, borderLeftColor: '#ffd700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  datetime: { fontSize: 16, fontWeight: '600', color: '#ffd700' },
  price: { fontSize: 18, fontWeight: 'bold', color: '#8eff00' },
  hall: { fontSize: 14, color: '#c5c5c5', marginBottom: 10 },
  link: { color: '#ffd700', fontWeight: 'bold', fontSize: 14 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 16, color: '#fff' },
});
