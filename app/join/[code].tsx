import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { validateInviteToken } from '@/lib/invites';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';

export default function JoinInviteScreen() {
  const { code } = useLocalSearchParams();
  const router = useRouter();
  const { profile, user } = useAuth();
  const { show } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function handleJoin() {
      try {
        if (!code) {
          show(t('join.noCode') || 'Сілтемеде код табылмады', 'error');
          router.replace('/');
          return;
        }

        // 1. Валидация
        const validation = await validateInviteToken(code as string);
        if (!validation.valid) {
          show(validation.error || 'Қателік', 'error');
          router.replace('/');
          return;
        }

        // 2. Аутентификация тексеру
        if (!user) {
          // Save as pending invite for deferred deep linking
          await savePendingInvite(code as string);
          router.replace('/login');
          return;
        }

        // 3. Бөлмеге қосылу (Supabase room_players)
        const { error } = await supabase
          .from('room_players')
          .upsert({
            room_id: validation.roomId,
            user_id: user.id,
            is_host: false,
            is_ready: false,
          });

        if (error) {
          show(t('join.error') || 'Қосылу кезінде қате кетті', 'error');
          router.replace('/');
          return;
        }

        // 4. Лоббиге бағыттау
        router.replace(`/lobby?roomId=${validation.roomId}`);
      } catch (e) {
        console.error(e);
        show(t('join.unexpectedError') || 'Күтпеген қате кетті', 'error');
        router.replace('/');
      } finally {
        setLoading(false);
      }
    }

    handleJoin();
  }, [code]);

  // Helper for deferred deep linking (will be moved to lib/storage.ts)
  async function savePendingInvite(code: string) {
    // Implementation will be in lib/storage.ts
    // For now, we will use a placeholder
  }

  if (loading) {
    return <LoadingScreen message={t('join.joining') || 'Ойынға қосылуда...'} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('join.redirecting') || 'Бағытталуда...'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
  },
});
