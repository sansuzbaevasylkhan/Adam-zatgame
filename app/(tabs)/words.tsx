import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { useTranslation } from 'react-i18next';
import { Plus, BookOpen, Trash2 } from 'lucide-react-native';

type WordEntry = {
  id: string;
  word: string;
  category: string | null;
  created_at: string;
};

export default function WordsScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { show } = useToast();
  const { t } = useTranslation();
  const [words, setWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWords = useCallback(async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from('word_bank')
      .select('id, word, category, created_at')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setWords(data as WordEntry[]);
    }
    setLoading(false);
    setRefreshing(false);
  }, [profile]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWords();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('word_bank').delete().eq('id', id);
    if (error) {
      show(t('words.error.delete'), 'error');
    } else {
      show(t('words.success.delete'), 'success');
      setWords((prev) => prev.filter((w) => w.id !== id));
    }
  };

  if (loading) return <LoadingScreen message={t('words.loading')} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BookOpen color={Colors.gold} size={24} strokeWidth={2} />
        <Text style={styles.headerTitle}>{t('words.title')}</Text>
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.statsText}>{t('words.totalCount', { count: words.length })}</Text>
      </View>

      <FlatList
        data={words}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <BookOpen color={Colors.textTertiary} size={48} strokeWidth={1.5} />
            <Text style={styles.emptyText}>{t('words.empty.title')}</Text>
            <Text style={styles.emptySub}>{t('words.empty.subtitle')}</Text>
            <Button label={t('words.addButton')} onPress={() => router.push('/add-word')} variant="gold" size="md" style={styles.emptyBtn} />
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.wordCard}>
            <View style={styles.wordInfo}>
              <Text style={styles.wordText}>{item.word}</Text>
              {item.category && <Text style={styles.wordCategory}>{item.category}</Text>}
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
              <Trash2 color={Colors.red} size={18} strokeWidth={2} />
            </TouchableOpacity>
          </Card>
        )}
      />

      <View style={styles.fab}>
        <TouchableOpacity
          style={styles.fabBtn}
          onPress={() => router.push('/add-word')}
          activeOpacity={0.85}
        >
          <Plus color={Colors.textInverse} size={26} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.sm,
  },
  headerTitle: { fontSize: 22, fontFamily: Fonts.heading, color: Colors.text },
  statsRow: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md },
  statsText: { fontSize: 13, fontFamily: Fonts.body, color: Colors.textSecondary },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 120 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: Spacing.md },
  emptyText: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: Colors.textSecondary },
  emptySub: { fontSize: 13, fontFamily: Fonts.body, color: Colors.textTertiary },
  emptyBtn: { marginTop: Spacing.md },
  wordCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm, padding: Spacing.md + 2 },
  wordInfo: { flex: 1 },
  wordText: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: Colors.text },
  wordCategory: { fontSize: 12, fontFamily: Fonts.body, color: Colors.textSecondary, marginTop: 2 },
  deleteBtn: { padding: Spacing.sm },
  fab: { position: 'absolute', bottom: 90, right: Spacing.xl },
  fabBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E8B948',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
