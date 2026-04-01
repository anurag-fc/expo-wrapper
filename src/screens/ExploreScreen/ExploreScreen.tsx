import React, { useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useNotificationStore } from '@/store/notification.store';

// ─── Design tokens ────────────────────────────────────────────────────────────
const CREAM = '#FAF8F3';
const CARD_BG = '#FFFFFF';
const CHIP_BG = '#EFEDE8';
const TEXT = '#1A1A1A';
const TEXT_SECONDARY = '#6B6868';
const ACCENT = '#F5C533';
const DARK = '#1C1C1E';

// ─── Mock data ────────────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Apartment', 'House', 'Condo', 'Villa', 'Cabin'];

type Listing = {
  id: string;
  imageColor: string;
  patternColor: string;
  userInitials: string;
  userBg: string;
  dates: string;
  location: string;
  swapFor: string[];
};

const LISTINGS: Listing[] = [
  {
    id: '1',
    imageColor: '#8BA3C4',
    patternColor: '#7A92B3',
    userInitials: 'MR',
    userBg: '#D4956A',
    dates: 'Nov 25 – Dec 5',
    location: 'Mexico City, CDMX, Mexico',
    swapFor: ['Quepos, Costa Rica', 'Paris, France', 'San Miguel...'],
  },
  {
    id: '2',
    imageColor: '#7BA89A',
    patternColor: '#6A9789',
    userInitials: 'SL',
    userBg: '#A8705B',
    dates: 'Dec 10 – Dec 20',
    location: 'Barcelona, Catalonia, Spain',
    swapFor: ['New York, USA', 'Tokyo, Japan', 'Sydney, AU'],
  },
  {
    id: '3',
    imageColor: '#C4A882',
    patternColor: '#B39771',
    userInitials: 'JK',
    userBg: '#6B8E9F',
    dates: 'Jan 3 – Jan 14',
    location: 'Lisbon, Portugal',
    swapFor: ['Berlin, Germany', 'Amsterdam, NL', 'Rome, Italy'],
  },
  {
    id: '4',
    imageColor: '#9B8EA8',
    patternColor: '#8A7D97',
    userInitials: 'AW',
    userBg: '#C4956A',
    dates: 'Feb 1 – Feb 12',
    location: 'Bali, Indonesia',
    swapFor: ['London, UK', 'Melbourne, AU', 'Cape Town, ZA'],
  },
  {
    id: '5',
    imageColor: '#B0A4C0',
    patternColor: '#9F93AF',
    userInitials: 'PD',
    userBg: '#7A9E6B',
    dates: 'Mar 5 – Mar 18',
    location: 'Kyoto, Japan',
    swapFor: ['Buenos Aires, AR', 'Istanbul, TR', 'Prague, CZ'],
  },
];

