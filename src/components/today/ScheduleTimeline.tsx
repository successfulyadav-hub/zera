import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui';
import { type Event } from '@/database/queries/events';
import { spacing, layout } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { formatTime } from '@/utils/dates';

function computeDuration(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return '';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface ScheduleTimelineProps {
  events: Event[];
}

export function ScheduleTimeline({ events }: ScheduleTimelineProps) {
  const { colors } = useTheme();
  const router = useRouter();

  if (events.length === 0) {
    return (
      <Animated.View entering={FadeIn.duration(500)} style={styles.emptyContainer}>
        <Text variant="cursive" color={colors.stone}>nothing planned — enjoy the space.</Text>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      {events.map((event, index) => {
        const lineColor = event.color || colors.sage;
        const duration = event.start_time && event.end_time
          ? computeDuration(event.start_time, event.end_time)
          : '';
        return (
          <Animated.View key={event.id} entering={FadeInDown.delay(index * 60).duration(300)}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push(`/event/${event.id}`)}
              style={styles.eventRow}
              accessibilityRole="button"
              accessibilityLabel={`${event.title}, ${event.is_all_day ? 'all day' : event.start_time ? formatTime(event.start_time) : ''}${duration ? `, ${duration}` : ''}`}
            >
              <View style={styles.timeColumn}>
                <Text variant="caption" color={colors.stone}>
                  {event.is_all_day ? 'All day' : event.start_time ? formatTime(event.start_time) : ''}
                </Text>
                {duration ? (
                  <Text variant="caption" color={colors.divider} style={styles.duration}>
                    {duration}
                  </Text>
                ) : null}
              </View>
              <View style={[styles.dividerLine, { backgroundColor: lineColor }]} />
              <View style={styles.eventContent}>
                <Text variant="body">{event.title}</Text>
                {event.description ? (
                  <Text variant="bodySmall" color={colors.stone} numberOfLines={1}>{event.description}</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  eventRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    minHeight: 40,
  },
  timeColumn: {
    width: 60,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  duration: {
    marginTop: 2,
  },
  dividerLine: {
    width: 3,
    borderRadius: 2,
    marginHorizontal: spacing.md,
    minHeight: 40,
  },
  eventContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
});
