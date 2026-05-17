import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { adminGetReservations, adminCancelReservation } from '../services/api';

export default function AdminReservationsScreen() {
  const [all, setAll]         = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  const load = useCallback(() => {
    setLoading(true);
    adminGetReservations()
      .then(data => { setAll(data); setFiltered(data); })
      .catch(e => Alert.alert('Σφάλμα', e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(all); return; }
    const q = search.toLowerCase();
    setFiltered(all.filter(r =>
      r.user_name?.toLowerCase().includes(q) ||
      r.user_email?.toLowerCase().includes(q) ||
      r.show_title?.toLowerCase().includes(q) ||
      r.theatre_name?.toLowerCase().includes(q)
    ));
  }, [search, all]);

  function confirmCancel(item) {
    Alert.alert('Ακύρωση', `Ακύρωση κράτησης #${item.reservation_id};`, [
      { text: 'Όχι', style: 'cancel' },
      {
        text: 'Ακύρωση', style: 'destructive',
        onPress: async () => {
          try { await adminCancelReservation(item.reservation_id); load(); }
          catch (e) { Alert.alert('Σφάλμα', e.message); }
        },
      },
    ]);
  }

  function formatDate(dt) {
    if (!dt) return '';
    return new Date(dt).toLocaleString('el-GR', { dateStyle: 'short', timeStyle: 'short' });
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Αναζήτηση χρήστη, παράστασης…"
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading
        ? <ActivityIndicator color="#ffd700" size="large" style={{ marginTop: 40 }} />
        : (
          <FlatList
            data={filtered}
            keyExtractor={i => String(i.reservation_id)}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View style={[styles.card, item.status === 'cancelled' && styles.cardCancelled]}>
                <View style={styles.info}>
                  <View style={styles.row}>
                    <Text style={styles.id}>#{item.reservation_id}</Text>
                    <View style={[styles.badge, item.status === 'confirmed' ? styles.badgeOk : styles.badgeCancel]}>
                      <Text style={styles.badgeText}>
                        {item.status === 'confirmed' ? 'Επιβεβαιωμένη' : 'Ακυρωμένη'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.name}>{item.show_title}</Text>
                  <Text style={styles.sub}>{item.theatre_name} · {formatDate(item.datetime)}</Text>
                  <Text style={styles.sub}>👤 {item.user_name} ({item.user_email})</Text>
                  <Text style={styles.sub}>🪑 {item.seats || '–'}</Text>
                </View>
                {item.status === 'confirmed' && (
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => confirmCancel(item)}>
                    <Text style={styles.cancelBtnText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#0d1f3c' },
  searchWrap:    { padding: 16, paddingBottom: 0 },
  search:        { backgroundColor: '#1a3a6b', color: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#2a4a8b' },
  card: {
    backgroundColor: '#1a3a6b', borderRadius: 10, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2a4a8b',
  },
  cardCancelled: { opacity: 0.55 },
  info:          { flex: 1 },
  row:           { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  id:            { color: '#888', fontSize: 12 },
  badge:         { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeOk:       { backgroundColor: '#1a6b2a' },
  badgeCancel:   { backgroundColor: '#6b1a1a' },
  badgeText:     { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  name:          { color: '#ffd700', fontSize: 14, fontWeight: 'bold' },
  sub:           { color: '#aaa', fontSize: 12, marginTop: 2 },
  cancelBtn:     { backgroundColor: '#8b0000', borderRadius: 20, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  cancelBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
