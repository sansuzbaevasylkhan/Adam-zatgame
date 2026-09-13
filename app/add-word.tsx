import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/toast';
import { useTranslation } from 'react-i18next';
import { DEFAULT_CATEGORIES } from '@/constants/game';
import { BookPlus } from 'lucide-react-native';

export default function AddWordScreen() {
  const { profile } = useAuth();
  const { show } = useToast();
  const { t } = useTranslation();
  const [word, setWord] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!profile) return;
    if (!word.trim()) {
      show(t('addWord.error.word'), 'error');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('word_bank').insert({
      user_id: profile.id,
      word: word.trim(),
      category: category.trim() || null,
    });
    setLoading(false);
    if (error) {
      show(t('addWord.error.save'), 'error');
    } else {
      show(t('addWord.success.save'), 'success');
      setWord('');
      setCategory('');
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('addWord.title')} subtitle={t('addWord.subtitle')} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card style={styles.card}>
            <View style={styles.iconRow}>
              <View style={styles.iconCircle}>
                <BookPlus color={Colors.gold} size={28} strokeWidth={2} />
              </View>
            </View>

            <Text style={styles.label}>{t('addWord.label.word')}</Text>
            <Input
              value={word}
              onChangeText={setWord}
              placeholder={t('addWord.placeholder.word')}
              autoCapitalize="sentences"
              autoFocus
            />

            <Text style={[styles.label, { marginTop: Spacing.md }]}>{t('addWord.label.category')}</Text>
            <Input
              value={category}
              onChangeText={setCategory}
              placeholder={t('addWord.placeholder.category')}
              autoCapitalize="sentences"
            />

            <Text style={[styles.label, { marginTop: Spacing.lg }]}>{t('addWord.suggestionsTitle')}</Text>
            <View style={styles.suggestions}>
              {DEFAULT_CATEGORIES.slice(0, 8).map((c) => (
                <View key={c} style={styles.suggestionChip}>
                  <Text style={styles.suggestionText}>{c}</Text>
                </View>
              ))}
            </View>

            <Button
              label={t('addWord.addButton')}
              onPress={handleAdd}
              variant="gold"
              size="lg"
              loading={loading}
              style={styles.button}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  card: { marginTop: Spacing.sm },
  iconRow: { alignItems: 'center', marginBottom: Spacing.lg },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.goldDim, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontFamily: Fonts.bodySemiBold, color: Colors.textSecondary, marginBottom: Spacing.sm },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.lg },
  suggestionChip: { backgroundColor: Colors.surface, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 1, borderRadius: 999, borderWidth: 1, borderColor: Colors.border },
  suggestionText: { fontSize: 12, fontFamily: Fonts.body, color: Colors.textSecondary },
  button: { marginTop: Spacing.md },
});
