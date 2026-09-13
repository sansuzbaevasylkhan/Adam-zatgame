import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { useTranslation } from 'react-i18next';
import { Settings, History, LogOut, Edit3, Zap, Trophy, Award } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { show } = useToast();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    show(t('profile.signOutSuccess'), 'info');
    router.replace('/welcome');
  };

  const stats = [
    { icon: Zap, label: t('profile.stats.games'), value: profile?.total_games ?? 0, color: Colors.gold },
    { icon: Trophy, label: t('profile.stats.wins'), value: profile?.total_wins ?? 0, color: Colors.green },
    { icon: Award, label: t('profile.stats.score'), value: profile?.total_score ?? 0, color: Colors.blue },
  ];

  const menuItems = [
    { icon: Edit3, label: t('profile.menu.edit'), onPress: () => router.push('/edit-profile') },
    { icon: History, label: t('profile.menu.history'), onPress: () => router.push('/game-history') },
    { icon: Settings, label: t('profile.menu.settings'), onPress: () => router.push('/settings') },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Avatar name={profile?.display_name || 'O'} avatarUrl={profile?.avatar_url} size={80} />
          <Text style={styles.name}>{profile?.display_name || t('profile.defaultPlayerName')}</Text>
          {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        </View>

        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <Card key={i} style={styles.statCard}>
              <s.icon color={s.color} size={20} strokeWidth={2} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </Card>
          ))}
        </View>

        <View style={styles.menu}>
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} onPress={item.onPress} activeOpacity={0.7}>
              <Card style={styles.menuCard}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIcon}>
                    <item.icon color={Colors.gold} size={18} strokeWidth={2} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          label={t('profile.signOutButton')}
          onPress={handleSignOut}
          variant="danger"
          size="lg"
          icon={<LogOut color={Colors.red} size={20} strokeWidth={2} />}
          style={styles.signOutBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100, paddingTop: 70 },
  profileHeader: { alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xl },
  name: { fontSize: 22, fontFamily: Fonts.heading, color: Colors.text },
  bio: { fontSize: 13, fontFamily: Fonts.body, color: Colors.textSecondary, textAlign: 'center', maxWidth: 280 },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  statCard: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: Spacing.lg },
  statValue: { fontSize: 22, fontFamily: Fonts.heading, color: Colors.text },
  statLabel: { fontSize: 11, fontFamily: Fonts.body, color: Colors.textSecondary },
  menu: { gap: Spacing.sm, marginBottom: Spacing.xl },
  menuCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md + 2 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.goldDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: Colors.text },
  signOutBtn: { marginTop: Spacing.md },
});
