import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../../lib/supabase';

// لیست ماشین‌های گاراژ
const VEHICLES = [
  { id: 'iron_beast', name: 'Iron Beast', power: 35, armor: 100, price: 'رایگان' },
  { id: 'desert_storm', name: 'Desert Storm', power: 45, armor: 120, price: '۷۵,۰۰۰ تومان' },
  { id: 'titan_crusher', name: 'Titan Crusher', power: 60, armor: 150, price: '۱۵۰,۰۰۰ تومان' },
];

const XP_REWARD_PER_WIN = 40;
const GAME_ID = 'war_god';

// تابع محاسبه تصاعدی لول و پیشرفت بر اساس XP
// لول ۱ به ۲ = ۲۰۰ XP، لول ۲ به ۳ = ۳۰۰ XP، لول ۳ به ۴ = ۴۰۰ XP و ...
const getProgressInfo = (xp: number) => {
  let level = 1;
  let totalRequiredXp = 0;
  let requiredXpForNext = 200;

  while (xp >= totalRequiredXp + requiredXpForNext) {
    totalRequiredXp += requiredXpForNext;
    level += 1;
    requiredXpForNext += 100;
  }

  const currentLevelXp = xp - totalRequiredXp;
  const remainingXp = requiredXpForNext - currentLevelXp;

  return {
    level,
    currentLevelXp,
    requiredXpForNext,
    remainingXp,
  };
};

