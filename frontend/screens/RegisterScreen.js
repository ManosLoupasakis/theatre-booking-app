import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { register, login } from '../services/api';

export default function RegisterScreen({ navigation, onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password) return Alert.alert('Σφάλμα', 'Συμπλήρωσε όλα τα πεδία.');
    if (password.length < 6) return Alert.alert('Σφάλμα', 'Το password πρέπει να έχει τουλάχιστον 6 χαρακτήρες.');
    setLoading(true);
    try {
      await register(name, email, password);
      const data = await login(email, password);
      onLogin(data.user);
    } catch (err) {
      Alert.alert('Σφάλμα εγγραφής', err.message);
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
  container: { flex: 1, backgroundColor: '#f0f2f5', justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a237e', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 20, color: '#5c6bc0', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 16, borderWidth: 1, borderColor: '#c5cae9' },
  button: { backgroundColor: '#1a237e', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { textAlign: 'center', marginTop: 20, color: '#5f6368', fontSize: 14 },
  linkBold: { color: '#1a237e', fontWeight: 'bold' },
});
