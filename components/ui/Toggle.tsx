import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type Option<T> = { label: string; value: T };

type Props<T> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: ViewStyle;
};

export function Toggle<T extends string | number>({ options, value, onChange, style }: Props<T>) {
  return (
    <View style={[styles.container, style]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            key={String(opt.value)}
            style={[styles.option, active && styles.active]}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  option: {
    flex: 1,
    paddingVertical: Spacing.sm + 1,
    alignItems: 'center',
    borderRadius: Radius.sm,
  marginHorizontal: 1,
  },
  active: {
    backgroundColor: Colors.gold,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: Fonts.bodySemiBold,
  },
  activeLabel: {
    color: Colors.textInverse,
  },
});
