import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react-native';

export default function AdminRanking() {
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRankings() {
      // Get all players' total scores
      const { data: answers } = await supabase
        .from('player_answers')
        .select('user_id, score');

      if (!answers) {
        setLoading(false);
        return;
      }

      // Calculate total score for each user
      const scoreMap: Record<string, number> = {};
      answers.forEach(ans => {
        scoreMap[ans.user_id] = (scoreMap[ans.user_id] || 0) + (ans.score || 0);
      });

      // Get profiles for these users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, created_at');

      if (profiles) {
        const results = profiles.map(p => ({
          user_id: p.id,
          display_name: p.display_name || 'Белгісіз',
          created_at: p.created_at,
          total_score: scoreMap[p.id] || 0
        }));

        // Sort by total score descending
        setRankings(results.sort((a, b) => b.total_score - a.total_score));
      }
      setLoading(false);
    }
    fetchRankings();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  if (loading) return <View style={styles.center}><Text style={styles.loadingText}>Жүктелуде...</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Trophy color={Colors.gold} size={32} />
          <Text style={styles.title}>Жалпы Рейтинг</Text>
        </View>
      </View>

      <View style={styles.rankingList}>
        {rankings.map((user, index) => {
          const rank = index + 1;
          let rankColor = Colors.text;
          let rankBadge = '';
          let cardStyle = styles.rankingCard;

          if (rank === 1) {
            rankColor = '#FFD700'; // Gold
            rankBadge = '🥇';
            cardStyle = [styles.rankingCard, styles.cardGold];
          } else if (rank === 2) {
            rankColor = '#C0C0C0'; // Silver
            rankBadge = '🥈';
            cardStyle = [styles.rankingCard, styles.cardSilver];
          } else if (rank === 3) {
            rankColor = '#CD7F32'; // Bronze
            rankBadge = '🥉';
            cardStyle = [styles.rankingCard, styles.cardBronze];
          }

          return (
            <View key={user.user_id} style={cardStyle}>
              <View style={styles.rankInfo}>
                <Text style={[styles.rankNumber, { color: rankColor }]}>{rank}</Text>
                <Text style={styles.rankEmoji}>{rankBadge}</Text>
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.display_name}</Text>
                <Text style={styles.userDate}>{formatDate(user.created_at)}</Text>
              </View>

              <View style={styles.scoreInfo}>
                <Text style={styles.scoreValue}>{user.total_score}</Text>
                <Text style={styles.scoreLabel}>ұпай</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    paddingTop: 60,
    backgroundColor: '#0A0A0C',
    flexGrow: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: {
    fontSize: 28,
    fontFamily: Fonts.display,
    color: Colors.text,
    letterSpacing: 1
  },
  rankingList: { gap: 12 },
  rankingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16161C',
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#2A2A32',
  },
  cardGold: { borderColor: '#FFD700', backgroundColor: 'rgba(255, 215, 0, 0.05)' },
  cardSilver: { borderColor: '#C0C0C0', backgroundColor: 'rgba(192, 192, 192, 0.05)' },
  cardBronze: { borderColor: '#CD7F32', backgroundColor: 'rgba(205, 127, 50, 0.05)' },
  rankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 60
  },
  rankNumber: {
    fontSize: 20,
    fontFamily: Fonts.heading,
    fontWeight: 'bold'
  },
  rankEmoji: {
    fontSize: 16
  },
  userInfo: {
    flex: 1,
    marginLeft: 10
  },
  userName: {
    fontSize: 16,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.text
  },
  userDate: {
    fontSize: 12,
    fontFamily: Fonts.body,
    color: Colors.textSecondary
  },
  scoreInfo: {
    alignItems: 'flex-end',
    gap: -4
  },
  scoreValue: {
    fontSize: 20,
    fontFamily: Fonts.heading,
    color: Colors.gold,
    fontWeight: 'bold'
  },
  scoreLabel: {
    fontSize: 10,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.textSecondary,
    textAlign: 'right'
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0C' },
  loadingText: { style: { color: Colors.textSecondary, fontFamily: Fonts.body } }
});
