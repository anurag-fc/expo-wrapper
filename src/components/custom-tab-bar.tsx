import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOracleStore } from '@/store/oracle.store';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const TAB_BG     = '#2C2C2E';
const TAB_ACTIVE = '#A3B18A';   // sage green
const MIC_COLOR  = '#A3B18A';
const CARD       = '#FFFFFF';
const TEXT_DARK  = '#2F2F2F';

const INACTIVE   = 'rgba(255,255,255,0.58)'; // ← brighter inactive

// ─── Sizing ───────────────────────────────────────────────────────────────────
const BUBBLE   = 56;                       // tab icon bubble
const PILL_PAD = 8;                        // pill padding (vertical + horizontal)
const PILL_H   = BUBBLE + PILL_PAD * 2;   // 72 — pill height
const MIC      = PILL_H;                  // 72 — mic matches pill exactly
const GAP      = 10;                      // gap between pill and mic

// When mic hides, the pill needs to shift right by half the (gap+mic) space
// to appear visually centred on screen.
const PILL_SHIFT = (GAP + MIC) / 2;       // 41 px

type IconName = SymbolViewProps['name'];

const TAB_ICONS: Record<string, IconName> = {
  index:   { ios: 'sparkles',      android: 'auto_awesome', web: 'auto_awesome' },
  profile: { ios: 'person.circle', android: 'person',       web: 'person'       },
};

