import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // مرحله ۱: ارسال کد به موبایل
  const handleSendOtp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone, // باید فرمت +98 داشته باشد
    });

    if (error) Alert.alert('خطا', error.message);
    else setIsOtpSent(true);
    setLoading(false);
  };

  // مرحله ۲: تایید کد دریافتی
  const handleVerifyOtp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: token,
      type: 'sms',
    });

    if (error) Alert.alert('خطا', 'کد وارد شده صحیح نیست');
    else router.push('/'); // ورود موفق
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>GameHub</Text>
      <Text style={styles.subtitle}>{isOtpSent ? 'کد تایید را وارد کنید' : 'ورود با شماره موبایل'}</Text>

      <View style={styles.form}>
        {!isOtpSent ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="+989120000000"
              placeholderTextColor="#777"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
              <Text style={styles.buttonText}>{loading ? 'درحال ارسال...' : 'دریافت کد'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="کد ۶ رقمی"
              keyboardType="number-pad"
              value={token}
              onChangeText={setToken}
            />
            <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
              <Text style={styles.buttonText}>{loading ? 'درحال ورود...' : 'تایید و ورود'}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1222', padding: 24, justifyContent: 'center' },
  logo: { fontSize: 40, fontWeight: 'bold', color: '#7C5CFF', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#AAA', textAlign: 'center', marginBottom: 40 },
  form: { width: '100%' },
  input: { backgroundColor: '#1B1F38', borderRadius: 12, padding: 14, color: '#FFF', borderWidth: 1, borderColor: '#2A2F52', marginBottom: 16 },
  button: { backgroundColor: '#7C5CFF', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
});
