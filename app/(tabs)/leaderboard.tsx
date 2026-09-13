import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useTranslation } from 'react-i18next';
import { Trophy, Medal } from 'lucide-react-native';

type LeaderEntry = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  total_games: number;
  total_wins: number;
  total_score: number;
};

export default function LeaderboardScreen() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaders = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, total_games, total_wins, total_score')
      .order('total_score', { ascending: false })
      .limit(50);

    if (!error && data) {
      setLeaders(data as LeaderEntry[]);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchLeaders();
  }, [fetchLeaders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaders();
  };

  if (loading) return <LoadingScreen message={t('leaderboard') + ' жүктелуде...'} />;

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);
  const myRank = leaders.findIndex((l) => l.id === profile?.id);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Trophy color={Colors.gold} size={24} strokeWidth={2} />
        <Text style={styles.headerTitle}>{t('leaderboard')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />}
      >
        {top3.length >= 3 && (
          <View style={styles.podium}>
            {/* 2nd */}
            <View style={styles.podiumItem}>
              <Avatar name={top3[1].display_name} avatarUrl={top3[1].avatar_url} size={56} />
              <Text style={styles.podiumName} numberOfLines={1}>{top3[1].display_name}</Text>
              <Text style={styles.podiumScore}>{top3[1].total_score}</Text>
              <View style={[styles.podiumStep, styles.podiumStep2]}>
                <Text style={styles.podiumStepNum}>2</Text>
              </View>
            </View>
            {/* 1st */}
            <View style={styles.podiumItem}>
              <View style={styles.crownCircle}>
                <Medal color={Colors.gold} size={20} strokeWidth={2} />
              </View>
              <Avatar name={top3[0].display_name} avatarUrl={top3[0].avatar_url} size={68} />
              <Text style={[styles.podiumName, styles.podiumName1]} numberOfLines={1}>{top3[0].display_name}</Text>
              <Text style={[styles.podiumScore, styles.podiumScore1]}>{top3[0].total_score}</Text>
              <View style={[styles.podiumStep, styles.podiumStep1]}>
                <Text style={styles.podiumStepNum}>1</Text>
              </View>
            </View>
            {/* 3rd */}
            <View style={styles.podiumItem}>
              <Avatar name={top3[2].display_name} avatarUrl={top3[2].avatar_url} size={56} />
              <Text style={styles.podiumName} numberOfLines={1}>{top3[2].display_name}</Text>
              <Text style={styles.podiumScore}>{top3[2].total_score}</Text>
              <View style={[styles.podiumStep, styles.podiumStep3]}>
                <Text style={styles.podiumStepNum}>3</Text>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>{t('general')}</Text>
        <View style={styles.list}>
          {rest.map((entry, i) => {
            const rank = i + 4;
            const isMe = entry.id === profile?.id;
            return (
              <Card key={entry.id} style={[styles.entryCard, isMe && styles.entryMine]}>
                <Text style={[styles.entryRank, isMe && styles.entryRankMine]}>{rank}</Text>
                <Avatar name={entry.display_name} avatarUrl={entry.avatar_url} size={36} />
                <View style={styles.entryInfo}>
                  <Text style={styles.entryName} numberOfLines={1}>
                    {entry.display_name} {isMe && t('me')}
                  </Text>
                  <Text style={styles.entryStats}>{entry.total_wins} {t('wins')} · {entry.total_games} {t('games')}</Text>
                </View>
                <Text style={styles.entryScore}>{entry.total_score}</Text>
              </Card>
            );
          })}
        </View>

        {myRank >= 0 && (
          <View style={styles.myRankCard}>
            <Text style={styles.myRankText}>{t('your_rank')}: {myRank + 1}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  headerTitle: { fontSize: 22, fontFamily: Fonts.heading, color: Colors.text },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xxxl,
    marginTop: Spacing.lg,
  },
  podiumItem: { alignItems: 'center', gap: 6, flex: 1 },
  crownCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.goldDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  podiumName: { fontSize: 13, fontFamily: Fonts.bodySemiBold, color: Colors.textSecondary, textAlign: 'center' },
  podiumName1: { color: Colors.gold, fontSize: 14 },
  podiumScore: { fontSize: 16, fontFamily: Fonts.heading, color: Colors.text },
  podiumScore1: { color: Colors.gold, fontSize: 18 },
  podiumStep: {
    width: '100%',
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  podiumStep1: { backgroundColor: 'rgba(232,185,72,0.15)', borderWidth: 1, borderColor: Colors.gold, height: 56 },
  podiumStep2: { backgroundColor: 'rgba(192,192,192,0.1)', borderWidth: 1, borderColor: 'rgba(192,192,192,0.3)', height: 44 },
  podiumStep3: { backgroundColor: 'rgba(205,127,50,0.1)', borderWidth: 1, borderColor: 'rgba(205,127,50,0.3)', height: 36 },
  podiumStepNum: { fontSize: 18, fontFamily: Fonts.display, color: Colors.text },
  sectionTitle: { fontSize: 13, fontFamily: Fonts.bodySemiBold, color: Colors.textTertiary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.md },
  list: { gap: Spacing.sm },
  entryCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  entryMine: { borderColor: Colors.blue, borderWidth: 1.5 },
  entryRank: { fontSize: 16, fontFamily: Fonts.display, color: Colors.textTertiary, width: 24, textAlign: 'center' },
  entryRankMine: { color: Colors.blue },
  entryInfo: { flex: 1 },
  entryName: { fontSize: 14, fontFamily: Fonts.bodySemiBold, color: Colors.text },
  entryStats: { fontSize: 11, fontFamily: Fonts.body, color: Colors.textSecondary, marginTop: 2 },
  entryScore: { fontSize: 16, fontFamily: Fonts.heading, color: Colors.gold },
  myRankCard: { alignItems: 'center', marginTop: Spacing.lg, padding: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.borderGold },
  myRankText: { fontSize: 14, fontFamily: Fonts.bodySemiBold, color: Colors.gold },
});
