import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'gold' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
}: Props) {
  const variantStyle = variants[variant];
  const sizeStyle = sizes[size];

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantStyle.container,
        sizeStyle.container,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.color} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, { color: variantStyle.color }, sizeStyle.label]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radius.md,
  },
  disabled: { opacity: 0.4 },
  label: {
    fontFamily: Fonts.bodySemiBold,
    textAlign: 'center',
  },
});

const variants: Record<Variant, { container: ViewStyle; color: string }> = {
  primary: { container: { backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.borderHover }, color: Colors.text },
  gold: { container: { backgroundColor: Colors.gold }, color: Colors.textInverse },
  secondary: { container: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border }, color: Colors.textSecondary },
  ghost: { container: { backgroundColor: 'transparent' }, color: Colors.gold },
  danger: { container: { backgroundColor: 'rgba(248,113,113,0.12)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)' }, color: Colors.red },
};

const sizes: Record<Size, { container: ViewStyle; label: TextStyle }> = {
  sm: { container: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.base }, label: { fontSize: 13 } },
  md: { container: { paddingVertical: Spacing.md + 2, paddingHorizontal: Spacing.lg }, label: { fontSize: 15 } },
  lg: { container: { paddingVertical: Spacing.base + 2, paddingHorizontal: Spacing.xl }, label: { fontSize: 17 } },
};
