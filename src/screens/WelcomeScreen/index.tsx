import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const BG   = '#F7F5F2';
const INK  = '#2F2F2F';
const SAGE = '#A3B18A';
const MUTE = '#ABABAB';

const SIZE = 48; // single font size throughout

// ─── WelcomeScreen ────────────────────────────────────────────────────────────
export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={s.screen}>

      {/* Only decoration — top-right corner shape */}
      <View style={s.cornerShape} />

      <SafeAreaView style={s.safe}>
        <View style={s.container}>

          {/* ── Label ── */}
          <View style={s.topRow}>
            <View style={s.pill}>
              <Text style={s.pillText}>CHOICE</Text>
            </View>
          </View>

          {/* ── Type flow — one size, weight only ── */}
          <View style={s.flow}>

            <Text style={[s.t, s.heavy]}>TRUST.</Text>
            <Text style={[s.t, s.thin,  { color: MUTE }]}>YOUR INNER</Text>
            <Text style={[s.t, s.heavy, { color: SAGE }]}>VOICE.</Text>

            <View style={s.gap} />

            <Text style={[s.t, s.thin]}>KNOW WHAT</Text>
            <Text style={[s.t, s.heavy]}>YOU FEEL.</Text>

            <View style={s.gap} />

            <Text style={[s.t, s.heavy]}>DECIDE.</Text>
            <Text style={[s.t, s.thin,  { color: MUTE }]}>BREATHE.</Text>

          </View>

          {/* ── Tagline ── */}
          <Text style={s.tagline}>
            A calm space to hear your own answer.
          </Text>

          {/* ── CTA ── */}
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            style={({ pressed }) => [s.cta, pressed && { opacity: 0.7 }]}
          >
            <Text style={s.ctaText}>Get Started  →</Text>
          </Pressable>

        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  safe:   { flex: 1 },

  // Single top-right shape
  cornerShape: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: SAGE + '22',
    top: -44,
    right: -36,
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },

  // Top label
  topRow: { alignItems: 'flex-start', marginBottom: 4 },
  pill: {
    borderWidth: 1,
    borderColor: INK + '25',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 3,
    color: MUTE,
  },

  // Type flow
  flow: {
    flex: 1,
    justifyContent: 'center',
  },
  t: {
    fontSize: SIZE,
    lineHeight: SIZE * 1.18,
    color: INK,
  },
  heavy: { fontWeight: '900' },
  thin:  { fontWeight: '200' },
  gap:   { height: SIZE * 0.6 },

  // Tagline
  tagline: {
    fontSize: 13,
    fontWeight: '300',
    color: MUTE,
    lineHeight: 20,
    marginBottom: 16,
  },

  // CTA
  cta: {
    backgroundColor: INK,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 4,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
