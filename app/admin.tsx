import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/toast';
import { Colors, Spacing, Radius, Fonts } from '@/constants/theme';
import { Users, UserPlus, Calendar } from 'lucide-react-native';

type UserProfile = {
  id: string;
  display_name: string;
  created_at: string;
  total_score: number;
  games_played: number;
};

export default function AdminScreen() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { show } = useToast();

  // 1. Барлық пайдаланушыларды жүктеу
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('total_score', { ascending: false }); // РЕЙТИНГ БОЙЫНША РЕТТЕУ (Ұпайы көп адам жоғарыда)

      if (error) throw error;
      setUsers(data as unknown as UserProfile[]);
    } catch (error: any) {
      show('Пайдаланушыларды жүктеуде қате: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // 2. REALTIME ТЫҢДАУШЫ (Listener)
    // Пайдаланушы тіркелген сәтте автоматты түрде жаңарту
    const channel = supabase
      .channel('admin-user-monitor')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          const newUser = payload.new as UserProfile;

          // Жаңа пайдаланушыны тізімнің басына қосу
          setUsers((prevUsers) => [newUser, ...prevUsers]);

          // Хабарлама шығару
          show(`🚀 Жаңа пайдаланушы қосылды: ${newUser.display_name}!`, 'success');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Жүктелуде...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Users color={Colors.gold} size={28} />
          <Text style={styles.headerTitle}>Жалпы Рейтинг</Text>
        </View>
        <View style={styles.userCountBadge}>
          <Text style={styles.userCountText}>{users.length} ойыншы</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <UserPlus color={Colors.gold} size={20} />
          <Text style={styles.statLabel}>Жаңа тіркелулер</Text>
          <Text style={styles.statValue}>Realtime</Text>
        </View>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <View style={styles.userCard}>
            <View style={styles.rankContainer}>
              <Text style={styles.rankText}>#{index + 1}</Text>
            </View>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{item.display_name?.[0]?.toUpperCase() || '?'}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.display_name || 'Есімсіз'}</Text>
              <View style={styles.dateContainer}>
                <Calendar color={Colors.textTertiary} size={12} />
                <Text style={styles.userDate}>
                  {new Date(item.created_at).toLocaleDateString('kk-KZ')}
                </Text>
              </View>
            </View>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreValue}>{item.total_score || 0} 🏆</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Әлі ешкім тіркелген жоқ</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  loadingText: { color: Colors.gold, fontFamily: Fonts.bodySemiBold, fontSize: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGold,
  },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  headerTitle: { fontSize: 22, fontFamily: Fonts.display, color: Colors.gold, letterSpacing: 1 },
  userCountBadge: {
    backgroundColor: Colors.goldDim,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  userCountText: { color: Colors.gold, fontSize: 12, fontFamily: Fonts.bodySemiBold },
  statsRow: { padding: Spacing.lg },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border
  },
  statLabel: { flex: 1, color: Colors.textSecondary, fontSize: 14, fontFamily: Fonts.body },
  statValue: { color: Colors.gold, fontSize: 16, fontFamily: Fonts.bodySemiBold },
  listContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rankContainer: {
    width: 30,
    marginRight: Spacing.sm,
    alignItems: 'flex-start',
  },
  rankText: {
    fontSize: 14,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.textTertiary,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.goldDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  avatarText: { color: Colors.gold, fontSize: 18, fontFamily: Fonts.display, fontWeight: 'bold' },
  userInfo: { flex: 1, gap: 2 },
  userName: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: Colors.text },
  dateContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  userDate: { fontSize: 12, color: Colors.textTertiary, fontFamily: Fonts.body },
  scoreBadge: {
    backgroundColor: Colors.goldDim,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.gold,
    alignItems: 'center',
  },
  scoreValue: { color: Colors.gold, fontSize: 14, fontFamily: Fonts.display, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: Colors.textSecondary, fontSize: 16, fontFamily: Fonts.body },
});
