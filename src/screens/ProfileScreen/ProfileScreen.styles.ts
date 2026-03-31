import { StyleSheet } from 'react-native';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1, alignItems: 'center' },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingBottom: Spacing.two,
  },
  form: { gap: Spacing.three },
  sectionLabel: { marginBottom: Spacing.two },
  langRow: { flexDirection: 'row', gap: Spacing.two },
});
