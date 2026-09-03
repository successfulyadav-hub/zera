import { Component, type ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui';
import { spacing, layout } from '@/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View style={styles.container}>
          <Text variant="screenTitle" align="center">Something went wrong</Text>
          <Text variant="body" color="#8C8780" align="center" style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
            <Text variant="bodyMedium" color="#7B8F7A">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: layout.screenPaddingH,
  },
  message: {
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7B8F7A',
  },
});
