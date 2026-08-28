import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function WarGodScreen() {
  const router = useRouter();
  const [selectedVehicle, setSelectedVehicle] = useState('iron-beast');

  const vehicles = [
    {
      id: 'iron-beast',
      name: 'هیولای آهنین (پیش‌فرض)',
      armor: '۱۰۰/۱۰۰',
      speed: 'متوسط',
      gun: 'تیربار سبک ۱۲.۷ میلی‌متری',
      price: 'رایگان',
      color: '#EF4444',
    },
    {
      id: 'desert-storm',
      name: 'طوفان صحرا (ارتقا یافته)',
      armor: '۱۸۰/۱۸۰',
      speed: 'بسیار سریع',
      gun: 'دوشکا دوبل نئونی + نیترو',
      price: '۷۵,۰۰۰ تومان',
      color: '#F59E0B',
    },
    {
      id: 'titan-crusher',
      name: 'تایتان جنگی (حرفه‌ای)',
      armor: '۳۰۰/۳۰۰',
      speed: 'زره‌پوش سنگین',
      gun: 'راکت‌انداز هوشمند + تیربار سنگین',
      price: '۱۵۰,۰۰۰ تومان',
      color: '#8B5CF6',
    },
  ];

  return (
    <View style={styles.container}>
      {/* هدر بالای صفحه */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>بازگشت ➔</Text>
        </TouchableOpacity>
        <Text style={styles.title}>خدای جنگ: نبرد ماشین‌ها ⚔️</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* کارت وضعیت بازیکن */}
        <View style={styles.statusCard}>
          <Text style={styles.levelTitle}>سطح شما در خدای جنگ: لول ۱</Text>
          <Text style={styles.xpText}>امتیاز XP: ۰ / ۱۰۰ (هر پیروزی = ۱۰۰+ امتیاز)</Text>
        </View>

        {/* بخش انتخاب ماشین و تجهیزات */}
        <Text style={styles.sectionHeading}>انتخاب ماشین جنگی و تجهیزات:</Text>

        {vehicles.map((v) => (
          <TouchableOpacity
            key={v.id}
            onPress={() => setSelectedVehicle(v.id)}
            style={[
              styles.vehicleCard,
              selectedVehicle === v.id && { borderColor: v.color, borderWidth: 2 },
            ]}
          >
            <View style={styles.cardTop}>
              <Text style={[styles.vehiclePrice, { color: v.color }]}>{v.price}</Text>
              <Text style={styles.vehicleName}>{v.name}</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.specVal}>{v.armor}</Text>
              <Text style={styles.specLabel}>میزان زره و جان:</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specVal}>{v.speed}</Text>
              <Text style={styles.specLabel}>سرعت و شتاب:</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specVal}>{v.gun}</Text>
              <Text style={styles.specLabel}>سلاح سقف:</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* دکمه شروع نبرد آنلاین */}
        <TouchableOpacity style={styles.battleButton}>
          <Text style={styles.battleButtonText}>🔥 ورود به میدان نبرد آنلاین</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D1A',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backBtn: {
    padding: 6,
  },
  backText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  title: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statusCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderRightWidth: 4,
    borderRightColor: '#EF4444',
  },
  levelTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  xpText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  sectionHeading: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 14,
    textAlign: 'right',
  },
  vehicleCard: {
    backgroundColor: '#131A2E',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cardTop: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  vehicleName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  vehiclePrice: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  specRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  specLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  specVal: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  battleButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#DC2626',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  battleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
