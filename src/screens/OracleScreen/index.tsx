import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSpeech } from '@/hooks/use-speech';
import { useQuestions, useSaveQuestion } from '@/queries/use-oracle';
import type { Question } from '@/services/oracle.service';
import { useOracleStore } from '@/store/oracle.store';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const BG   = '#F7F5F2';
const TEXT = '#2F2F2F';
const MUTED   = '#9E9E9E';
const YES_COL = '#5EA870';   // richer sage green (readable + glowing)
const NO_COL  = '#6A92AA';   // richer blue-gray

// ─── Oracle State ─────────────────────────────────────────────────────────────
type OracleState = 'idle' | 'listening' | 'processing' | 'revealing';

const MICRO_COPIES = [
  'You already know.',
  'Trust your instinct.',
  'The answer was always there.',
  'Listen to what you feel.',
  'Let it settle.',
  'You asked — now you know.',
];

const HOLD_PHRASES = ['Hold on…', 'Take a breath…', 'Let it settle…'];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatRelative(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 2)   return 'just now';
  if (hours < 1)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Bento Grid ───────────────────────────────────────────────────────────────
type BentoRowData =
  | { id: string; type: 'full'; item: Question }
  | { id: string; type: 'duo'; left: Question; right: Question; leftFlex: number; rightFlex: number };

// Cycles through a layout pattern to create visual rhythm
const BENTO_PATTERNS: Array<{ type: 'full' } | { type: 'duo'; lf: number; rf: number }> = [
  { type: 'duo', lf: 5, rf: 3 },  // wide | narrow
  { type: 'full' },                 // hero
  { type: 'duo', lf: 1, rf: 1 },  // equal halves
  { type: 'duo', lf: 3, rf: 5 },  // narrow | wide
  { type: 'full' },                 // hero
];

function groupBento(items: Question[]): BentoRowData[] {
  const rows: BentoRowData[] = [];
  let i = 0;
  let p = 0;
  while (i < items.length) {
    const pat = BENTO_PATTERNS[p % BENTO_PATTERNS.length];
    const remaining = items.length - i;
    if (pat.type === 'full' || remaining === 1) {
      rows.push({ id: items[i].id, type: 'full', item: items[i] });
      i += 1;
    } else {
      rows.push({ id: items[i].id, type: 'duo', left: items[i], right: items[i + 1], leftFlex: pat.lf, rightFlex: pat.rf });
      i += 2;
    }
    p++;
  }
  return rows;
}

function BentoCard({ item, flex }: { item: Question; flex?: number }) {
  const yes = item.answer === 'YES';
  const col = yes ? YES_COL : NO_COL;
  return (
    <View style={[styles.bentoCard, { flex: flex ?? 1, backgroundColor: col + '13' }]}>
      {/* Question */}
      <Text style={styles.bentoQ} numberOfLines={4}>{item.question_text}</Text>
      {/* Answer + time */}
      <View style={styles.bentoFoot}>
        <Text style={[styles.bentoAns, { color: col }]}>{item.answer}</Text>
        <Text style={styles.bentoTime}>{formatRelative(item.created_at)}</Text>
      </View>
    </View>
  );
}

function BentoRowItem({ row }: { row: BentoRowData }) {
  if (row.type === 'full') {
    return (
      <View style={styles.bentoFullRow}>
        <BentoCard item={row.item} />
      </View>
    );
  }
  return (
    <View style={styles.bentoDuoRow}>
      <BentoCard item={row.left}  flex={row.leftFlex} />
      <BentoCard item={row.right} flex={row.rightFlex} />
    </View>
  );
}

function EmptyHint() {
  return (
    <View style={styles.emptyHint}>
      <Text style={styles.emptyHintText}>Your questions will appear here.</Text>
      <Text style={styles.emptyHintSub}>Tap the circle below to begin.</Text>
    </View>
  );
}

