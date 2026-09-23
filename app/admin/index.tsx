import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '@/constants/theme';
import { Users, Trophy, Zap } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function AdminIndex() {
  const [stats, setStats] = useState({ users: 0, games: 0, totalScore: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: gameCount } = await supabase.from('game_rooms').select('*', { count: 'exact', head: true });

      const { data: scores } = await supabase.from('player_answers').select('score');
      const total = scores?.reduce((sum, item) => sum + (item.score || 0), 0) || 0;

      setStats({ users: userCount || 0, games: gameCount || 0, totalScore: total });
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) return <View style={styles.center}><Text style={styles.loadingText}>Жүктелуде...</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Қош келдіңіз, Администратор!</Text>
        <Text style={styles.subtitle}>Жүйе статистикасы мен басқару панелі</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Пайдаланушылар"
          value={stats.users}
          icon={<Users color={Colors.gold} size={28} />}
          color="#D4AF37"
        />
        <StatCard
          title="Ойындар саны"
          value={stats.games}
          icon={<Zap color={Colors.gold} size={28} />}
          color="#D4AF37"
        />
        <StatCard
          title="Жалпы ұпай"
          value={stats.totalScore}
          icon={<Trophy color={Colors.gold} size={28} />}
          color="#D4AF37"
        />
      </View>
    </ScrollView>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <View style={styles.card}>
      <View style={styles.cardIcon}>{icon}</View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    paddingTop: 60,
    backgroundColor: '#0A0A0C',
    flexGrow: 1
  },
  header: { marginBottom: 40 },
  title: {
    fontSize: 32,
    fontFamily: Fonts.display,
    color: Colors.text,
    letterSpacing: 1
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    marginTop: 8
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'space-between'
  },
  card: {
    backgroundColor: '#16161C',
    width: '31%',
    padding: 20,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#2A2A32',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardIcon: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 50
  },
  cardInfo: { alignItems: 'center' },
  cardTitle: {
    fontSize: 14,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.textSecondary,
    marginBottom: 8
  },
  cardValue: {
    fontSize: 28,
    fontFamily: Fonts.heading,
    color: Colors.gold,
    fontWeight: 'bold'
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0C' },
  loadingText: { color: Colors.textSecondary, fontFamily: Fonts.body }
});
