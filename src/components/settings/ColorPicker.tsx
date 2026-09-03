import { useState, useCallback } from 'react';
import { View, StyleSheet, PanResponder, Dimensions } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { hexToHSL, hslToHex } from '@/utils/colorUtils';
import { spacing } from '@/theme';
import { TouchableOpacity } from 'react-native';
import { RotateCcw } from 'lucide-react-native';

const SWATCH_SIZE = 36;
const RING_SIZE = Dimensions.get('window').width - 120;
const RING_WIDTH = 28;

const PRESET_HUES = [
  { label: 'Sage', h: 120, s: 20, l: 52 },
  { label: 'Rose', h: 350, s: 35, l: 65 },
  { label: 'Sky', h: 210, s: 35, l: 60 },
  { label: 'Lavender', h: 270, s: 30, l: 65 },
  { label: 'Peach', h: 25, s: 45, l: 65 },
  { label: 'Mint', h: 160, s: 30, l: 55 },
  { label: 'Sand', h: 40, s: 25, l: 70 },
  { label: 'Coral', h: 10, s: 40, l: 60 },
];

const BG_PRESETS = [
  { label: 'Cream', hex: '#F8F6F1' },
  { label: 'Snow', hex: '#F5F5F5' },
  { label: 'Blush', hex: '#F8F1F1' },
  { label: 'Mist', hex: '#F1F4F8' },
  { label: 'Mint', hex: '#F1F8F4' },
  { label: 'Linen', hex: '#F5F0E8' },
  { label: 'Lavender', hex: '#F3F1F8' },
  { label: 'Honey', hex: '#F8F5ED' },
];

interface ColorPickerProps {
  label: string;
  currentColor: string | null;
  defaultColor: string;
  onColorChange: (color: string | null) => void;
  mode: 'accent' | 'background';
}

export function ColorPicker({ label, currentColor, defaultColor, onColorChange, mode }: ColorPickerProps) {
  const { colors } = useTheme();
  const activeColor = currentColor || defaultColor;
  const presets = mode === 'accent' ? PRESET_HUES : BG_PRESETS;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="body">{label}</Text>
        {currentColor && (
          <TouchableOpacity
            onPress={() => onColorChange(null)}
            style={styles.resetBtn}
            activeOpacity={0.7}
          >
            <RotateCcw color={colors.stone} size={14} />
            <Text variant="caption" color={colors.stone} style={{ marginLeft: 4 }}>
              Reset
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.previewRow}>
        <View style={[styles.previewSwatch, { backgroundColor: activeColor }]} />
        <Text variant="caption" color={colors.stone} style={styles.hexLabel}>
          {activeColor.toUpperCase()}
        </Text>
      </View>

      <View style={styles.swatchGrid}>
        {mode === 'accent'
          ? (presets as typeof PRESET_HUES).map((p) => {
              const hex = hslToHex(p.h, p.s, p.l);
              const isActive = currentColor === hex;
              return (
                <TouchableOpacity
                  key={p.label}
                  onPress={() => onColorChange(hex)}
                  activeOpacity={0.7}
                  style={styles.swatchWrap}
                >
                  <View
                    style={[
                      styles.swatch,
                      { backgroundColor: hex },
                      isActive && { borderWidth: 2.5, borderColor: colors.ink },
                    ]}
                  />
                  <Text variant="caption" color={colors.stone} style={styles.swatchLabel}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })
          : (presets as typeof BG_PRESETS).map((p) => {
              const isActive = currentColor === p.hex;
              return (
                <TouchableOpacity
                  key={p.label}
                  onPress={() => onColorChange(p.hex)}
                  activeOpacity={0.7}
                  style={styles.swatchWrap}
                >
                  <View
                    style={[
                      styles.swatch,
                      { backgroundColor: p.hex },
                      isActive && { borderWidth: 2.5, borderColor: colors.ink },
                      { borderWidth: isActive ? 2.5 : 1, borderColor: isActive ? colors.ink : colors.divider },
                    ]}
                  />
                  <Text variant="caption" color={colors.stone} style={styles.swatchLabel}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  previewSwatch: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  hexLabel: {
    letterSpacing: 1,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  swatchWrap: {
    alignItems: 'center',
    gap: 4,
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_SIZE / 2,
  },
  swatchLabel: {
    fontSize: 10,
  },
});
