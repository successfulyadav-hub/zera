import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Text, Input, Button, IconButton } from '@/components/ui';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTheme } from '@/hooks/useTheme';
import { spacing, layout } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signUp = useAuthStore((s) => s.signUp);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async () => {
    if (!email.trim() || !password) return;
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    const result = await signUp(email.trim(), password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
        <View style={[styles.content, styles.center]}>
          <Text variant="screenTitle" align="center">Check your email</Text>
          <Text variant="body" color={colors.stone} align="center" style={styles.subtitle}>
            We sent a confirmation link to {email}
          </Text>
          <Button label="Back to Sign In" onPress={() => router.replace('/auth/login')} style={styles.button} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: colors.bg }]}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <IconButton icon={<ArrowLeft color={colors.ink} size={22} />} onPress={() => router.back()} />
      </View>
      <View style={styles.content}>
        <Text variant="screenTitle">Create account</Text>
        <Text variant="body" color={colors.stone} style={styles.subtitle}>
          Sign up to sync across devices
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
        <Input
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.field}
        />

        {error ? <Text variant="bodySmall" color={colors.error} style={styles.error}>{error}</Text> : null}

        <Button label="Create Account" onPress={handleSignUp} loading={loading} style={styles.button} />
        <Button
          label="Already have an account? Sign In"
          variant="ghost"
          onPress={() => router.replace('/auth/login')}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: layout.screenPaddingH, paddingVertical: spacing.sm },
  content: { flex: 1, paddingHorizontal: layout.screenPaddingH, paddingTop: spacing.xxl },
  center: { justifyContent: 'center' },
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.xxl },
  field: { marginTop: spacing.md },
  error: { marginTop: spacing.md },
  button: { marginTop: spacing.xxl },
});