// ─── OracleScreen ─────────────────────────────────────────────────────────────
export default function OracleScreen() {
  const insets = useSafeAreaInsets();

  const [oracleState, setOracleState]         = useState<OracleState>('idle');
  const [currentAnswer, setCurrentAnswer]     = useState<'YES' | 'NO'>('YES');
  const [microCopy, setMicroCopy]             = useState('');
  const [holdPhrase, setHoldPhrase]           = useState('Hold on…');
  const [shownTranscript, setShownTranscript] = useState('');

  const speech                   = useSpeech();
  const { data: questions = [] } = useQuestions();
  const bentoRows = useMemo(() => groupBento(questions), [questions]);
  const { mutate: saveQuestion } = useSaveQuestion();
  const { setPhase, setMicPress, pendingMicPress, setPendingMicPress } = useOracleStore();

  const oracleStateRef      = useRef<OracleState>('idle');
  const capturedTranscript  = useRef('');
  const timers              = useRef<ReturnType<typeof setTimeout>[]>([]);
  const latestGoToRevealing = useRef<() => void>(() => {});
  const latestGoToIdle      = useRef<() => void>(() => {});
  const latestHandleSilence = useRef<() => void>(() => {});

  useEffect(() => { oracleStateRef.current = oracleState; }, [oracleState]);
  useEffect(() => { setPhase(oracleState); }, [oracleState, setPhase]);

  // Consume a pending mic press triggered from another tab.
  // Start immediately — navigation and oracle flow run in parallel.
  useEffect(() => {
    if (!pendingMicPress) return;
    setPendingMicPress(false);
    if (oracleStateRef.current === 'idle') goToListening();
  }, [pendingMicPress]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Animation values ──────────────────────────────────────────────────────
  const listOp   = useSharedValue(1);
  const greetOp  = useSharedValue(1);
  const transOp  = useSharedValue(0);
  const holdOp   = useSharedValue(0);
  const ansOp    = useSharedValue(0);
  const ansScale = useSharedValue(0.82);
  const copyOp   = useSharedValue(0);

  // Reveal-specific: ring ripples + ornament
  const ring1Scale = useSharedValue(0.6);
  const ring1Op    = useSharedValue(0);
  const ring2Scale = useSharedValue(0.6);
  const ring2Op    = useSharedValue(0);
  const ring3Scale = useSharedValue(0.6);
  const ring3Op    = useSharedValue(0);
  const ornOp      = useSharedValue(0);   // ornament (——•——)

  // ── Animated styles ───────────────────────────────────────────────────────
  const listStyle  = useAnimatedStyle(() => ({ opacity: listOp.value }));
  const greetStyle = useAnimatedStyle(() => ({ opacity: greetOp.value }));
  const transStyle = useAnimatedStyle(() => ({ opacity: transOp.value }));
  const holdStyle  = useAnimatedStyle(() => ({ opacity: holdOp.value }));
  const ansStyle   = useAnimatedStyle(() => ({
    opacity: ansOp.value,
    transform: [{ scale: ansScale.value }],
  }));
  const copyStyle  = useAnimatedStyle(() => ({ opacity: copyOp.value }));
  const ornStyle   = useAnimatedStyle(() => ({ opacity: ornOp.value }));

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Op.value,
  }));
  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Op.value,
  }));
  const ring3Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring3Scale.value }],
    opacity: ring3Op.value,
  }));

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  // ── Transitions ───────────────────────────────────────────────────────────
  function goToListening() {
    setOracleState('listening');
    setShownTranscript('');
    capturedTranscript.current = '';
    speech.startListening();

    listOp.value  = withTiming(0, { duration: 350, easing: Easing.inOut(Easing.ease) });
    greetOp.value = withTiming(0, { duration: 250 });
    transOp.value = withDelay(300, withTiming(1, { duration: 450 }));
  }

  function goToProcessing() {
    clearTimers();
    setOracleState('processing');
    setHoldPhrase(HOLD_PHRASES[Math.floor(Math.random() * HOLD_PHRASES.length)]);
    holdOp.value = withDelay(500, withTiming(1, { duration: 600 }));
    const t = setTimeout(() => latestGoToRevealing.current(), 1600);
    timers.current.push(t);
  }

  function goToRevealing() {
    const answer: 'YES' | 'NO' = Math.random() < 0.5 ? 'YES' : 'NO';
    const copy = MICRO_COPIES[Math.floor(Math.random() * MICRO_COPIES.length)];

    setCurrentAnswer(answer);
    setMicroCopy(copy);
    setOracleState('revealing');

    const q = capturedTranscript.current.trim();
    if (q) saveQuestion({ question: q, answer });

    // Fade out transcript / hold phrase
    transOp.value = withTiming(0, { duration: 250 });
    holdOp.value  = withTiming(0, { duration: 200 });

    // Main answer reveal — spring in with scale
    ansOp.value    = withDelay(300, withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }));
    ansScale.value = withDelay(300, withSpring(1, { damping: 12, stiffness: 60 }));

    // ── Ring ripples (staggered, expand & fade) ──
    ring1Scale.value = 0.6;
    ring1Op.value    = 0;
    ring1Scale.value = withDelay(300, withTiming(2.6, { duration: 1800, easing: Easing.out(Easing.ease) }));
    ring1Op.value    = withDelay(300, withSequence(
      withTiming(0.55, { duration: 300 }),
      withTiming(0,    { duration: 1300 }),
    ));

    ring2Scale.value = 0.6;
    ring2Op.value    = 0;
    ring2Scale.value = withDelay(550, withTiming(3.2, { duration: 2200, easing: Easing.out(Easing.ease) }));
    ring2Op.value    = withDelay(550, withSequence(
      withTiming(0.35, { duration: 300 }),
      withTiming(0,    { duration: 1700 }),
    ));

    ring3Scale.value = 0.6;
    ring3Op.value    = 0;
    ring3Scale.value = withDelay(820, withTiming(4.0, { duration: 2600, easing: Easing.out(Easing.ease) }));
    ring3Op.value    = withDelay(820, withSequence(
      withTiming(0.20, { duration: 300 }),
      withTiming(0,    { duration: 2000 }),
    ));

    // Ornament + micro-copy
    ornOp.value  = withDelay(1200, withTiming(1, { duration: 600 }));
    copyOp.value = withDelay(1500, withTiming(1, { duration: 700 }));

    const t = setTimeout(() => latestGoToIdle.current(), 5000);
    timers.current.push(t);
  }

  function goToIdle() {
    clearTimers();
    setOracleState('idle');
    speech.reset();

    ansOp.value    = withTiming(0, { duration: 500 });
    copyOp.value   = withTiming(0, { duration: 300 });
    ornOp.value    = withTiming(0, { duration: 300 });
    ansScale.value = 0.82;
    ring1Op.value  = 0;
    ring2Op.value  = 0;
    ring3Op.value  = 0;

    listOp.value  = withDelay(500, withTiming(1, { duration: 500 }));
    greetOp.value = withDelay(500, withTiming(1, { duration: 500 }));
  }

  latestGoToRevealing.current = goToRevealing;
  latestGoToIdle.current      = goToIdle;
  latestHandleSilence.current = () => {
    if (oracleStateRef.current !== 'listening') return;
    capturedTranscript.current = speech.transcript;
    speech.stopListening();
    goToProcessing();
  };

  function handleMicPress() {
    const st = oracleStateRef.current;
    if (st === 'idle') {
      goToListening();
    } else if (st === 'listening') {
      capturedTranscript.current = shownTranscript;
      speech.stopListening();
      goToProcessing();
    }
  }

  const latestMicPress = useRef<() => void>(() => {});
  latestMicPress.current = handleMicPress;
  useEffect(() => {
    setMicPress(() => latestMicPress.current());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (speech.transcript) setShownTranscript(speech.transcript);
  }, [speech.transcript]);

  useEffect(() => {
    if (speech.isSilent) latestHandleSilence.current();
  }, [speech.isSilent]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { clearTimers(); speech.reset(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const LIST_TOP    = insets.top + 12;
  const LIST_BOTTOM = Math.max(insets.bottom, 16) + 72 + 24;
  const col = currentAnswer === 'YES' ? YES_COL : NO_COL;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.screen}>

      {/* ── LAYER A: Past Questions ── */}
      <Animated.View
        style={[StyleSheet.absoluteFill, listStyle]}
        pointerEvents={oracleState === 'idle' ? 'auto' : 'none'}
      >
        <FlatList
          data={bentoRows}
          keyExtractor={(row) => row.id}
          renderItem={({ item: row }) => <BentoRowItem row={row} />}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: LIST_TOP, paddingBottom: LIST_BOTTOM },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Animated.View style={[styles.greetingRow, greetStyle]}>
              <Text style={styles.greetingText}>{getGreeting()}</Text>
              <Text style={styles.greetingSubtext}>What's on your mind?</Text>
            </Animated.View>
          }
          ListEmptyComponent={<EmptyHint />}
        />
      </Animated.View>

      {/* ── LAYER B: Transcript + Hold phrase ── */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.layerCenter, transStyle]}
        pointerEvents="none"
      >
        <Text style={styles.transcriptText}>
          {shownTranscript || (oracleState === 'listening' ? 'Speak your question…' : '')}
        </Text>
        <Animated.View style={[styles.holdRow, holdStyle]}>
          <View style={styles.holdLine} />
          <Text style={styles.holdText}>{holdPhrase}</Text>
        </Animated.View>
      </Animated.View>

      {/* ── LAYER C: Answer Reveal ── */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.layerCenter, ansStyle]}
        pointerEvents="none"
      >
        {/* ── Ripple rings (expand outward from center) ── */}
        <Animated.View style={[styles.ring, { borderColor: col + 'AA' }, ring1Style]} />
        <Animated.View style={[styles.ring, { borderColor: col + '77' }, ring2Style]} />
        <Animated.View style={[styles.ring, { borderColor: col + '44' }, ring3Style]} />

        {/* ── Layered glow orbs ── */}
        <View style={[styles.glowOrbLg, { backgroundColor: col + '0A' }]} />
        <View style={[styles.glowOrbMd, { backgroundColor: col + '12' }]} />
        <View style={[styles.glowOrbSm, { backgroundColor: col + '1E' }]} />

        {/* ── Answer word ── */}
        <Text
          style={[
            styles.answerText,
            {
              color: col,
              textShadowColor: col + 'AA',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 28,
            },
          ]}
        >
          {currentAnswer}
        </Text>

        {/* ── Ornament ——•—— ── */}
        <Animated.View style={[styles.ornament, ornStyle]}>
          <View style={[styles.ornLine, { backgroundColor: col + '55' }]} />
          <View style={[styles.ornDot, { backgroundColor: col }]} />
          <View style={[styles.ornLine, { backgroundColor: col + '55' }]} />
        </Animated.View>

        {/* ── Micro-copy ── */}
        <Animated.View style={copyStyle}>
          <Text style={styles.microCopyText}>{microCopy}</Text>
        </Animated.View>
      </Animated.View>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const RING_BASE = 160;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },

  layerCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingBottom: 120,
  },

  // ── List ───────────────────────────────────────────────────────────────────
  listContent: { paddingHorizontal: 20, gap: 12 },
  greetingRow: { paddingTop: 8, paddingBottom: 6, gap: 4 },
  greetingText: {
    fontSize: 30,
    fontWeight: '300',
    color: TEXT,
    letterSpacing: -0.4,
  },
  greetingSubtext: { fontSize: 14, fontWeight: '300', color: MUTED },

  // ── Bento grid ─────────────────────────────────────────────────────────────
  bentoFullRow: {
    flexDirection: 'row',     // single card fills full width
  },
  bentoDuoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bentoCard: {
    borderRadius: 20,
    padding: 14,
    minHeight: 130,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  bentoQ: {
    fontSize: 13,
    fontWeight: '400',
    color: TEXT,
    lineHeight: 19,
  },
  bentoFoot: {
    marginTop: 14,
    gap: 2,
  },
  bentoAns: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 2,
  },
  bentoTime: {
    fontSize: 11,
    color: MUTED,
    fontWeight: '300',
  },

  // ── Empty ──────────────────────────────────────────────────────────────────
  emptyHint:     { marginTop: 60, alignItems: 'center', gap: 8, paddingHorizontal: 20 },
  emptyHintText: { fontSize: 16, color: MUTED, fontWeight: '300', textAlign: 'center' },
  emptyHintSub:  { fontSize: 13, color: MUTED + 'AA', fontWeight: '300', textAlign: 'center' },

  // ── Transcript ─────────────────────────────────────────────────────────────
  transcriptText: {
    fontSize: 26,
    fontWeight: '300',
    color: TEXT,
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.2,
  },
  holdRow: { alignItems: 'center', marginTop: 28, gap: 14 },
  holdLine: {
    width: 36,
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: MUTED,
    opacity: 0.5,
  },
  holdText: {
    fontSize: 15,
    color: MUTED,
    fontWeight: '300',
    fontStyle: 'italic',
  },

  // ── Answer reveal ──────────────────────────────────────────────────────────

  // Ripple rings — border-only circles, same base size, scaled outward
  ring: {
    position: 'absolute',
    width: RING_BASE,
    height: RING_BASE,
    borderRadius: RING_BASE / 2,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },

  // Layered ambient glow orbs
  glowOrbLg: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  glowOrbMd: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
  },
  glowOrbSm: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  // Answer text
  answerText: {
    fontSize: 92,
    fontWeight: '200',
    letterSpacing: 14,
    textAlign: 'center',
  },

  // Ornament ——•——
  ornament: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
    marginBottom: 14,
  },
  ornLine: {
    width: 44,
    height: 1,
  },
  ornDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  // Micro-copy
  microCopyText: {
    fontSize: 16,
    color: MUTED,
    fontWeight: '300',
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
