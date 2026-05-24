import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity,
  Modal, TextInput, ActivityIndicator,
} from 'react-native';
import {
  adminGetTheatres, adminCreateTheatre, adminUpdateTheatre, adminDeleteTheatre,
} from '../services/api';
import { Toast, useToast, ConfirmModal, useConfirm } from '../components/Feedback';

const EMPTY = { name: '', location: '', description: '' };

export default function AdminTheatresScreen() {
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
    adminGetTheatres()
      .then(setTheatres)
      .catch(e => showToast(e.message, 'error'))
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, [load]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({ name: item.name, location: item.location, description: item.description || '' });
    setModal(true);
  }

  async function save() {
    if (!form.name.trim() || !form.location.trim()) {
      showToast('Όνομα και τοποθεσία είναι υποχρεωτικά', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await adminUpdateTheatre(editing.theatre_id, form);
        showToast('Το θέατρο ενημερώθηκε', 'success');
      } else {
        await adminCreateTheatre(form);
        showToast('Το θέατρο δημιουργήθηκε', 'success');
      }
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
      title: 'Διαγραφή Θεάτρου',
      message: `Θέλεις σίγουρα να διαγράψεις το "${item.name}";`,
      confirmText: 'Διαγραφή',
      isDestructive: true,
      onConfirm: async () => {
        closeConfirm();
        try {
          await adminDeleteTheatre(item.theatre_id);
          showToast('Το θέατρο διαγράφηκε', 'success');
          load();
        } catch (e) {
          showToast(e.message, 'error');
        }
      },
    });
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
        <Text style={styles.addBtnText}>+ Νέο Θέατρο</Text>
      </TouchableOpacity>

      {loading
        ? <ActivityIndicator color="#ffd700" size="large" style={{ marginTop: 40 }} />
        : (
          <FlatList
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffd700" colors={['#ffd700']} />}
            data={theatres}
            keyExtractor={i => String(i.theatre_id)}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.sub}>{item.location}</Text>
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
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? 'Επεξεργασία Θεάτρου' : 'Νέο Θέατρο'}</Text>
            <TextInput
              style={styles.input} placeholder="Όνομα *" placeholderTextColor="#888"
              value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))}
            />
            <TextInput
              style={styles.input} placeholder="Τοποθεσία *" placeholderTextColor="#888"
              value={form.location} onChangeText={v => setForm(f => ({ ...f, location: v }))}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Περιγραφή" placeholderTextColor="#888"
              value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))}
              multiline
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
        </View>
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
  container: { flex: 1, backgroundColor: '#0d1f3c' },
  addBtn:    { margin: 16, backgroundColor: '#ffd700', borderRadius: 8, padding: 12, alignItems: 'center' },
  addBtnText:{ color: '#0d1f3c', fontWeight: 'bold', fontSize: 15 },
  card: {
    backgroundColor: '#1a3a6b', borderRadius: 10, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2a4a8b',
  },
  info:        { flex: 1 },
  name:        { color: '#ffd700', fontSize: 16, fontWeight: 'bold' },
  sub:         { color: '#aaa', fontSize: 13, marginTop: 2 },
  actions:     { flexDirection: 'row', gap: 8 },
  editBtn:     { padding: 8 },
  editBtnText: { fontSize: 18 },
  delBtn:      { padding: 8 },
  delBtnText:  { fontSize: 18 },
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modal:       { backgroundColor: '#1a3a6b', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#ffd700' },
  modalTitle:  { color: '#ffd700', fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: {
    backgroundColor: '#0d1f3c', color: '#fff', borderRadius: 8, padding: 12,
    borderWidth: 1, borderColor: '#2a4a8b', marginBottom: 12, fontSize: 14,
  },
  modalBtns:   { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn:   { flex: 1, backgroundColor: '#333', borderRadius: 8, padding: 12, alignItems: 'center' },
  cancelBtnText:{ color: '#fff' },
  saveBtn:     { flex: 1, backgroundColor: '#ffd700', borderRadius: 8, padding: 12, alignItems: 'center' },
  saveBtnText: { color: '#0d1f3c', fontWeight: 'bold' },
});
