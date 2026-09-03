import { useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Network from 'expo-network';
import { Text } from '@/components/ui';
import { spacing } from '@/theme';

export function NetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const translateY = useSharedValue(-40);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const update = () => setIsConnected(navigator.onLine);
      window.addEventListener('online', update);
      window.addEventListener('offline', update);
      update();
      return () => {
        window.removeEventListener('online', update);
        window.removeEventListener('offline', update);
      };
    }

    const check = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        setIsConnected(state.isConnected ?? true);
      } catch {
        setIsConnected(true);
      }
    };

    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    translateY.value = withTiming(isConnected ? -40 : 0, { duration: 300 });
  }, [isConnected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text variant="caption" color="#FFFFFF" align="center">
        No internet connection — working offline
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#8C8780',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    zIndex: 9998,
  },
});
