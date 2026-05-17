import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { adminGetUsers, adminUpdateUserRole, adminDeleteUser } from '../services/api';

export default function AdminUsersScreen() {
  const [all, setAll]           = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  const load = useCallback(() => {
    setLoading(true);
    adminGetUsers()
      .then(data => { setAll(data); setFiltered(data); })
      .catch(e => Alert.alert('Σφάλμα', e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(all); return; }
    const q = search.toLowerCase();
    setFiltered(all.filter(u =>
      u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    ));
  }, [search, all]);

  function toggleRole(item) {
    const newRole = item.role === 'admin' ? 'user' : 'admin';
    Alert.alert(
      'Αλλαγή ρόλου',
      `Αλλαγή ρόλου του "${item.name}" σε ${newRole === 'admin' ? 'Admin' : 'Χρήστη'};`,
      [
        { text: 'Ακύρωση', style: 'cancel' },
        {
          text: 'Αλλαγή',
          onPress: async () => {
            try { await adminUpdateUserRole(item.user_id, newRole); load(); }
            catch (e) { Alert.alert('Σφάλμα', e.message); }
          },
        },
      ]
    );
  }

  function confirmDelete(item) {
    Alert.alert('Διαγραφή', `Διαγραφή χρήστη "${item.name}";`, [
      { text: 'Ακύρωση', style: 'cancel' },
      {
        text: 'Διαγραφή', style: 'destructive',
        onPress: async () => {
          try { await adminDeleteUser(item.user_id); load(); }
          catch (e) { Alert.alert('Σφάλμα', e.message); }
        },
      },
    ]);
  }

  function formatDate(dt) {
    if (!dt) return '';
    return new Date(dt).toLocaleDateString('el-GR');
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Αναζήτηση ονόματος, email…"
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
            keyExtractor={i => String(i.user_id)}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.info}>
                  <View style={styles.row}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={[styles.badge, item.role === 'admin' ? styles.badgeAdmin : styles.badgeUser]}>
                      <Text style={styles.badgeText}>{item.role === 'admin' ? 'Admin' : 'Χρήστης'}</Text>
                    </View>
                  </View>
                  <Text style={styles.sub}>{item.email}</Text>
                  <Text style={styles.sub}>Εγγραφή: {formatDate(item.created_at)}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.roleBtn} onPress={() => toggleRole(item)}>
                    <Text style={styles.roleBtnText}>{item.role === 'admin' ? '👤' : '⭐'}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0d1f3c' },
  searchWrap:  { padding: 16, paddingBottom: 0 },
  search:      { backgroundColor: '#1a3a6b', color: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#2a4a8b' },
  card: {
    backgroundColor: '#1a3a6b', borderRadius: 10, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2a4a8b',
  },
  info:        { flex: 1 },
  row:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  name:        { color: '#ffd700', fontSize: 15, fontWeight: 'bold' },
  sub:         { color: '#aaa', fontSize: 12, marginTop: 2 },
  badge:       { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeAdmin:  { backgroundColor: '#6b3a1a' },
  badgeUser:   { backgroundColor: '#1a3a6b', borderWidth: 1, borderColor: '#2a4a8b' },
  badgeText:   { color: '#ffd700', fontSize: 11, fontWeight: 'bold' },
  actions:     { flexDirection: 'row', gap: 6 },
  roleBtn:     { padding: 8 },
  roleBtnText: { fontSize: 18 },
  delBtn:      { padding: 8 },
  delBtnText:  { fontSize: 18 },
});
