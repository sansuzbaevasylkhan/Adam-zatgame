import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { useTranslation } from 'react-i18next';

export default function EditProfileScreen() {
  const { profile, updateProfile } = useAuth();
  const { show } = useToast();
  const { t } = useTranslation();
  const [name, setName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      show(t('editProfile.error.name'), 'error');
      return;
    }
    setLoading(true);
    const { error } = await updateProfile({
      display_name: name.trim(),
      bio: bio.trim() || null,
    });
    setLoading(false);
    if (error) {
      show(t('editProfile.error.save'), 'error');
    } else {
      show(t('editProfile.success.save'), 'success');
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('editProfile.title')} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarSection}>
            <Avatar name={name || 'O'} avatarUrl={profile?.avatar_url} size={80} />
            <Text style={styles.avatarHint}>{t('editProfile.avatarHint')}</Text>
          </View>

          <Card style={styles.card}>
            <Text style={styles.label}>{t('editProfile.label.name')}</Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder={t('editProfile.placeholder.name')}
              autoCapitalize="words"
            />

            <Text style={[styles.label, { marginTop: Spacing.md }]}>{t('editProfile.label.bio')}</Text>
            <Input
              value={bio}
              onChangeText={setBio}
              placeholder={t('editProfile.placeholder.bio')}
              autoCapitalize="sentences"
              maxLength={150}
            />
          </Card>

          <Button
            label={t('editProfile.saveButton')}
            onPress={handleSave}
            variant="gold"
            size="lg"
            loading={loading}
            style={styles.button}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  avatarSection: { alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xl },
  avatarHint: { fontSize: 12, fontFamily: Fonts.body, color: Colors.textTertiary },
  card: { marginBottom: Spacing.xl },
  label: { fontSize: 13, fontFamily: Fonts.bodySemiBold, color: Colors.textSecondary, marginBottom: Spacing.sm },
  button: { marginTop: Spacing.md },
});
