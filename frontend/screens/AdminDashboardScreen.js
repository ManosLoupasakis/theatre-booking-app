import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import { adminGetStats } from '../services/api';

const CARDS = [
  { key: 'theatres',    label: 'Θέατρα',      icon: '🏛️',  screen: 'AdminTheatres' },
  { key: 'shows',       label: 'Παραστάσεις', icon: '🎭',  screen: 'AdminShows' },
  { key: 'showtimes',   label: 'Ωράρια',      icon: '🕐',  screen: 'AdminShowtimes' },
  { key: 'reservations',label: 'Κρατήσεις',   icon: '🎫',  screen: 'AdminReservations' },
  { key: 'users',       label: 'Χρήστες',     icon: '👥',  screen: 'AdminUsers' },
];

export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetStats()
      .then(setStats)
      .catch(e => Alert.alert('Σφάλμα', e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Πίνακας Ελέγχου</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#ffd700" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.grid}>
          {CARDS.map(card => (
            <TouchableOpacity
              key={card.key}
              style={styles.card}
              onPress={() => navigation.navigate(card.screen)}
            >
              <Text style={styles.icon}>{card.icon}</Text>
              <Text style={styles.count}>{stats?.[card.key] ?? '–'}</Text>
              <Text style={styles.label}>{card.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1f3c' },
  content:   { padding: 16, paddingBottom: 40 },
  title:     { color: '#ffd700', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  card: {
    backgroundColor: '#1a3a6b',
    borderRadius: 12,
    padding: 20,
    width: '47%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffd700',
    marginBottom: 4,
  },
  icon:  { fontSize: 32, marginBottom: 8 },
  count: { color: '#ffd700', fontSize: 28, fontWeight: 'bold' },
  label: { color: '#ccc', fontSize: 13, marginTop: 4 },
});
