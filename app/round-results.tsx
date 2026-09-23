import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { pickRandomLetter, pickRandomCategories } from '@/constants/game';
import { Check, X, ChevronRight } from 'lucide-react-native';

type RoomData = {
  id: string;
  host_id: string;
  round: number;
  total_rounds: number;
  letter: string | null;
  categories: string[];
  round_duration: number;
  status: string;
};

type AnswerRow = {
  user_id: string;
  category: string;
  answer: string;
  score: number;
  profiles: { display_name: string };
};

type PlayerScore = {
  user_id: string;
  display_name: string;
  round_score: number;
  total_score: number;
};

export default function RoundResultsScreen() {
  const router = useRouter();
  const { roomId, round } = useLocalSearchParams();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [scores, setScores] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateAndSaveScores = async () => {
    const { data: roomData } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('id', roomId as string)
      .single();

    if (!roomData) return;

    const { data: allAnswers } = await supabase
      .from('player_answers')
      .select('user_id, category, answer, round')
      .eq('room_id', roomId as string)
      .eq('round', Number(round));

    if (!allAnswers) return;

    const letter = (roomData.letter || '').toUpperCase();
    const updates = [];

    // Group answers by category to check for duplicates
    const categoryGroups: Record<string, { answer: string, user_id: string }[]> = {};
    allAnswers.forEach(ans => {
      if (!categoryGroups[ans.category]) categoryGroups[ans.category] = [];
      categoryGroups[ans.category].push({ answer: ans.answer.trim().toLowerCase(), user_id: ans.user_id });
    });

    allAnswers.forEach(ans => {
      const userAnswer = ans.answer.trim();
      const lowerAnswer = userAnswer.toLowerCase();
      let score = 0;

      // 1. Check if starts with the correct letter
      if (userAnswer && userAnswer.toUpperCase().startsWith(letter)) {
        // 2. Check for duplicates in the same category
        const othersWithSameAnswer = categoryGroups[ans.category].filter(
          a => a.answer === lowerAnswer && a.user_id !== ans.user_id
        );

        score = othersWithSameAnswer.length === 0 ? 10 : 5;
      }

      updates.push({
        room_id: roomId,
        round: Number(round),
        user_id: ans.user_id,
        category: ans.category,
        score: score
      });
    });

    if (updates.length > 0) {
      await supabase.from('player_answers').upsert(updates, {
        onConflict: 'room_id,user_id,round,category',
      });
    }
  };

  const fetchData = useCallback(async () => {
    // Only calculate scores if we are the host or if scores are not yet set
    const { data: roomData } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('id', roomId as string)
      .maybeSingle();
    if (!roomData) return;
    setRoom(roomData as RoomData);

    // Ensure scores are calculated before fetching them
    if (roomData.host_id === profile?.id) {
      await calculateAndSaveScores();
    }

    const { data: answerData } = await supabase
      .from('player_answers')
      .select('user_id, category, answer, score, profiles:profiles(display_name)')
      .eq('room_id', roomId as string)
      .eq('round', Number(round));
    if (answerData) setAnswers(answerData as unknown as AnswerRow[]);

    // Calculate scores
    const { data: allAnswers } = await supabase
      .from('player_answers')
      .select('user_id, score, profiles:profiles(display_name)')
      .eq('room_id', roomId as string)
      .lte('round', Number(round));

    if (allAnswers) {
      const scoreMap: Record<string, PlayerScore> = {};
      (allAnswers as unknown as AnswerRow[]).forEach((a) => {
        if (!scoreMap[a.user_id]) {
          scoreMap[a.user_id] = {
            user_id: a.user_id,
            display_name: a.profiles.display_name,
            round_score: 0,
            total_score: 0,
          };
        }
        scoreMap[a.user_id].total_score += a.score || 0;
      });

      // Add this round's scores
      (answerData as unknown as AnswerRow[] || []).forEach((a) => {
        if (scoreMap[a.user_id]) {
          scoreMap[a.user_id].round_score += a.score || 0;
        }
      });

      setScores(Object.values(scoreMap).sort((a, b) => b.total_score - a.total_score));
    }

    setLoading(false);
  }, [roomId, round]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isHost = room?.host_id === profile?.id;
  const isLastRound = room && room.round >= room.total_rounds;

  const handleNextRound = async () => {
    if (!room || !isHost) return;

    if (isLastRound) {
      // Save game history
      const { data: players } = await supabase
        .from('room_players')
        .select('user_id')
        .eq('room_id', room.id);

      if (players) {
        const sorted = [...scores].sort((a, b) => b.total_score - a.total_score);
        const historyRows = sorted.map((s, i) => ({
          room_id: room.id,
          user_id: s.user_id,
          final_score: s.total_score,
          position: i + 1,
          total_players: players.length,
          rounds_played: room.total_rounds,
        }));
        await supabase.from('game_history').insert(historyRows);

        // Update profiles
        for (const s of sorted) {
          const isWinner = s.user_id === sorted[0].user_id;
          await supabase.rpc('increment_profile_stats', {
            p_user_id: s.user_id,
            p_games: 1,
            p_wins: isWinner ? 1 : 0,
            p_score: s.total_score,
          }).then(() => {});
          // Fallback if rpc doesn't exist
          const { data: prof } = await supabase
            .from('profiles')
            .select('total_games, total_wins, total_score')
            .eq('id', s.user_id)
            .maybeSingle();
          if (prof) {
            await supabase.from('profiles').update({
              total_games: (prof.total_games || 0) + 1,
              total_wins: (prof.total_wins || 0) + (isWinner ? 1 : 0),
              total_score: (prof.total_score || 0) + s.total_score,
            }).eq('id', s.user_id);
          }
        }
      }

      await supabase.from('game_rooms').update({ status: 'finished' }).eq('id', room.id);
    } else {
      const newLetter = pickRandomLetter();
      const newCategories = pickRandomCategories(room.categories.length);
      await supabase.from('game_rooms').update({
        round: room.round + 1,
        letter: newLetter,
        categories: newCategories,
        stop_triggered_by: null,
        status: 'playing',
      }).eq('id', room.id);
    }
  };

  if (loading || !room) return <LoadingScreen message={t('roundResults.loading')} />;

  const categories = room.categories;
  const playerIds = [...new Set(answers.map((a) => a.user_id))];

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('roundResults.title', { round: room.round })} showBack={false} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.letterHeader}>
          <Text style={styles.letterLabel}>{t('game.letterLabel')}</Text>
          <Text style={styles.letter}>{room.letter}</Text>
        </View>

        {/* Answer comparison table */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroll}>
          <View style={styles.table}>
            {/* Header row */}
            <View style={styles.tableHeader}>
              <View style={styles.tableCellName}>
                <Text style={styles.headerText}>{t('roundResults.table.player')}</Text>
              </View>
              {categories.map((cat) => (
                <View key={cat} style={styles.tableCellCat}>
                  <Text style={styles.headerTextSmall}>{cat}</Text>
                </View>
              ))}
              <View style={styles.tableCellScore}>
                <Text style={styles.headerText}>{t('roundResults.table.score')}</Text>
              </View>
            </View>

            {/* Player rows */}
            {playerIds.map((uid) => {
              const playerAnswers = answers.filter((a) => a.user_id === uid);
              const playerName = playerAnswers[0]?.profiles.display_name ?? '?';
              const totalScore = playerAnswers.reduce((sum, a) => sum + (a.score || 0), 0);
              return (
                <View key={uid} style={styles.tableRow}>
                  <View style={styles.tableCellName}>
                    <View style={styles.nameCell}>
                      <Avatar name={playerName} size={24} />
                      <Text style={styles.playerName} numberOfLines={1}>{playerName}</Text>
                    </View>
                  </View>
                  {categories.map((cat) => {
                    const ans = playerAnswers.find((a) => a.category === cat);
                    const hasAnswer = ans && ans.answer.trim();
                    const valid = hasAnswer && ans.answer.toUpperCase().startsWith((room.letter ?? '').toUpperCase());
                    return (
                      <View key={cat} style={styles.tableCellCat}>
                        {hasAnswer ? (
                          <View style={styles.answerCell}>
                            {valid ? (
                              <Check color={Colors.green} size={12} strokeWidth={3} />
                            ) : (
                              <X color={Colors.red} size={12} strokeWidth={3} />
                            )}
                            <Text style={styles.answerText} numberOfLines={1}>{ans!.answer}</Text>
                          </View>
                        ) : (
                          <Text style={styles.noAnswer}>—</Text>
                        )}
                      </View>
                    );
                  })}
                  <View style={styles.tableCellScore}>
                    <Text style={styles.scoreText}>{totalScore}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Total scores */}
        <Text style={styles.sectionTitle}>{t('roundResults.totalScoreTitle')}</Text>
        <View style={styles.scoresList}>
          {scores.map((s, i) => (
            <Card key={s.user_id} style={[styles.scoreCard, i === 0 && styles.scoreCardFirst]}>
              <View style={styles.scoreRank}>
                <Text style={[styles.rankText, i === 0 && styles.rankFirst]}>{i + 1}</Text>
              </View>
              <Avatar name={s.display_name} size={32} />
              <Text style={styles.scoreName}>{s.display_name}</Text>
              <Text style={styles.scoreValue}>{s.total_score}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>

      {isHost && (
        <View style={styles.footer}>
          <Button
            label={isLastRound ? t('finalResult.homeButton') : t('roundResults.nextRoundButton')}
            onPress={handleNextRound}
            variant="gold"
            size="lg"
            icon={<ChevronRight color={Colors.textInverse} size={20} strokeWidth={2.5} />}
          />
        </View>
      )}
      {!isHost && (
        <View style={styles.footer}>
          <Text style={styles.waitingText}>{t('roundResults.waitingHost')}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 120 },
  letterHeader: { alignItems: 'center', marginVertical: Spacing.lg },
  letterLabel: { fontSize: 10, fontFamily: Fonts.bodySemiBold, color: Colors.textTertiary, letterSpacing: 2 },
  letter: { fontSize: 40, fontFamily: Fonts.display, color: Colors.gold },
  tableScroll: { marginBottom: Spacing.xl },
  table: { minWidth: '100%' },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: Spacing.sm },
  tableHeaderCell: {},
  tableCellName: { width: 100, paddingRight: Spacing.sm },
  tableCellCat: { width: 90, paddingHorizontal: 4 },
  tableCellScore: { width: 50, alignItems: 'center' },
  headerText: { fontSize: 12, fontFamily: Fonts.bodySemiBold, color: Colors.textSecondary },
  headerTextSmall: { fontSize: 10, fontFamily: Fonts.bodySemiBold, color: Colors.textTertiary, textAlign: 'center' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  nameCell: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  playerName: { fontSize: 12, fontFamily: Fonts.bodySemiBold, color: Colors.text, flex: 1 },
  answerCell: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  answerText: { fontSize: 11, fontFamily: Fonts.body, color: Colors.textSecondary, flex: 1 },
  noAnswer: { fontSize: 12, fontFamily: Fonts.body, color: Colors.textTertiary, textAlign: 'center' },
  scoreText: { fontSize: 14, fontFamily: Fonts.bodyBold, color: Colors.gold, textAlign: 'center' },
  sectionTitle: { fontSize: 13, fontFamily: Fonts.bodySemiBold, color: Colors.textTertiary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.md },
  scoresList: { gap: Spacing.sm },
  scoreCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  scoreCardFirst: { borderColor: Colors.borderGold, borderWidth: 2 },
  scoreRank: { width: 28, alignItems: 'center' },
  rankText: { fontSize: 18, fontFamily: Fonts.display, color: Colors.textSecondary },
  rankFirst: { color: Colors.gold },
  scoreName: { flex: 1, fontSize: 14, fontFamily: Fonts.bodySemiBold, color: Colors.text },
  scoreValue: { fontSize: 18, fontFamily: Fonts.heading, color: Colors.gold },
  footer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl + 10 },
  waitingText: { fontSize: 13, fontFamily: Fonts.body, color: Colors.textTertiary, textAlign: 'center' },
});
