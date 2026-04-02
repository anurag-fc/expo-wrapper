import type { SymbolViewProps } from 'expo-symbols';

export type CategoryId =
  | 'design'
  | 'code'
  | 'business'
  | 'creative'
  | 'productivity'
  | 'health';

export type Category = {
  id: CategoryId;
  label: string;
  color: string;
  icon: SymbolViewProps['name'];
};

export const CATEGORIES: Category[] = [
  {
    id: 'design',
    label: 'Design',
    color: '#C084FC',
    icon: { ios: 'pencil.ruler', android: 'brush', web: 'brush' },
  },
  {
    id: 'code',
    label: 'Code',
    color: '#60A5FA',
    icon: {
      ios: 'chevron.left.forwardslash.chevron.right',
      android: 'code',
      web: 'code',
    },
  },
  {
    id: 'business',
    label: 'Business',
    color: '#FB923C',
    icon: { ios: 'briefcase', android: 'business_center', web: 'business_center' },
  },
  {
    id: 'creative',
    label: 'Creative',
    color: '#F472B6',
    icon: { ios: 'paintbrush', android: 'palette', web: 'palette' },
  },
  {
    id: 'productivity',
    label: 'Productivity',
    color: '#4ADE80',
    icon: { ios: 'checkmark.circle', android: 'task_alt', web: 'task_alt' },
  },
  {
    id: 'health',
    label: 'Health',
    color: '#F87171',
    icon: { ios: 'heart', android: 'favorite', web: 'favorite' },
  },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

// ─── XP rules ────────────────────────────────────────────────────────────────
export const XP_RULES = {
  LOG_LESSON:     10,
  COMPLETE_SKILL: 100,
  STREAK_7_DAY:   50,
  RATE_SKILL:     5,
} as const;

export const XP_PER_LEVEL = 500;

export function xpToLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpForNextLevel(level: number): number {
  return level * XP_PER_LEVEL;
}

export function xpProgressInLevel(xp: number): { current: number; total: number; pct: number } {
  const level = xpToLevel(xp);
  const levelStart = (level - 1) * XP_PER_LEVEL;
  const current = xp - levelStart;
  const total = XP_PER_LEVEL;
  return { current, total, pct: Math.round((current / total) * 100) };
}
