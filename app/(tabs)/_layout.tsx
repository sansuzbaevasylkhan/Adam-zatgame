import { Tabs } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Home, Trophy, User, BookOpen } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Manrope-SemiBold',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Басты',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Рейтинг',
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="words"
        options={{
          title: 'Сөздер',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}
