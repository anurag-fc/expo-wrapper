import { SymbolView } from 'expo-symbols';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddSkillSheet } from '@/components/add-skill-sheet';
import { ThemedText } from '@/components/themed-text';
import { CATEGORIES, type Category } from '@/constants/skills';
import { Accent, BottomTabInset, Primary, Spacing } from '@/constants/theme';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const BG     = '#FAF8F3';
const CARD   = '#FFFFFF';
const TEXT   = '#1A1A1A';
const MUTED  = '#6B6868';
const BORDER = '#E8E5DF';

// ─── Mock popular skills ──────────────────────────────────────────────────────
type PopularSkill = {
  id: string;
  name: string;
  category: string;
  source: string;
  lessons: number;
  xp: number;
};

const POPULAR: PopularSkill[] = [
  { id: 'p1', name: 'JavaScript Essentials',   category: 'code',         source: 'freeCodeCamp', lessons: 12, xp: 120 },
  { id: 'p2', name: 'Figma for Beginners',     category: 'design',       source: 'YouTube',      lessons: 8,  xp: 80  },
  { id: 'p3', name: 'Public Speaking',          category: 'productivity', source: 'Coursera',     lessons: 6,  xp: 60  },
  { id: 'p4', name: 'Watercolour Basics',       category: 'creative',     source: 'Skillshare',   lessons: 10, xp: 100 },
  { id: 'p5', name: 'Product Management 101',  category: 'business',     source: 'LinkedIn',     lessons: 9,  xp: 90  },
  { id: 'p6', name: 'Morning Yoga Routine',    category: 'health',       source: 'YouTube',      lessons: 5,  xp: 50  },
];

// ─── Category card ────────────────────────────────────────────────────────────
function CategoryCard({ cat, count }: { cat: Category; count: number }) {
  return (
    <Pressable style={[styles.catCard, { backgroundColor: cat.color + '18' }]}>
      <View style={[styles.catIconWrap, { backgroundColor: cat.color + '30' }]}>
        <SymbolView name={cat.icon} size={22} tintColor={cat.color} />
      </View>
      <ThemedText style={[styles.catCardLabel, { color: TEXT }]}>{cat.label}</ThemedText>
      <ThemedText style={styles.catCardCount}>{count} skills</ThemedText>
    </Pressable>
  );
}

