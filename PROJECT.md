# expo-wrapper

A production-ready Expo project wrapper. Every feature listed below is fully wired up and working. Clone it, install packages, set your `.env`, and start building — no boilerplate setup required.

---

## Stack

| Category | Library | Version |
|---|---|---|
| Framework | Expo | ~55.0.9 |
| React | React | 19.2.0 |
| React Native | React Native | 0.83.4 |
| Routing | expo-router | ~55.0.8 |
| Backend / Auth | @supabase/supabase-js | ^2.101.0 |
| Server state | @tanstack/react-query | ^5.96.0 |
| Client state | zustand | ^5.0.12 |
| Internationalisation | i18next + react-i18next | ^26 / ^17 |
| Push notifications | expo-notifications | ~55.0.14 |
| Secure storage | expo-secure-store | ~55.0.9 |
| Animations | react-native-reanimated | 4.2.1 |
| Language | TypeScript | ~5.9.2 (strict) |

---

## Quick Start

```bash
# 1. Install dependencies
npx expo install @supabase/supabase-js expo-secure-store \
  @react-native-async-storage/async-storage @tanstack/react-query \
  zustand i18next react-i18next expo-notifications

# 2. Copy env template
cp .env.example .env

# 3. Run (mock mode is ON by default — no Supabase account needed)
npx expo start
```

**Mock credentials:** `demo@example.com` / `demo123`

---

## Features

### 1. Mock Mode

> **Toggle:** `EXPO_PUBLIC_USE_MOCK=true` in `.env`

A universal flag that switches the entire app between dummy data and real Supabase calls. Every service checks this flag independently.

**When ON:**
- All API calls return pre-defined dummy data from `src/mocks/data.ts`
- A simulated 700ms network delay exercises all loading states
- Auth session is stored in AsyncStorage (no real tokens)
- OAuth buttons show an alert explaining mock mode
- Mock credentials: `demo@example.com` / `demo123`

**When OFF:**
- Fill `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env`
- All services call Supabase directly — no other code changes needed

**Relevant files:**
```
src/constants/config.ts          ← IS_MOCK_MODE flag
src/mocks/data.ts                ← all mock data (user, profile, notifications)
src/mocks/delay.ts               ← simulated network delay
```

---

### 2. Authentication

Full auth flow powered by Supabase Auth. Route groups enforce access control — no `ProtectedRoute` wrapper components needed.

**Screens:**
- `(auth)/login` — email/password sign-in + OAuth buttons + links to register/forgot-password
- `(auth)/register` — sign up with email confirmation state
- `(auth)/forgot-password` — password reset via email link

**Auth guard:**
- `(auth)/_layout.tsx` — redirects to `/(app)/` if already signed in
- `(app)/_layout.tsx` — redirects to `/(auth)/login` if no session; shows loading spinner while session resolves

**How it works:**
1. `AuthProvider` runs on app launch — calls `authService.getSession()` to restore the session
2. Subscribes to auth state changes (Supabase listener in real mode, mock emitter in mock mode)
3. Writes session to `useAuthStore` (Zustand)
4. Route group layouts read from the store and redirect accordingly

**Relevant files:**
```
src/services/auth.service.ts        ← signIn, signUp, signOut, resetPassword, OAuth
src/providers/auth-provider.tsx     ← bootstraps session, subscribes to changes
src/store/auth.store.ts             ← session + isReady state
src/queries/use-session.ts          ← useSession, useSignIn, useSignOut, useSignUp, useResetPassword
src/app/(auth)/                     ← login, register, forgot-password screens
src/app/(app)/_layout.tsx           ← auth guard
src/lib/supabase/storage.ts         ← SecureStore + AsyncStorage adapter (handles Android 2KB limit)
```

---

### 3. Server State — TanStack Query

All data fetched from the backend goes through TanStack Query. Provides caching, background refetching, loading/error states, and optimistic updates out of the box.

**Default config:**
- `staleTime`: 5 minutes
- `retry`: 2 attempts with exponential backoff
- Cache is fully cleared on sign-out (prevents data leakage between accounts)

**Available query hooks:**

| Hook | What it does |
|---|---|
| `useSession()` | Returns current `AppSession` from Zustand (not a query — session is event-driven) |
| `useIsAuthReady()` | `true` once initial session check completes |
| `useSignIn()` | Mutation — signs in with email/password |
| `useSignUp()` | Mutation — registers with email/password |
| `useSignOut()` | Mutation — signs out and clears query cache |
| `useResetPassword()` | Mutation — sends password reset email |
| `useProfile()` | Query — fetches profile for the logged-in user |
| `useUpdateProfile()` | Mutation — updates profile with optimistic update + rollback |
| `useNotifications()` | Query — fetches all notifications for the logged-in user |
| `useMarkAsRead()` | Mutation — marks a notification as read, invalidates cache |

