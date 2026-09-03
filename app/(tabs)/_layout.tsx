import { Tabs } from 'expo-router';
import { Home, Calendar, FileText, Bell, LayoutGrid } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { typeScale } from '@/theme';

export default function TabLayout() {
  const { colors } = useTheme();

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
          backgroundColor: colors.bg,
          borderTopColor: colors.divider,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
          height: 85,
          paddingBottom: 28,
          paddingTop: 8,
        },
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
