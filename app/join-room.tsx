import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/toast';
import { useTranslation } from 'react-i18next';
import { KeyRound } from 'lucide-react-native';

export default function JoinRoomScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { show } = useToast();
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!profile) return;
    if (code.length < 4) {
      show(t('joinRoom.error.incompleteCode'), 'error');
      return;
    }
    setLoading(true);

    const { data: room, error } = await supabase
      .from('game_rooms')
      .select('id, status')
      .eq('code', code.toUpperCase().trim())
      .maybeSingle();

    if (error || !room) {
      show(t('joinRoom.error.notFound'), 'error');
      setLoading(false);
      return;
    }

    if (room.status === 'finished') {
      show(t('joinRoom.error.finished'), 'error');
      setLoading(false);
      return;
    }

    const { data: existing } = await supabase
      .from('room_players')
      .select('id')
      .eq('room_id', room.id)
      .eq('user_id', profile.id)
      .maybeSingle();

    if (!existing) {
      const { error: joinErr } = await supabase.from('room_players').insert({
        room_id: room.id,
        user_id: profile.id,
        is_host: false,
        is_ready: false,
      });
      if (joinErr) {
        show(t('joinRoom.error.join'), 'error');
        setLoading(false);
        return;
      }
    }

    show(t('joinRoom.success.done'), 'success');
    router.replace(`/lobby?roomId=${room.id}`);
  };

  if (loading) return <LoadingScreen message={t('joinRoom.loading')} />;

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('joinRoom.title')} subtitle={t('joinRoom.subtitle')} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <View style={styles.iconRow}>
            <View style={styles.iconCircle}>
              <KeyRound color={Colors.gold} size={28} strokeWidth={2} />
            </View>
          </View>
          <Text style={styles.cardTitle}>{t('joinRoom.codeLabel')}</Text>
          <Text style={styles.cardDesc}>{t('joinRoom.codeDesc')}</Text>
          <Input
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase())}
            placeholder="ABCDEF"
            style={styles.codeInput}
            autoCapitalize="characters"
            maxLength={6}
            autoFocus
          />
          <Button label={t('joinRoom.joinButton')} onPress={handleJoin} variant="gold" size="lg" style={styles.button} />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  card: { alignItems: 'center', marginTop: Spacing.xl },
  iconRow: { marginBottom: Spacing.lg },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.goldDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 18, fontFamily: Fonts.bodySemiBold, color: Colors.text },
  cardDesc: { fontSize: 13, fontFamily: Fonts.body, color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.lg, textAlign: 'center' },
  codeInput: {
    textAlign: 'center',
    fontSize: 24,
    fontFamily: Fonts.heading,
    letterSpacing: 8,
  },
  button: { marginTop: Spacing.lg, width: '100%' },
});
