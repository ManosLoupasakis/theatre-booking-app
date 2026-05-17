import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import {
  adminGetShowtimes, adminCreateShowtime, adminUpdateShowtime,
  adminDeleteShowtime, adminGenerateSeats, adminGetShows,
} from '../services/api';

const EMPTY_ST = { show_id: '', datetime: '', hall: '', price: '' };
const EMPTY_SEATS = { rows: '4', seatsPerRow: '5', vipRows: 'A', balconyRows: 'D' };

export default function AdminShowtimesScreen() {
  const [showtimes, setShowtimes] = useState([]);
  const [shows, setShows]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [seatsModal, setSeatsModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [selectedSt, setSelectedSt] = useState(null);
  const [form, setForm]           = useState(EMPTY_ST);
  const [seatsForm, setSeatsForm] = useState(EMPTY_SEATS);
  const [saving, setSaving]       = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([adminGetShowtimes(), adminGetShows()])
      .then(([st, s]) => { setShowtimes(st); setShows(s); })
      .catch(e => Alert.alert('Σφάλμα', e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY_ST, show_id: shows[0]?.show_id || '' });
    setModal(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      show_id: item.show_id,
      datetime: item.datetime ? item.datetime.replace('T', ' ').slice(0, 16) : '',
      hall: item.hall,
      price: String(item.price),
    });
    setModal(true);
  }

  function openSeats(item) {
    setSelectedSt(item);
    setSeatsForm(EMPTY_SEATS);
    setSeatsModal(true);
  }

  async function save() {
    if (!form.show_id || !form.datetime || !form.hall || !form.price) {
      Alert.alert('Σφάλμα', 'Όλα τα πεδία είναι υποχρεωτικά');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      if (editing) await adminUpdateShowtime(editing.showtime_id, payload);
      else await adminCreateShowtime(payload);
      setModal(false);
      load();
    } catch (e) {
      Alert.alert('Σφάλμα', e.message);
    } finally {
      setSaving(false);
    }
  }

  async function generateSeats() {
    setSaving(true);
    try {
      const payload = {
        rows: parseInt(seatsForm.rows, 10),
        seatsPerRow: parseInt(seatsForm.seatsPerRow, 10),
        vipRows: seatsForm.vipRows,
        balconyRows: seatsForm.balconyRows,
      };
      const result = await adminGenerateSeats(selectedSt.showtime_id, payload);
      Alert.alert('Επιτυχία', `Δημιουργήθηκαν ${result.created} θέσεις`);
      setSeatsModal(false);
      load();
    } catch (e) {
      Alert.alert('Σφάλμα', e.message);
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(item) {
    Alert.alert('Διαγραφή', 'Διαγραφή ωραρίου;', [
      { text: 'Ακύρωση', style: 'cancel' },
      {
        text: 'Διαγραφή', style: 'destructive',
        onPress: async () => {
          try { await adminDeleteShowtime(item.showtime_id); load(); }
          catch (e) { Alert.alert('Σφάλμα', e.message); }
        },
      },
    ]);
  }

  function formatDate(dt) {
    if (!dt) return '';
    const d = new Date(dt);
    return d.toLocaleString('el-GR', { dateStyle: 'short', timeStyle: 'short' });
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
        <Text style={styles.addBtnText}>+ Νέο Ωράριο</Text>
      </TouchableOpacity>

      {loading
        ? <ActivityIndicator color="#ffd700" size="large" style={{ marginTop: 40 }} />
        : (
          <FlatList
            data={showtimes}
            keyExtractor={i => String(i.showtime_id)}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.show_title}</Text>
                  <Text style={styles.sub}>{item.theatre_name}</Text>
                  <Text style={styles.sub}>{formatDate(item.datetime)} · {item.hall} · {item.price}€</Text>
                  <Text style={styles.seats}>🪑 {item.seat_count} θέσεις</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => openSeats(item)} style={styles.iconBtn}>
                    <Text style={{ fontSize: 18 }}>🪑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
                    <Text style={{ fontSize: 18 }}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.iconBtn}>
                    <Text style={{ fontSize: 18 }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )
      }

      {/* Showtime form modal */}
      <Modal visible={modal} animationType="slide" transparent>
        <ScrollView contentContainerStyle={styles.overlayScroll}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? 'Επεξεργασία Ωραρίου' : 'Νέο Ωράριο'}</Text>

            <Text style={styles.fieldLabel}>Παράσταση *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {shows.map(s => (
                <TouchableOpacity
                  key={s.show_id}
                  style={[styles.pill, form.show_id == s.show_id && styles.pillActive]}
                  onPress={() => setForm(f => ({ ...f, show_id: s.show_id }))}
                >
                  <Text style={[styles.pillText, form.show_id == s.show_id && styles.pillTextActive]}>
                    {s.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.input} placeholder="Ημ/νία ώρα (YYYY-MM-DD HH:MM) *" placeholderTextColor="#888"
              value={form.datetime} onChangeText={v => setForm(f => ({ ...f, datetime: v }))}
            />
            <TextInput
              style={styles.input} placeholder="Αίθουσα *" placeholderTextColor="#888"
              value={form.hall} onChangeText={v => setForm(f => ({ ...f, hall: v }))}
            />
            <TextInput
              style={styles.input} placeholder="Τιμή (€) *" placeholderTextColor="#888"
              keyboardType="numeric" value={form.price}
              onChangeText={v => setForm(f => ({ ...f, price: v }))}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)}>
                <Text style={styles.cancelBtnText}>Ακύρωση</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? '...' : 'Αποθήκευση'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>

      {/* Seats generation modal */}
      <Modal visible={seatsModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Δημιουργία Θέσεων</Text>
            <Text style={styles.fieldLabel}>Για: {selectedSt?.show_title}</Text>

            <TextInput
              style={styles.input} placeholder="Αριθμός σειρών" placeholderTextColor="#888"
              keyboardType="numeric" value={seatsForm.rows}
              onChangeText={v => setSeatsForm(f => ({ ...f, rows: v }))}
            />
            <TextInput
              style={styles.input} placeholder="Θέσεις ανά σειρά" placeholderTextColor="#888"
              keyboardType="numeric" value={seatsForm.seatsPerRow}
              onChangeText={v => setSeatsForm(f => ({ ...f, seatsPerRow: v }))}
            />
            <TextInput
              style={styles.input} placeholder="VIP σειρές (π.χ. AB)" placeholderTextColor="#888"
              value={seatsForm.vipRows} onChangeText={v => setSeatsForm(f => ({ ...f, vipRows: v }))}
            />
            <TextInput
              style={styles.input} placeholder="Μπαλκόνι σειρές (π.χ. D)" placeholderTextColor="#888"
              value={seatsForm.balconyRows} onChangeText={v => setSeatsForm(f => ({ ...f, balconyRows: v }))}
            />
            <Text style={styles.hint}>Υπόλοιπες σειρές → standard</Text>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSeatsModal(false)}>
                <Text style={styles.cancelBtnText}>Ακύρωση</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={generateSeats} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? '...' : 'Δημιουργία'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0d1f3c' },
  addBtn:       { margin: 16, backgroundColor: '#ffd700', borderRadius: 8, padding: 12, alignItems: 'center' },
  addBtnText:   { color: '#0d1f3c', fontWeight: 'bold', fontSize: 15 },
  card: {
    backgroundColor: '#1a3a6b', borderRadius: 10, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2a4a8b',
  },
  info:         { flex: 1 },
  name:         { color: '#ffd700', fontSize: 15, fontWeight: 'bold' },
  sub:          { color: '#aaa', fontSize: 12, marginTop: 2 },
  seats:        { color: '#7cb9f5', fontSize: 12, marginTop: 3 },
  actions:      { flexDirection: 'row', gap: 6 },
  iconBtn:      { padding: 6 },
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  overlayScroll:{ flexGrow: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modal:        { backgroundColor: '#1a3a6b', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#ffd700' },
  modalTitle:   { color: '#ffd700', fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  fieldLabel:   { color: '#ccc', fontSize: 13, marginBottom: 6 },
  pill:         { backgroundColor: '#0d1f3c', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#2a4a8b', marginRight: 8 },
  pillActive:   { backgroundColor: '#ffd700', borderColor: '#ffd700' },
  pillText:     { color: '#ccc', fontSize: 13 },
  pillTextActive:{ color: '#0d1f3c', fontWeight: 'bold' },
  input: {
    backgroundColor: '#0d1f3c', color: '#fff', borderRadius: 8, padding: 12,
    borderWidth: 1, borderColor: '#2a4a8b', marginBottom: 12, fontSize: 14,
  },
  hint:         { color: '#888', fontSize: 12, marginBottom: 12 },
  modalBtns:    { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn:    { flex: 1, backgroundColor: '#333', borderRadius: 8, padding: 12, alignItems: 'center' },
  cancelBtnText:{ color: '#fff' },
  saveBtn:      { flex: 1, backgroundColor: '#ffd700', borderRadius: 8, padding: 12, alignItems: 'center' },
  saveBtnText:  { color: '#0d1f3c', fontWeight: 'bold' },
});
