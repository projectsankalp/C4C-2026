import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  useColorScheme,
  Appearance,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Colors } from '../constants/theme';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

type UserProfile = {
  id: string;
  name: string;
  username: string | null;
  email: string;
  role: string;
  village: string | null;
  status: string;
  phc_name: string | null;
};

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  const styles = createStyles(colors);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(colorScheme === 'dark');

  useEffect(() => {
    setDarkModeEnabled(colorScheme === 'dark');
  }, [colorScheme]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (!token || !API_BASE_URL) {
          setError('Not logged in');
          return;
        }

        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data: UserProfile = await res.json();
          setProfile(data);
        } else {
          setError('Could not load profile');
        }
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const changeLanguage = async (code: string) => {
    await i18n.changeLanguage(code);
    await SecureStore.setItemAsync('language', code);
    setShowLanguageDropdown(false);
  };

  const currentLanguageName = (() => {
    switch (i18n.language) {
      case 'ml': return 'മലയാളം';
      case 'kn': return 'ಕನ್ನಡ';
      default: return 'English';
    }
  })();

  const toggleDarkMode = async (value: boolean) => {
    setDarkModeEnabled(value);
    Appearance.setColorScheme(value ? 'dark' : 'light');
    await SecureStore.setItemAsync('colorScheme', value ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('username');
    await SecureStore.deleteItemAsync('token');
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.profileImage}>
          <Ionicons name="person" size={60} color={colors.primary} />
        </View>

        {loading ? (
          <ActivityIndicator color={colors.textInverse} style={{ marginTop: 16 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            <Text style={styles.name}>{profile!.name}</Text>
            <Text style={styles.roleTag}>{profile!.role}</Text>
          </>
        )}
      </View>

      {/* USER DETAILS */}
      {!loading && !error && profile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.personal_info')}</Text>
          <View style={styles.infoCard}>

            {!!profile.username && (
              <>
                <View style={styles.infoRow}>
                  <Ionicons name="at-outline" size={20} color={colors.primary} />
                  <View style={styles.infoTextGroup}>
                    <Text style={styles.infoLabel}>Username</Text>
                    <Text style={styles.infoText}>{profile.username}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
              </>
            )}

            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={colors.primary} />
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoText}>{profile.email}</Text>
              </View>
            </View>

            {!!profile.village && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={20} color={colors.primary} />
                  <View style={styles.infoTextGroup}>
                    <Text style={styles.infoLabel}>Village</Text>
                    <Text style={styles.infoText}>{profile.village}</Text>
                  </View>
                </View>
              </>
            )}

            {!!profile.phc_name && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="medkit-outline" size={20} color={colors.primary} />
                  <View style={styles.infoTextGroup}>
                    <Text style={styles.infoLabel}>Primary Health Center</Text>
                    <Text style={styles.infoText}>{profile.phc_name}</Text>
                  </View>
                </View>
              </>
            )}

            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Account Status</Text>
                <Text style={[styles.infoText, profile.status === 'ACTIVE' && styles.statusActive]}>
                  {profile.status}
                </Text>
              </View>
            </View>

          </View>
        </View>
      )}

      {/* SETTINGS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.settings')}</Text>
        <View style={styles.settingsCard}>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={20} color={colors.primary} />
              <Text style={styles.settingText}>{t('settings.dark_mode')}</Text>
            </View>
            <Switch value={darkModeEnabled} onValueChange={toggleDarkMode} />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="language-outline" size={20} color={colors.primary} />
              <Text style={styles.settingText}>{t('settings.language')}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.optionText}>{currentLanguageName}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.textMuted} style={{ marginLeft: 5 }} />
            </View>
          </TouchableOpacity>

          {showLanguageDropdown && (
            <View style={styles.languageDropdown}>
              {[
                { code: 'en', label: 'English' },
                { code: 'ml', label: 'മലയാളം' },
                { code: 'kn', label: 'ಕನ್ನಡ' },
              ].map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  style={styles.languageDropdownItem}
                  onPress={() => changeLanguage(lang.code)}
                >
                  <Text style={[
                    styles.languageDropdownText,
                    i18n.language === lang.code && { color: colors.tint, fontWeight: '700' },
                  ]}>
                    {lang.label}
                  </Text>
                  {i18n.language === lang.code && (
                    <Ionicons name="checkmark" size={18} color={colors.tint} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary} />
              <Text style={styles.settingText}>{t('settings.notifications')}</Text>
            </View>
            <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
          </View>

        </View>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>{t('settings.logout')}</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: colors.headerBackground,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: { fontSize: 26, fontWeight: '700', color: colors.textInverse },
  roleTag: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textInverse,
    opacity: 0.8,
    textTransform: 'capitalize',
  },
  errorText: { marginTop: 12, color: colors.textInverse, opacity: 0.8 },
  section: { marginTop: 25, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15, color: colors.text },
  infoCard: { backgroundColor: colors.cardBackground, borderRadius: 18, padding: 18, elevation: 3 },
  settingsCard: { backgroundColor: colors.cardBackground, borderRadius: 18, paddingHorizontal: 18, elevation: 3 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  infoTextGroup: { marginLeft: 15, flex: 1 },
  infoLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 2 },
  infoText: { fontSize: 15, color: colors.text, fontWeight: '500' },
  statusActive: { color: '#16A34A', fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.border },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18 },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingText: { marginLeft: 15, fontSize: 15, color: colors.text },
  optionText: { color: colors.textMuted, fontSize: 14 },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 35,
    marginBottom: 40,
    backgroundColor: colors.danger,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 10 },
  languageDropdown: { backgroundColor: '#F3F4F6', borderRadius: 16, padding: 8, marginTop: -10, marginBottom: 10 },
  languageDropdownItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
  languageDropdownText: { fontSize: 15, color: colors.text },
});
