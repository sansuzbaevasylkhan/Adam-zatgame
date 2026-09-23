import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Colors, Fonts, Spacing, Radius } from '@/constants/theme';
import { LayoutDashboard, Users, Trophy, LogOut } from 'lucide-react-native';
import { useAuth } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useAuth();

  const menuItems = [
    { name: 'Басты бет', path: '/admin', icon: LayoutDashboard },
    { name: 'Тіркелгендер', path: '/admin/users', icon: Users },
    { name: 'Рейтинг', path: '/admin/ranking', icon: Trophy },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandText}>ADAM ZAT</Text>
          <Text style={styles.brandSubtext}>GAMES ADMIN</Text>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.path}
                style={[styles.menuItem, isActive(item.path) && styles.menuItemActive]}
                onPress={() => router.push(item.path)}
              >
                <Icon color={isActive(item.path) ? Colors.gold : Colors.textSecondary} size={22} />
                <Text style={[styles.menuText, isActive(item.path) && styles.menuTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => router.replace('/auth')}
        >
          <LogOut color={Colors.red} size={22} />
          <Text style={styles.logoutText}>Шығу</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.main}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C', // Ultra Dark
    flexDirection: 'row',
  },
  sidebar: {
    width: 260,
    backgroundColor: '#121216',
    borderRightWidth: 1,
    borderRightColor: '#2A2A32',
    paddingTop: 40,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandText: {
    fontSize: 24,
    fontFamily: Fonts.display,
    color: Colors.gold,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  brandSubtext: {
    fontSize: 10,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.textSecondary,
    letterSpacing: 3,
    marginTop: 4,
  },
  menu: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: Radius.md,
    backgroundColor: 'transparent',
  },
  menuItemActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)', // Gold tint
    borderLeftWidth: 4,
    borderLeftColor: Colors.gold,
  },
  menuText: {
    fontSize: 15,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.textSecondary,
  },
  menuTextActive: {
    color: Colors.gold,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.2)',
  },
  logoutText: {
    fontSize: 15,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.red,
  },
  main: {
    flex: 1,
    backgroundColor: '#0A0A0C',
  },
});
