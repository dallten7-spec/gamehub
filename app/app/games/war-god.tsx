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
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

// لیست ماشین‌های جنگی به همراه مشخصات
const VEHICLES = [
  { id: 'iron_beast', name: 'Iron Beast', power: 35, armor: 110, icon: '🚜', price: 0, priceLabel: 'رایگان' },
  { id: 'desert_storm', name: 'Desert Storm', power: 48, armor: 140, icon: '🚙', price: 75000, priceLabel: '۷۵,۰۰۰ سکه' },
  { id: 'titan_crusher', name: 'Titan Crusher', power: 65, armor: 180, icon: '🚚', price: 150000, priceLabel: '۱۵۰,۰۰۰ سکه' },
];

const XP_REWARD_PER_WIN = 40;
const GAME_ID = 'war_god';

// فرمول تصاعدی دو فازی لول‌بندی
const getXpNeededForLevel = (lvl: number): number => {
  if (lvl <= 1) return 120;
  if (lvl <= 10) {
    return Math.round(120 * Math.pow(1.10, lvl - 1));
  }
  const baseAtLvl10 = Math.round(120 * Math.pow(1.10, 9));
  return Math.round(baseAtLvl10 * Math.pow(1.25, lvl - 10));
};

const getProgressInfo = (xp: number) => {
  let level = 1;
  let accumulatedXp = 0;
  let neededForCurrentLvl = getXpNeededForLevel(level);

  while (xp >= accumulatedXp + neededForCurrentLvl) {
    accumulatedXp += neededForCurrentLvl;
    level += 1;
    neededForCurrentLvl = getXpNeededForLevel(level);
  }

  const currentLevelProgressXp = xp - accumulatedXp;
  const remainingXp = neededForCurrentLvl - currentLevelProgressXp;

  return {
    level,
    currentLevelProgressXp,
    neededForCurrentLvl,
    remainingXp,
  };
};

