import { useState } from 'react';
import { View, StyleSheet, Switch, ScrollView, TouchableOpacity, ActivityIndicator, Share, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut, RefreshCw, User, Trash2, Download } from 'lucide-react-native';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { Text, Card, Divider, Button, ConfirmDialog } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSync } from '@/hooks/useSync';
import { useToast } from '@/hooks/useToast';
import { getDB } from '@/database/connection';
import { notesQuery } from '@/database/queries/notes';
import { remindersQuery } from '@/database/queries/reminders';
import { spacing, layout } from '@/theme';
import { hapticLight } from '@/utils/haptics';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { darkMode, setDarkMode, hapticsEnabled, setHaptics, notificationsEnabled, setNotifications } = useSettingsStore();
  const { user, session, signOut } = useAuthStore();
  const { syncing, lastSync, triggerSync } = useSync();
  const toast = useToast();
  const [clearConfirm, setClearConfirm] = useState(false);

  const isSignedIn = !!session;

  const handleSignOut = async () => {
    hapticLight();
    await signOut();
  };

  const handleSync = async () => {
    hapticLight();
    await triggerSync();
  };

  const handleClearData = async () => {
    setClearConfirm(false);
    hapticLight();
    const db = await getDB();
    await db.execAsync('DELETE FROM tasks; DELETE FROM events; DELETE FROM reminders; DELETE FROM notes;');
    toast.show('All data cleared');
  };

  const handleExportData = async () => {
    hapticLight();
    const db = await getDB();
    const tasks = await db.getAllAsync('SELECT * FROM tasks');
    const events = await db.getAllAsync('SELECT * FROM events');
    const notes = await notesQuery.getAll();
    const reminders = await remindersQuery.getAll();
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      tasks,
      events,
      notes,
      reminders,
    };
    const json = JSON.stringify(exportData, null, 2);
    await Share.share(
      Platform.OS === 'ios'
        ? { message: json }
        : { message: json, title: 'Zera Backup' }
    );
  };

  const SettingRow = ({ label, value, onToggle }: { label: string; value: boolean; onToggle: (v: boolean) => void }) => (
    <View style={styles.row}>
      <Text variant="body">{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.surface, true: colors.sage }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScreenHeader title="Settings" />
      <ScrollView contentContainerStyle={styles.content}>

        <Card style={styles.card}>
          <Text variant="sectionLabel" color={colors.stone} style={styles.sectionTitle}>ACCOUNT</Text>
          {isSignedIn ? (
            <>
              <View style={styles.profileRow}>
                <View style={[styles.avatar, { backgroundColor: colors.sageSoft }]}>
                  <User color={colors.sage} size={20} />
                </View>
                <View style={styles.profileInfo}>
                  <Text variant="bodyMedium">{user?.email}</Text>
                  <Text variant="caption" color={colors.stone}>Signed in</Text>
                </View>
              </View>
              <Divider style={styles.divider} />
              <TouchableOpacity style={styles.row} onPress={handleSync} activeOpacity={0.7}>
                <View style={styles.syncRow}>
                  <RefreshCw color={colors.sage} size={18} />
                  <Text variant="body" style={{ marginLeft: spacing.sm }}>Sync Now</Text>
                </View>
                {syncing ? (
                  <ActivityIndicator size="small" color={colors.sage} />
                ) : lastSync ? (
                  <Text variant="caption" color={colors.stone}>
                    {new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                ) : null}
              </TouchableOpacity>
              <Divider style={styles.divider} />
              <TouchableOpacity style={styles.row} onPress={handleSignOut} activeOpacity={0.7}>
                <View style={styles.syncRow}>
                  <LogOut color={colors.error} size={18} />
                  <Text variant="body" color={colors.error} style={{ marginLeft: spacing.sm }}>Sign Out</Text>
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text variant="body" color={colors.stone} style={styles.signInDescription}>
                Sign in to sync your data across devices
              </Text>
              <Button label="Sign In" onPress={() => router.push('/auth/login')} style={styles.signInBtn} />
            </>
          )}
        </Card>

        <Card style={styles.card}>
          <Text variant="sectionLabel" color={colors.stone} style={styles.sectionTitle}>APPEARANCE</Text>

          <View style={styles.row}>
            <Text variant="body">Dark Mode</Text>
            <View style={styles.segmented}>
              {(['system', 'light', 'dark'] as const).map((mode) => (
                <View
                  key={mode}
                  style={[
                    styles.segment,
                    darkMode === mode && { backgroundColor: colors.sage },
                  ]}
                >
                  <Text
                    variant="caption"
                    color={darkMode === mode ? '#FFFFFF' : colors.stone}
                    onPress={() => setDarkMode(mode)}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text variant="sectionLabel" color={colors.stone} style={styles.sectionTitle}>PREFERENCES</Text>
          <SettingRow label="Haptic Feedback" value={hapticsEnabled} onToggle={setHaptics} />
          <Divider style={styles.divider} />
          <SettingRow label="Notifications" value={notificationsEnabled} onToggle={setNotifications} />
        </Card>

        <Card style={styles.card}>
          <Text variant="sectionLabel" color={colors.stone} style={styles.sectionTitle}>DATA</Text>
          <TouchableOpacity style={styles.row} onPress={handleExportData} activeOpacity={0.7}>
            <View style={styles.syncRow}>
              <Download color={colors.sage} size={18} />
              <Text variant="body" style={{ marginLeft: spacing.sm }}>Export Backup</Text>
            </View>
          </TouchableOpacity>
          <Divider style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => setClearConfirm(true)} activeOpacity={0.7}>
            <View style={styles.syncRow}>
              <Trash2 color={colors.error} size={18} />
              <Text variant="body" color={colors.error} style={{ marginLeft: spacing.sm }}>Clear All Data</Text>
            </View>
          </TouchableOpacity>
        </Card>

        <Card style={styles.card}>
          <Text variant="sectionLabel" color={colors.stone} style={styles.sectionTitle}>ABOUT</Text>
          <Text variant="body">Zera</Text>
          <Text variant="caption" color={colors.stone}>Version 1.0.0</Text>
          <Text variant="cursive" color={colors.stone} style={styles.tagline}>
            beautifully minimal. built around the day.
          </Text>
        </Card>
      </ScrollView>

      <ConfirmDialog
        visible={clearConfirm}
        title="Clear All Data"
        message="This will permanently delete all tasks, events, reminders, and notes from this device."
        onConfirm={handleClearData}
        onCancel={() => setClearConfirm(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: 100,
  },
  card: { marginBottom: spacing.lg },
  sectionTitle: {
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  divider: { marginVertical: spacing.xs },
  segmented: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segment: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  tagline: { marginTop: spacing.md },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInDescription: {
    marginBottom: spacing.md,
  },
  signInBtn: {
    marginTop: spacing.xs,
  },
});
