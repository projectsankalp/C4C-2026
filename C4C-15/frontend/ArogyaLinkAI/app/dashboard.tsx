import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useNetInfo } from '@react-native-community/netinfo';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';

export default function DashboardScreen() {
  const { t } = useTranslation();


  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  const styles = createStyles(colors);

  const [menuOpen, setMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState('ASHA Worker');

  const netInfo = useNetInfo();
  const isOnline = netInfo.isConnected === true;

  const [stats, setStats] = useState({
    patients: 0,
    highRisk: 0,
    visits: 0,
    pending: 0,
    hypertension: 0,
    diabetes: 0,
    critical: 0,
    controlled: 0,
  });

  useEffect(() => {

    let isMounted = true;

    const loadData = async () => {
      try {

        const storedName = await SecureStore.getItemAsync('username');

        if (isMounted && storedName?.trim()) {
          setDisplayName(storedName.trim());
        }

      } catch {
        // Keep fallback label when secure storage read fails.
      }

      try {
        const token = await SecureStore.getItemAsync('token');
        if (!token || !API_BASE_URL) return;

        const res = await fetch(`${API_BASE_URL}/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setStats({
              patients: data.patients ?? 0,
              highRisk: data.highRisk ?? 0,
              visits: data.visits ?? 0,
              pending: data.pending ?? 0,
              hypertension: data.hypertension ?? 0,
              diabetes: data.diabetes ?? 0,
              critical: data.critical ?? 0,
              controlled: data.controlled ?? 0,
            });
          }
        }
      } catch {
        // Keep default zeros if stats fetch fails.
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };

  }, []);

  return (

    <SafeAreaView style={styles.container}>

      {/* SIDE DRAWER */}

      {menuOpen && (

        <Pressable
          style={styles.drawerOverlay}
          onPress={() => setMenuOpen(false)}
        >

          <Pressable
            onPress={() => {}}
            style={styles.drawerPressable}
          >

            <View style={styles.drawerMenu}>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setMenuOpen(false)}
              >
                <Ionicons
                  name="close"
                  size={30}
                  color={colors.textInverse}
                />
              </TouchableOpacity>

              <Text style={styles.drawerTitle}>
                {displayName}
              </Text>

              <Text style={styles.drawerSubtitle}>
                Community Health Worker
              </Text>

              {/* Scheduling */}

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/visits');
                }}
              >
                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color={colors.textInverse}
                />

                <Text style={styles.drawerText}>
                  Scheduling
                </Text>
              </TouchableOpacity>

              {/* Patient Details */}

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/patient-list');
                }}
              >
                <Ionicons
                  name="people-outline"
                  size={22}
                  color={colors.textInverse}
                />

                <Text style={styles.drawerText}>
                  Patient Details
                </Text>
              </TouchableOpacity>

              {/* LOGOUT */}

              <TouchableOpacity
                style={styles.logoutDrawerButton}
                onPress={async () => {

                  await SecureStore.deleteItemAsync('username');

                  setMenuOpen(false);

                  router.replace('/');

                }}
              >
                <Ionicons
                  name="log-out-outline"
                  size={22}
                  color={colors.textInverse}
                />

                <Text style={styles.drawerText}>
                  {t('dashboard.logout')}
                </Text>
              </TouchableOpacity>

            </View>

          </Pressable>

        </Pressable>

      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >

        {/* HEADER */}

        <View style={styles.header}>

          <View style={styles.topRow}>

            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuOpen(true)}
            >
              <Ionicons
                name="menu"
                size={22}
                color={colors.text}
              />
            </TouchableOpacity>

            {/* CLOUD STATUS */}

            <TouchableOpacity style={styles.cloudButton}>

              <Ionicons
                name={isOnline
                  ? 'cloud-done-outline'
                  : 'cloud-offline-outline'}
                size={22}
                color={isOnline
                  ? '#16A34A'
                  : '#F97316'}
              />

            </TouchableOpacity>

            {/* PROFILE */}

            <TouchableOpacity
              style={styles.profileCircle}
              onPress={() => router.push('/profile')}
            >

              <Ionicons
                name="person"
                size={22}
                color={colors.textInverse}
              />

            </TouchableOpacity>

          </View>

          <View style={styles.welcomeSection}>

            <Text style={styles.greeting}>
              Welcome
            </Text>

            <Text style={styles.workerName}>
              {displayName}
            </Text>

          </View>

        </View>

        {/* HERO CARD */}

        <View style={styles.heroCard}>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text style={styles.heroTitle}>Asha</Text>
            <Text style={{ color: '#FFFDD0', fontSize: 18, fontWeight: '700', marginTop: 2 }}>+</Text>
          </View>

          <Text style={styles.heroSubtitle}>
            Rural Healthcare Dashboard
          </Text>

          <View style={styles.heroStats}>

            <View style={styles.heroStatItem}>
              <Ionicons
                name="people-outline"
                size={18}
                color={colors.iconBgGreen}
              />

              <Text style={styles.heroStatNumber}>
                {stats.patients}
              </Text>

              <Text style={styles.heroStatLabel}>
                Patients
              </Text>
            </View>

            <View style={styles.heroStatItem}>
              <Ionicons
                name="warning-outline"
                size={18}
                color={colors.iconBgGreen}
              />

              <Text style={styles.heroStatNumber}>
                {stats.highRisk}
              </Text>

              <Text style={styles.heroStatLabel}>
                {t('dashboard.high_risk')}
              </Text>
            </View>

            <View style={styles.heroStatItem}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={colors.iconBgGreen}
              />

              <Text style={styles.heroStatNumber}>
                {stats.visits}
              </Text>

              <Text style={styles.heroStatLabel}>
                {t('dashboard.visits')}
              </Text>
            </View>

            <View style={styles.heroStatItem}>
              <Ionicons
                name="sync-outline"
                size={18}
                color={colors.iconBgGreen}
              />

              <Text style={styles.heroStatNumber}>
                {stats.pending}
              </Text>

              <Text style={styles.heroStatLabel}>
                Pending
              </Text>
            </View>

          </View>

        </View>

        {/* PRIORITY MONITORING */}

        <Text style={styles.sectionTitle}>
          Priority Monitoring
        </Text>

        <View style={styles.gridContainer}>

          <View style={styles.healthCard}>

            <View style={styles.iconRed}>
              <FontAwesome5
                name="heartbeat"
                size={18}
                color={colors.danger}
              />
            </View>

            <Text style={styles.cardTitle}>
              Hypertension
            </Text>

            <Text style={styles.cardNumber}>
              {stats.hypertension}
            </Text>

            <Text style={styles.cardSubText}>
              risk cases
            </Text>

          </View>

          <View style={styles.healthCard}>

            <View style={styles.iconOrange}>
              <MaterialCommunityIcons
                name="diabetes"
                size={20}
                color={colors.warning}
              />
            </View>

            <Text style={styles.cardTitle}>
              Diabetes
            </Text>

            <Text style={styles.cardNumber}>
              {stats.diabetes}
            </Text>

            <Text style={styles.cardSubText}>
              risk cases
            </Text>

          </View>

          <View style={styles.healthCard}>

            <View style={styles.iconBlue}>
              <Ionicons
                name="warning-outline"
                size={20}
                color={colors.primary}
              />
            </View>

            <Text style={styles.cardTitle}>
              Critical
            </Text>

            <Text style={styles.cardNumber}>
              {stats.critical}
            </Text>

            <Text style={styles.cardSubText}>
              Immediate follow-up
            </Text>

          </View>

          <View style={styles.healthCard}>

            <View style={styles.iconGreen}>
              <Ionicons
                name="checkmark-done-outline"
                size={20}
                color={colors.success}
              />
            </View>

            <Text style={styles.cardTitle}>
              Controlled
            </Text>

            <Text style={styles.cardNumber}>
              {stats.controlled}
            </Text>

            <Text style={styles.cardSubText}>
              Stable cases
            </Text>

          </View>

        </View>

        {/* QUICK ACTIONS */}

        <Text style={styles.sectionTitle}>
          {t('dashboard.quick_actions')}
        </Text>

        <View style={styles.quickGrid}>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/add-patient')}
          >
            <Ionicons
              name="person-add-outline"
              size={24}
              color={colors.primary}
            />

            <Text style={styles.quickText}>
              {t('dashboard.add_patient')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/patient-survey')}
          >
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={24}
              color={colors.tint}
            />

            <Text style={styles.quickText}>
              Patient Survey
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCard}>
            <Ionicons
              name="sync-outline"
              size={24}
              color={colors.danger}
            />

            <Text style={styles.quickText}>
              {t('dashboard.sync')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/visits')}
          >
            <Ionicons
              name="home-outline"
              size={24}
              color={colors.primary}
            />

            <Text style={styles.quickText}>
              Home {t('dashboard.visits')}
            </Text>
          </TouchableOpacity>

        </View>

        {/* RECENT ACTIVITY */}

        <Text style={styles.sectionTitle}>
          {t('dashboard.recent_activity')}
        </Text>

        <View style={styles.activityCard}>

          <View style={styles.activityItem}>

            <Ionicons
              name="checkmark-circle"
              size={18}
              color={colors.success}
            />

            <Text style={styles.activityText}>
              Patient data synced
            </Text>

          </View>

          <View style={styles.activityItem}>

            <Ionicons
              name="person-add"
              size={18}
              color={colors.primary}
            />

            <Text style={styles.activityText}>
              New patient added today
            </Text>

          </View>

          <View style={styles.activityItem}>

            <Ionicons
              name="warning"
              size={18}
              color={colors.danger}
            />

            <Text style={styles.activityText}>
              2 critical BP alerts
            </Text>

          </View>

        </View>

      </ScrollView>

    </SafeAreaView>

  );
}

const createStyles = (colors: any) => StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContainer: {
    padding: 22,
    paddingBottom: 40,
  },

  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    zIndex: 999,
    flexDirection: 'row',
  },

  drawerPressable: {
    flex: 1,
    flexDirection: 'row',
  },

  drawerMenu: {
    width: '78%',
    backgroundColor: colors.headerBackground,
    paddingTop: 80,
    paddingHorizontal: 24,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
  },

  logoutDrawerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
    paddingVertical: 20,
  },

  drawerTitle: {
    color: colors.textInverse,
    fontSize: 30,
    fontWeight: '700',
    marginTop: 20,
  },

  drawerSubtitle: {
    color: colors.textInverse,
    opacity: 0.8,
    marginTop: 6,
    marginBottom: 40,
    fontSize: 15,
  },

  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },

  drawerText: {
    color: colors.textInverse,
    fontSize: 18,
    marginLeft: 18,
    fontWeight: '600',
  },

  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
  },

  header: {
    marginBottom: 24,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cloudButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 12,
  },

  profileCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.headerBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },

  welcomeSection: {
    marginTop: 22,
  },

  greeting: {
    fontSize: 18,
    color: colors.textMuted,
  },

  workerName: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    marginTop: 6,
  },

  heroCard: {
    backgroundColor: colors.headerBackground,
    borderRadius: 30,
    padding: 24,
    marginBottom: 28,
  },

  heroTitle: {
    color: colors.textInverse,
    fontSize: 28,
    fontWeight: '700',
  },

  heroSubtitle: {
    color: colors.textInverse,
    opacity: 0.8,
    marginTop: 6,
    marginBottom: 24,
    fontSize: 15,
  },

  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  heroStatItem: {
    alignItems: 'center',
  },

  heroStatNumber: {
    color: colors.textInverse,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },

  heroStatLabel: {
    color: colors.textInverse,
    opacity: 0.8,
    marginTop: 4,
    fontSize: 13,
  },

  sectionTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 18,
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  healthCard: {
    width: '48%',
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },

  iconRed: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.iconBgRed,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconOrange: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.iconBgOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconBlue: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.iconBgBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconGreen: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.iconBgGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardTitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 16,
  },

  cardNumber: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
    marginTop: 10,
  },

  cardSubText: {
    color: colors.textMuted,
    marginTop: 6,
    fontSize: 14,
  },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  quickCard: {
    width: '48%',
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    paddingVertical: 28,
    alignItems: 'center',
    marginBottom: 16,
  },

  quickText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },

  activityCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    padding: 22,
    marginBottom: 40,
  },

  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  activityText: {
    marginLeft: 12,
    color: colors.text,
    fontSize: 15,
  },

});