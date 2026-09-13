import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Plus, LogIn, Zap, BookOpen, Info } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{t('home.greeting')}</Text>
          <Text style={styles.name}>{profile?.display_name || t('home.defaultPlayerName')}</Text>
        </View>
        <Avatar name={profile?.display_name || 'O'} avatarUrl={profile?.avatar_url} size={44} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{t('home.createRoomSection')}</Text>

        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/game-mode')}>
          <Card style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.goldDim }]}>
              <Plus color={Colors.gold} size={24} strokeWidth={2.5} />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>{t('home.newGameTitle')}</Text>
              <Text style={styles.actionDesc}>{t('home.newGameDesc')}</Text>
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/join-room')}>
          <Card style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(74,158,255,0.12)' }]}>
              <LogIn color={Colors.blue} size={24} strokeWidth={2.5} />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>{t('home.joinRoomTitle')}</Text>
              <Text style={styles.actionDesc}>{t('home.joinRoomDesc')}</Text>
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/how-to-play')}>
          <Card style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(52,211,153,0.12)' }]}>
              <Info color={Colors.green} size={24} strokeWidth={2.5} />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>{t('home.howToPlayTitle')}</Text>
              <Text style={styles.actionDesc}>{t('home.howToPlayDesc')}</Text>
            </View>
          </Card>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Zap color={Colors.gold} size={20} strokeWidth={2} />
            <Text style={styles.statValue}>{profile?.total_games ?? 0}</Text>
            <Text style={styles.statLabel}>{t('home.stats.games')}</Text>
          </Card>
          <Card style={styles.statCard}>
            <BookOpen color={Colors.blue} size={20} strokeWidth={2} />
            <Text style={styles.statValue}>{profile?.total_wins ?? 0}</Text>
            <Text style={styles.statLabel}>{t('home.stats.wins')}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statScoreText}>{profile?.total_score ?? 0}</Text>
            <Text style={styles.statLabel}>{t('home.stats.score')}</Text>
          </Card>
        </View>
      </ScrollView>
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
    paddingTop: 60,
    paddingBottom: Spacing.lg,
  },
  greeting: { fontSize: 14, fontFamily: Fonts.body, color: Colors.textSecondary },
  name: { fontSize: 22, fontFamily: Fonts.heading, color: Colors.text, marginTop: 2 },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  sectionTitle: {
    fontSize: 13,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.textTertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    marginBottom: Spacing.md,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: Colors.text },
  actionDesc: { fontSize: 13, fontFamily: Fonts.body, color: Colors.textSecondary, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.lg,
  },
  statValue: {
    fontSize: 24,
    fontFamily: Fonts.heading,
    color: Colors.text,
  },
  statScoreText: {
    fontSize: 24,
    fontFamily: Fonts.heading,
    color: Colors.gold,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
  },
});
