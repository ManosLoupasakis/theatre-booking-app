import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  ScrollView, ImageBackground,
} from 'react-native';
import { getSeats, createReservation } from '../services/api';
import { Toast, useToast } from '../components/Feedback';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const CAT_COLOR  = { vip: '#ffd700', standard: '#4488ee', balcony: '#33cc66' };
const CAT_LABEL  = { vip: 'VIP', standard: 'Standard', balcony: 'Balcony' };
const CAT_DIM    = { vip: 'rgba(255,215,0,0.12)', standard: 'rgba(68,136,238,0.10)', balcony: 'rgba(51,204,102,0.10)' };

// Fan effect: front rows (small idx) get more horizontal padding → narrower appearance
function rowPadding(rowLabel) {
  const idx = ALPHABET.indexOf(rowLabel);
  return Math.max(0, 22 - idx * 3);
}

export default function SeatsScreen({ route, navigation }) {
  const { showtime, show } = route.params;
  const [seats, setSeats]     = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const { toast, showToast }  = useToast();

  useEffect(() => {
    getSeats(showtime.showtime_id)
      .then(setSeats)
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [showtime.showtime_id]);

  function toggle(seat) {
    if (seat.status === 'reserved') return;
    setSelected(prev =>
      prev.includes(seat.seat_id)
        ? prev.filter(id => id !== seat.seat_id)
        : [...prev, seat.seat_id]
    );
  }

  async function handleBook() {
    if (!selected.length) return showToast('Επέλεξε τουλάχιστον μία θέση.', 'error');
    setBooking(true);
    try {
      await createReservation(showtime.showtime_id, selected);
      showToast(`Κράτηση για ${selected.length} θέση/εις ολοκληρώθηκε!`, 'success',
        () => navigation.navigate('Profile'));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBooking(false);
    }
  }

  // Build sorted rows
  const rowMap = {};
  seats.forEach(s => {
    if (!rowMap[s.row_label]) rowMap[s.row_label] = [];
    rowMap[s.row_label].push(s);
  });
  const sortedRows = Object.entries(rowMap)
    .sort(([a], [b]) => ALPHABET.indexOf(a) - ALPHABET.indexOf(b))
    .map(([row, rs], idx, arr) => {
      const section = rs[0]?.category;
      const prevSection = idx > 0 ? arr[idx - 1][1][0]?.category : null;
      return {
        row,
        seats: [...rs].sort((a, b) => a.seat_number - b.seat_number),
        section,
        newSection: section !== prevSection,
      };
    });

  const totalPrice = selected.length * parseFloat(showtime.price);

  return (
    <ImageBackground
      source={{ uri: 'https://www.newsit.gr/wp-content/uploads/2020/10/THEATRO_PEIRAIA-scaled.jpg' }}
      style={styles.container}
      imageStyle={styles.bgImg}
    >
      <View style={styles.overlay}>
        <Toast visible={toast.visible} message={toast.message} type={toast.type} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{show.title}</Text>
          <Text style={styles.headerSub}>{showtime.hall} · €{parseFloat(showtime.price).toFixed(2)} / θέση</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#ffd700" style={{ marginTop: 60 }} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

            {/* Stage */}
            <View style={styles.stageWrap}>
              <View style={styles.perspLeft} />
              <View style={styles.perspRight} />
              <View style={styles.stage}>
                <Text style={styles.stageEmoji}>🎭</Text>
                <Text style={styles.stageText}>Σ  Κ  Η  Ν  Η</Text>
              </View>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              {Object.entries(CAT_LABEL).map(([k, v]) => (
                <View key={k} style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: CAT_COLOR[k] }]} />
                  <Text style={styles.legendTxt}>{v}</Text>
                </View>
              ))}
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: '#444' }]} />
                <Text style={styles.legendTxt}>Κρατημένη</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, styles.legendSelected]} />
                <Text style={styles.legendTxt}>Επιλεγμένη</Text>
              </View>
            </View>

            {/* Rows */}
            <View style={styles.theatre}>
              {sortedRows.map(({ row, seats: rowSeats, section, newSection }) => {
                const pad  = rowPadding(row);
                const left = rowSeats.filter(s => s.seat_number <= 5);
                const right= rowSeats.filter(s => s.seat_number > 5);

                return (
                  <View key={row}>
                    {newSection && (
                      <View style={[styles.secDiv, { borderColor: CAT_COLOR[section] + '44' }]}>
                        <View style={[styles.secLine, { backgroundColor: CAT_COLOR[section] }]} />
                        <Text style={[styles.secLabel, { color: CAT_COLOR[section] }]}>
                          ── {CAT_LABEL[section]} ──
                        </Text>
                        <View style={[styles.secLine, { backgroundColor: CAT_COLOR[section] }]} />
                      </View>
                    )}

                    <View style={[
                      styles.row,
                      { paddingHorizontal: pad, backgroundColor: CAT_DIM[section] },
                    ]}>
                      <Text style={styles.rowLbl}>{row}</Text>

                      <View style={styles.half}>
                        {left.map(seat => {
                          const sel = selected.includes(seat.seat_id);
                          const res = seat.status === 'reserved';
                          return (
                            <TouchableOpacity
                              key={seat.seat_id}
                              style={[
                                styles.seat,
                                { backgroundColor: res ? '#3a3a3a' : CAT_COLOR[seat.category] },
                                sel && styles.seatSel,
                                res && styles.seatRes,
                              ]}
                              onPress={() => toggle(seat)}
                              disabled={res}
                            >
                              <Text style={[styles.seatN, sel && styles.seatNSel, res && styles.seatNRes]}>
                                {seat.seat_number}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      <View style={styles.aisle}>
                        <Text style={styles.aisleText}>│</Text>
                      </View>

                      <View style={styles.half}>
                        {right.map(seat => {
                          const sel = selected.includes(seat.seat_id);
                          const res = seat.status === 'reserved';
                          return (
                            <TouchableOpacity
                              key={seat.seat_id}
                              style={[
                                styles.seat,
                                { backgroundColor: res ? '#3a3a3a' : CAT_COLOR[seat.category] },
                                sel && styles.seatSel,
                                res && styles.seatRes,
                              ]}
                              onPress={() => toggle(seat)}
                              disabled={res}
                            >
                              <Text style={[styles.seatN, sel && styles.seatNSel, res && styles.seatNRes]}>
                                {seat.seat_number}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      <Text style={styles.rowLbl}>{row}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Viewer position */}
            <View style={styles.viewer}>
              <View style={styles.viewerLine} />
              <Text style={styles.viewerText}>👁  Θέαση από εδώ</Text>
              <View style={styles.viewerLine} />
            </View>

          </ScrollView>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerSub}>Επιλεγμένες</Text>
            <Text style={styles.footerMain}>
              {selected.length} θέσεις  ·  <Text style={styles.footerPrice}>€{totalPrice.toFixed(2)}</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.bookBtn, (booking || !selected.length) && styles.bookBtnOff]}
            onPress={handleBook}
            disabled={booking || !selected.length}
          >
            {booking
              ? <ActivityIndicator color="#0d1f3c" />
              : <Text style={styles.bookBtnTxt}>Κράτηση →</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgImg:     { resizeMode: 'cover', opacity: 0.25 },
  overlay:   { flex: 1, backgroundColor: 'rgba(4, 10, 24, 0.88)' },

  header:      { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  headerTitle: { color: '#ffd700', fontSize: 18, fontWeight: 'bold' },
  headerSub:   { color: '#b8a8ff', fontSize: 13, marginTop: 2 },

  scroll: { paddingBottom: 16 },

  // ── Stage ──────────────────────────────────────────────────────
  stageWrap: {
    alignItems: 'center', paddingVertical: 16,
    position: 'relative',
  },
  perspLeft: {
    position: 'absolute', top: 30, left: '10%',
    width: 2, height: 50,
    backgroundColor: '#ffd700', opacity: 0.15,
    transform: [{ rotate: '-30deg' }],
  },
  perspRight: {
    position: 'absolute', top: 30, right: '10%',
    width: 2, height: 50,
    backgroundColor: '#ffd700', opacity: 0.15,
    transform: [{ rotate: '30deg' }],
  },
  stage: {
    width: '52%',
    backgroundColor: '#150e00',
    borderWidth: 2, borderColor: '#ffd700',
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    paddingVertical: 12, alignItems: 'center',
    shadowColor: '#ffd700', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7, shadowRadius: 18, elevation: 14,
  },
  stageEmoji: { fontSize: 22, marginBottom: 2 },
  stageText:  { color: '#ffd700', fontWeight: 'bold', fontSize: 12, letterSpacing: 3 },

  // ── Legend ──────────────────────────────────────────────────────
  legend: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 10,
    paddingHorizontal: 16, paddingBottom: 10,
  },
  legendItem:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendBox:     { width: 14, height: 14, borderRadius: 3 },
  legendSelected:{ backgroundColor: '#fff', borderWidth: 2, borderColor: '#ffd700' },
  legendTxt:     { color: '#999', fontSize: 11 },

  // ── Theatre ──────────────────────────────────────────────────────
  theatre: { paddingHorizontal: 6 },

  secDiv: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 10, marginBottom: 4, gap: 6,
    paddingHorizontal: 8, borderTopWidth: 1,
    paddingTop: 8,
  },
  secLine:  { flex: 1, height: 1 },
  secLabel: { fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },

  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3, borderRadius: 4, paddingVertical: 2,
  },
  rowLbl: { width: 16, textAlign: 'center', color: '#666', fontSize: 10, fontWeight: '700' },

  half:  { flexDirection: 'row' },
  aisle: { width: 14, alignItems: 'center', justifyContent: 'center' },
  aisleText: { color: '#2a3a5b', fontSize: 18, lineHeight: 20 },

  // ── Seats ──────────────────────────────────────────────────────
  seat: {
    width: 26, height: 26, borderRadius: 5,
    margin: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  seatSel: {
    backgroundColor: '#fff',
    borderWidth: 2, borderColor: '#ffd700',
    shadowColor: '#ffd700', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 6, elevation: 8,
  },
  seatRes: { opacity: 0.35 },
  seatN:    { fontSize: 8, fontWeight: '800', color: '#111' },
  seatNSel: { color: '#0d1f3c' },
  seatNRes: { color: '#666' },

  // ── Viewer ──────────────────────────────────────────────────────
  viewer: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 14, marginHorizontal: 20, gap: 8,
  },
  viewerLine: { flex: 1, height: 1, backgroundColor: '#2a3a5b' },
  viewerText: { color: '#3a4a6b', fontSize: 11, letterSpacing: 1 },

  // ── Footer ──────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderTopWidth: 1, borderColor: '#1a2a4b',
    backgroundColor: 'rgba(4,10,24,0.97)',
  },
  footerSub:   { color: '#888', fontSize: 12 },
  footerMain:  { color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 2 },
  footerPrice: { color: '#8eff00', fontWeight: 'bold' },
  bookBtn:    { backgroundColor: '#ffd700', borderRadius: 12, paddingVertical: 13, paddingHorizontal: 24 },
  bookBtnOff: { backgroundColor: '#2a3a5b' },
  bookBtnTxt: { color: '#0d1f3c', fontWeight: 'bold', fontSize: 16 },
});
