import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Trophy, Users, Layers, Calendar } from 'lucide-react-native';

type HistoryEntry = {
  id: string;
  final_score: number;
  position: number;
  total_players: number;
  rounds_played: number;
  created_at: string;
};

export default function GameHistoryScreen() {
  const { profile } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from('game_history')
      .select('id, final_score, position, total_players, rounds_played, created_at')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setHistory(data as HistoryEntry[]);
    }
    setLoading(false);
    setRefreshing(false);
  }, [profile]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) return <LoadingScreen message="Тарих жүктелуде..." />;

  const medals = ['🥇', '🥈', '🥉'];
  const positionColors = [Colors.gold, 'rgba(192,192,192,1)', 'rgba(205,127,50,1)'];

  return (
    <View style={styles.container}>
      <ScreenHeader title="Ойын тарихы" subtitle="Соңғы ойындарыңыз" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchHistory(); }} tintColor={Colors.gold} />}
      >
        {history.length === 0 ? (
          <View style={styles.empty}>
            <Trophy color={Colors.textTertiary} size={48} strokeWidth={1.5} />
            <Text style={styles.emptyText}>Әлі ойын ойнамадыңыз</Text>
            <Text style={styles.emptySub}>Алғашқы ойыныңызды бастаңыз!</Text>
          </View>
        ) : (
          history.map((h) => {
            const isWinner = h.position === 1;
            const date = new Date(h.created_at);
            const dateStr = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
            return (
              <Card key={h.id} style={[styles.historyCard, isWinner && styles.winnerCard]}>
                <View style={styles.positionCircle}>
                  <Text style={[styles.positionText, { color: positionColors[Math.min(h.position - 1, 2)] || Colors.textSecondary }]}>
                    {h.position}
                  </Text>
                </View>
                <View style={styles.historyInfo}>
                  <View style={styles.historyRow}>
                    <Users color={Colors.textTertiary} size={14} strokeWidth={2} />
                    <Text style={styles.historyMeta}>{h.total_players} ойыншы</Text>
                    <Layers color={Colors.textTertiary} size={14} strokeWidth={2} style={{ marginLeft: Spacing.md }} />
                    <Text style={styles.historyMeta}>{h.rounds_played} раунд</Text>
                  </View>
                  <View style={styles.historyRow}>
                    <Calendar color={Colors.textTertiary} size={14} strokeWidth={2} />
                    <Text style={styles.historyDate}>{dateStr}</Text>
                  </View>
                </View>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreValue}>{h.final_score}</Text>
                  <Text style={styles.scoreLabel}>ұпай</Text>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: Spacing.md },
  emptyText: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: Colors.textSecondary },
  emptySub: { fontSize: 13, fontFamily: Fonts.body, color: Colors.textTertiary },
  historyCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm, padding: Spacing.md + 2 },
  winnerCard: { borderColor: Colors.borderGold, borderWidth: 2 },
  positionCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  positionText: { fontSize: 18, fontFamily: Fonts.display },
  historyInfo: { flex: 1, gap: 4 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  historyMeta: { fontSize: 12, fontFamily: Fonts.body, color: Colors.textSecondary },
  historyDate: { fontSize: 12, fontFamily: Fonts.body, color: Colors.textTertiary },
  scoreBox: { alignItems: 'center' },
  scoreValue: { fontSize: 20, fontFamily: Fonts.heading, color: Colors.gold },
  scoreLabel: { fontSize: 10, fontFamily: Fonts.body, color: Colors.textTertiary },
});
