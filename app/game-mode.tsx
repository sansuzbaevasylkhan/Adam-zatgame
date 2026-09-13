import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { ROUND_DURATIONS, ROUND_COUNTS } from '@/constants/game';
import { Zap, Clock, Layers, Users } from 'lucide-react-native';

export default function GameModeScreen() {
  const router = useRouter();
  const [duration, setDuration] = useState(60);
  const [rounds, setRounds] = useState(3);

  const handleCreate = () => {
    router.push({
      pathname: '/create-room',
      params: { duration: String(duration), rounds: String(rounds) },
    });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Ойын режимі" subtitle="Параметрлерді таңдаңыз" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Clock color={Colors.gold} size={20} strokeWidth={2} />
            <Text style={styles.cardTitle}>Раунд уақыты</Text>
          </View>
          <Text style={styles.cardDesc}>Әр раундтағы ойын уақыты</Text>
          <Toggle
            options={ROUND_DURATIONS.map((d) => ({ label: `${d}s`, value: d }))}
            value={duration}
            onChange={setDuration}
            style={styles.toggle}
          />
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Layers color={Colors.blue} size={20} strokeWidth={2} />
            <Text style={styles.cardTitle}>Раунд саны</Text>
          </View>
          <Text style={styles.cardDesc}>Қанша раунд ойнайтыныңыз</Text>
          <Toggle
            options={ROUND_COUNTS.map((r) => ({ label: `${r}`, value: r }))}
            value={rounds}
            onChange={setRounds}
            style={styles.toggle}
          />
        </Card>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Users color={Colors.green} size={18} strokeWidth={2} />
            <Text style={styles.infoText}>2-8 ойыншы</Text>
          </View>
          <View style={styles.infoRow}>
            <Zap color={Colors.gold} size={18} strokeWidth={2} />
            <Text style={styles.infoText}>Кездейсоқ әріп мен категориялар</Text>
          </View>
        </Card>

        <Button label="Бөлме құру" onPress={handleCreate} variant="gold" size="lg" style={styles.button} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  card: { marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  cardTitle: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: Colors.text },
  cardDesc: { fontSize: 13, fontFamily: Fonts.body, color: Colors.textSecondary, marginBottom: Spacing.md },
  toggle: { marginTop: Spacing.sm },
  infoCard: { gap: Spacing.md, marginBottom: Spacing.xl },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoText: { fontSize: 14, fontFamily: Fonts.body, color: Colors.textSecondary },
  button: { marginTop: Spacing.md },
});
