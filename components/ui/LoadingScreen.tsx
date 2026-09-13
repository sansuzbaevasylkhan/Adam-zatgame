import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';

type Props = { message?: string };

export function LoadingScreen({ message = 'Жүктелуде...' }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.gold} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: Colors.bg,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: Fonts.body,
  },
});