**Relevant files:**
```
src/lib/query/client.ts             ← QueryClient singleton with default options
src/constants/query-keys.ts         ← centralised key factories
src/queries/use-session.ts
src/queries/use-profile.ts
src/queries/use-notifications.ts
src/providers/query-provider.tsx
```

---

### 4. Client State — Zustand

UI-only state that doesn't belong in the server cache. Three stores, zero overlap with TanStack Query.

| Store | What it holds |
|---|---|
| `useAuthStore` | `session`, `isReady` — written by `AuthProvider`, read by auth guard and screens |
| `useAppStore` | `toast` — global toast queue with auto-dismiss after 3s |
| `useNotificationStore` | `unreadCount` — drives the tab badge, reset when Notifications screen opens |

**Key rule:** never put data fetched from an API in Zustand. Use it only for derived UI state.

**Relevant files:**
```
src/store/auth.store.ts
src/store/app.store.ts
src/store/notification.store.ts
```

---

### 5. Supabase Integration

Supabase handles auth, database, storage, and (optionally) edge functions.

**Database schema expected:**

| Table | Key columns |
|---|---|
| `profiles` | `id`, `email`, `full_name`, `avatar_url`, `bio`, `updated_at` |
| `notifications` | `id`, `user_id`, `title`, `body`, `data`, `read_at`, `created_at` |
| `push_tokens` | `id`, `user_id`, `token`, `platform` |

**Token storage:** Uses a `SecureStore + AsyncStorage` hybrid adapter. SecureStore is limited to 2 KB per value on Android — JWTs regularly exceed this. Values over 1800 bytes are stored in AsyncStorage with a pointer key kept in SecureStore.

**Type safety:** `src/lib/supabase/types.ts` mirrors the database schema. Regenerate anytime with:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts
```

**Relevant files:**
```
src/lib/supabase/client.ts          ← singleton, auth config
src/lib/supabase/storage.ts         ← SecureStore+AsyncStorage hybrid adapter
src/lib/supabase/types.ts           ← Database type + Tables<T> / InsertTables<T> helpers
src/services/auth.service.ts
src/services/user.service.ts
src/services/notifications.service.ts
```

---

### 6. Internationalisation (i18n)

Full i18n setup with two languages out of the box. Language change takes effect immediately without restarting the app.

**Supported languages:** English (`en`), Spanish (`es`)

**Namespaces:** `common`, `auth`, `profile`, `notifications`, `home`

**Usage in components:**
```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
t('auth.signIn')               // → "Sign In"
t('home.greeting', { name })   // → "Hello, Anurag!"
```

**Switching language:**
```typescript
import i18n from '@/lib/i18n';
i18n.changeLanguage('es');     // instant, no restart
```

A language switcher is built into the Profile screen.

**Adding a new language:**
1. Create `src/lib/i18n/locales/fr.ts` mirroring the `en.ts` structure
2. Register it in `src/lib/i18n/index.ts` under `resources: { fr: { translation: fr } }`

**Relevant files:**
```
src/lib/i18n/index.ts
src/lib/i18n/locales/en.ts
src/lib/i18n/locales/es.ts
```

---

### 7. Push Notifications

**`NotificationProvider`** handles the lifecycle automatically:
- Registers the Expo push token with Supabase when a user signs in
- Listens for foreground notifications → increments unread count in `useNotificationStore`
- Listens for notification taps → deep-links into the app via `router.push(data.route)`
- Configures foreground notification display (alert + sound + badge)

**`useNotificationPermission`** hook — use this to request permission from the UI at the right moment (e.g. after login, not on app launch):
```typescript
const { status, request } = useNotificationPermission();
// status: 'undetermined' | 'granted' | 'denied'
await request(); // shows system permission dialog
```

A permission prompt is shown inline on the Notifications screen if status is `undetermined`.

**In mock mode:** permission is always `granted`, no real tokens are registered.

**Relevant files:**
```
src/providers/notification-provider.tsx
src/hooks/use-notification-permission.ts
src/store/notification.store.ts
src/services/notifications.service.ts
src/queries/use-notifications.ts
src/app/(app)/notifications.tsx
```

---

### 8. Routing

File-based routing via `expo-router`. Routes are split into two groups:

```
src/app/
├── _layout.tsx              Root layout — all providers + Stack navigator
├── +not-found.tsx           404 screen
│
├── (auth)/                  Unauthenticated screens
│   ├── _layout.tsx          ← redirects to (app)/ if already signed in
│   ├── login.tsx
│   ├── register.tsx
│   └── forgot-password.tsx
│
└── (app)/                   Protected screens
    ├── _layout.tsx          ← redirects to (auth)/login if no session
    ├── index.tsx            Home tab
    ├── explore.tsx          Explore tab
    ├── notifications.tsx    Notifications tab
    └── profile.tsx          Profile tab
