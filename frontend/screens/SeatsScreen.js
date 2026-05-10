import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { getSeats, createReservation } from '../services/api';

const CATEGORY_COLOR = { vip: '#ffd700', standard: '#e3f2fd', balcony: '#e8f5e9' };
const CATEGORY_LABEL = { vip: 'VIP', standard: 'Standard', balcony: 'Balcony' };

export default function SeatsScreen({ route, navigation }) {
  const { showtime, show } = route.params;
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getSeats(showtime.showtime_id);
        setSeats(data);
      } catch (err) {
        Alert.alert('Σφάλμα', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [showtime.showtime_id]);

  function toggleSeat(seat) {
    if (seat.status === 'reserved') return;
    setSelected(prev =>
      prev.includes(seat.seat_id)
        ? prev.filter(id => id !== seat.seat_id)
        : [...prev, seat.seat_id]
    );
  }

  async function handleBook() {
    if (selected.length === 0) return Alert.alert('Επιλογή', 'Επέλεξε τουλάχιστον μία θέση.');
    setBooking(true);
    try {
      await createReservation(showtime.showtime_id, selected);
      Alert.alert('Επιτυχία!', `Η κράτησή σου ολοκληρώθηκε για ${selected.length} θέση/εις.`, [
        { text: 'OK', onPress: () => navigation.navigate('Profile') }
      ]);
    } catch (err) {
      Alert.alert('Σφάλμα κράτησης', err.message);
    } finally {
      setBooking(false);
    }
  }

  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.row_label]) acc[seat.row_label] = [];
    acc[seat.row_label].push(seat);
    return acc;
  }, {});

  const totalPrice = selected.length * parseFloat(showtime.price);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{show.title}</Text>
      <Text style={styles.subtitle}>Επιλογή Θέσεων · {showtime.hall}</Text>

      <View style={styles.legend}>
        {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
          <View key={k} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: CATEGORY_COLOR[k] }]} />
            <Text style={styles.legendText}>{v}</Text>
          </View>
        ))}
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ccc' }]} />
          <Text style={styles.legendText}>Κρατημένη</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1a237e" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.stageLabel}>— ΣΚΗΝΗ —</Text>
          {Object.entries(rows).map(([row, rowSeats]) => (
            <View key={row} style={styles.row}>
              <Text style={styles.rowLabel}>{row}</Text>
              {rowSeats.map(seat => {
                const isSelected = selected.includes(seat.seat_id);
                const isReserved = seat.status === 'reserved';
                return (
                  <TouchableOpacity
                    key={seat.seat_id}
                    style={[
                      styles.seat,
                      { backgroundColor: isReserved ? '#ccc' : isSelected ? '#1a237e' : CATEGORY_COLOR[seat.category] },
                    ]}
                    onPress={() => toggleSeat(seat)}
                    disabled={isReserved}
                  >
                    <Text style={[styles.seatText, isSelected && { color: '#fff' }]}>{seat.seat_number}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {selected.length} θέση/εις · <Text style={styles.priceText}>€{totalPrice.toFixed(2)}</Text>
        </Text>
        <TouchableOpacity
          style={[styles.bookBtn, (booking || selected.length === 0) && styles.bookBtnDisabled]}
          onPress={handleBook}
          disabled={booking || selected.length === 0}
        >
          {booking ? <ActivityIndicator color="#fff" /> : <Text style={styles.bookBtnText}>Κράτηση</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1a237e' },
  subtitle: { fontSize: 13, color: '#5c6bc0', marginBottom: 12 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 14, height: 14, borderRadius: 4 },
  legendText: { fontSize: 12, color: '#5f6368' },
  stageLabel: { textAlign: 'center', color: '#9e9e9e', marginBottom: 16, fontWeight: '600', letterSpacing: 2 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'center' },
  rowLabel: { width: 24, fontWeight: 'bold', color: '#5c6bc0', marginRight: 6 },
  seat: { width: 36, height: 36, borderRadius: 6, margin: 3, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#bbb' },
  seatText: { fontSize: 12, fontWeight: '600', color: '#333' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderColor: '#e0e0e0', marginTop: 8 },
  footerText: { fontSize: 16, color: '#333' },
  priceText: { fontWeight: 'bold', color: '#2e7d32' },
  bookBtn: { backgroundColor: '#1a237e', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 },
  bookBtnDisabled: { backgroundColor: '#9fa8da' },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