// ─── Mic Button ──────────────────────────────────────────────────────────────
function MicButton({ isActive, onPress }: { isActive: boolean; onPress: () => void }) {
  const ring1    = useSharedValue(1);
  const ring2    = useSharedValue(1);
  const btnScale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      ring1.value = withRepeat(withSequence(
        withTiming(1.5,  { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0,  { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ), -1, false);
      ring2.value = withRepeat(
        withDelay(450, withSequence(
          withTiming(1.9, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        )), -1, false,
      );
      btnScale.value = withTiming(1.06, { duration: 300 });
    } else {
      cancelAnimation(ring1);
      cancelAnimation(ring2);
      ring1.value    = withTiming(1, { duration: 400 });
      ring2.value    = withTiming(1, { duration: 400 });
      btnScale.value = withTiming(1, { duration: 300 });
    }
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  const r1Style  = useAnimatedStyle(() => ({
    transform: [{ scale: ring1.value }],
    opacity: Math.max(0, (2 - ring1.value) * 0.22),
  }));
  const r2Style  = useAnimatedStyle(() => ({
    transform: [{ scale: ring2.value }],
    opacity: Math.max(0, (2 - ring2.value) * 0.13),
  }));
  const bStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  return (
    <View style={styles.micWrapper}>
      <Animated.View style={[styles.pulseRing, r2Style]} />
      <Animated.View style={[styles.pulseRing, r1Style]} />
      <Animated.View style={bStyle}>
        <Pressable
          onPress={onPress}
          style={[styles.micBtn, isActive && styles.micBtnActive]}
          android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: true, radius: MIC / 2 }}
        >
          <SymbolView
            name={
              isActive
                ? { ios: 'stop.fill', android: 'stop', web: 'stop' }
                : { ios: 'mic.fill',  android: 'mic',  web: 'mic'  }
            }
            size={24}
            tintColor={isActive ? '#FFFFFF' : TEXT_DARK}
          />
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ─── CustomTabBar ─────────────────────────────────────────────────────────────
export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { phase, micPress } = useOracleStore();

  const isListening    = phase === 'listening';
  const micInteractive = phase === 'idle' || phase === 'listening';

  // ── Animation: pill slides to centre when mic hides, back when it shows ────
  const pillX  = useSharedValue(0);   // translateX on the pill
  const micOp  = useSharedValue(1);   // opacity  of the mic
  const micSc  = useSharedValue(1);   // scale    of the mic

  useEffect(() => {
    if (micInteractive) {
      // 1. Pill slides back to its natural position
      pillX.value = withTiming(0, { duration: 350, easing: Easing.inOut(Easing.ease) });
      // 2. Mic fades + scales in after pill has started moving
      micOp.value = withDelay(180, withTiming(1, { duration: 260 }));
      micSc.value = withDelay(180, withSpring(1, { damping: 14, stiffness: 90 }));
    } else {
      // 1. Mic fades + scales out
      micOp.value = withTiming(0, { duration: 200 });
      micSc.value = withTiming(0.82, { duration: 200 });
      // 2. Pill slides to centre after mic has vanished
      pillX.value = withDelay(160, withTiming(PILL_SHIFT, {
        duration: 340,
        easing: Easing.inOut(Easing.ease),
      }));
    }
  }, [micInteractive]); // eslint-disable-line react-hooks/exhaustive-deps

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
  }));
  const micStyle = useAnimatedStyle(() => ({
    opacity: micOp.value,
    transform: [{ scale: micSc.value }],
  }));

  // ── Route helpers ─────────────────────────────────────────────────────────
  const oracleRoute  = state.routes.find(r => r.name === 'index');
  const profileRoute = state.routes.find(r => r.name === 'profile');
  const oracleIdx    = state.routes.findIndex(r => r.name === 'index');
  const profileIdx   = state.routes.findIndex(r => r.name === 'profile');

  function makeOnPress(route: (typeof state.routes)[0]) {
    return () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (state.routes.indexOf(route) !== state.index && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params as never);
      }
    };
  }

  return (
    <View
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 16) }]}
      pointerEvents="box-none"
    >
      {/* Row: [pill] ── gap ── [mic] */}
      <View style={styles.row}>

        {/* Pill — translateX centres it when mic is hidden */}
        <Animated.View style={pillStyle}>
          <View style={styles.bar}>
            {oracleRoute && (
              <Pressable
                onPress={makeOnPress(oracleRoute)}
                style={styles.tab}
                accessibilityRole="button"
                accessibilityState={state.index === oracleIdx ? { selected: true } : {}}
              >
                <View style={[styles.bubble, state.index === oracleIdx && styles.bubbleActive]}>
                  <SymbolView
                    name={TAB_ICONS.index}
                    size={22}
                    tintColor={state.index === oracleIdx ? '#FFFFFF' : INACTIVE}
                  />
                </View>
              </Pressable>
            )}
            {profileRoute && (
              <Pressable
                onPress={makeOnPress(profileRoute)}
                style={styles.tab}
                accessibilityRole="button"
                accessibilityState={state.index === profileIdx ? { selected: true } : {}}
              >
                <View style={[styles.bubble, state.index === profileIdx && styles.bubbleActive]}>
                  <SymbolView
                    name={TAB_ICONS.profile}
                    size={22}
                    tintColor={state.index === profileIdx ? '#FFFFFF' : INACTIVE}
                  />
                </View>
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Static gap */}
        <View style={styles.gap} />

        {/* Mic — fades + scales in/out */}
        <Animated.View
          style={micStyle}
          pointerEvents={micInteractive ? 'auto' : 'none'}
        >
          <MicButton isActive={isListening} onPress={micPress} />
        </Animated.View>

      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Pill
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TAB_BG,
    borderRadius: 40,
    paddingVertical: PILL_PAD,
    paddingHorizontal: PILL_PAD,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 14,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    width: BUBBLE,
    height: BUBBLE,
    borderRadius: BUBBLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleActive: {
    backgroundColor: TAB_ACTIVE,
  },

  // Gap
  gap: {
    width: GAP,
  },

  // Mic
  micWrapper: {
    width: MIC,
    height: MIC,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: MIC,
    height: MIC,
    borderRadius: MIC / 2,
    backgroundColor: MIC_COLOR,
  },
  micBtn: {
    width: MIC,
    height: MIC,
    borderRadius: MIC / 2,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
  },
  micBtnActive: {
    backgroundColor: MIC_COLOR,
  },
});
