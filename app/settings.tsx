import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { useSettings } from '@/lib/settingsContext';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Bell, Vibrate, Globe, Info, LogOut, ChevronRight } from 'lucide-react-native';
import { requestNotificationPermissions, scheduleTestNotification } from '@/lib/notifications';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { show } = useToast();
  const { t } = useTranslation();
  const {
    notificationsEnabled,
    setNotificationsEnabled,
    vibrationEnabled,
    setVibrationEnabled,
    language,
    setLanguage
  } = useSettings();

  const handleSignOut = () => {
    Alert.alert(t('sign_out_confirm'), t('sign_out_msg'), [
      { text: t('no'), style: 'cancel' },
      {
        text: t('yes'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          show(t('signed_out'), 'info');
          router.replace('/welcome');
        },
      },
    ]);
  };

  const toggleNotifications = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        setNotificationsEnabled(false);
        return;
      }
      // Send a test notification to show it works
      await scheduleTestNotification();
    }
    setNotificationsEnabled(value);
  };

  const toggleVibration = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVibrationEnabled(value);
  };

  const changeLanguage = (lang: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLanguage(lang);
  };

  const settings = [
    {
      icon: Bell,
      label: t('notifications'),
      value: notificationsEnabled,
      type: 'switch',
      onToggle: toggleNotifications
    },
    {
      icon: Vibrate,
      label: t('vibration'),
      value: vibrationEnabled,
      type: 'switch',
      onToggle: toggleVibration
    },
    {
      icon: Globe,
      label: t('language'),
      value: language === 'kk' ? t('kazakh') : t('russian'),
      type: 'select',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const nextLang = language === 'kk' ? 'ru' : 'kk';
        changeLanguage(nextLang);
      }
    },
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('settings')} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{t('general')}</Text>
        <Card style={styles.card}>
          {settings.map((s, i) => (
            <View key={i}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIcon}>
                    <s.icon color={Colors.gold} size={18} strokeWidth={2} />
                  </View>
                  <Text style={styles.settingLabel}>{s.label}</Text>
                </View>
                <View style={styles.settingRight}>
                  {s.type === 'switch' ? (
                    <Switch
                      value={s.value as boolean}
                      onValueChange={(val) => s.onToggle?.(val)}
                      trackColor={{ false: Colors.border, true: Colors.gold }}
                      thumbColor={Colors.text}
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={s.onPress}
                      style={styles.selectValueContainer}
                    >
                      <Text style={styles.settingValue}>{s.value as string}</Text>
                      <ChevronRight color={Colors.textTertiary} size={18} strokeWidth={2} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              {i < settings.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>

        <Text style={styles.sectionTitle}>{t('about')}</Text>
        <Card style={styles.card}>
          <TouchableOpacity onPress={() => router.push('/how-to-play')} activeOpacity={0.7}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Info color={Colors.gold} size={18} strokeWidth={2} />
                </View>
                <Text style={styles.settingLabel}>{t('how_to_play')}</Text>
              </View>
              <ChevronRight color={Colors.textTertiary} size={18} strokeWidth={2} />
            </View>
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionTitle}>{t('account')}</Text>
        <TouchableOpacity onPress={handleSignOut} activeOpacity={0.7}>
          <Card style={[styles.card, styles.signOutCard]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, styles.signOutIcon]}>
                  <LogOut color={Colors.red} size={18} strokeWidth={2} />
                </View>
                <Text style={styles.signOutText}>{t('sign_out')}</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        <Text style={styles.version}>АДАМ ЗАТ v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  sectionTitle: { fontSize: 13, fontFamily: Fonts.bodySemiBold, color: Colors.textTertiary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.sm, marginTop: Spacing.lg },
  card: { padding: 0 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md + 2 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  settingIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.goldDim, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: Colors.text },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  settingValue: { fontSize: 13, fontFamily: Fonts.body, color: Colors.textSecondary },
  selectValueContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.md + 2 },
  signOutCard: { borderColor: 'rgba(248,113,113,0.2)' },
  signOutIcon: { backgroundColor: 'rgba(248,113,113,0.12)' },
  signOutText: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: Colors.red },
  version: { fontSize: 12, fontFamily: Fonts.body, color: Colors.textTertiary, textAlign: 'center', marginTop: Spacing.xxxl },
});
