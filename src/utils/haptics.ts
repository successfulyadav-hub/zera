import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const isWeb = Platform.OS === 'web';

export function hapticLight() {
  if (isWeb) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function hapticMedium() {
  if (isWeb) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function hapticSuccess() {
  if (isWeb) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function hapticSelection() {
  if (isWeb) return;
  Haptics.selectionAsync();
}
