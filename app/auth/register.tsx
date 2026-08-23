import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleRegister = () => {
    if (password !== confirm) {
      alert('رمز عبور و تکرار آن یکسان نیستند');
      return;
    }
    // فعلاً ثبت‌نام آزمایشی — بعداً به Supabase متصل می‌شود
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.logo}>GameHub</Text>
          <Text style={styles.subtitle}>ساخت حساب کاربری</Text>

          <View style={styles.form}>
            <Text style={styles.label}>شماره موبایل</Text>
            <TextInput
              style={styles.input}
              placeholder="09xxxxxxxxx"
              placeholderTextColor="#777"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <Text style={styles.label}>رمز عبور</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#777"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Text style={styles.label}>تکرار رمز عبور</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#777"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
            />

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>ثبت‌نام</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.link}>قبلاً ثبت‌نام کرده‌اید؟ ورود</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1222' },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 40, fontWeight: 'bold', color: '#7C5CFF', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#AAA', textAlign: 'center', marginBottom: 40 },
  form: { width: '100%' },
  label: { color: '#CCC', fontSize: 14, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#1B1F38',
    borderRadius: 12,
    padding: 14,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2A2F52',
  },
  button: {
    backgroundColor: '#7C5CFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  buttonText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
  link: { color: '#7C5CFF', textAlign: 'center', marginTop: 20, fontSize: 14 },
});
