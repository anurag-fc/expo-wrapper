import { SymbolView } from 'expo-symbols';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CATEGORIES } from '@/constants/skills';
import { Primary, Spacing } from '@/constants/theme';
import { useAddSkill } from '@/queries/use-skills';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const BG     = '#FAF8F3';
const CARD   = '#FFFFFF';
const TEXT   = '#1A1A1A';
const MUTED  = '#6B6868';
const BORDER = '#E8E5DF';
const CHIP   = '#F0EEE9';

type Props = { visible: boolean; onClose: () => void };

export function AddSkillSheet({ visible, onClose }: Props) {
  const { mutate: addSkill, isPending } = useAddSkill();

  const [name, setName]         = useState('');
  const [category, setCategory] = useState('');
  const [lessons, setLessons]   = useState(10);
  const [source, setSource]     = useState('');

  const reset = () => {
    setName('');
    setCategory('');
    setLessons(10);
    setSource('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert('', 'Please enter a skill name.');
      return;
    }
    if (!category) {
      Alert.alert('', 'Please choose a category.');
      return;
    }
    addSkill(
      {
        name:           name.trim(),
        category,
        total_lessons:  lessons,
        source:         source.trim() || null,
        goal_date:      null,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose} />

      <View style={styles.sheet}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>New Skill</ThemedText>
          <Pressable style={styles.closeBtn} onPress={handleClose} hitSlop={8}>
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              size={15}
              tintColor={MUTED}
            />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.body}
        >
          {/* Skill name */}
          <View style={styles.field}>
            <ThemedText style={styles.fieldLabel}>Skill name</ThemedText>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. React Native, Piano, Spanish…"
              placeholderTextColor={MUTED}
              autoFocus
              returnKeyType="next"
            />
          </View>

          {/* Category */}
          <View style={styles.field}>
            <ThemedText style={styles.fieldLabel}>Category</ThemedText>
            <View style={styles.catGrid}>
              {CATEGORIES.map((cat) => {
                const active = category === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    style={[styles.catChip, active && { backgroundColor: cat.color + '25', borderColor: cat.color }]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <SymbolView
                      name={cat.icon}
                      size={14}
                      tintColor={active ? cat.color : MUTED}
                    />
                    <ThemedText style={[styles.catChipText, active && { color: cat.color, fontWeight: '600' }]}>
                      {cat.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Total lessons */}
          <View style={styles.field}>
            <ThemedText style={styles.fieldLabel}>Total lessons</ThemedText>
            <View style={styles.stepper}>
              <Pressable
                style={styles.stepBtn}
                onPress={() => setLessons((n) => Math.max(1, n - 1))}
                hitSlop={8}
              >
                <SymbolView
                  name={{ ios: 'minus', android: 'remove', web: 'remove' }}
                  size={16}
                  tintColor={TEXT}
                />
              </Pressable>
              <ThemedText style={styles.stepCount}>{lessons}</ThemedText>
              <Pressable
                style={styles.stepBtn}
                onPress={() => setLessons((n) => n + 1)}
                hitSlop={8}
              >
                <SymbolView
                  name={{ ios: 'plus', android: 'add', web: 'add' }}
                  size={16}
                  tintColor={TEXT}
                />
              </Pressable>
            </View>
          </View>

          {/* Source (optional) */}
          <View style={styles.field}>
            <ThemedText style={styles.fieldLabel}>Source <ThemedText style={styles.optional}>(optional)</ThemedText></ThemedText>
            <TextInput
              style={styles.input}
              value={source}
              onChangeText={setSource}
              placeholder="e.g. Udemy, YouTube, Book…"
              placeholderTextColor={MUTED}
              returnKeyType="done"
            />
          </View>
        </ScrollView>

        {/* Add button */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.addBtn, { opacity: isPending || pressed ? 0.75 : 1 }]}
            onPress={handleAdd}
            disabled={isPending}
          >
            {isPending ? (
              <LoadingSpinner />
            ) : (
              <ThemedText style={styles.addBtnText}>Add Skill</ThemedText>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: BG,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    overflow: 'hidden',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  title: { fontSize: 18, fontWeight: '700', color: TEXT },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: CHIP,
    alignItems: 'center', justifyContent: 'center',
  },

  body: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },

  field: { gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5 },
  optional:   { fontSize: 11, fontWeight: '400', color: MUTED, textTransform: 'none' },

  input: {
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: TEXT,
  },

  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: CHIP,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  catChipText: { fontSize: 13, fontWeight: '500', color: MUTED },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  stepBtn: {
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: CHIP,
  },
  stepCount: {
    minWidth: 52,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: TEXT,
  },

  footer: {
    paddingHorizontal: Spacing.three,
    paddingTop: 12,
    paddingBottom: 36,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  addBtn: {
    backgroundColor: Primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