// ─── Popular skill card ───────────────────────────────────────────────────────
function PopularCard({ skill, onAdd }: { skill: PopularSkill; onAdd: () => void }) {
  const catEntry = CATEGORIES.find((c) => c.id === skill.category);
  const color    = catEntry?.color ?? Primary;

  return (
    <View style={styles.popCard}>
      <View style={[styles.popBand, { backgroundColor: color }]} />
      <View style={styles.popBody}>
        <View style={styles.popTop}>
          <View style={[styles.popXpPill, { backgroundColor: color + '20' }]}>
            <ThemedText style={[styles.popXpText, { color }]}>+{skill.xp} XP</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.popName} numberOfLines={2}>{skill.name}</ThemedText>
        <ThemedText style={styles.popSource}>{skill.source} · {skill.lessons} lessons</ThemedText>
        <Pressable style={[styles.popAddBtn, { backgroundColor: color }]} onPress={onAdd}>
          <SymbolView
            name={{ ios: 'plus', android: 'add', web: 'add' }}
            size={12}
            tintColor="#FFFFFF"
          />
          <ThemedText style={styles.popAddText}>Add</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ExploreScreen() {
  const [query, setQuery]         = useState('');
  const [showAddSheet, setShowAddSheet] = useState(false);

  const filtered = query.trim().length > 0
    ? POPULAR.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.category.toLowerCase().includes(query.toLowerCase()),
      )
    : null;

  // Skill counts per category from POPULAR mock
  const countMap: Record<string, number> = {};
  POPULAR.forEach((s) => { countMap[s.category] = (countMap[s.category] ?? 0) + 1; });

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.headerWrap} edges={['top']}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.pageTitle}>Explore</ThemedText>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={17}
            tintColor={MUTED}
          />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search skills…"
            placeholderTextColor={MUTED}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Search results */}
        {filtered ? (
          <>
            <ThemedText style={styles.sectionTitle}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </ThemedText>
            {filtered.length === 0 ? (
              <View style={styles.emptySearch}>
                <SymbolView
                  name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
                  size={28}
                  tintColor={MUTED}
                />
                <ThemedText style={styles.emptySearchText}>No skills found for "{query}"</ThemedText>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.popularRow}
              >
                {filtered.map((skill) => (
                  <PopularCard key={skill.id} skill={skill} onAdd={() => setShowAddSheet(true)} />
                ))}
              </ScrollView>
            )}
          </>
        ) : (
          <>
            {/* Category grid */}
            <ThemedText style={styles.sectionTitle}>Browse Categories</ThemedText>
            <View style={styles.catGrid}>
              {CATEGORIES.map((cat) => (
                <CategoryCard key={cat.id} cat={cat} count={countMap[cat.id] ?? 0} />
              ))}
            </View>

            {/* Popular skills */}
            <View style={styles.sectionRow}>
              <ThemedText style={styles.sectionTitle}>Popular to Learn</ThemedText>
              <View style={styles.accentDot} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularRow}
            >
              {POPULAR.map((skill) => (
                <PopularCard key={skill.id} skill={skill} onAdd={() => setShowAddSheet(true)} />
              ))}
            </ScrollView>

            {/* Add custom skill CTA */}
            <Pressable style={styles.ctaCard} onPress={() => setShowAddSheet(true)}>
              <View style={styles.ctaIcon}>
                <SymbolView
                  name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }}
                  size={26}
                  tintColor={Primary}
                />
              </View>
              <View style={styles.ctaText}>
                <ThemedText style={styles.ctaTitle}>Track your own skill</ThemedText>
                <ThemedText style={styles.ctaSub}>Add anything you're learning</ThemedText>
              </View>
              <SymbolView
                name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                size={15}
                tintColor={MUTED}
              />
            </Pressable>
          </>
        )}
      </ScrollView>

      <AddSkillSheet visible={showAddSheet} onClose={() => setShowAddSheet(false)} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },

  headerWrap: {
    backgroundColor: BG,
    paddingHorizontal: Spacing.three,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  titleRow: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  pageTitle: { fontSize: 26, fontWeight: '700', color: TEXT, letterSpacing: -0.5 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: CARD,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: BORDER,
  },
  searchInput: { flex: 1, fontSize: 15, color: TEXT },

  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: 14,
  },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: TEXT, letterSpacing: -0.2 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  accentDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Accent },

  // Category grid
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  catCard: {
    width: '47.5%',
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  catIconWrap: {
    width: 44, height: 44,
    borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  catCardLabel: { fontSize: 14, fontWeight: '700' },
  catCardCount: { fontSize: 12, color: MUTED },

  // Popular row
  popularRow: {
    gap: 12,
    paddingRight: Spacing.three,
  },
  popCard: {
    width: 160,
    backgroundColor: CARD,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  popBand: { height: 5 },
  popBody: { padding: 14, gap: 6 },
  popTop: { flexDirection: 'row' },
  popXpPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  popXpText: { fontSize: 11, fontWeight: '700' },
  popName: { fontSize: 13, fontWeight: '700', color: TEXT, lineHeight: 18 },
  popSource: { fontSize: 11, color: MUTED },
  popAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  popAddText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },

  // Empty search
  emptySearch: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 32,
  },
  emptySearchText: { fontSize: 14, color: MUTED, textAlign: 'center' },

  // CTA card
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  ctaIcon: {
    width: 48, height: 48,
    borderRadius: 14,
    backgroundColor: Primary + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaText: { flex: 1, gap: 3 },
  ctaTitle: { fontSize: 14, fontWeight: '700', color: TEXT },
  ctaSub:   { fontSize: 12, color: MUTED },
});
