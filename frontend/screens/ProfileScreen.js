import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { getMyReservations, cancelReservation, logout } from '../services/api';

export default function ProfileScreen({ user, onLogout }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyReservations();
      setReservations(data);
    } catch (err) {
      Alert.alert('Σφάλμα', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  async function handleCancel(id) {
    try {
      await cancelReservation(id);
      setConfirmId(null);
      fetchReservations();
    } catch (err) {
      setConfirmId(null);
      Alert.alert('Σφάλμα', err.message);
    }
  }

  async function handleLogout() {
    await logout();
    onLogout();
  }

  function formatDate(dt) {
    return new Date(dt).toLocaleString('el-GR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  const renderItem = ({ item }) => {
    const isFuture = new Date(item.datetime) > new Date();
    return (
      <View style={[styles.card, item.status === 'cancelled' && styles.cardCancelled]}>
        <Text style={styles.showTitle}>{item.show_title}</Text>
        <Text style={styles.info}>🏛 {item.theatre_name}</Text>
        <Text style={styles.info}>📅 {formatDate(item.datetime)}</Text>
        <Text style={styles.info}>💺 {item.seats || '—'}</Text>
        <Text style={styles.info}>💶 €{parseFloat(item.price).toFixed(2)} / θέση</Text>
        <View style={styles.statusRow}>
          <View style={[styles.badge, item.status === 'cancelled' ? styles.badgeCancelled : styles.badgeConfirmed]}>
            <Text style={styles.badgeText}>{item.status === 'confirmed' ? 'Επιβεβαιωμένη' : 'Ακυρωμένη'}</Text>
          </View>
          {item.status === 'confirmed' && isFuture && confirmId !== item.reservation_id && (
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmId(item.reservation_id)}>
              <Text style={styles.cancelBtnText}>Ακύρωση</Text>
            </TouchableOpacity>
          )}
        </View>
        {confirmId === item.reservation_id && (
          <View style={styles.confirmRow}>
            <Text style={styles.confirmText}>Είσαι σίγουρος;</Text>
            <TouchableOpacity style={styles.confirmYes} onPress={() => handleCancel(item.reservation_id)}>
              <Text style={styles.confirmYesText}>Ναι, ακύρωση</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmNo} onPress={() => setConfirmId(null)}>
              <Text style={styles.confirmNoText}>Όχι</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Αποσύνδεση</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Κρατήσεις μου</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#ffd700" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={item => String(item.reservation_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>Δεν έχεις κρατήσεις ακόμα.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1f3c', padding: 16 },
  profileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: 14, padding: 16, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#ffd700' },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#ffd700' },
  userEmail: { fontSize: 13, color: '#b8a8ff', marginTop: 2 },
  logoutBtn: { backgroundColor: '#ffd700', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  logoutText: { color: '#0d1f3c', fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#ffd700', marginBottom: 12 },
  list: { paddingBottom: 20 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#ffd700', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  cardCancelled: { opacity: 0.55 },
  showTitle: { fontSize: 16, fontWeight: 'bold', color: '#ffd700', marginBottom: 6 },
  info: { fontSize: 13, color: '#c5c5c5', marginBottom: 3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  badgeConfirmed: { backgroundColor: '#2d5016' },
  badgeCancelled: { backgroundColor: '#5d2e3d' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  cancelBtn: { backgroundColor: '#5d2e3d', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  cancelBtnText: { color: '#ff8a8a', fontWeight: '600', fontSize: 13 },
  confirmRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  confirmText: { fontSize: 13, color: '#c5c5c5', flex: 1 },
  confirmYes: { backgroundColor: '#c62828', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  confirmYesText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  confirmNo: { backgroundColor: '#444', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  confirmNoText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 16, color: '#666' },
});