export default function WarGodGame() {
  const router = useRouter();
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLES[0]);
  const [unlockedVehicles, setUnlockedVehicles] = useState<string[]>(['iron_beast']);
  const [inBattle, setInBattle] = useState(false);
  const [playerHp, setPlayerHp] = useState(110);
  const [enemyHp, setEnemyHp] = useState(120);
  const [maxEnemyHp, setMaxEnemyHp] = useState(120);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState({ xp: 0, level: 1, wins: 0 });

  // وضعیت مهارت‌ها
  const [shieldActive, setShieldActive] = useState(false);
  const [airstrikeCooldown, setAirstrikeCooldown] = useState(0);
  const [repairCooldown, setRepairCooldown] = useState(0);
  const [isEnemyTurn, setIsEnemyTurn] = useState(false);

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

  const handleSelectVehicle = (vehicle: typeof VEHICLES[0]) => {
    if (unlockedVehicles.includes(vehicle.id)) {
      setSelectedVehicle(vehicle);
    } else {
      Alert.alert(
        'قفل‌گشایی تانک',
        `آیا می‌خواهید ${vehicle.name} را باز کنید؟`,
        [
          { text: 'انصراف', style: 'cancel' },
          {
            text: 'تایید',
            onPress: () => {
              setUnlockedVehicles((prev) => [...prev, vehicle.id]);
              setSelectedVehicle(vehicle);
              Alert.alert('موفق', `${vehicle.name} با موفقیت آنلاک شد و انتخاب گردید!`);
            },
          },
        ]
      );
    }
  };

  const startBattle = () => {
    const enemyBaseHp = 100 + (playerStats.level * 12);
    setPlayerHp(selectedVehicle.armor);
    setEnemyHp(enemyBaseHp);
    setMaxEnemyHp(enemyBaseHp);
    setShieldActive(false);
    setAirstrikeCooldown(0);
    setRepairCooldown(0);
    setIsEnemyTurn(false);
    setBattleLog([`💥 میدان نبرد فعال شد! شما با "${selectedVehicle.name}" وارد میدان شدید.`]);
    setInBattle(true);
  };

  const executeEnemyTurn = (currentPlayerHp: number, currentShield: boolean) => {
    setIsEnemyTurn(true);
    setTimeout(() => {
      let enemyDamage = Math.floor(Math.random() * 18) + 12;
      let logMsg = '';

      if (currentShield) {
        enemyDamage = Math.floor(enemyDamage * 0.5);
        logMsg = `🛡️ سپر شما فعال بود! آسیب نصف شد (${enemyDamage} دمیج).`;
        setShieldActive(false);
      } else {
        logMsg = `⚡ حریف شلیک سنگین کرد و ${enemyDamage} دمیج وارد کرد!`;
      }

      const updatedPlayerHp = Math.max(0, currentPlayerHp - enemyDamage);
      setPlayerHp(updatedPlayerHp);
      setBattleLog((prev) => [logMsg, ...prev]);
      setIsEnemyTurn(false);

      if (updatedPlayerHp <= 0) {
        setInBattle(false);
        Alert.alert('💥 شکست!', 'ماشین جنگی شما منهدم شد. تجهیزات خود را ارتقا دهید و مجدداً تلاش کنید!');
      }
    }, 600);
  };

  const handleAttack = () => {
    if (isEnemyTurn) return;

    const playerDamage = Math.floor(Math.random() * 16) + (selectedVehicle.power - 8);
    const newEnemyHp = Math.max(0, enemyHp - playerDamage);
    setEnemyHp(newEnemyHp);

    if (airstrikeCooldown > 0) setAirstrikeCooldown(airstrikeCooldown - 1);
    if (repairCooldown > 0) setRepairCooldown(repairCooldown - 1);

    setBattleLog((prev) => [`🎯 شلیک توپ اصلی: ${playerDamage} آسیب به زره دشمن وارد شد!`, ...prev]);

    if (newEnemyHp <= 0) {
      handleVictory();
      return;
    }

    executeEnemyTurn(playerHp, shieldActive);
  };

  const handleAirstrike = () => {
    if (isEnemyTurn || airstrikeCooldown > 0) return;

    const damage = selectedVehicle.power + 28;
    const newEnemyHp = Math.max(0, enemyHp - damage);
    setEnemyHp(newEnemyHp);
    setAirstrikeCooldown(3);

    if (repairCooldown > 0) setRepairCooldown(repairCooldown - 1);

    setBattleLog((prev) => [`🚀 بمباران هوایی دقیق! ${damage} آسیب مرگبار وارد شد!`, ...prev]);

    if (newEnemyHp <= 0) {
      handleVictory();
      return;
    }

    executeEnemyTurn(playerHp, shieldActive);
  };

  const handleShield = () => {
    if (isEnemyTurn || shieldActive) return;

    setShieldActive(true);
    if (airstrikeCooldown > 0) setAirstrikeCooldown(airstrikeCooldown - 1);
    if (repairCooldown > 0) setRepairCooldown(repairCooldown - 1);

    setBattleLog((prev) => ['🛡️ سپر الکترومغناطیسی فعال شد (۵۰٪ کاهش آسیب نوبت بعد).', ...prev]);

    executeEnemyTurn(playerHp, true);
  };

  const handleRepair = () => {
    if (isEnemyTurn || repairCooldown > 0) return;

    const heal = 35;
    const newHp = Math.min(selectedVehicle.armor, playerHp + heal);
    setPlayerHp(newHp);
    setRepairCooldown(3);

    if (airstrikeCooldown > 0) setAirstrikeCooldown(airstrikeCooldown - 1);

    setBattleLog((prev) => [`🔧 نانوبات‌های تعمیراتی فعال شدند: +${heal} HP بازیابی شد.`, ...prev]);

    executeEnemyTurn(newHp, shieldActive);
  };

  const handleVictory = async () => {
    const newXp = playerStats.xp + XP_REWARD_PER_WIN;
    const progress = getProgressInfo(newXp);
    const newWins = playerStats.wins + 1;

    setPlayerStats({ xp: newXp, level: progress.level, wins: newWins });
    setInBattle(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_game_stats').upsert({
          user_id: user.id,

  };

  const handleRepair = () => {
    if (isEnemyTurn || repairCooldown > 0) return;

    const heal = 35;
    const newHp = Math.min(selectedVehicle.armor, playerHp + heal);
    setPlayerHp(newHp);
    setRepairCooldown(3);

    if (airstrikeCooldown > 0) setAirstrikeCooldown(airstrikeCooldown - 1);

    setBattleLog((prev) => [`🔧 نانوبات‌های تعمیراتی فعال شدند: +${heal} HP بازیابی شد.`, ...prev]);

    executeEnemyTurn(newHp, shieldActive);
  };

  const handleVictory = async () => {
    const newXp = playerStats.xp + XP_REWARD_PER_WIN;
    const progress = getProgressInfo(newXp);
    const newWins = playerStats.wins + 1;

    setPlayerStats({ xp: newXp, level: progress.level, wins: newWins });
    setInBattle(false);

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
      console.error('خطا در ذخیره آمار بازی:', err);
    }

    Alert.alert(
      '🏆 پیروزی قاطعانه!',
      `ماشین دشمن منهدم گردید!\n\n🎁 پاداش نبرد: +${XP_REWARD_PER_WIN} XP\n⭐ سطح جدید شما: لول ${progress.level}\n⚡ پیشرفت تا سطح بعدی: ${progress.remainingXp} XP`
    );
  };

  const handleSurrender = () => {
    Alert.alert('تسلیم و خروج', 'آیا مطمئن هستید که می‌خواهید از اینوار پیشرفت */}
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <Text style={styles.statBadge}>سطح: {progress.level}</Text>
          <Text style={styles.statBadge}>کل XP: {playerStats.xp}</Text>
          <Text style={styles.statBadge}>پیروزی‌ها: {playerStats.wins} (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF3366" />
        <Text style={styles.loadingText}>در حال فراخوانی پایگاه داده جنگی...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* هدر */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (inBattle ? handleSurrender() : router.back())}
        >
          <Text style={styles.backBtnText}>{inBattle ? '🏳 عقب‌نشینی' : '⬅ لابی اصلی'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚔️ خدای جنگ</Text>
      </View>

      {/* وضعیت لول و نوار پیشرفت */}
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <Text style={styles.statBadge}>سطح: {progress.level}</Text>
          <Text style={styles.statBadge}>کل XP: {playerStats.xp}</Text>
          <Text style={styles.statBadge}>پیروزی‌ها: {playerStats.wins}</Text>
        </View>

        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(
                  100,
                  Math.round((progress.currentLevelProgressXp / progress.neededForCurrentLvl) * 100)
                )}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.xpHint}>
          پیشرفت سطح: {progress.currentLevelProgressXp} / {progress.neededForCurrentLvl} XP ({progress.remainingXp} XP={[styles.vehicleHpBarFill, { width: '100%' }]} />
                  </View>
                </View>

                {/* جزئیات کارت */}
                <View style={styles.vehicleInfoRow}>
                  <View style={styles.vehicleRight}>
                    <Text style={styles.vehicleIcon}>{vehicle.icon}</Text>
                    <View>
                      <Text style={styles.vehicleName}>{vehicle.name}</Text>
                      <Text style={styles.vehicleDetails}>
                        قدرت آتش: {vehicle.power} ⚔️ | زره: {vehicle.armor} 🛡️
                      </Text>
                    </View>
                  </View>
                  <View style={styles.badgeContainer}>
                    <Text style={[styles.vehiclePrice, isUnlocked ? styles.unlockedText : styles.lockedText]}>
                      {isUnlocked ? (isSelected ? '✓ انتخاب‌شده' : 'آماده نبرد') : vehicle.priceLabel}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.startBtn} onPress={startBattle}>
            <Text style={styles.startBtnText}>شروع نبرد آنلاین ⚔️</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // میدان جنگ
        <View style={styles.arena}>
          {/* نوار سلامتی طرفین */}
          <View style={styles.battleHud}>
            <View style={styles.hudPlayer}>
              <Text style={styles.hudName}>{selectedVehicle.name}</Text>
              <Text style={[styles.hudHp, { color: '#00E676' }]}>
                {playerHp} / {selectedVehicle.armor} HP
              </Text>
              <View style={styles.hpBarBg}>
                <View
                  style={[
                    styles.hpBarFill,
                    {
                      width: `${Math.max(0, (playerHp / selectedVehicle.armor) * 100)}%`,
                      backgroundColor: '#00E676',
                    },
                  ]}
                />
              </View>
            </View>

            <Text style={styles.vsBadge}>VS</Text>

            <View style={styles.hudPlayer}>
              <Text style={styles.hudName}>ربات رزمی</Text>
              <Text style={[styles.hudHp, { color: '#FF3366' }]}>
                {enemyHp} / {maxEnemyHp} HP
              </Text>
              <View style={styles.hpBarBg}>
                <View
                  style={[
                    styles.hpBarFill,
                    {
                      width: `${Math.max(0, (enemyHp / maxEnemyHp) * 100)}%`,
                      backgroundColor: '#FF3366',
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* پنل عملیات و مهارت‌ها */}
          <View style={styles.controlPanel}>
            <TouchableOpacity
              style={[styles.mainAttackBtn, isEnemyTurn && styles.disabledSkill]}
              onPress={handleAttack}
              disabled={isEnemyTurn}
            >
              <Text style={styles.mainAttackText}>🔥 شلیک توپ اصلی</Text>
            </TouchableOpacity>

            <View style={styles.skillsRow}>
              <TouchableOpacity
                style={[styles.skillBtn, (airstrikeCooldown > 0 || isEnemyTurn) && styles.disabledSkill]}
                onPress={handleAirstrike}
                disabled={airstrikeCooldown > 0 || isEnemyTurn}
              >
                <Text style={styles.skillBtnText}>
                  🚀 بمباران {airstrikeCooldown > 0 ? `(${airstrikeCooldown})` : ''}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.skillBtn, (shieldActive || isEnemyTurn) && styles.activeSkill]}
                onPress={handleShield}
                disabled={shieldActive || isEnemyTurn}
              >
                <Text style={styles.skillBtnText}>
                  🛡️ {shieldActive ? 'سپر فعال' : 'سپر انرژی'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.skillBtn, (repairCooldown > 0 || isEnemyTurn) && styles.disabledSkill]}
                onPress={handleRepair}
                disabled={repairCooldown > 0 || isEnemyTurn}
              >
                <Text style={styles.skillBtnText}>
                  🔧 تعمیر {repairCooldown > 0 ? `(${repairCooldown})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* وضعیت نوبت */}
          {isEnemyTurn && (
            <View style={styles.turnIndicator}>
              <ActivityIndicator size="small" color="#FF3366" />
              <Text style={styles.turnText}>نوبت شلیک حریف...</Text>
            </View>
          )}

          {/* گزارش زنده نبرد */}
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
    backgroundColor: '#0A0F1D',
  },
  content: {
    padding: 16,
    paddingTop: 45,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: '#0A0F1D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  backBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  statsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginBottom: 10,
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
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'right',
  },
  vehicleCard: {
    backgroundColor: '#162032',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#334155',
    gap: 10,
  },
  selectedCard: {
    borderColor: '#FF3366',
    backgroundColor: '#231525',
  },
  vehicleHpSection: {
    width: '100%',
  },
  vehicleHpHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  vehicleHpTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  vehicleHpValue: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: 'bold',
  },
  vehicleHpBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  vehicleHpBarFill: {
    height: '100%',
    backgroundColor: '#00E676',
    borderRadius: 3,
  },
  vehicleInfoRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  vehicleIcon: {
    fontSize: 28,
  },
  vehicleName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  vehicleDetails: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'right',
  },
  badgeContainer: {
    alignItems: 'flex-start',
  },
  vehiclePrice: {
    fontWeight: 'bold',
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  unlockedText: {
    color: '#00E676',
    backgroundColor: '#064E3B',
  },
  lockedText: {
    color: '#F59E0B',
    backgroundColor: '#451A03',
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
    gap: 14,
  },
  battleHud: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#162032',
    padding: 14,
    borderRadius: 14,
  },
  hudPlayer: {
    flex: 1,
    alignItems: 'center',
  },
  hudName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  hudHp: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  hpBarBg: {
    width: '90%',
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
  },
  vsBadge: {
    color: '#F59E0B',
    fontWeight: '900',
    fontSize: 14,
    marginHorizontal: 8,
  },
  controlPanel: {
    gap: 10,
  },
  mainAttackBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  mainAttackText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skillsRow: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  skillBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  skillBtnText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: 'bold',
  },
  disabledSkill: {
    opacity: 0.4,
  },
  activeSkill: {
    borderColor: '#38BDF8',
    backgroundColor: '#0369A1',
  },
  turnIndicator: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVerticalwidth: '90%',
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
  },
  vsBadge: {
    color: '#F59E0B',
    fontWeight: '900',
    fontSize: 14,
    marginHorizontal: 8,
  },
  controlPanel: {
    gap: 10,
  },
  mainAttackBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  mainAttackText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skillsRow: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  skillBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  skillBtnText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: 'bold',
  },
  disabledSkill: {
    opacity: 0.4,
  },
  activeSkill: {
    borderColor: '#38BDF8',
    backgroundColor: '#0369A1',
  },
  turnIndicator: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  turnText: {
    color: '#FF3366',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  logBox: {
    backgroundColor: '#162032',
    padding: 12,
    borderRadius: 12,
    min
