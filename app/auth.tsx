import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert('Қате', 'Барлық жолдарды толтырыңыз');
      return;
    }

    setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) Alert.alert('Қателік', error.message);
      else Alert.alert('Сәтті', 'Электронды поштаңызды растаңыз!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) Alert.alert('Қателік', error.message);
      else router.replace('/(tabs)/home');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.bg, '#1a1a1f', Colors.bg]} style={styles.gradient} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>АДАМ</Text>
          <Text style={styles.logoAccent}>ЗАТ</Text>
          <Text style={styles.tagline}>Сөздер ойынына қош келдіңіз</Text>
        </View>

        <View style={styles.form}>
          <Input
            placeholder="Электронды пошта"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            placeholder="Құпия сөз"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title={loading ? "Жүктелуде..." : (isSignUp ? "Тіркелу" : "Кіру")}
            onPress={handleAuth}
            disabled={loading}
          />

          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={styles.switchText}>
              {isSignUp ? "Аккаунтыңыз бар ма? Кіріңіз" : "Аккаунтыңыз жоқ па? Тіркеліңіз"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  logo: {
    fontSize: 48,
    fontFamily: Fonts.display,
    color: Colors.text,
    letterSpacing: 2,
  },
  logoAccent: {
    fontSize: 48,
    fontFamily: Fonts.display,
    color: Colors.gold,
    letterSpacing: 2,
    marginTop: -10,
  },
  tagline: {
    fontSize: 16,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    gap: Spacing.md,
  },
  switchBtn: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  switchText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: Fonts.body,
  },
});
