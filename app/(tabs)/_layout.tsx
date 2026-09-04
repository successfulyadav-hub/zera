import { Platform, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Home, Calendar, FileText, Bell, LayoutGrid } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { typeScale } from '@/theme';

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: typeScale.navLabel.fontFamily,
          fontSize: typeScale.navLabel.fontSize,
          letterSpacing: typeScale.navLabel.letterSpacing,
        },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Platform.OS === 'web'
            ? (isDark ? 'rgba(28,27,25,0.85)' : 'rgba(248,246,241,0.75)')
            : 'transparent',
          borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
          shadowOpacity: 0,
          height: 80,
          paddingBottom: 24,
          paddingTop: 10,
        },
        tabBarBackground: () =>
          Platform.OS !== 'web' ? (
            <BlurView
              intensity={isDark ? 50 : 70}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            >
              <View style={[StyleSheet.absoluteFill, {
                backgroundColor: isDark ? 'rgba(28,27,25,0.5)' : 'rgba(248,246,241,0.3)',
              }]} />
            </BlurView>
          ) : null,
        tabBarActiveTintColor: colors.sage,
        tabBarInactiveTintColor: colors.stone,
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => <Home color={color} size={22} />,
          tabBarAccessibilityLabel: 'Today tab',
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <Calendar color={color} size={22} />,
          tabBarAccessibilityLabel: 'Calendar tab',
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color }) => <FileText color={color} size={22} />,
          tabBarAccessibilityLabel: 'Notes tab',
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: 'Reminders',
          tabBarIcon: ({ color }) => <Bell color={color} size={22} />,
          tabBarAccessibilityLabel: 'Reminders tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <LayoutGrid color={color} size={22} />,
          tabBarAccessibilityLabel: 'Settings tab',
        }}
      />
    </Tabs>
  );
}
