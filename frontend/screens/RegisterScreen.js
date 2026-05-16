import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { register, login } from '../services/api';

export default function RegisterScreen({ navigation, onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister() {
    setError('');
    if (!name || !email || !password) return setError('Συμπλήρωσε όλα τα πεδία.');
    if (password.length < 6) return setError('Το password πρέπει να έχει τουλάχιστον 6 χαρακτήρες.');
    setLoading(true);
    try {
      await register(name, email, password);
      const data = await login(email, password);
      onLogin(data.user);
    } catch (err) {
      setError(err.message || 'Σφάλμα εγγραφής');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎭 Theater Booking</Text>
      <Text style={styles.subtitle}>Δημιουργία Λογαριασμού</Text>

      <TextInput style={styles.input} placeholder="Ονοματεπώνυμο" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input} placeholder="Email" value={email}
        onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
      />
      <TextInput
        style={styles.input} placeholder="Password (min 6 χαρακτήρες)"
        value={password} onChangeText={setPassword} secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Εγγραφή</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Έχεις ήδη λογαριασμό; <Text style={styles.linkBold}>Σύνδεση</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1f3c', justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ffd700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 20, color: '#b8a8ff', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 16, borderWidth: 1.5, borderColor: '#ffd700', color: '#fff' },
  button: { backgroundColor: '#ffd700', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#0d1f3c', fontSize: 16, fontWeight: 'bold' },
  error: { color: '#ff6b6b', backgroundColor: '#3d1a1a', borderRadius: 8, padding: 10, marginBottom: 10, textAlign: 'center' },
  link: { textAlign: 'center', marginTop: 20, color: '#b8a8ff', fontSize: 14 },
  linkBold: { color: '#ffd700', fontWeight: 'bold' },
});
