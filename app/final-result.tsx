import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useTranslation } from 'react-i18next';
import { Crown, Home } from 'lucide-react-native';

type ScoreEntry = {
  user_id: string;
  display_name: string;
  total_score: number;
  position: number;
};

export default function FinalResultScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    const { data } = await supabase
      .from('player_answers')
      .select('user_id, score, profiles:profiles(display_name)')
      .eq('room_id', roomId as string);

    if (!data) {
      setLoading(false);
      return;
    }

    const scoreMap: Record<string, ScoreEntry> = {};
    (data as unknown as { user_id: string; score: number; profiles: { display_name: string } }[]).forEach((row) => {
      if (!scoreMap[row.user_id]) {
        scoreMap[row.user_id] = {
          user_id: row.user_id,
          display_name: row.profiles.display_name,
          total_score: 0,
          position: 0,
        };
      }
      scoreMap[row.user_id].total_score += row.score || 0;
    });

    const sorted = Object.values(scoreMap).sort((a, b) => b.total_score - a.total_score);
    sorted.forEach((s, i) => (s.position = i + 1));
    setScores(sorted);
    setLoading(false);
  }, [roomId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  if (loading) return <LoadingScreen message={t('finalResult.loading')} />;

  const winner = scores[0];
  const myScore = scores.find((s) => s.user_id === profile?.id);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.bg, '#0F0F12', Colors.bg]} style={styles.gradient} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Crown color={Colors.gold} size={48} strokeWidth={2} />
          <Text style={styles.title}>{t('finalResult.title')}</Text>
        </View>

        {/* Winner spotlight */}
        {winner && (
          <View style={styles.winnerCard}>
            <View style={styles.crownBadge}>
              <Crown color={Colors.gold} size={20} strokeWidth={2} />
              <Text style={styles.crownText}>{t('finalResult.winnerBadge')}</Text>
            </View>
            <Avatar name={winner.display_name} size={72} />
            <Text style={styles.winnerName}>{winner.display_name}</Text>
            <Text style={styles.winnerScore}>{winner.total_score} {t('finalResult.winnerScore').split(' ')[1]}</Text>
          </View>
        )}

        {/* Full ranking */}
        <Text style={styles.sectionTitle}>{t('finalResult.rankingTitle')}</Text>
        <View style={styles.rankingList}>
          {scores.map((s, i) => (
            <View
              key={s.user_id}
              style={[
                styles.rankCard,
                i === 0 && styles.rankFirst,
                i === 1 && styles.rankSecond,
                i === 2 && styles.rankThird,
                s.user_id === profile?.id && styles.rankMine,
              ]}
            >
              <Text style={[styles.rankNumber, i === 0 && styles.rankNumberGold]}>
                {i + 1}
              </Text>
              <Avatar name={s.display_name} size={36} />
              <View style={styles.rankInfo}>
                <Text style={styles.rankName}>{s.display_name}</Text>
                {s.user_id === profile?.id && <Text style={styles.rankYou}>{t('finalResult.rankMine')}</Text>}
              </View>
              <Text style={styles.rankScore}>{s.total_score}</Text>
            </View>
          ))}
        </View>

        {myScore && (
          <View style={styles.myResult}>
            <Text style={styles.myResultText}>
              {t('finalResult.myResult', { pos: myScore.position, score: myScore.total_score })}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={t('finalResult.homeButton')}
          onPress={() => router.replace('/(tabs)/home')}
          variant="gold"
          size="lg"
          icon={<Home color={Colors.textInverse} size={20} strokeWidth={2.5} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  gradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 120, paddingTop: 60 },
  header: { alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
  title: { fontSize: 24, fontFamily: Fonts.display, color: Colors.text },
  winnerCard: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    borderWidth: 2,
    borderColor: Colors.gold,
    gap: Spacing.md,
    marginBottom: Spacing.xxxl,
  },
  crownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.goldDim,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 1,
    borderRadius: 999,
  },
  crownText: { fontSize: 11, fontFamily: Fonts.bodySemiBold, color: Colors.gold, letterSpacing: 2 },
  winnerName: { fontSize: 22, fontFamily: Fonts.heading, color: Colors.text },
  winnerScore: { fontSize: 28, fontFamily: Fonts.display, color: Colors.gold },
  sectionTitle: { fontSize: 13, fontFamily: Fonts.bodySemiBold, color: Colors.textTertiary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.md },
  rankingList: { gap: Spacing.sm },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md + 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rankFirst: { borderColor: Colors.gold, borderWidth: 2 },
  rankSecond: { borderColor: 'rgba(192,192,192,0.3)', borderWidth: 1.5 },
  rankThird: { borderColor: 'rgba(205,127,50,0.3)', borderWidth: 1.5 },
  rankMine: { borderColor: Colors.blue, borderWidth: 1.5 },
  rankNumber: { fontSize: 20, fontFamily: Fonts.display, color: Colors.textTertiary, width: 28, textAlign: 'center' },
  rankNumberGold: { color: Colors.gold },
  rankInfo: { flex: 1 },
  rankName: { fontSize: 14, fontFamily: Fonts.bodySemiBold, color: Colors.text },
  rankYou: { fontSize: 11, fontFamily: Fonts.body, color: Colors.blue, marginTop: 2 },
  rankScore: { fontSize: 18, fontFamily: Fonts.heading, color: Colors.gold },
  myResult: { alignItems: 'center', marginTop: Spacing.lg },
  myResultText: { fontSize: 14, fontFamily: Fonts.body, color: Colors.textSecondary },
  footer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl + 10 },
});
