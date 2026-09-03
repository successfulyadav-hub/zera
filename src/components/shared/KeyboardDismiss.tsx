import { Keyboard, TouchableWithoutFeedback, View, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';

interface KeyboardDismissProps {
  children: ReactNode;
}

export function KeyboardDismiss({ children }: KeyboardDismissProps) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>{children}</View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
