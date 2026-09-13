import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type Props = {
  label: string;
  color?: string;
  bgColor?: string;
  style?: ViewStyle;
};

export function Pill({ label, color = Colors.gold, bgColor, style }: Props) {
  return (
    <View style={[styles.pill, { backgroundColor: bgColor ?? `${color}20`, borderColor: `${color}40` }, style]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 1,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontFamily: Fonts.bodySemiBold,
    letterSpacing: 0.5,
  },
});
