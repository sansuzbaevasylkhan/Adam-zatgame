import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Pill } from '@/components/ui/Pill';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/toast';
import { useTranslation } from 'react-i18next';
import { Copy, Crown, Check, Users } from 'lucide-react-native';
import type { RealtimeChannel } from '@supabase/supabase-js';

type RoomData = {
  id: string;
  code: string;
  host_id: string;
  status: string;
  total_rounds: number;
  round_duration: number;
  categories: string[];
};

type Player = {
  id: string;
  user_id: string;
  is_host: boolean;
  is_ready: boolean;
  profiles: { display_name: string; avatar_url: string | null };
};

export default function LobbyScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams();
  const { profile } = useAuth();
  const { show } = useToast();
  const { t } = useTranslation();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const fetchRoom = useCallback(async () => {
    const { data } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('id', roomId as string)
      .maybeSingle();
    if (data) setRoom(data as RoomData);
  }, [roomId]);

  const fetchPlayers = useCallback(async () => {
    const { data } = await supabase
      .from('room_players')
      .select('id, user_id, is_host, is_ready, profiles:profiles(display_name, avatar_url)')
      .eq('room_id', roomId as string)
      .order('joined_at', { ascending: true });
    if (data) setPlayers(data as unknown as Player[]);
  }, [roomId]);

  useEffect(() => {
    fetchRoom();
    fetchPlayers().finally(() => setLoading(false));

    const channel: RealtimeChannel = supabase
      .channel(`lobby-${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` }, () => {
        fetchPlayers();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomId}` }, (payload) => {
        const newRoom = payload.new as RoomData;
        setRoom(newRoom);
        if (newRoom.status === 'playing') {
          router.replace(`/game?roomId=${roomId}`);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, fetchRoom, fetchPlayers, router]);

  const isHost = room?.host_id === profile?.id;
  const allReady = players.length >= 2 && players.every((p) => p.is_ready);

  const toggleReady = async () => {
    if (!profile) return;
    await supabase
      .from('room_players')
      .update({ is_ready: !players.find((p) => p.user_id === profile.id)?.is_ready })
      .eq('room_id', roomId as string)
      .eq('user_id', profile.id);
  };

  const startGame = async () => {
    if (!isHost || !room) return;
    setStarting(true);
    const { error } = await supabase
      .from('game_rooms')
      .update({ status: 'playing' })
      .eq('id', room.id);
    if (error) {
      show(t('lobby.error.start'), 'error');
      setStarting(false);
    }
  };

  const leaveRoom = async () => {
    if (!profile) return;
    Alert.alert(
      t('lobby.leaveConfirm.title'),
      t('lobby.leaveConfirm.message'),
      [
        { text: t('lobby.leaveConfirm.no'), style: 'cancel' },
        {
          text: t('lobby.leaveConfirm.yes'),
          style: 'destructive',
          onPress: async () => {
            await supabase
              .from('room_players')
              .delete()
              .eq('room_id', roomId as string)
              .eq('user_id', profile.id);
            router.replace('/(tabs)/home');
          },
        },
      ]
    );
  };

  const copyCode = () => {
    if (!room) return;
    show(t('lobby.copySuccess', { code: room.code }), 'success');
  };

  if (loading) return <LoadingScreen message={t('lobby.loading')} />;

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('lobby.title')} showBack={false} right={
        <TouchableOpacity onPress={leaveRoom}>
          <Text style={styles.leaveText}>{t('lobby.leaveButton')}</Text>
        </TouchableOpacity>
      } />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.codeCard}>
          <Text style={styles.codeLabel}>{t('lobby.codeLabel')}</Text>
          <TouchableOpacity onPress={copyCode} style={styles.codeRow}>
            <Text style={styles.codeText}>{room?.code ?? '------'}</Text>
            <Copy color={Colors.gold} size={18} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.codeHint}>{t('lobby.codeHint')}</Text>
        </Card>

        <View style={styles.playersHeader}>
          <View style={styles.playersTitleRow}>
            <Users color={Colors.textSecondary} size={18} strokeWidth={2} />
            <Text style={styles.playersTitle}>{t('lobby.playersTitle')}</Text>
          </View>
          <Text style={styles.playerCount}>{t('lobby.playerCount', { count: players.length })}</Text>
        </View>

        <View style={styles.playersList}>
          {players.map((p) => (
            <Card key={p.id} style={styles.playerCard}>
              <View style={styles.playerInfo}>
                <Avatar name={p.profiles.display_name} avatarUrl={p.profiles.avatar_url} size={40} />
                <View>
                  <Text style={styles.playerName}>{p.profiles.display_name}</Text>
                  <View style={styles.playerBadges}>
                    {p.is_host && (
                      <View style={styles.hostBadge}>
                        <Crown color={Colors.gold} size={10} strokeWidth={2.5} />
                        <Text style={styles.hostText}>{t('lobby.hostBadge')}</Text>
                      </View>
                    )}
                    {p.is_ready && (
                      <View style={styles.readyBadge}>
                        <Check color={Colors.green} size={10} strokeWidth={3} />
                        <Text style={styles.readyText}>{t('lobby.readyBadge')}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {room && (
          <Card style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>{t('lobby.settings.rounds')}</Text>
              <Text style={styles.settingValue}>{room.total_rounds}</Text>
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>{t('lobby.settings.time')}</Text>
              <Text style={styles.settingValue}>{room.round_duration}s</Text>
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>{t('lobby.settings.categories')}</Text>
              <Text style={styles.settingValue}>{room.categories.length}</Text>
            </View>
          </Card>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {isHost ? (
          <Button
            label={t('lobby.startButton')}
            onPress={startGame}
            variant="gold"
            size="lg"
            loading={starting}
            disabled={!allReady}
          />
        ) : (
          <Button
            label={players.find((p) => p.user_id === profile?.id)?.is_ready ? t('lobby.readyButtonActive') : t('lobby.readyButtonInactive')}
            onPress={toggleReady}
            variant={players.find((p) => p.user_id === profile?.id)?.is_ready ? 'secondary' : 'gold'}
            size="lg"
          />
        )}
        {!allReady && isHost && (
          <Text style={styles.waitText}>{t('lobby.waitReady')}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 120 },
  leaveText: { color: Colors.red, fontSize: 14, fontFamily: Fonts.bodySemiBold },
  codeCard: { alignItems: 'center', marginBottom: Spacing.xl, marginTop: Spacing.sm },
  codeLabel: { fontSize: 11, fontFamily: Fonts.bodySemiBold, color: Colors.textTertiary, letterSpacing: 2 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  codeText: { fontSize: 36, fontFamily: Fonts.display, color: Colors.gold, letterSpacing: 6 },
  codeHint: { fontSize: 12, fontFamily: Fonts.body, color: Colors.textSecondary, marginTop: Spacing.xs },
  playersHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  playersTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  playersTitle: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: Colors.text },
  playerCount: { fontSize: 13, fontFamily: Fonts.body, color: Colors.textSecondary },
  playersList: { gap: Spacing.sm },
  playerCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
  playerInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  playerName: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: Colors.text },
  playerBadges: { flexDirection: 'row', gap: 6, marginTop: 4 },
  hostBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.goldDim, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  hostText: { fontSize: 10, fontFamily: Fonts.bodySemiBold, color: Colors.gold },
  readyBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(52,211,153,0.12)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  readyText: { fontSize: 10, fontFamily: Fonts.bodySemiBold, color: Colors.green },
  settingsCard: { marginTop: Spacing.lg },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLabel: { fontSize: 14, fontFamily: Fonts.body, color: Colors.textSecondary },
  settingValue: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: Colors.text },
  settingDivider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  footer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl + 10, gap: Spacing.sm },
  waitText: { fontSize: 12, fontFamily: Fonts.body, color: Colors.textTertiary, textAlign: 'center' },
});
