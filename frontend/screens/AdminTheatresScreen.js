import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import {
  adminGetTheatres, adminCreateTheatre, adminUpdateTheatre, adminDeleteTheatre,
} from '../services/api';

const EMPTY = { name: '', location: '', description: '' };

export default function AdminTheatresScreen() {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminGetTheatres()
      .then(setTheatres)
      .catch(e => Alert.alert('Σφάλμα', e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

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
      Alert.alert('Σφάλμα', 'Όνομα και τοποθεσία είναι υποχρεωτικά');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await adminUpdateTheatre(editing.theatre_id, form);
      } else {
        await adminCreateTheatre(form);
      }
      setModal(false);
      load();
    } catch (e) {
      Alert.alert('Σφάλμα', e.message);
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(item) {
    Alert.alert('Διαγραφή', `Διαγραφή "${item.name}";`, [
      { text: 'Ακύρωση', style: 'cancel' },
      {
        text: 'Διαγραφή', style: 'destructive',
        onPress: async () => {
          try {
            await adminDeleteTheatre(item.theatre_id);
            load();
          } catch (e) {
            Alert.alert('Σφάλμα', e.message);
          }
        },
      },
    ]);
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
