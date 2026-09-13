import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Fonts, Radius } from '@/constants/theme';

type Props = {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  style?: ViewStyle;
};

export function Avatar({ name, avatarUrl, size = 48, style }: Props) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const bgColors = ['#E8B948', '#4A9EFF', '#34D399', '#F87171', '#A78BFA', '#FB923C'];
  const colorIndex = name.charCodeAt(0) % bgColors.length;
  const bgColor = bgColors[colorIndex];

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials || '?'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.textInverse,
    fontFamily: Fonts.bodyBold,
  },
});
