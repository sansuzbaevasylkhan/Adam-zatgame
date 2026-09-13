import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/toast';
import { useTranslation } from 'react-i18next';
import { generateRoomCode, pickRandomCategories, DEFAULT_CATEGORIES } from '@/constants/game';
import { CheckCircle2 } from 'lucide-react-native';

export default function CreateRoomScreen() {
  const router = useRouter();
  const { duration, rounds } = useLocalSearchParams();
  const { profile } = useAuth();
  const { show } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [categoryCount, setCategoryCount] = useState(5);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    setSelectedCategories(pickRandomCategories(categoryCount));
  }, [categoryCount]);

  const handleCreate = async () => {
    if (!profile) return;
    setLoading(true);

    const code = generateRoomCode();
    const categories = pickRandomCategories(categoryCount);

    const { data: room, error } = await supabase
      .from('game_rooms')
      .insert({
        code,
        host_id: profile.id,
        status: 'waiting',
        total_rounds: Number(rounds) || 3,
        round_duration: Number(duration) || 60,
        categories,
      })
      .select('*')
      .single();

    if (error) {
      show(t('createRoom.error.create'), 'error');
      setLoading(false);
      return;
    }

    const { error: playerError } = await supabase.from('room_players').insert({
      room_id: room.id,
      user_id: profile.id,
      is_host: true,
      is_ready: true,
    });

    if (playerError) {
      show(t('createRoom.error.join'), 'error');
      setLoading(false);
      return;
    }

    show(t('createRoom.success.done'), 'success');
    router.replace(`/lobby?roomId=${room.id}`);
  };

  if (loading) return <LoadingScreen message={t('createRoom.loading')} />;

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('createRoom.title')} subtitle={t('createRoom.subtitle')} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t('createRoom.catCountTitle')}</Text>
          <Text style={styles.cardDesc}>{t('createRoom.catCountDesc')}</Text>
          <View style={styles.countRow}>
            {[3, 5, 7, 10].map((n) => (
              <View
                key={n}
                style={[
                  styles.countChip,
                  categoryCount === n && styles.countChipActive,
                ]}
              >
                <Button
                  label={String(n)}
                  onPress={() => setCategoryCount(n)}
                  variant={categoryCount === n ? 'gold' : 'secondary'}
                  size="sm"
                />
              </View>
            ))}
          </View>
        </Card>

        <Text style={styles.sectionTitle}>{t('createRoom.selectedCatsTitle')}</Text>
        <View style={styles.categoriesGrid}>
          {selectedCategories.map((cat) => (
            <View key={cat} style={styles.categoryChip}>
              <CheckCircle2 color={Colors.gold} size={14} strokeWidth={2} />
              <Text style={styles.categoryText}>{cat}</Text>
            </View>
          ))}
        </View>

        <Button label={t('createRoom.createButton')} onPress={handleCreate} variant="gold" size="lg" style={styles.button} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  card: { marginBottom: Spacing.lg },
  cardTitle: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: Colors.text },
  cardDesc: { fontSize: 13, fontFamily: Fonts.body, color: Colors.textSecondary, marginTop: 2, marginBottom: Spacing.md },
  countRow: { flexDirection: 'row', gap: Spacing.sm },
  countChip: { flex: 1 },
  countChipActive: {},
  sectionTitle: {
    fontSize: 13,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.textTertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.text,
  },
  button: { marginTop: Spacing.md },
});
