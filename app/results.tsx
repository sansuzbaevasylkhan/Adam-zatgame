import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Trophy, Medal, User } from 'lucide-react-native';

export default function ResultsScreen() {
  const { roomId } = useLocalSearchParams();
  const router = useRouter();
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    async function fetchResults() {
      setLoading(true);
      try {
        // In a real game, we would have a backend function to calculate scores.
        // For now, we fetch all answers for this room and round 1.
        const { data: answers, error } = await supabase
          .from('player_answers')
          .select('user_id, answer, score, profiles(display_name)')
          .eq('room_id', roomId);

        if (error) throw error;

        // Basic scoring logic: Sum of scores per user
        const userScores: { [key: string]: { name: string, score: number } } = {};

        answers?.forEach(ans => {
          const userId = ans.user_id;
          const name = ans.profiles?.display_name || 'Ойыншы';
          if (!userScores[userId]) {
            userScores[userId] = { name, score: 0 };
          }
          userScores[userId].score += ans.score;
        });

        const sortedRankings = Object.entries(userScores)
          .map(([id, data]) => ({ id, ...data }))
          .sort((a, b) => b.score - a.score);

        setRankings(sortedRankings);
      } catch (error: any) {
        Alert.alert('Қателік', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [roomId]);

  if (loading) return <View style={styles.center}><Text style={{color: Colors.text}}>Нәтижелер есептелуде...</Text></View>;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Нәтижелер" subtitle="Раунд қорытындысы" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {rankings.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>Әлі ешқандай нәтиже жоқ</Text>
          </Card>
        ) : (
          <View style={styles.rankingsList}>
            {rankings.map((player, index) => (
              <Card
                key={player.id}
                style={[
                  styles.playerCard,
                  index === 0 ? styles.winnerCard : {}
                ]}
              >
                <View style={styles.rankInfo}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.playerDetails}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.playerScore}>{player.score} ұпай</Text>
                  </View>
                  {index === 0 && <Trophy color={Colors.gold} size={24} />}
                </View>
              </Card>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Button
            title="Басты бетке қайту"
            onPress={() => router.replace('/(tabs)/home')}
            variant="outline"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  scroll: { padding: Spacing.lg, paddingBottom: 100 },
  rankingsList: { gap: Spacing.md, marginTop: Spacing.md },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  winnerCard: {
    borderColor: Colors.gold,
    borderWidth: 2,
    backgroundColor: '#25252b',
  },
  rankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 14,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.text,
  },
  playerDetails: {
    flex: 1,
    gap: 2,
  },
  playerName: {
    fontSize: 16,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.text,
  },
  playerScore: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
  },
  footer: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
});
