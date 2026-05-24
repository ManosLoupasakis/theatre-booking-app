import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, ScrollView,
} from 'react-native';
import {
  adminGetShows, adminCreateShow, adminUpdateShow, adminDeleteShow, adminGetTheatres,
} from '../services/api';
import { Toast, useToast, ConfirmModal, useConfirm } from '../components/Feedback';

const EMPTY = { theatre_id: '', title: '', description: '', duration: '', age_rating: 'All' };

export default function AdminShowsScreen() {
  const [shows, setShows]       = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast, showToast } = useToast();
  const { confirm, showConfirm, closeConfirm } = useConfirm();

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([adminGetShows(), adminGetTheatres()])
      .then(([s, t]) => { setShows(s); setTheatres(t); })
      .catch(e => showToast(e.message, 'error'))
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, [load]);

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY, theatre_id: theatres[0]?.theatre_id || '' });
    setModal(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      theatre_id: item.theatre_id,
      title: item.title,
      description: item.description || '',
      duration: String(item.duration),
      age_rating: item.age_rating || 'All',
    });
    setModal(true);
  }

  async function save() {
    if (!form.theatre_id || !form.title.trim() || !form.duration) {
      showToast('Θέατρο, τίτλος και διάρκεια είναι υποχρεωτικά', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, duration: parseInt(form.duration, 10) };
      if (editing) { await adminUpdateShow(editing.show_id, payload); showToast('Η παράσταση ενημερώθηκε', 'success'); }
      else { await adminCreateShow(payload); showToast('Η παράσταση δημιουργήθηκε', 'success'); }
      setModal(false);
      load();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(item) {
    showConfirm({
      title: 'Διαγραφή Παράστασης',
      message: `Θέλεις σίγουρα να διαγράψεις "${item.title}";`,
      confirmText: 'Διαγραφή',
      isDestructive: true,
      onConfirm: async () => {
        closeConfirm();
        try { await adminDeleteShow(item.show_id); showToast('Η παράσταση διαγράφηκε', 'success'); load(); }
        catch (e) { showToast(e.message, 'error'); }
      },
    });
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
        <Text style={styles.addBtnText}>+ Νέα Παράσταση</Text>
      </TouchableOpacity>

      {loading
        ? <ActivityIndicator color="#ffd700" size="large" style={{ marginTop: 40 }} />
        : (
          <FlatList
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffd700" colors={['#ffd700']} />}
            data={shows}
            keyExtractor={i => String(i.show_id)}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.title}</Text>
                  <Text style={styles.sub}>{item.theatre_name} · {item.duration}' · {item.age_rating}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                    <Text style={styles.editBtnText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.delBtn} onPress={() => confirmDelete(item)}>
                    <Text style={styles.delBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )
      }

      <Modal visible={modal} animationType="slide" transparent>
        <ScrollView contentContainerStyle={styles.overlayScroll}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? 'Επεξεργασία Παράστασης' : 'Νέα Παράσταση'}</Text>

            <Text style={styles.fieldLabel}>Θέατρο *</Text>
            <View style={styles.pickerWrap}>
              {theatres.map(t => (
                <TouchableOpacity
                  key={t.theatre_id}
                  style={[styles.pill, form.theatre_id == t.theatre_id && styles.pillActive]}
                  onPress={() => setForm(f => ({ ...f, theatre_id: t.theatre_id }))}
                >
                  <Text style={[styles.pillText, form.theatre_id == t.theatre_id && styles.pillTextActive]}>
                    {t.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input} placeholder="Τίτλος *" placeholderTextColor="#888"
              value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))}
            />
            <TextInput
              style={[styles.input, { height: 70 }]}
              placeholder="Περιγραφή" placeholderTextColor="#888" multiline
              value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))}
            />
            <TextInput
              style={styles.input} placeholder="Διάρκεια (λεπτά) *" placeholderTextColor="#888"
              keyboardType="numeric" value={form.duration}
              onChangeText={v => setForm(f => ({ ...f, duration: v }))}
            />
            <TextInput
              style={styles.input} placeholder="Ηλικία (All, 14+, 18+…)" placeholderTextColor="#888"
              value={form.age_rating} onChangeText={v => setForm(f => ({ ...f, age_rating: v }))}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0d1f3c' },
  addBtn:      { margin: 16, backgroundColor: '#ffd700', borderRadius: 8, padding: 12, alignItems: 'center' },
  addBtnText:  { color: '#0d1f3c', fontWeight: 'bold', fontSize: 15 },
  card: {
    backgroundColor: '#1a3a6b', borderRadius: 10, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2a4a8b',
  },
  info:         { flex: 1 },
  name:         { color: '#ffd700', fontSize: 15, fontWeight: 'bold' },
  sub:          { color: '#aaa', fontSize: 12, marginTop: 3 },
  actions:      { flexDirection: 'row', gap: 8 },
  editBtn:      { padding: 8 },
  editBtnText:  { fontSize: 18 },
  delBtn:       { padding: 8 },
  delBtnText:   { fontSize: 18 },
  overlayScroll:{ flexGrow: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modal:        { backgroundColor: '#1a3a6b', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#ffd700' },
  modalTitle:   { color: '#ffd700', fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  fieldLabel:   { color: '#ccc', fontSize: 13, marginBottom: 6 },
  pickerWrap:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  pill:         { backgroundColor: '#0d1f3c', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#2a4a8b' },
  pillActive:   { backgroundColor: '#ffd700', borderColor: '#ffd700' },
  pillText:     { color: '#ccc', fontSize: 13 },
  pillTextActive:{ color: '#0d1f3c', fontWeight: 'bold' },
  input: {
    backgroundColor: '#0d1f3c', color: '#fff', borderRadius: 8, padding: 12,
    borderWidth: 1, borderColor: '#2a4a8b', marginBottom: 12, fontSize: 14,
  },
  modalBtns:    { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn:    { flex: 1, backgroundColor: '#333', borderRadius: 8, padding: 12, alignItems: 'center' },
  cancelBtnText:{ color: '#fff' },
  saveBtn:      { flex: 1, backgroundColor: '#ffd700', borderRadius: 8, padding: 12, alignItems: 'center' },
  saveBtnText:  { color: '#0d1f3c', fontWeight: 'bold' },
});
