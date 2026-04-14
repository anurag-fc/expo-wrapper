import React, { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSpeech } from '@/hooks/use-speech';
import { useQuestions, useSaveQuestion } from '@/queries/use-oracle';
import type { Question } from '@/services/oracle.service';
import { useOracleStore } from '@/store/oracle.store';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const BG      = '#F7F5F2';
const CARD    = '#FFFFFF';
const TEXT    = '#2F2F2F';
const MUTED   = '#9E9E9E';
const YES_COL = '#7FB98B';
const NO_COL  = '#8BA5B5';

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

// ─── QuestionCard ─────────────────────────────────────────────────────────────
function QuestionCard({ item }: { item: Question }) {
  const yes = item.answer === 'YES';
  return (
    <View style={styles.card}>
      <Text style={styles.cardQuestion} numberOfLines={2}>
        {item.question_text}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardTime}>{formatRelative(item.created_at)}</Text>
        <View style={[styles.badge, yes ? styles.yesBadge : styles.noBadge]}>
          <Text style={[styles.badgeText, yes ? styles.yesLabel : styles.noLabel]}>
            {item.answer}
          </Text>
        </View>
      </View>
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
  const { mutate: saveQuestion } = useSaveQuestion();

  // Oracle store — shares phase & mic handler with CustomTabBar
  const { setPhase, setMicPress } = useOracleStore();

  // Stable refs
  const oracleStateRef      = useRef<OracleState>('idle');
  const capturedTranscript  = useRef('');
  const timers              = useRef<ReturnType<typeof setTimeout>[]>([]);
  const latestGoToRevealing = useRef<() => void>(() => {});
  const latestGoToIdle      = useRef<() => void>(() => {});
  const latestHandleSilence = useRef<() => void>(() => {});

  // Keep ref in sync with state
  useEffect(() => {
    oracleStateRef.current = oracleState;
  }, [oracleState]);

  // Sync phase into store so CustomTabBar can animate the mic
  useEffect(() => {
    setPhase(oracleState);
  }, [oracleState, setPhase]);

  // ── Animation values (screen layers only — mic is in CustomTabBar) ──────────
  const listOp   = useSharedValue(1);
  const greetOp  = useSharedValue(1);
  const transOp  = useSharedValue(0);
  const holdOp   = useSharedValue(0);
  const ansOp    = useSharedValue(0);
  const ansScale = useSharedValue(0.88);
  const copyOp   = useSharedValue(0);

  const listStyle  = useAnimatedStyle(() => ({ opacity: listOp.value }));
  const greetStyle = useAnimatedStyle(() => ({ opacity: greetOp.value }));
  const transStyle = useAnimatedStyle(() => ({ opacity: transOp.value }));
  const holdStyle  = useAnimatedStyle(() => ({ opacity: holdOp.value }));
  const ansStyle   = useAnimatedStyle(() => ({
    opacity: ansOp.value,
    transform: [{ scale: ansScale.value }],
  }));
  const copyStyle = useAnimatedStyle(() => ({ opacity: copyOp.value }));

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  // ── State transitions ─────────────────────────────────────────────────────
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

    transOp.value  = withTiming(0, { duration: 250 });
    holdOp.value   = withTiming(0, { duration: 200 });
    ansOp.value    = withDelay(350, withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }));
    ansScale.value = withDelay(350, withSpring(1, { damping: 14, stiffness: 75 }));
    copyOp.value   = withDelay(1400, withTiming(1, { duration: 700 }));

    const t = setTimeout(() => latestGoToIdle.current(), 4200);
    timers.current.push(t);
  }

  function goToIdle() {
    clearTimers();
    setOracleState('idle');
    speech.reset();

    ansOp.value    = withTiming(0, { duration: 450 });
    copyOp.value   = withTiming(0, { duration: 300 });
    ansScale.value = 0.88;

    listOp.value  = withDelay(450, withTiming(1, { duration: 500 }));
    greetOp.value = withDelay(450, withTiming(1, { duration: 500 }));
  }

  // Keep latest refs fresh (avoids stale closures in timers/effects)
  latestGoToRevealing.current = goToRevealing;
  latestGoToIdle.current      = goToIdle;
  latestHandleSilence.current = () => {
    if (oracleStateRef.current !== 'listening') return;
    capturedTranscript.current = speech.transcript;
    speech.stopListening();
    goToProcessing();
  };

  // ── Mic press (registered into store so CustomTabBar can call it) ──────────
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

  // Keep the store's micPress pointing to the latest handleMicPress
  const latestMicPress = useRef<() => void>(() => {});
  latestMicPress.current = handleMicPress;
  useEffect(() => {
    setMicPress(() => latestMicPress.current());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep live transcript displayed
  useEffect(() => {
    if (speech.transcript) setShownTranscript(speech.transcript);
  }, [speech.transcript]);

  // Web: silence → auto-transition
  useEffect(() => {
    if (speech.isSilent) latestHandleSilence.current();
  }, [speech.isSilent]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimers();
      speech.reset();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Layout ────────────────────────────────────────────────────────────────
  const LIST_TOP     = insets.top + 12;
  // Bottom padding clears the tab bar pill (72px) + safe area
  const LIST_BOTTOM  = Math.max(insets.bottom, 16) + 72 + 24;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.screen}>

      {/* ── LAYER A: Past Questions (idle) ── */}
      <Animated.View
        style={[StyleSheet.absoluteFill, listStyle]}
        pointerEvents={oracleState === 'idle' ? 'auto' : 'none'}
      >
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <QuestionCard item={item} />}
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

      {/* ── LAYER C: YES / NO Reveal ── */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.layerCenter, ansStyle]}
        pointerEvents="none"
      >
        <View
          style={[
            styles.answerGlow,
            currentAnswer === 'YES'
              ? { backgroundColor: YES_COL + '18' }
              : { backgroundColor: NO_COL  + '18' },
          ]}
        />
        <Text
          style={[
            styles.answerText,
            currentAnswer === 'YES' ? { color: YES_COL } : { color: NO_COL },
          ]}
        >
          {currentAnswer}
        </Text>
        <Animated.View style={copyStyle}>
          <Text style={styles.microCopyText}>{microCopy}</Text>
        </Animated.View>
      </Animated.View>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  layerCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingBottom: 120,
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  greetingRow: {
    paddingTop: 8,
    paddingBottom: 6,
    gap: 4,
  },
  greetingText: {
    fontSize: 30,
    fontWeight: '300',
    color: TEXT,
    letterSpacing: -0.4,
  },
  greetingSubtext: {
    fontSize: 14,
    color: MUTED,
    fontWeight: '300',
  },

  // Question card
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  cardQuestion: {
    fontSize: 16,
    fontWeight: '400',
    color: TEXT,
    lineHeight: 23,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTime: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '300',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  yesBadge: { backgroundColor: YES_COL + '22' },
  noBadge:  { backgroundColor: NO_COL  + '22' },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  yesLabel: { color: YES_COL },
  noLabel:  { color: NO_COL  },

  // Empty
  emptyHint: {
    marginTop: 60,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  emptyHintText: {
    fontSize: 16,
    color: MUTED,
    fontWeight: '300',
    textAlign: 'center',
  },
  emptyHintSub: {
    fontSize: 13,
    color: MUTED + 'AA',
    fontWeight: '300',
    textAlign: 'center',
  },

  // Transcript
  transcriptText: {
    fontSize: 26,
    fontWeight: '300',
    color: TEXT,
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.2,
  },
  holdRow: {
    alignItems: 'center',
    marginTop: 28,
    gap: 14,
  },
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

  // Answer
  answerGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  answerText: {
    fontSize: 80,
    fontWeight: '200',
    letterSpacing: 10,
    textAlign: 'center',
  },
  microCopyText: {
    fontSize: 16,
    color: MUTED,
    fontWeight: '300',
    fontStyle: 'italic',
    marginTop: 20,
    textAlign: 'center',
  },
});