```

**Provider nesting order** (outermost → innermost in `_layout.tsx`):

```
ErrorBoundary
  GestureHandlerRootView
    SafeAreaProvider
      QueryProvider
        AuthProvider
          NotificationProvider
            ThemeProvider
              Stack
```

The order is intentional:
- `GestureHandlerRootView` must be outermost
- `QueryProvider` before `AuthProvider` so auth can seed the query cache on sign-in
- `NotificationProvider` after `AuthProvider` so tokens are tied to a signed-in user

**Typed routes** are enabled (`experiments.typedRoutes: true` in `app.json`) — `router.push()` calls are type-checked.

---

### 9. UI Components

All components use `StyleSheet.create` + the existing `useTheme()` hook for colors. Light and dark mode are supported automatically.

| Component | Location | Props |
|---|---|---|
| `Button` | `components/ui/button.tsx` | `variant` (primary/secondary/ghost/destructive), `size` (sm/md/lg), `loading`, `disabled` |
| `Input` | `components/ui/input.tsx` | `label`, `error`, all `TextInputProps` |
| `Card` | `components/ui/card.tsx` | All `ViewProps` |
| `Avatar` | `components/ui/avatar.tsx` | `uri`, `name` (used for initials fallback), `size` |
| `LoadingSpinner` | `components/ui/loading-spinner.tsx` | `fullscreen`, `size` |
| `EmptyState` | `components/ui/empty-state.tsx` | `title`, `subtitle`, `action` |
| `ErrorBoundary` | `components/ui/error-boundary.tsx` | `fallback` (optional custom render) |
| `OAuthButtons` | `components/auth/oauth-buttons.tsx` | — (reads mock mode internally) |
| `ThemedText` | `components/themed-text.tsx` | `type` (title/subtitle/small/smallBold/link/linkPrimary/code), `themeColor` |
| `ThemedView` | `components/themed-view.tsx` | `type` (background/backgroundElement/backgroundSelected) |

---

### 10. Theming

Light/dark mode is fully supported via system preference.

**Colors** (`src/constants/theme.ts`):

| Token | Light | Dark |
|---|---|---|
| `text` | `#000000` | `#ffffff` |
| `background` | `#ffffff` | `#000000` |
| `backgroundElement` | `#F0F0F3` | `#212225` |
| `backgroundSelected` | `#E0E1E6` | `#2E3135` |
| `textSecondary` | `#60646C` | `#B0B4BA` |

**Usage in components:**
```typescript
import { useTheme } from '@/hooks/use-theme';
const theme = useTheme();
// theme.text, theme.background, theme.textSecondary, etc.
```

**Spacing scale:** `half(2)` · `one(4)` · `two(8)` · `three(16)` · `four(24)` · `five(32)` · `six(64)`

---

### 11. Error Handling

`ErrorBoundary` (class component) wraps the entire app in `_layout.tsx`. Catches any render-time crash and shows a "Something went wrong / Try again" fallback instead of a white screen.

```typescript
// Custom fallback
<ErrorBoundary fallback={(error, reset) => (
  <View>
    <Text>{error.message}</Text>
    <Button onPress={reset}>Retry</Button>
  </View>
)}>
  <MyScreen />
</ErrorBoundary>
```

Replace the `console.error` in `componentDidCatch` with your error reporting service (Sentry, Bugsnag, etc.) when going to production.

---

## Architecture Rules

1. **Services are pure functions** — no hooks, no React, just async functions with a `{ data, error }` return shape. Callable from anywhere.
2. **Queries wrap services** — TanStack Query hooks import service functions. The query cache is the single source of truth for server data.
3. **Zustand is for UI state only** — session, toast, unread count. Never API data.
4. **Mock branching lives in services** — the `IS_MOCK_MODE` check is in the service layer only. Queries, stores, and components are unaware of mock mode.
5. **Route groups enforce auth** — the guard lives in `(app)/_layout.tsx`. Adding a new protected screen means just creating a file inside `(app)/`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_USE_MOCK` | Yes | `true` = dummy data, `false` = real Supabase |
| `EXPO_PUBLIC_SUPABASE_URL` | When mock=false | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | When mock=false | Your Supabase anon key |
| `EXPO_PUBLIC_APP_ENV` | No | `development` or `production` |

Only `EXPO_PUBLIC_*` prefixed variables are bundled into the client. Never put service role keys or secrets in these.

---

## Adding a New Feature

Follow this checklist for any new data-fetching feature:

```
1. src/lib/supabase/types.ts      → add the table Row/Insert/Update types
2. src/mocks/data.ts              → add mock data for the feature
3. src/services/my.service.ts     → pure async functions, mock branch + real branch
4. src/constants/query-keys.ts    → add a key factory
5. src/queries/use-my-feature.ts  → useQuery / useMutation hooks
6. src/app/(app)/my-screen.tsx    → screen that uses the hook
```
