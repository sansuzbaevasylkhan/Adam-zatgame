import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Zap, Users, Trophy, Shuffle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const features = [
    { icon: Users, title: t('welcome.feature1.title'), desc: t('welcome.feature1.desc') },
    { icon: Zap, title: t('welcome.feature2.title'), desc: t('welcome.feature2.desc') },
    { icon: Shuffle, title: t('welcome.feature3.title'), desc: t('welcome.feature3.desc') },
    { icon: Trophy, title: t('welcome.feature4.title'), desc: t('welcome.feature4.desc') },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.bg, '#0F0F12', Colors.bg]} style={styles.gradient} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.logo}>{t('welcome.logo.part1')}</Text>
          <Text style={styles.logoAccent}>{t('welcome.logo.part2')}</Text>
          <Text style={styles.tagline}>{t('welcome.tagline')}</Text>
        </View>

        <View style={styles.features}>
          {features.map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <f.icon color={Colors.gold} size={22} strokeWidth={2} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label={t('welcome.startButton')} onPress={() => router.push('/login')} variant="gold" size="lg" />
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>{t('welcome.signupPrompt')} </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.signupLink}>{t('welcome.signupLink')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  gradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingTop: 80 },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logo: {
    fontSize: 52,
    fontFamily: Fonts.display,
    color: Colors.text,
    letterSpacing: 4,
  },
  logoAccent: {
    fontSize: 52,
    fontFamily: Fonts.display,
    color: Colors.gold,
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 15,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    letterSpacing: 1,
  },
  features: { gap: Spacing.md, marginBottom: Spacing.xxxl },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.goldDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureTitle: {
    fontSize: 15,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.text,
  },
  featureDesc: {
    fontSize: 13,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl + 10,
    gap: Spacing.md,
  },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupText: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
  },
  signupLink: {
    fontSize: 14,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.gold,
  },
});
