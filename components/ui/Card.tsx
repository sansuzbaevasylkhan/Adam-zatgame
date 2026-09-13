import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  elevated?: boolean;
};

export function Card({ children, style, padded = true, elevated = false }: Props) {
  return (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  overflow: 'hidden',
  shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  elevated: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.borderHover,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  padded: {
    padding: Spacing.lg,
  },
});
