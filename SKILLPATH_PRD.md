# Product Requirements Document
## SkillPath — Personal Skill Learning Tracker

---

## 1. Overview

**Product:** SkillPath — a mobile app where users track skills they're learning, log daily progress, and stay motivated through streaks, XP, and visual progress.

**Platform:** iOS + Android (Expo React Native)

**Target user:** Self-learners, developers, designers, and professionals upskilling outside of formal education.

---

## 2. Design Language

| Token | Value | Usage |
|---|---|---|
| Primary | `#6C6FE4` | Hero cards, active states |
| Accent | `#F5C533` | Streaks, XP, highlights |
| Card Purple | `#C084FC` | Design category |
| Card Orange | `#FB923C` | Business category |
| Card Green | `#4ADE80` | Health / Productivity |
| Card Blue | `#60A5FA` | Code category |
| Card Pink | `#F472B6` | Creative category |
| Background | `#F4F4F8` | Cool off-white |
| Card | `#FFFFFF` | Pure white with shadow |
| Text | `#0F0F1A` | Near black |
| Text secondary | `#6B7280` | Muted grey |
| Dark pill | `#0F0F1A` | CTAs, active tabs |
| Border | `#E5E7EB` | Dividers, input borders |

**Visual rules:**
- Full pill buttons (`borderRadius: 999`) — never square
- Bold 700 weight headlines, 500 body
- Cards: `shadowOpacity: 0.08`, `shadowRadius: 16`
- Category cards: solid colour background with white text
- Active tab indicator: small dot below icon
- Progress rings (circular) for skill completion %
- Avatar stacks for social proof elements

---

## 3. Information Architecture

```
(app)/
├── index.tsx          →  Home (feed + calendar + courses)
├── explore.tsx        →  Explore (categories + featured)
├── add-skill.tsx      →  Add Skill (bottom sheet)
├── notifications.tsx  →  Notifications
└── profile.tsx        →  Profile (XP + stats + streaks)
```

---

## 4. Screens — Detailed Requirements

---

### Screen 1 — Home

**Purpose:** Daily driver. User sees their momentum, continues learning, and logs today's progress.

#### Header
- Left: Avatar (36px) + greeting `"Good morning, {name}"`
- Right: Bell icon with notification badge if unread

#### Continue Learning — Hero Card
- Full-width card, primary blue background (`#6C6FE4`)
- Shows the **most recently accessed skill**
- Fields: skill name (bold white), category tag, source label, white progress bar
- Progress counter top-right: `2/5 lessons` pill
- CTA: black pill `"CONTINUE →"`
- If no skill added: illustration + `"Add your first skill"` CTA

#### Weekly Activity Strip
- 7 columns: Sun Mon Tue Wed Thu Fri Sat
- Each day has a day label + circular icon:
  - **Completed:** filled dark circle with check
  - **Today:** filled accent yellow circle
  - **Missed:** empty circle with muted border
  - **Future:** ghost/empty
- Tapping a past day shows tooltip: `"Logged 2 skills"`
- Streak label above strip: `🔥 4 day streak`

#### My Skills List
- Section header: `"My Skills"` + `"See all"` link + `+` add button
- First 3–4 skills as list rows
- Each row:
  - Left: category colour dot (12px)
  - Skill name (bold) + source label (muted, small)
  - Right: circular progress ring (40px) with % inside
  - Chevron right
- Empty state: illustrated card with `"No skills yet — explore to add some"`

---

### Screen 2 — Explore

**Purpose:** Discover and add new skills. Browse by category or search.

#### Header
- Title `"Explore"`
- Full-width search bar below title (rounded, `#F4F4F8` bg)

#### Category Grid
- Section label: `"Browse by Category"`
- 2-column grid of colourful cards (~160px tall each)

| Category | Colour | Icon |
|---|---|---|
| Design | `#C084FC` | pencil.ruler |
| Code | `#60A5FA` | chevron.left.forwardslash.chevron.right |
| Business | `#FB923C` | briefcase |
| Creative | `#F472B6` | paintbrush |
| Productivity | `#4ADE80` | checkmark.circle |
| Health | `#F87171` | heart |

- Each card: category name (bold white) + icon (white) + `"12 skills"` count
- Tapping filters the featured list below

#### Featured Skills
- Section label: `"Featured"` + active category filter pill
- Horizontal scroll, cards 280px wide
- Each card:
  - Top: colour band (category colour, 80px)
  - Body: skill name, 2-line description, source tag
  - Bottom: avatar stack (3 learners) + `"X people learning"` + Add button (black pill)
  - If already added: `"Added ✓"` (muted, disabled)

#### Add Skill — Bottom Sheet
> Accessible from Explore card or `+` button on Home

**Fields:**
| Field | Type | Required |
|---|---|---|
| Skill name | Text input | ✅ |
| Category | Horizontal chip selector | ✅ |
| Total lessons / modules | Number input | ✅ |
| Source / Platform | Text input | ❌ |
| Goal — complete by | Date picker | ❌ |

- CTA: `"Add to My Skills"` — full-width black pill
- Validation: skill name required, lessons > 0

---

### Screen 3 — Notifications

**Purpose:** Reminders and milestone celebrations.

#### Header
- Dark status pill `"Alerts"` + unread count badge

#### Notification Types

