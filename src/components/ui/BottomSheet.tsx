import { Modal as RNModal, View, StyleSheet, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { radius, spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const { colors, isDark } = useTheme();

  const sheetContent = (
    <>
      <View style={[styles.handle, { backgroundColor: colors.stone }]} />
      {children}
    </>
  );

  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrapper}>
              <View style={styles.contentOuter}>
                {Platform.OS !== 'web' ? (
                  <BlurView
                    intensity={isDark ? 60 : 80}
                    tint={isDark ? 'dark' : 'light'}
                    style={[styles.content, styles.blurContent]}
                  >
                    <View style={[styles.glassOverlay, {
                      backgroundColor: isDark ? 'rgba(30,28,24,0.7)' : 'rgba(255,255,255,0.5)',
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)',
                    }]} />
                    {sheetContent}
                  </BlurView>
                ) : (
                  <View style={[styles.content, {
                    backgroundColor: isDark ? 'rgba(30,28,24,0.85)' : 'rgba(255,255,255,0.8)',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
                    borderWidth: StyleSheet.hairlineWidth,
                  }]}>
                    {sheetContent}
                  </View>
                )}
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  wrapper: { width: '100%' },
  contentOuter: {
    overflow: 'hidden',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  content: {
    padding: spacing.xxl,
    paddingBottom: 36,
    maxHeight: '90%',
  },
  blurContent: {
    overflow: 'hidden',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.xl,
    opacity: 0.2,
    zIndex: 1,
  },
});
