import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Users, Shuffle, Clock, Hand, Check, Trophy } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function HowToPlayScreen() {
  const { t } = useTranslation();

  const steps = [
    { icon: Users, title: t('howToPlay.step1.title'), desc: t('howToPlay.step1.desc') },
    { icon: Shuffle, title: t('howToPlay.step2.title'), desc: t('howToPlay.step2.desc') },
    { icon: Clock, title: t('howToPlay.step3.title'), desc: t('howToPlay.step3.desc') },
    { icon: Hand, title: t('howToPlay.step4.title'), desc: t('howToPlay.step4.desc') },
    { icon: Check, title: t('howToPlay.step5.title'), desc: t('howToPlay.step5.desc') },
    { icon: Trophy, title: t('howToPlay.step6.title'), desc: t('howToPlay.step6.desc') },
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('howToPlay.title')} subtitle={t('howToPlay.subtitle')} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {steps.map((s, i) => (
          <Card key={i} style={styles.stepCard}>
            <View style={styles.stepIcon}>
              <s.icon color={Colors.gold} size={22} strokeWidth={2} />
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepDesc}>{s.desc}</Text>
            </View>
          </Card>
        ))}

        <Card style={styles.tipCard}>
          <Text style={styles.tipTitle}>{t('howToPlay.tipTitle')}</Text>
          <Text style={styles.tipText}>
            {t('howToPlay.tipText')}
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  stepCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.md },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.goldDim,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepText: { flex: 1 },
  stepTitle: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: Colors.text, marginBottom: 4 },
  stepDesc: { fontSize: 13, fontFamily: Fonts.body, color: Colors.textSecondary, lineHeight: 20 },
  tipCard: { marginTop: Spacing.md, borderColor: Colors.borderGold },
  tipTitle: { fontSize: 14, fontFamily: Fonts.bodySemiBold, color: Colors.gold, marginBottom: Spacing.sm },
  tipText: { fontSize: 13, fontFamily: Fonts.body, color: Colors.textSecondary, lineHeight: 20 },
});
