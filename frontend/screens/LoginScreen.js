import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { login } from '../services/api';

export default function LoginScreen({ navigation, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');
    if (!email || !password) return setError('Συμπλήρωσε email και password.');
    setLoading(true);
    try {
      const data = await login(email, password);
      onLogin(data.user);
    } catch (err) {
      setError(err.message || 'Σφάλμα σύνδεσης');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎭 Theater Booking</Text>
      <Text style={styles.subtitle}>Σύνδεση</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Σύνδεση</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Δεν έχεις λογαριασμό; <Text style={styles.linkBold}>Εγγραφή</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a237e', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 20, color: '#5c6bc0', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 16, borderWidth: 1, borderColor: '#c5cae9' },
  button: { backgroundColor: '#1a237e', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  error: { color: '#c62828', backgroundColor: '#ffebee', borderRadius: 8, padding: 10, marginBottom: 10, textAlign: 'center' },
  link: { textAlign: 'center', marginTop: 20, color: '#5f6368', fontSize: 14 },
  linkBold: { color: '#1a237e', fontWeight: 'bold' },
});
