import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/toast';
import { useTranslation } from 'react-i18next';
import { pickRandomLetter, pickRandomCategories } from '@/constants/game';
import { Hand, Clock, AlertCircle } from 'lucide-react-native';
import type { RealtimeChannel } from '@supabase/supabase-js';

type RoomData = {
  id: string;
  code: string;
  host_id: string;
  status: string;
  round: number;
  total_rounds: number;
  round_duration: number;
  letter: string | null;
  categories: string[];
  stop_triggered_by: string | null;
};

type Player = {
  user_id: string;
  is_host: boolean;
  profiles: { display_name: string };
};

type AnswerMap = Record<string, string>;

export default function GameScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams();
  const { profile } = useAuth();
  const { show } = useToast();
  const { t } = useTranslation();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stopOverlay, setStopOverlay] = useState(false);
  const [stopperName, setStopperName] = useState<string>('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasSubmittedRef = useRef(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchRoom = useCallback(async () => {
    const { data } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('id', roomId as string)
      .maybeSingle();
    if (!data) return;
    setRoom(data as RoomData);

    if (data.status === 'finished') {
      router.replace(`/final-result?roomId=${roomId}`);
      return;
    }

    if (data.status === 'round_results' || (data.stop_triggered_by && !stopOverlay)) {
      router.replace(`/round-results?roomId=${roomId}&round=${data.round}`);
      return;
    }

    if (data.letter && data.status === 'playing' && timeLeft === 0) {
      setTimeLeft(data.round_duration);
    }
  }, [roomId, timeLeft, stopOverlay, router]);

  const fetchPlayers = useCallback(async () => {
    const { data } = await supabase
      .from('room_players')
      .select('user_id, is_host, profiles:profiles(display_name)')
      .eq('room_id', roomId as string)
      .order('joined_at', { ascending: true });
    if (data) setPlayers(data as unknown as Player[]);
  }, [roomId]);

  useEffect(() => {
    fetchRoom();
    fetchPlayers().finally(() => setLoading(false));

    const channel = supabase
      .channel(`game-${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomId}` }, (payload) => {
        const newRoom = payload.new as RoomData;
        setRoom(newRoom);

        if (newRoom.status === 'finished') {
          router.replace(`/final-result?roomId=${roomId}`);
          return;
        }

        if (newRoom.stop_triggered_by && !stopOverlay) {
          const stopper = players.find((p) => p.user_id === newRoom.stop_triggered_by);
          setStopperName(stopper?.profiles.display_name ?? t('game.stopper.someone'));
          setStopOverlay(true);
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => {
            router.replace(`/round-results?roomId=${roomId}&round=${newRoom.round}`);
          }, 2500);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` }, () => {
        fetchPlayers();
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && room?.status === 'playing' && !stopOverlay) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [timeLeft, room?.status, stopOverlay]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (timeLeft === 0 && room?.status === 'playing' && !hasSubmittedRef.current && !stopOverlay) {
      handleSubmitAnswers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, room?.status, stopOverlay]);

  const handleStop = async () => {
    if (!profile || !room || room.stop_triggered_by) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setStopperName(profile.display_name);
    setStopOverlay(true);

    await supabase
      .from('game_rooms')
      .update({ stop_triggered_by: profile.id })
      .eq('id', room.id);

    await handleSubmitAnswers();
  };

  const handleSubmitAnswers = async () => {
    if (!profile || !room || hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    setSubmitting(true);

    const rows = room.categories.map((cat) => ({
      room_id: room.id,
      user_id: profile.id,
      round: room.round,
      letter: room.letter,
      category: cat,
      answer: answers[cat] ?? '',
      score: 0,
    }));

    if (rows.length > 0) {
      await supabase.from('player_answers').upsert(rows, {
        onConflict: 'room_id,user_id,round,category',
      });
    }

    setSubmitting(false);

    if (!room.stop_triggered_by) {
      // Wait for host to trigger round results
    }
  };

  // Host: trigger round results after stop or all submitted
  useEffect(() => {
    if (!room || !profile || room.host_id !== profile.id) return;
    if (!room.stop_triggered_by && timeLeft > 0) return;

    const checkAndAdvance = async () => {
      const { count } = await supabase
        .from('player_answers')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id)
        .eq('round', room.round);

      const expected = players.length * room.categories.length;
      if (count && count >= expected) {
        if (room.round >= room.total_rounds) {
          await supabase.from('game_rooms').update({ status: 'finished' }).eq('id', room.id);
        } else {
          await supabase.from('game_rooms').update({ status: 'round_results' }).eq('id', room.id);
        }
      }
    };

    const timer = setTimeout(checkAndAdvance, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.stop_triggered_by, timeLeft, players.length]);

  if (loading || !room) return <LoadingScreen message="Ойын жүктелуде..." />;

  if (stopOverlay) {
    return (
      <View style={styles.stopOverlay}>
        <View style={styles.stopContent}>
          <View style={styles.stopIconCircle}>
            <Hand color={Colors.gold} size={48} strokeWidth={2.5} />
          </View>
          <Text style={styles.stopTitle}>ТОҚТА!</Text>
          <Text style={styles.stopSubtitle}>{stopperName} басты</Text>
        </View>
      </View>
    );
  }

  const progress = (room.round_duration - timeLeft) / room.round_duration;
  const isLowTime = timeLeft <= 10 && timeLeft > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.roundInfo}>
          <Text style={styles.roundLabel}>Раунд {room.round}/{room.total_rounds}</Text>
          <Text style={styles.letterLabel}>ӘРІП</Text>
          <Text style={styles.letter}>{room.letter ?? '?'}</Text>
        </View>
        <View style={[styles.timer, isLowTime && styles.timerLow]}>
          <Clock color={isLowTime ? Colors.red : Colors.gold} size={20} strokeWidth={2} />
          <Text style={[styles.timerText, isLowTime && styles.timerTextLow]}>{timeLeft}s</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${Math.min(progress * 100, 100)}%` }, isLowTime && styles.progressBarLow]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.instruction}>
          {'"'}{room.letter}{'" әрпінен басталатын сөздер жазыңыз'}
        </Text>

        <View style={styles.answersContainer}>
          {room.categories.map((cat) => (
            <View key={cat} style={styles.answerRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{cat}</Text>
              </View>
              <Input
                value={answers[cat] ?? ''}
                onChangeText={(text) => setAnswers((prev) => ({ ...prev, [cat]: text }))}
                placeholder={`${room.letter}...`}
                style={styles.answerInput}
                autoCapitalize="sentences"
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.stopButton, submitting && styles.stopDisabled]}
          onPress={handleStop}
          disabled={submitting || !!room.stop_triggered_by}
          activeOpacity={0.85}
        >
          <Hand color={Colors.textInverse} size={22} strokeWidth={2.5} />
          <Text style={styles.stopButtonText}>ТОҚТА!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 56,
    paddingBottom: Spacing.md,
  },
  roundInfo: { gap: 2 },
  roundLabel: { fontSize: 13, fontFamily: Fonts.bodySemiBold, color: Colors.textSecondary },
  letterLabel: { fontSize: 10, fontFamily: Fonts.bodySemiBold, color: Colors.textTertiary, letterSpacing: 2 },
  letter: { fontSize: 32, fontFamily: Fonts.display, color: Colors.gold },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  timerLow: { borderColor: Colors.red },
  timerText: { fontSize: 18, fontFamily: Fonts.heading, color: Colors.gold },
  timerTextLow: { color: Colors.red },
  progressContainer: { height: 3, backgroundColor: Colors.surface, marginHorizontal: Spacing.xl },
  progressBar: { height: 3, backgroundColor: Colors.gold },
  progressBarLow: { backgroundColor: Colors.red },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100, paddingTop: Spacing.lg },
  instruction: { fontSize: 14, fontFamily: Fonts.body, color: Colors.textSecondary, marginBottom: Spacing.lg, textAlign: 'center' },
  answersContainer: { gap: Spacing.md },
  answerRow: { gap: Spacing.sm },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 1,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryText: { fontSize: 13, fontFamily: Fonts.bodySemiBold, color: Colors.text },
  answerInput: {},
  footer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl + 10 },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.gold,
    paddingVertical: Spacing.base + 2,
    borderRadius: Radius.md,
  },
  stopDisabled: { opacity: 0.4 },
  stopButtonText: { fontSize: 18, fontFamily: Fonts.display, color: Colors.textInverse, letterSpacing: 2 },
  stopOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopContent: { alignItems: 'center', gap: Spacing.lg },
  stopIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.goldDim,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  stopTitle: { fontSize: 48, fontFamily: Fonts.display, color: Colors.gold, letterSpacing: 4 },
  stopSubtitle: { fontSize: 18, fontFamily: Fonts.body, color: Colors.textSecondary },
});