export default function WarGodGame() {
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLES[0]);
  const [inBattle, setInBattle] = useState(false);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState({ xp: 0, level: 1, wins: 0 });

  // دریافت آمار از دیتابیس
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_game_stats')
        .select('xp, level, wins')
        .eq('user_id', user.id)
        .eq('game_id', GAME_ID)
        .single();

      if (data && !error) {
        const xp = data.xp || 0;
        const progress = getProgressInfo(xp);
        setPlayerStats({
          xp: xp,
          level: progress.level,
          wins: data.wins || 0,
        });
      }
    } catch (err) {
      console.error('خطا در دریافت آمار:', err);
    } finally {
      setLoading(false);
    }
  };

  const startBattle = () => {
    setPlayerHp(selectedVehicle.armor);
    setEnemyHp(120);
    setBattleLog([`💥 نبرد آغاز شد! شما با "${selectedVehicle.name}" وارد میدان شدید.`]);
    setInBattle(true);
  };

  const handleAttack = async () => {
    // حمله کاربر
    const playerDamage = Math.floor(Math.random() * 15) + (selectedVehicle.power - 10);
    const newEnemyHp = Math.max(0, enemyHp - playerDamage);
    setEnemyHp(newEnemyHp);

    let updatedLogs = [`🎯 شما شلیک کردید و ${playerDamage} آسیب زدید!`];

    if (newEnemyHp <= 0) {
      // پیروزی در نبرد
      const newXp = playerStats.xp + XP_REWARD_PER_WIN;
      const progress = getProgressInfo(newXp);
      const newWins = playerStats.wins + 1;

      setPlayerStats({ xp: newXp, level: progress.level, wins: newWins });
      setInBattle(false);

      // ذخیره در Supabase
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('user_game_stats').upsert({
            user_id: user.id,
            game_id: GAME_ID,
            xp: newXp,
            level: progress.level,
            wins: newWins,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('خطا در ثبت امتیاز:', err);
      }

      Alert.alert(
        '🏆 پیروزی!',
        `ماشین حریف منهدم شد!\nپاداش: ${XP_REWARD_PER_WIN}+ امتیاز XP\nسطح جدید: لول ${progress.level}\nXP لازم تا لول بعدی: ${progress.remainingXp}`
      );
      return;
    }

    // شلیک حریف
    const enemyDamage = Math.floor(Math.random() * 20) + 15;
    const newPlayerHp = Math.max(0, playerHp - enemyDamage);
    setPlayerHp(newPlayerHp);
    updatedLogs.unshift(`⚡ حریف شلیک کرد! ${enemyDamage} آسیب خوردید.`);

    if (newPlayerHp <= 0) {
      setInBattle(false);
      Alert.alert('💥 شکست!', 'ماشین شما منهدم شد. دوباره تلاش کنید!');
      return;
    }

    setBattleLog((prev) => [...updatedLogs, ...prev]);
  };

  const progress = getProgressInfo(playerStats.xp);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF3366" />
        <Text style={styles.loadingText}>در حال بارگذاری اطلاعات نبرد...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* کارت وضعیت فرمانده و لول تصاعدی */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>وضعیت فرمانده در «خدای جنگ»</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statBadge}>سطح: {progress.level}</Text>
          <Text style={styles.statBadge}>امتیاز کل: {playerStats.xp} XP</Text>
          <Text style={styles.statBadge}>بردها: {playerStats.wins}</Text>
        </View>

        {/* نوار پیشرفت تا لول بعدی */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${Math.min(100, Math.round((progress.currentLevelXp / progress.requiredXpForNext) * 100))}%` },
            ]}
          />
        </View>
        <Text style={styles.xpHint}>
          پیشرفت سطح: {progress.currentLevelXp} / {progress.requiredXpForNext} XP ({progress.remainingXp} XP تا سطح بعدی)
        </Text>
      </View>

      {!inBattle ? (
        // بخش گاراژ و انتخاب تانک / ماشین
        <View style={styles.garage}>
          <Text style={styles.sectionTitle}>انتخاب ماشین جنگی:</Text>
          {VEHICLES.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.id}
              style={[
                styles.vehicleCard,
                selectedVehicle.id === vehicle.id && styles.selectedCard,
              ]}
              onPress={() => setSelectedVehicle(vehicle)}
            >
              <View>
                <Text style={styles.vehicleName}>{vehicle.name}</Text>
                <Text style={styles.vehicleDetails}>
                  قدرت: {vehicle.power} | زره: {vehicle.armor}
                </Text>
              </View>
              <Text style={styles.vehiclePrice}>{vehicle.price}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.startBtn} onPress={startBattle}>
            <Text style={styles.startBtnText}>ورود به میدان نبرد ⚔️</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // بخش میدان جنگ
        <View style={styles.arena}>
          <View style={styles.healthContainer}>
            <View style={styles.hpBox}>
              <Text style={styles.hpLabel}>شما ({selectedVehicle.name})</Text>
              <Text style={[styles.hpValue, { color: '#00E676' }]}>HP: {playerHp}</Text>
            </View>
            <Text style={styles.vsText}>VS</Text>
            <View style={styles.hpBox}>
              <Text style={styles.hpLabel}>حریف (ربات جنگی)</Text>
              <Text style={[styles.hpValue, { color: '#FF3366' }]}>HP: {enemyHp}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.fireBtn} onPress={handleAttack}>
            <Text style={styles.fireBtnText}>🔥 شلیک موشک</Text>
          </TouchableOpacity>

          <Text style={styles.logTitle}>گزارش نبرد:</Text>
          <View style={styles.logBox}>
            {battleLog.map((log, index) => (
              <Text key={index} style={styles.logText}>
                {log}
              </Text>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 20,
  },
  center: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 14,
  },
  statsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
    alignItems: 'center',
  },
  statsTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statBadge: {
    backgroundColor: '#0F172A',
    color: '#38BDF8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 'bold',
  },
  progressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#0F172A',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#38BDF8',
  },
  xpHint: {
    color: '#94A3B8',
    fontSize: 11,
  },
  garage: {
    gap: 12,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  vehicleCard: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  selectedCard: {
    borderColor: '#FF3366',
    backgroundColor: '#2A1828',
  },
  vehicleName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  vehicleDetails: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  vehiclePrice: {
    color: '#38BDF8',
    fontWeight: 'bold',
    fontSize: 13,
  },
  startBtn: {
    backgroundColor: '#FF3366',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  startBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  arena: {
    gap: 16,
  },
  healthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 14,
  },
  hpBox: {
    alignItems: 'center',
    flex: 1,
  },
  hpLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  hpValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  vsText: {
    color: '#F59E0B',
    fontWeight: '900',
    fontSize: 16,
  },
  fireBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  fireBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logTitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  logBox: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    minHeight: 120,
    gap: 8,
  },
  logText: {
    color: '#E2E8F0',
    fontSize: 12,
    textAlign: 'right',
  },
});
