import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { useTranslation } from 'react-i18next';
import { Mail, Lock } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { show } = useToast();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('login.error.allFields'));
      return;
    }
    setLoading(true);
    setError(null);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      show(t('login.success.welcome'), 'success');
      router.replace('/(tabs)/home');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.bg, '#0F0F12', Colors.bg]} style={styles.gradient} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t('login.title')}</Text>
          <Text style={styles.subtitle}>{t('login.subtitle')}</Text>

          <View style={styles.form}>
            <View style={styles.inputRow}>
              <Mail color={Colors.textTertiary} size={18} style={styles.inputIcon} strokeWidth={2} />
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder={t('login.placeholder.email')}
                keyboardType="email-address"
                style={styles.inputWithIcon}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputRow}>
              <Lock color={Colors.textTertiary} size={18} style={styles.inputIcon} strokeWidth={2} />
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder={t('login.placeholder.password')}
                secureTextEntry
                style={styles.inputWithIcon}
              />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
              label={t('login.loginButton')}
              onPress={handleLogin}
              variant="gold"
              size="lg"
              loading={loading}
              style={styles.button}
            />

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>{t('login.signupPrompt')} </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={styles.signupLink}>{t('login.signupLink')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  gradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingTop: 80 },
  title: {
    fontSize: 30,
    fontFamily: Fonts.display,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xxxl,
  },
  form: { gap: Spacing.md },
  inputRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  inputWithIcon: {
    paddingLeft: 42,
  },
  errorText: {
    color: Colors.red,
    fontSize: 13,
    fontFamily: Fonts.body,
    marginLeft: Spacing.xs,
  },
  button: { marginTop: Spacing.md },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  signupText: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
  },
  signupLink: {
    fontSize: 14,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.gold,
  },
});
