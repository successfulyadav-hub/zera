import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { CalendarGrid } from './CalendarGrid';
import { hapticLight } from '@/utils/haptics';

const SWIPE_THRESHOLD = 50;

interface SwipeableCalendarProps {
  month: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  eventDots?: Set<string>;
  taskDots?: Set<string>;
}

export function SwipeableCalendar({
  month,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  eventDots,
  taskDots,
}: SwipeableCalendarProps) {
  const translateX = useSharedValue(0);

  const goNext = () => {
    hapticLight();
    onNextMonth();
  };

  const goPrev = () => {
    hapticLight();
    onPrevMonth();
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      translateX.value = e.translationX * 0.3;
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(0, { duration: 200 });
        runOnJS(goNext)();
      } else if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(0, { duration: 200 });
        runOnJS(goPrev)();
      } else {
        translateX.value = withTiming(0, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={animatedStyle}>
        <CalendarGrid
          month={month}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          eventDots={eventDots}
          taskDots={taskDots}
        />
      </Animated.View>
    </GestureDetector>
  );
}
