import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, ImageBackground, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMyReservations, cancelReservation, logout } from '../services/api';
import { Toast, useToast, ConfirmModal, useConfirm } from '../components/Feedback';

export default function ProfileScreen({ user, onLogout }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast, showToast } = useToast();
  const { confirm, showConfirm, closeConfirm } = useConfirm();

  const fetchReservations = useCallback(async () => {
    try {
      const data = await getMyReservations();
      setReservations(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchReservations();
    }, [fetchReservations])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReservations();
  }, [fetchReservations]);

  function requestCancel(item) {
    showConfirm({
      title: 'Ακύρωση Κράτησης',
      message: `Θέλεις σίγουρα να ακυρώσεις την κράτησή σου για "${item.show_title}";`,
      confirmText: 'Ακύρωση',
      isDestructive: true,
      onConfirm: async () => {
        closeConfirm();
        try {
          await cancelReservation(item.reservation_id);
          showToast('Η κράτηση ακυρώθηκε επιτυχώς', 'success');
          fetchReservations();
        } catch (err) {
          showToast(err.message, 'error');
        }
      },
    });
  }

  async function handleLogout() {
    await logout();
    onLogout();
  }

  function formatDate(dt) {
    return new Date(dt).toLocaleString('el-GR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  const renderItem = ({ item }) => {
    const isPast = new Date(item.datetime) <= new Date();
    return (
      <View style={[styles.card, item.status === 'cancelled' && styles.cardCancelled]}>
        <Text style={styles.showTitle}>{item.show_title}</Text>
        <Text style={styles.info}>🏛 {item.theatre_name}</Text>
        <Text style={styles.info}>📅 {formatDate(item.datetime)}</Text>
        <Text style={styles.info}>💺 {item.seats || '—'}</Text>
        <Text style={styles.info}>💶 €{parseFloat(item.price).toFixed(2)} / θέση</Text>
        <View style={styles.statusRow}>
          <View style={[styles.badge, item.status === 'cancelled' ? styles.badgeCancelled : isPast ? styles.badgePast : styles.badgeConfirmed]}>
            <Text style={styles.badgeText}>
              {item.status === 'cancelled' ? 'Ακυρωμένη' : isPast ? 'Ολοκληρωμένη' : 'Επιβεβαιωμένη'}
            </Text>
          </View>
          {item.status === 'confirmed' && !isPast && (
            <TouchableOpacity style={styles.cancelBtn} onPress={() => requestCancel(item)}>
              <Text style={styles.cancelBtnText}>Ακύρωση</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={{ uri: 'https://www.newsit.gr/wp-content/uploads/2020/10/THEATRO_PEIRAIA-scaled.jpg' }}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay}>
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
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffd700" colors={['#ffd700']} />
            }
          />
        )}
      </View>

      <ConfirmModal
        visible={confirm.visible}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        isDestructive={confirm.isDestructive}
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
      />
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { resizeMode: 'cover', opacity: 0.4 },
  overlay: { flex: 1, backgroundColor: 'rgba(13, 31, 60, 0.5)', padding: 16 },
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
  badgePast:      { backgroundColor: '#3a3a3a' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  cancelBtn: { backgroundColor: '#5d2e3d', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  cancelBtnText: { color: '#ff8a8a', fontWeight: '600', fontSize: 13 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 16, color: '#fff' },
});