| Type | Icon | Accent colour |
|---|---|---|
| Daily reminder | `bell` | `#6C6FE4` blue |
| Streak milestone | `flame` | `#F5C533` yellow |
| Skill completed | `checkmark.seal` | `#4ADE80` green |
| XP earned | `star` | `#C084FC` purple |
| Weekly summary | `chart.bar` | `#FB923C` orange |

#### Notification Card
- Left: coloured icon bubble (40px, category colour at 15% opacity)
- Body: bold title + 2-line description + relative timestamp
- **Unread:** 3px left accent bar (primary blue)
- **Read:** no accent bar, muted
- Swipe right → mark read
- `"Mark all read"` button in header

---

### Screen 4 — Profile

**Purpose:** User's learning identity — XP, level, streaks, completed skills.

#### Header
- Dark status pill `"Profile"`

#### Identity Card
- Avatar (72px) + yellow level badge
- Display name + email
- XP bar: `Level 4 · 1,240 / 2,000 XP` with filled blue progress bar

#### Stats Row — 3 equal cards

| Stat | Example |
|---|---|
| 🔥 Streak | 12 days |
| ✅ Completed | 4 skills |
| ⏱ Hours | 24.5 hrs |

Each: white card, large bold number + muted label.

#### Completed Skills
- Section label: `"Completed"`
- List rows: skill name + category dot + completion date + star rating (1–5)
- Empty state: `"Complete a skill to see it here"`

#### Settings Section
- Edit name / bio
- Language switcher (EN / ES / HI)
- Notification preferences toggle
- Sign out (destructive)

---

## 5. Data Model (Supabase)

```sql
-- Skills the user is tracking
create table skills (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete cascade,
  name          text not null,
  category      text not null,   -- 'design' | 'code' | 'business' | 'creative' | 'productivity' | 'health'
  source        text,            -- 'YouTube', 'Udemy', 'Book', etc.
  total_lessons int default 1,
  goal_date     date,
  created_at    timestamptz default now()
);

-- Each time user logs a lesson / session
create table progress_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete cascade,
  skill_id      uuid references skills on delete cascade,
  lessons_done  int default 1,
  logged_at     timestamptz default now()
);

-- Aggregated stats per skill
create table skill_stats (
  skill_id          uuid primary key references skills on delete cascade,
  completed_lessons int default 0,
  is_completed      boolean default false,
  completed_at      timestamptz,
  star_rating       int            -- 1–5, set when marking complete
);

-- User-level XP, level, streak
create table user_stats (
  user_id         uuid primary key references auth.users on delete cascade,
  xp              int default 0,
  level           int default 1,
  current_streak  int default 0,
  longest_streak  int default 0,
  last_logged_at  timestamptz,
  timezone        text default 'UTC'   -- set from device on first log, used for midnight streak resets
);
```

### XP Rules

| Action | XP earned |
|---|---|
| Log a lesson | +10 XP |
| Complete a skill | +100 XP |
| 7-day streak bonus | +50 XP |
| Rate a completed skill | +5 XP |

**Level formula:** `level = floor(xp / 500) + 1`

---

## 6. Screen Flow

```
Launch
  └── Auth guard
        ├── Not logged in → Login / Register
        └── Logged in →
              Home (default tab)
                ├── Tap hero card → Skill Detail (log progress)
                ├── Tap skill row → Skill Detail (log progress)
                ├── Tap + → Add Skill bottom sheet
                └── Tap "See all" → Full skill list

              Explore tab
                ├── Tap category card → filtered featured list
                ├── Tap featured skill → Skill Detail (preview + Add)
                └── Tap Add → Add Skill bottom sheet

              Notifications tab
                └── Tap notification → deep link to relevant screen

              Profile tab
                └── Tap completed skill → Skill Detail (read-only)
```

---

## 7. MVP vs Later

| Feature | MVP | Later |
|---|---|---|
| Add / track skills | ✅ | |
| Weekly calendar strip | ✅ | |
| Progress ring per skill | ✅ | |
| XP + level system | ✅ | |
| Streak tracking | ✅ | |
| Category browse | ✅ | |
| Push notification reminders | ✅ | |
| Search skills | ✅ | |
| Star rating on completion | ✅ | |
| Social — see friends' skills | | ✅ |
| Curated skill library | | ✅ |
| AI-generated learning plan | | ✅ |
| Offline mode | | ✅ |
| Apple / Google OAuth | | ✅ |

---

## 8. Open Questions

| # | Question | Decision | Rationale |
|---|---|---|---|
| 1 | Progress logging format | **Per-lesson tap** (with optional multi-lesson count) | Binary, satisfying, streak-friendly. Hours can be derived later from average lesson length without schema changes. |
| 2 | Skill library source | **User-created only** in MVP | Zero moderation overhead. Seed a curated library in V2 from real user data. |
| 3 | Streak reset timing | **Midnight local time** | Matches user mental model (Duolingo standard). Store `timezone` on `user_stats`, compare UTC timestamps against local date boundaries. |
| 4 | Social layer | **Strictly personal** in MVP, schema designed for social from day one | Empty friend lists hurt retention. Keep `user_id` on all tables, use permissive RLS on read-only stats so social queries need only a new `follows` table in V2. |

---

*Last updated: 2026-04-02*
