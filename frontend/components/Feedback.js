import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Animated } from 'react-native';

// ── TOAST ──────────────────────────────────────────────────────────────────────

const ICONS = { success: '✓', error: '✕', info: 'ℹ' };
const COLORS = {
  success: { bg: '#1a6b3a', border: '#27ae60', icon: '#2ecc71' },
  error:   { bg: '#6b1a1a', border: '#c0392b', icon: '#e74c3c' },
  info:    { bg: '#1a3a6b', border: '#2980b9', icon: '#3498db' },
};

export function Toast({ visible, message, type = 'success' }) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: visible ? 1 : 0, duration: 280, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: visible ? 0 : -20, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [visible]);

  const c = COLORS[type] || COLORS.info;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        { backgroundColor: c.bg, borderColor: c.border, opacity, transform: [{ translateY }] },
      ]}
    >
      <View style={[styles.toastIconBox, { backgroundColor: c.icon }]}>
        <Text style={styles.toastIconText}>{ICONS[type]}</Text>
      </View>
      <Text style={styles.toastMsg} numberOfLines={3}>{message}</Text>
    </Animated.View>
  );
}

export function useToast() {
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const timer = useRef(null);

  function showToast(message, type = 'success', onDone) {
    if (timer.current) clearTimeout(timer.current);
    setToast({ visible: true, message, type });
    timer.current = setTimeout(() => {
      setToast(t => ({ ...t, visible: false }));
      if (onDone) onDone();
    }, 2800);
  }

  return { toast, showToast };
}

// ── CONFIRM MODAL ──────────────────────────────────────────────────────────────

export function ConfirmModal({ visible, title, message, onConfirm, onCancel, confirmText = 'Επιβεβαίωση', isDestructive = false }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.confirmBox}>
          <View style={[styles.confirmHeader, isDestructive && styles.confirmHeaderDestructive]}>
            <Text style={styles.confirmIcon}>{isDestructive ? '🗑️' : '❓'}</Text>
          </View>
          <Text style={styles.confirmTitle}>{title}</Text>
          {message ? <Text style={styles.confirmMsg}>{message}</Text> : null}
          <View style={styles.confirmBtns}>
            <TouchableOpacity style={styles.confirmCancel} onPress={onCancel}>
              <Text style={styles.confirmCancelText}>Ακύρωση</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmOk, isDestructive && styles.confirmOkDestructive]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmOkText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function useConfirm() {
  const [confirm, setConfirm] = useState({
    visible: false, title: '', message: '', onConfirm: null, confirmText: 'Επιβεβαίωση', isDestructive: false,
  });

  function showConfirm({ title, message, onConfirm, confirmText = 'Επιβεβαίωση', isDestructive = false }) {
    setConfirm({ visible: true, title, message, onConfirm, confirmText, isDestructive });
  }

  function closeConfirm() {
    setConfirm(c => ({ ...c, visible: false }));
  }

  return { confirm, showConfirm, closeConfirm };
}

// ── STYLES ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  toast: {
    position: 'absolute', top: 16, left: 16, right: 16, zIndex: 9999,
    flexDirection: 'row', alignItems: 'center', borderRadius: 12,
    borderWidth: 1, padding: 12, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 10,
  },
  toastIconBox:  { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  toastIconText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  toastMsg:      { flex: 1, color: '#fff', fontSize: 14, fontWeight: '500' },

  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  confirmBox: { backgroundColor: '#1a3a6b', borderRadius: 20, width: '100%', maxWidth: 340, overflow: 'hidden', borderWidth: 1, borderColor: '#2a4a8b' },
  confirmHeader: { backgroundColor: '#2a4a8b', alignItems: 'center', paddingVertical: 20 },
  confirmHeaderDestructive: { backgroundColor: '#4a1a1a' },
  confirmIcon:   { fontSize: 36 },
  confirmTitle:  { color: '#ffd700', fontSize: 18, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 20, paddingTop: 16 },
  confirmMsg:    { color: '#ccc', fontSize: 14, textAlign: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  confirmBtns:   { flexDirection: 'row', padding: 16, gap: 10 },
  confirmCancel: { flex: 1, backgroundColor: '#2a3a5b', borderRadius: 10, padding: 13, alignItems: 'center' },
  confirmCancelText: { color: '#ccc', fontWeight: '600' },
  confirmOk:     { flex: 1, backgroundColor: '#ffd700', borderRadius: 10, padding: 13, alignItems: 'center' },
  confirmOkDestructive: { backgroundColor: '#e74c3c' },
  confirmOkText: { color: '#0d1f3c', fontWeight: 'bold' },
});
