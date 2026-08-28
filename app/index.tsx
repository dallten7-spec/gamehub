import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isVip, setIsVip] = useState(false);
  const [gameStats, setGameStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      
      // دریافت وضعیت اشتراک
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_vip, vip_until')
        .eq('id', session.user.id)
        .single();
      if (profile) setIsVip(profile.is_vip || false);

      // دریافت لول و امتیاز بازی‌ها
      const { data: stats } = await supabase
        .from('user_game_stats')
        .select('*')
        .eq('user_id', session.user.id);
      if (stats) setGameStats(stats);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const getStats = (gameId: string) => {
    const s = gameStats.find((item) => item.game_id === gameId);
    return { level: s ? s.level : 1, xp: s ? s.xp : 0 };
  };

  const games = [
    {
      id: 'war_god',
      title: 'خدای جنگ (نبرد ماشین‌ها)',
      icon: '🚗💥',
      route: '/app/games/war-god',
      color: '#EF4444',
      tag: 'اکشن / مبارزه‌ای',
    },
    {
      id: 'haft_khan',
      title: 'هفت‌خان آنلاین',
      icon: '🛡️',
      route: '/app/games/haft-khan',
      color: '#3B82F6',
      tag: 'استراتژیک کارتی',
    },
    {
      id: 'billiards',
      title: 'بیلیارد ۸-Ball',
      icon: '🎱',
      route: '/app/games/billiards',
      color: '#10B981',
      tag: 'واقع‌گرایانه / فیزیک',
    },
    {
      id: 'soccer',
      title: 'فوتبال مهره‌ای (Soccer Stars)',
      icon: '⚽',
      route: '/app/games/soccer',
      color: '#F59E0B',
      tag: 'نوبتی / رقابتی',
    },
  ];

  return (
    <View style={styles.container}>
      {/* هدر بالای صفحه */}
      <View style={styles.header}>
        <View style={styles.vipBadge}>
          <Text style={styles.vipText}>{isVip ? '👑 عضویت طلایی VIP' : 'عضویت عادی'}</Text>
        </View>
        <Text style={styles.brandTitle}>GameHub 🎮</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchUserData} tintColor="#38BDF8" />}
      >
        {/* بنر خوش‌آمدگویی و تراز کاربر */}
        <View style={styles.banner}>
          <Text style={styles.welcomeTitle}>میدان نبرد آنلاین GameHub</Text>
          <Text style={styles.welcomeSubtitle}>یک بازی را انتخاب کنید و حریف بطلبید!</Text>
        </View>

        {/* لیست بازی‌ها */}
        <Text style={styles.sectionTitle}>بازی‌های فعال و آنلاین:</Text>

        {games.map((g) => {
          const stats = getStats(g.id);
          return (
            <TouchableOpacity
              key={g.id}
              style={[styles.gameCard, { borderColor: g.color }]}
              onPress={() => router.push(g.route as any)}
            >
              <View style={styles.gameInfo}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.gameTag, { backgroundColor: g.color + '22', color: g.color }]}>
                    {g.tag}
                  </Text>
                  <Text style={styles.gameTitle}>{g.title} {g.icon}</Text>
                </View>

                <View style={styles.statsRow}>
                  <Text style={styles.statValue}>لول {stats.level} (XP: {stats.xp})</Text>
                  <Text style={styles.statLabel}>سطح اختصاصی:</Text>
                </View>
              </View>

              <View style={[styles.playButton, { backgroundColor: g.color }]}>
                <Text style={styles.playButtonText}>ورود ➔</Text>
              </View>
            </TouchableOpacity>
          );
        })}
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
  brandTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#38BDF8',
  },
  vipBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  vipText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  banner: {
    backgroundColor: '#131A2E',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  welcomeSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'right',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 14,
    textAlign: 'right',
  },
  gameCard: {
    backgroundColor: '#131A2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  gameTag: {
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    gap: 6,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  statValue: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  playButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
