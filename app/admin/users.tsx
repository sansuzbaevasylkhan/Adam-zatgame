import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { User } from 'lucide-react-native';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, created_at')
        .order('created_at', { ascending: false });

      if (data) setUsers(data);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  if (loading) return <View style={styles.center}><Text style={styles.loadingText}>Жүктелуде...</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <User color={Colors.gold} size={32} />
          <Text style={styles.title}>Тіркелгендер</Text>
        </View>
        <Text style={styles.countBadge}>{users.length} адам</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>Аты-жөні</Text>
          <Text style={styles.headerText}>Тіркелген күні</Text>
        </View>

        {users.map((user, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.cellText}>{user.display_name || 'Белгісіз'}</Text>
            <Text style={styles.cellTextDate}>{formatDate(user.created_at)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    paddingTop: 60,
    backgroundColor: '#0A0A0C',
    flexGrow: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: {
    fontSize: 28,
    fontFamily: Fonts.display,
    color: Colors.text,
    letterSpacing: 1
  },
  countBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    color: Colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    fontSize: 12,
    fontFamily: Fonts.bodySemiBold,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  table: {
    backgroundColor: '#16161C',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#2A2A32',
    overflow: 'hidden'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1C1C24',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A32',
  },
  headerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  tableRow: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A32',
    alignItems: 'center'
  },
  cellText: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.body,
    color: Colors.text
  },
  cellTextDate: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    textAlign: 'right'
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0C' },
  loadingText: { color: Colors.textSecondary, fontFamily: Fonts.body }
});
