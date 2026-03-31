import { StyleSheet } from 'react-native';

import { MaxContentWidth, Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1, alignItems: 'center' },
  flex: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.four,
  },
  form: { gap: Spacing.three, alignSelf: 'stretch' },
  centerText: { textAlign: 'center' },
  confirmation: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.five,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
});
