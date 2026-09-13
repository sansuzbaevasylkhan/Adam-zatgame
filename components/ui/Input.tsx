import React from 'react';
import { TextInput, StyleSheet, TextStyle, View, Text } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric';
  error?: string | null;
  style?: TextStyle;
  maxLength?: number;
  autoFocus?: boolean;
};

export function Input({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = 'none',
  keyboardType = 'default',
  error,
  style,
  maxLength,
  autoFocus = false,
}: Props) {
  return (
    <View>
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoFocus={autoFocus}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md + 2,
    color: Colors.text,
    fontSize: 15,
    fontFamily: Fonts.body,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.red,
  },
  errorText: {
    color: Colors.red,
    fontSize: 12,
    fontFamily: Fonts.body,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
