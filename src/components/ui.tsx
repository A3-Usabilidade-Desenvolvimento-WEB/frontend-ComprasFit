import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle, type StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppState';

export const colors = { bg: '#FFFFFF', text: '#15291F', muted: '#58685F', green: '#18885B', forest: '#176C4A', border: '#E9EFEB', white: '#FFFFFF' };
export function useTheme() {
  const { state } = useApp();
  return state.preferences.dark ? { ...colors, bg: '#171D17', text: '#F5F4EB', muted: '#B2B8A9', white: '#242D24', border: '#394239' } : colors;
}
export function Icon({ name, size = 22, color = colors.text }: { name: React.ComponentProps<typeof Ionicons>['name']; size?: number; color?: string }) {
  return <Ionicons name={name} size={size} color={color} accessible={false} aria-hidden />;
}
export function Button({ title, onPress, disabled, secondary, icon, busy }: { title: string; onPress: () => void; disabled?: boolean; secondary?: boolean; icon?: React.ComponentProps<typeof Ionicons>['name']; busy?: boolean }) {
  const c = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: !!disabled || !!busy }} disabled={disabled || busy} onPress={onPress}
    style={({ pressed }) => [ui.button, { backgroundColor: secondary ? c.white : c.green, borderColor: secondary ? c.border : c.green, opacity: disabled ? .4 : pressed ? .7 : 1 }]}>
    {busy ? <ActivityIndicator color={c.text} /> : <><Text style={[ui.buttonText, { color: secondary ? c.text : '#FFFFFF' }]}>{title}</Text>{icon && <Icon name={icon} color={secondary ? c.text : '#FFFFFF'} />}</>}
  </Pressable>;
}
export function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  const c = useTheme();
  return <View style={{ gap: 10 }}><Text accessibilityRole="header" style={[ui.heading, { color: c.text }]}>{title}</Text>{subtitle && <Text style={[ui.body, { color: c.muted }]}>{subtitle}</Text>}</View>;
}
export function Chip({ title, selected, onPress, emoji, color }: { title: string; selected: boolean; onPress: () => void; emoji?: string; color?: string }) {
  const c = useTheme();
  return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} aria-checked={selected} onPress={onPress} style={[ui.chip, { backgroundColor: selected ? color ?? '#E3EDC8' : c.white, borderColor: selected ? c.green : c.border }]}>
    {emoji && <Text style={{ fontSize: 29 }}>{emoji}</Text>}<Text style={{ fontSize: 16, fontWeight: '600', color: selected ? '#20291F' : c.text, textAlign: 'center' }}>{title}</Text>
    {selected && <View style={ui.check}><Icon name="checkmark-circle" size={16} color={c.forest} /></View>}
  </Pressable>;
}
export function Card({ children, style }: React.PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const c = useTheme();
  return <View style={[ui.card, { backgroundColor: c.white, borderColor: c.border }, style]}>{children}</View>;
}
export const ui = StyleSheet.create({
  button: { minHeight: 56, borderRadius: 18, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderWidth: 1 },
  buttonText: { fontSize: 18, fontWeight: '700' },
  heading: { fontSize: 31, lineHeight: 34, fontWeight: '800', letterSpacing: -.8 },
  body: { fontSize: 17, lineHeight: 23 },
  chip: { minHeight: 55, borderWidth: 1.5, borderRadius: 14, padding: 15, alignItems: 'center', justifyContent: 'center', gap: 10, flexGrow: 1, position: 'relative' },
  check: { position: 'absolute', top: 6, right: 6 },
  card: { borderWidth: 1, borderRadius: 22, padding: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  small: { fontSize: 14, lineHeight: 18 },
});
