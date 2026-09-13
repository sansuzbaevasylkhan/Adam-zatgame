import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function IndexScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      if (session) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/welcome');
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [session, loading, router]);

  if (loading) return <LoadingScreen message="Қосылу..." />;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.bg, '#0F0F12', Colors.bg]} style={styles.gradient} />
      <View style={styles.content}>
        <Text style={styles.logo}>АДАМ</Text>
        <Text style={styles.logoAccent}>ЗАТ</Text>
        <Text style={styles.tagline}>Сөз ойыны</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  gradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  logo: {
    fontSize: 56,
    fontFamily: Fonts.display,
    color: Colors.text,
    letterSpacing: 4,
  },
  logoAccent: {
    fontSize: 56,
    fontFamily: Fonts.display,
    color: Colors.gold,
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    letterSpacing: 2,
  },
});
