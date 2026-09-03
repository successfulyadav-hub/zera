import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Text, Input, Button, IconButton } from '@/components/ui';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTheme } from '@/hooks/useTheme';
import { spacing, layout } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signIn = useAuthStore((s) => s.signIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    setError('');
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.replace('/(tabs)/today');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: colors.bg }]}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <IconButton icon={<ArrowLeft color={colors.ink} size={22} />} onPress={() => router.back()} />
      </View>
      <View style={styles.content}>
        <Text variant="screenTitle">Welcome back</Text>
        <Text variant="body" color={colors.stone} style={styles.subtitle}>
          Sign in to sync your data
        </Text>

        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.field}
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.field}
        />

        {error ? <Text variant="bodySmall" color={colors.error} style={styles.error}>{error}</Text> : null}

        <Button label="Sign In" onPress={handleLogin} loading={loading} style={styles.button} />
        <Button
          label="Don't have an account? Sign Up"
          variant="ghost"
          onPress={() => router.replace('/auth/signup')}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: layout.screenPaddingH, paddingVertical: spacing.sm },
  content: { flex: 1, paddingHorizontal: layout.screenPaddingH, paddingTop: spacing.xxl },
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.xxl },
  field: { marginTop: spacing.md },
  error: { marginTop: spacing.md },
  button: { marginTop: spacing.xxl },
});
