# Zera

**Beautifully minimal. Built around the day.**

Zera is a personal productivity app that unifies your calendar, tasks, notes, reminders, and journaling into one calm, focused space. No clutter, no complexity — just your day, thoughtfully organized.

## Features

### Today View
Your command center. See today's schedule, tasks, notes, and stats at a glance. Swipe between days with the week strip, track your streak, and celebrate when everything's done.

### Tasks
- Priorities (none, low, medium, high) with color-coded indicators
- Due times with local notification alerts
- Subtasks for breaking down complex work
- Swipe to complete or delete with undo
- Drag to reorder
- Streak tracking for consecutive productive days

### Calendar
- Monthly view with swipeable month navigation
- Event and task dot indicators on each day
- Tap a day to see its schedule inline
- Tap the month title to jump back to today

### Notes & Journal
- Distraction-free editor with auto-save
- Multi-page journaling per day
- Pin important notes to the top
- Share notes via the system share sheet
- Word and character count
- Search across all notes

### Reminders
- Date and time scheduling with local notifications
- Recurrence options (daily, weekly, monthly, yearly)
- Grouped by date with section headers
- Tap notification to deep link directly to the reminder

### Search
- Global search across tasks, events, notes, and reminders
- Debounced input with instant results
- Tap any result to navigate to its detail screen

### Sync & Auth
- Email/password authentication via Supabase
- Cloud sync with push/pull and last-write-wins conflict resolution
- Pull-to-refresh on every screen
- Works fully offline with local SQLite database

### Settings
- Dark mode (system / light / dark)
- Haptic feedback toggle
- Notification preferences
- Export all data as JSON backup
- Clear all data with confirmation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 57 |
| Language | TypeScript (strict mode) |
| Navigation | Expo Router (file-based) |
| Database | expo-sqlite (raw SQL) |
| State | Zustand |
| Auth & Sync | Supabase |
| Styling | StyleSheet + design tokens |
| Fonts | DM Sans + Caveat (Google Fonts) |
| Animations | react-native-reanimated |
| Gestures | react-native-gesture-handler |
| Lists | @shopify/flash-list |
| Icons | lucide-react-native |
| Haptics | expo-haptics |
| Notifications | expo-notifications |

## Design System

Zera uses a warm, earthy color palette with sage green as the accent:

| Token | Light | Dark |
|-------|-------|------|
| Background | `#F8F6F1` | `#1C1B19` |
| Surface | `#EFEDE6` | `#242320` |
| Ink | `#1A1A1A` | `#E8E5DE` |
| Stone | `#8C8780` | `#9C9890` |
| Sage | `#7B8F7A` | `#8FA88E` |

Typography pairs **DM Sans** (UI text, 4 weights) with **Caveat** (decorative/handwritten accents).

## Project Structure

```
zera/
  app/                    # Expo Router screens
    (tabs)/               # 5 tab screens
    auth/                 # Login & signup
    day/                  # Day detail view
    event/                # Event create & edit
    note/                 # Note editor
    reminder/             # Reminder create & edit
    search.tsx            # Global search
    onboarding.tsx        # First-launch carousel
  src/
    components/
      ui/                 # Primitives (Text, Button, Card, etc.)
      shared/             # ScreenHeader, FAB, Skeleton, etc.
      today/              # DayHeader, WeekStrip, Timeline, etc.
      tasks/              # TaskItem, TaskEditModal, etc.
      calendar/           # CalendarGrid, SwipeableCalendar
      notes/              # NoteCard
      reminders/          # ReminderItem
      search/             # SearchBar
    database/
      schema.ts           # SQLite table definitions
      migrations.ts       # Schema evolution
      connection.ts       # DB singleton
      queries/            # Per-entity query modules
    stores/               # Zustand stores
    hooks/                # useTheme, useToast, useSync, etc.
    lib/                  # Supabase client, sync engine
    theme/                # Colors, typography, spacing tokens
    utils/                # Dates, haptics, notifications
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Expo CLI (`npx expo`)
- iOS Simulator or Android Emulator (or Expo Go)

### Install & Run

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm start

# Run on specific platform
pnpm android
pnpm ios
```

### Supabase Setup (Optional)

Sync is optional — the app works fully offline. To enable cloud sync:

1. Create a project at [supabase.com](https://supabase.com)
2. Create a `.env` file:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Run the SQL migrations from `src/database/schema.ts` in the Supabase SQL editor (adding a `user_id` column to each table)

### Build for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## License

MIT
