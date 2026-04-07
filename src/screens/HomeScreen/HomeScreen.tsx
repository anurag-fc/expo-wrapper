import { SymbolView } from 'expo-symbols';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddSkillSheet } from '@/components/add-skill-sheet';
import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CATEGORY_MAP, xpProgressInLevel } from '@/constants/skills';
import { Accent, BottomTabInset, Primary, Spacing } from '@/constants/theme';
import { useWeeklyProgress } from '@/queries/use-progress';
import { useProfile } from '@/queries/use-profile';
import { useSession } from '@/queries/use-session';
import { useSkills } from '@/queries/use-skills';
import { useUserStats } from '@/queries/use-user-stats';
import { getSkillProgress } from '@/services/skills.service';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const BG     = '#FAF8F3';
const CARD   = '#FFFFFF';
const TEXT   = '#1A1A1A';
const MUTED  = '#6B6868';
const BORDER = '#E8E5DF';
const DARK   = '#1C1C1E';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function get7Days(): { dateStr: string; label: string; isToday: boolean }[] {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push({
      dateStr: d.toLocaleDateString('en-CA'),
      label:   DAY_LABELS[d.getDay()],
      isToday: i === 0,
    });
  }
  return result;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function WeeklyStrip({ progressLogs, streak }: {
  progressLogs: { logged_at: string }[] | undefined | null;
  streak: number;
}) {
  const days = get7Days();
  const loggedDates = new Set(
    (progressLogs ?? []).map((l) => l.logged_at.split('T')[0]),
  );

  return (
    <View style={styles.weekCard}>
      <View style={styles.weekHeader}>
        <ThemedText style={styles.sectionTitle}>This Week</ThemedText>
        <View style={styles.streakPill}>
          <ThemedText style={styles.streakText}>🔥 {streak}</ThemedText>
        </View>
      </View>
      <View style={styles.weekDays}>
        {days.map((d) => {
          const logged  = loggedDates.has(d.dateStr);
          return (
            <View key={d.dateStr} style={styles.dayCol}>
              <View style={[
                styles.dayDot,
                logged     && styles.dayDotFilled,
                d.isToday  && !logged && styles.dayDotToday,
              ]} />
              <ThemedText style={[styles.dayLabel, d.isToday && styles.dayLabelToday]}>
                {d.label}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const session  = useSession();
  const { data: profile }    = useProfile();
  const { data: skills, isLoading: skillsLoading }      = useSkills();
  const { data: progressLogs }  = useWeeklyProgress();
  const { data: userStats }     = useUserStats();
  const [showAddSheet, setShowAddSheet] = useState(false);

  const firstName   = profile?.full_name?.split(' ')[0] ?? session?.user.email?.split('@')[0] ?? 'there';
  const displayName = profile?.full_name ?? session?.user.email ?? '…';

  const activeSkills    = (skills ?? []).filter((s) => !s.skill_stats?.is_completed);
  const heroSkill       = activeSkills[0] ?? null;
  const heroProgress    = heroSkill ? getSkillProgress(heroSkill) : 0;
  const heroCat         = heroSkill ? CATEGORY_MAP[heroSkill.category as keyof typeof CATEGORY_MAP] : null;

  const xpInfo = userStats ? xpProgressInLevel(userStats.xp) : null;

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']}>
        <View style={styles.topBar}>
          <View>
            <ThemedText style={styles.greeting}>Hey, {firstName} 👋</ThemedText>
            {userStats && (
              <ThemedText style={styles.levelTag}>
                Level {userStats.level} · {userStats.xp} XP
              </ThemedText>
            )}
          </View>
          <Avatar uri={profile?.avatar_url} name={displayName} size={40} />
        </View>

        {/* XP progress bar */}
        {xpInfo && (
          <View style={styles.xpBarWrap}>
            <View style={styles.xpBarTrack}>
              <View style={[styles.xpBarFill, { width: `${xpInfo.pct}%` as `${number}%` }]} />
            </View>
            <ThemedText style={styles.xpBarLabel}>{xpInfo.current}/{xpInfo.total} XP</ThemedText>
          </View>
        )}
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ── Continue Learning hero ── */}
        {skillsLoading ? (
          <View style={styles.heroCard}>
            <LoadingSpinner />
          </View>
        ) : heroSkill ? (
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <ThemedText style={styles.heroEyebrow}>Continue Learning</ThemedText>
              {heroCat && (
                <View style={[styles.heroCatPill, { backgroundColor: heroCat.color + '30' }]}>
                  <View style={[styles.heroCatDot, { backgroundColor: heroCat.color }]} />
                  <ThemedText style={[styles.heroCatText, { color: heroCat.color }]}>
                    {heroCat.label}
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText style={styles.heroName} numberOfLines={2}>{heroSkill.name}</ThemedText>
            {heroSkill.source && (
              <ThemedText style={styles.heroSource}>{heroSkill.source}</ThemedText>
            )}
            <View style={styles.heroProgressRow}>
              <View style={styles.heroTrack}>
                <View style={[styles.heroFill, { width: `${heroProgress}%` as `${number}%` }]} />
              </View>
              <ThemedText style={styles.heroPercent}>{heroProgress}%</ThemedText>
            </View>
            <ThemedText style={styles.heroSub}>
              {heroSkill.skill_stats?.completed_lessons ?? 0} of {heroSkill.total_lessons} lessons
            </ThemedText>
          </View>
        ) : (
          <View style={styles.emptyHero}>
            <SymbolView
              name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }}
              size={32}
              tintColor={Primary}
            />
            <ThemedText style={styles.emptyHeroTitle}>No skills yet</ThemedText>
            <ThemedText style={styles.emptyHeroSub}>Add your first skill to get started</ThemedText>
            <Pressable
              style={styles.emptyHeroBtn}
              onPress={() => setShowAddSheet(true)}
            >
              <ThemedText style={styles.emptyHeroBtnText}>Add a Skill</ThemedText>
            </Pressable>
          </View>
        )}

        {/* ── Weekly activity ── */}
        <WeeklyStrip
          progressLogs={progressLogs as { logged_at: string }[] | null | undefined}
          streak={userStats?.current_streak ?? 0}
        />

        {/* ── My Skills ── */}
        <View style={styles.sectionRow}>
          <ThemedText style={styles.sectionTitle}>My Skills</ThemedText>
          <Pressable style={styles.addBtn} onPress={() => setShowAddSheet(true)}>
            <SymbolView
              name={{ ios: 'plus', android: 'add', web: 'add' }}
              size={14}
              tintColor={Primary}
            />
            <ThemedText style={styles.addBtnText}>Add</ThemedText>
          </Pressable>
        </View>

        {skillsLoading ? (
          <View style={styles.loadingCard}><LoadingSpinner /></View>
        ) : (skills ?? []).length === 0 ? (
          <View style={styles.emptyList}>
            <ThemedText style={styles.emptyListText}>No skills tracked yet</ThemedText>
          </View>
        ) : (
          <View style={styles.skillList}>
            {(skills ?? []).map((skill) => {
              const pct = getSkillProgress(skill);
              const cat = CATEGORY_MAP[skill.category as keyof typeof CATEGORY_MAP];
              const isCompleted = skill.skill_stats?.is_completed ?? false;
              return (
                <View key={skill.id} style={[styles.skillRow, isCompleted && styles.skillRowDone]}>
                  <View style={[styles.catDot, { backgroundColor: cat?.color ?? MUTED }]} />
                  <View style={styles.skillMeta}>
                    <View style={styles.skillNameRow}>
                      <ThemedText style={[styles.skillName, isCompleted && styles.skillNameDone]} numberOfLines={1}>
                        {skill.name}
                      </ThemedText>
                      {isCompleted && (
                        <SymbolView
                          name={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }}
                          size={13}
                          tintColor={Accent}
                        />
                      )}
                    </View>
                    <View style={styles.progressRow}>
                      <View style={styles.progressTrack}>
                        <View style={[
                          styles.progressFill,
                          { width: `${pct}%` as `${number}%`, backgroundColor: cat?.color ?? Primary },
                        ]} />
                      </View>
                      <ThemedText style={styles.progressPct}>{pct}%</ThemedText>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <AddSkillSheet visible={showAddSheet} onClose={() => setShowAddSheet(false)} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: 8,
    paddingBottom: 4,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: TEXT, letterSpacing: -0.4 },
  levelTag: { fontSize: 12, color: MUTED, marginTop: 2 },

  xpBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.three,
    paddingBottom: 12,
  },
  xpBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: BORDER,
    borderRadius: 2,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: 4,
    backgroundColor: Primary,
    borderRadius: 2,
  },
  xpBarLabel: { fontSize: 11, color: MUTED, flexShrink: 0 },

  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: 4,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: 14,
  },

  // Hero card
  heroCard: {
    backgroundColor: Primary,
    borderRadius: 22,
    padding: 20,
    gap: 10,
    minHeight: 80,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  heroTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroEyebrow: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.6 },
  heroCatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroCatDot: { width: 5, height: 5, borderRadius: 2.5 },
  heroCatText: { fontSize: 11, fontWeight: '600' },
  heroName: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.3, width: '100%' },
  heroSource: { fontSize: 12, color: 'rgba(255,255,255,0.65)', width: '100%' },
  heroProgressRow: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroTrack: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  heroFill: { height: 5, backgroundColor: '#FFFFFF', borderRadius: 3 },
  heroPercent: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', flexShrink: 0 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', width: '100%' },

  emptyHero: {
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  emptyHeroTitle: { fontSize: 17, fontWeight: '700', color: TEXT },
  emptyHeroSub:   { fontSize: 13, color: MUTED, textAlign: 'center' },
  emptyHeroBtn: {
    marginTop: 6,
    backgroundColor: Primary,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 14,
  },
  emptyHeroBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  // Weekly strip
  weekCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  weekHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakPill: {
    backgroundColor: DARK,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  weekDays: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: 5 },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0EEE9',
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  dayDotFilled: { backgroundColor: Primary, borderColor: Primary },
  dayDotToday:  { borderColor: Primary, backgroundColor: 'transparent' },
  dayLabel: { fontSize: 11, fontWeight: '500', color: MUTED },
  dayLabelToday: { color: Primary, fontWeight: '700' },

  // Section row
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -4,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: TEXT, letterSpacing: -0.2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addBtnText: { fontSize: 13, fontWeight: '600', color: Primary },

  // Loading / empty
  loadingCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  emptyList: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  emptyListText: { fontSize: 14, color: MUTED },

  // Skill list
  skillList: {
    backgroundColor: CARD,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  skillRowDone: { opacity: 0.6 },
  catDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  skillMeta: { flex: 1, gap: 6 },
  skillNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  skillName: { flex: 1, fontSize: 14, fontWeight: '600', color: TEXT },
  skillNameDone: { textDecorationLine: 'line-through' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: BORDER,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: 4, borderRadius: 2 },
  progressPct: { fontSize: 11, fontWeight: '600', color: MUTED, width: 30, textAlign: 'right' },
});