// ─── Card ─────────────────────────────────────────────────────────────────────
function ListingCard({ item }: { item: Listing }) {
  return (
    <Pressable style={styles.card}>
      {/* ── Image area ── */}
      <View style={[styles.cardImage, { backgroundColor: item.imageColor }]}>
        {/* Decorative pattern */}
        <View style={[styles.patCircle, styles.patCircle1, { backgroundColor: item.patternColor }]} />
        <View style={[styles.patCircle, styles.patCircle2, { backgroundColor: item.patternColor }]} />
        <View style={[styles.patRect, { backgroundColor: item.patternColor }]} />

        {/* Bookmark */}
        <Pressable style={styles.bookmarkBtn} hitSlop={8}>
          <SymbolView
            name={{ ios: 'bookmark', android: 'bookmark_border', web: 'bookmark_border' }}
            size={16}
            tintColor="#FFFFFF"
          />
        </Pressable>
      </View>

      {/* User avatar — positioned over image/body boundary, sibling to both */}
      <View style={styles.avatarRing}>
        <View style={[styles.avatar, { backgroundColor: item.userBg }]}>
          <ThemedText style={styles.avatarInitials}>{item.userInitials}</ThemedText>
        </View>
      </View>

      {/* ── Body ── */}
      <View style={styles.cardBody}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <SymbolView
              name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }}
              size={13}
              tintColor={TEXT_SECONDARY}
            />
            <ThemedText style={styles.metaText}>{item.dates}</ThemedText>
          </View>
          <View style={styles.metaItem}>
            <SymbolView
              name={{ ios: 'location', android: 'location_on', web: 'location_on' }}
              size={13}
              tintColor={TEXT_SECONDARY}
            />
            <ThemedText style={styles.metaText} numberOfLines={1}>{item.location}</ThemedText>
          </View>
        </View>

        <View style={styles.swapSection}>
          <ThemedText style={styles.swapLabel}>Swap for</ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {item.swapFor.map((dest, i) => (
              <View key={i} style={styles.chip}>
                <ThemedText style={styles.chipText}>{dest}</ThemedText>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ExploreScreen() {
  const [activeCategory, setActiveCategory] = useState('All');
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const renderItem: ListRenderItem<Listing> = ({ item }) => <ListingCard item={item} />;

  return (
    <View style={styles.screen}>
      {/* ── Sticky header ── */}
      <SafeAreaView style={styles.headerWrap} edges={['top']}>
        {/* Title row */}
        <View style={styles.headerRow}>
          <Pressable style={styles.roundBtn}>
            <SymbolView
              name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              size={20}
              tintColor={TEXT}
            />
          </Pressable>

          <ThemedText style={styles.headerTitle}>Explore</ThemedText>

          <Pressable style={styles.roundBtn}>
            <SymbolView
              name={{ ios: 'bell', android: 'notifications_none', web: 'notifications_none' }}
              size={20}
              tintColor={TEXT}
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>{unreadCount}</ThemedText>
              </View>
            )}
          </Pressable>
        </View>

        {/* Filter row */}
        <View style={styles.filterRow}>
          <Pressable style={styles.filterPill}>
            <SymbolView
              name={{ ios: 'building.2', android: 'apartment', web: 'apartment' }}
              size={14}
              tintColor="#FFFFFF"
            />
            <ThemedText style={styles.filterPillText}>Apartment</ThemedText>
            <SymbolView
              name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
              size={12}
              tintColor="rgba(255,255,255,0.7)"
            />
          </Pressable>

          <View style={styles.filterActions}>
            <Pressable style={styles.roundBtn}>
              <SymbolView
                name={{ ios: 'square.on.square', android: 'grid_view', web: 'grid_view' }}
                size={17}
                tintColor={TEXT}
              />
            </Pressable>
            <Pressable style={styles.roundBtn}>
              <SymbolView
                name={{ ios: 'map', android: 'map', web: 'map' }}
                size={17}
                tintColor={TEXT}
              />
            </Pressable>
          </View>
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
          style={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <ThemedText
                style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}
              >
                {cat}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* ── Listings ── */}
      <FlatList
        data={LISTINGS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: BottomTabInset + Spacing.three },
        ]}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: CREAM },

  // Header
  headerWrap: {
    backgroundColor: CREAM,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E2DA',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    marginBottom: Spacing.two,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
    letterSpacing: -0.3,
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: TEXT },

  // Filter
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: DARK,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  filterPillText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  filterActions: { flexDirection: 'row', gap: Spacing.two },

  // Categories
  categoriesScroll: { marginBottom: Spacing.one },
  categoriesContent: { gap: Spacing.two, paddingRight: Spacing.three },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: CHIP_BG,
  },
  catChipActive: { backgroundColor: DARK },
  catChipText: { fontSize: 13, fontWeight: '500', color: TEXT_SECONDARY },
  catChipTextActive: { color: '#FFFFFF' },

  // List
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },

  // Card
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardImage: {
    height: 210,
  },
  patCircle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.5,
  },
  patCircle1: { width: 150, height: 150, top: -40, right: -20 },
  patCircle2: { width: 90, height: 90, bottom: 20, left: 20, opacity: 0.3 },
  patRect: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 14,
    top: 30,
    left: '45%',
    opacity: 0.25,
    transform: [{ rotate: '25deg' }],
  },
  bookmarkBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    position: 'absolute',
    top: 185,  // imageHeight(210) - avatarHeight(50)/2 + borderWidth(3)/2 ≈ 185
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  cardBody: {
    paddingTop: 28,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  metaRow: { gap: 5 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 13, color: TEXT_SECONDARY, flex: 1 },

  swapSection: { gap: 6 },
  swapLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  chipsRow: { gap: Spacing.two },
  chip: {
    backgroundColor: CHIP_BG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  chipText: { fontSize: 12, fontWeight: '500', color: TEXT },
});
