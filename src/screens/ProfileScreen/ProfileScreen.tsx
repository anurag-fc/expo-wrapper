import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import i18n from '@/lib/i18n';
import { useProfile, useUpdateProfile } from '@/queries/use-profile';
import { useSignOut } from '@/queries/use-session';

import { styles } from './ProfileScreen.styles';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setBio(profile.bio ?? '');
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile(
      { full_name: fullName, bio },
      { onSuccess: () => Alert.alert('', t('profile.updateSuccess')) },
    );
  };

  const handleSignOut = () => {
    Alert.alert(t('auth.signOut'), 'Are you sure?', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('auth.signOut'), style: 'destructive', onPress: () => signOut() },
    ]);
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.screen}>
        <LoadingSpinner fullscreen />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <View style={styles.avatarSection}>
            <Avatar uri={profile?.avatar_url} name={profile?.full_name} size={80} />
            <ThemedText type="subtitle">{profile?.full_name ?? '—'}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">{profile?.email}</ThemedText>
          </View>

          <Card style={styles.form}>
            <Input
              label={t('profile.fullName')}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your name"
            />
            <Input
              label={t('profile.bio')}
              value={bio}
              onChangeText={setBio}
              placeholder="A short bio"
              multiline
              numberOfLines={3}
            />
            <Button onPress={handleSave} loading={isSaving}>
              {t('profile.saveChanges')}
            </Button>
          </Card>

          <Card>
            <ThemedText type="smallBold" style={styles.sectionLabel}>
              {t('profile.changeLanguage')}
            </ThemedText>
            <View style={styles.langRow}>
              <Button
                onPress={() => i18n.changeLanguage('en')}
                variant={i18n.language === 'en' ? 'primary' : 'secondary'}
                size="sm">
                {t('profile.language_en')}
              </Button>
              <Button
                onPress={() => i18n.changeLanguage('es')}
                variant={i18n.language === 'es' ? 'primary' : 'secondary'}
                size="sm">
                {t('profile.language_es')}
              </Button>
            </View>
          </Card>

          <Button onPress={handleSignOut} variant="destructive" loading={isSigningOut}>
            {t('auth.signOut')}
          </Button>

        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
