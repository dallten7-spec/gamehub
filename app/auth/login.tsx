import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase'; // اتصال به دیتابیس

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState(''); // اینجا ایمیل یا نام کاربری وارد می‌شه
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('خطا', error.message);
    } else {
      router.push('/'); // اگر موفق بود، بره به صفحه اصلی
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>GameHub</Text>
      <Text style={styles.subtitle}>ورود به حساب کاربری</Text>

      <View style={styles.form}>
        <Text style={styles.label}>ایمیل (نام کاربری)</Text>
        <TextInput
          style={styles.input}
          placeholder="email@example.com"
          placeholderTextColor="#777"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
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

        <TouchableOpacity 
          style={[styles.button, { opacity: loading ? 0.7 : 1 }]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'درحال ورود...' : 'ورود'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1222', padding: 24, justifyContent: 'center' },
  logo: { fontSize: 40, fontWeight: 'bold', color: '#7C5CFF', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#AAA', textAlign: 'center', marginBottom: 40 },
  form: { width: '100%' },
  label: { color: '#CCC', fontSize: 14, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#1B1F38', borderRadius: 12, padding: 14, color: '#FFF', borderWidth: 1, borderColor: '#2A2F52' },
  button: { backgroundColor: '#7C5CFF', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 28 },
  buttonText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
});
