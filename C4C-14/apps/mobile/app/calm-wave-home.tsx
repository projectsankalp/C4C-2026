import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { getUser, removeUser } from '../utils/store';
import { api } from '../utils/api';

const { width } = Dimensions.get('window');

export default function CalmWaveHome() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const userId = await getUser();
      if (!userId) {
        router.replace('/otp-login');
        return;
      }
      const res = await api.get(`/dashboard/${userId}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E89AAE" />
      </View>
    );
  }

  const anomalyScore = data?.healthStatus?.anomalyScore || 0.16;
  const wellnessScore = Math.round(100 - (anomalyScore * 100));

  return (
    <View style={styles.outerContainer}>
      {/* Background Leaves */}
      <MaterialIcons name="eco" size={160} color="#F9E3E8" style={[styles.bgLeaf, { top: -20, right: -40, transform: [{ rotate: '45deg' }] }]} />
      <MaterialIcons name="eco" size={140} color="#F9E3E8" style={[styles.bgLeaf, { bottom: 100, left: -40, transform: [{ rotate: '-135deg' }] }]} />

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Good morning,</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.nameText}>{data?.user?.name ? data.user.name.split(' ')[0] : 'Swasthya'}</Text>
              <MaterialIcons name="eco" size={24} color="#F6C7D2" style={{ marginLeft: 6 }} />
            </View>
            <Text style={styles.subGreetingText}>You're not alone.</Text>
            <Text style={styles.subGreetingText}>We're here with you, always.</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <MaterialIcons name="notifications-none" size={28} color="#2B2B2B" />
          </TouchableOpacity>
        </View>

        {/* Huge Wellness Circle */}
        <View style={styles.wellnessRingSection}>
          <View style={styles.wellnessRingOuter}>
            <View style={styles.wellnessRingInner}>
              <Text style={styles.wellnessScoreLabel}>WELLNESS SCORE</Text>
              <Text style={styles.wellnessScoreNumber}>{wellnessScore}</Text>
              <Text style={styles.wellnessScoreMessage}>You're doing great ♥</Text>
            </View>
          </View>
        </View>

        {/* Check-in Prompt Box */}
        <View style={styles.checkinCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkinTitle}>How are you feeling today?</Text>
            <Text style={styles.checkinSubtitle}>A small check-in can make a big difference.</Text>
            <TouchableOpacity 
              style={styles.checkinButton}
              onPress={() => router.push('/micro-checkin')}
              activeOpacity={0.8}
            >
              <Text style={styles.checkinBtnText}>Start Check-in</Text>
              <MaterialIcons name="chevron-right" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
          <MaterialIcons name="eco" size={100} color="#F9E3E8" style={{ position: 'absolute', bottom: -20, right: -20, transform: [{ rotate: '-30deg' }] }} />
        </View>

        {/* Body Signals Grid */}
        <View style={styles.gridContainer}>
          {/* Steps */}
          <TouchableOpacity style={styles.glassCard} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
              <Ionicons name="walk" size={16} color="#E89AAE" />
              <Text style={styles.cardHeaderLabel}>Steps</Text>
            </View>
            <Text style={styles.cardValueText}>
              {data?.user?.steps !== undefined ? data.user.steps.toLocaleString() : '6,420'}
            </Text>
          </TouchableOpacity>

          {/* Active Mins */}
          <TouchableOpacity style={styles.glassCard} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="bolt" size={16} color="#E89AAE" />
              <Text style={styles.cardHeaderLabel}>Active Mins</Text>
            </View>
            <Text style={styles.cardValueText}>
              {data?.user?.activeMins !== undefined ? data.user.activeMins : 45}
              <Text style={styles.cardValueSubText}>m</Text>
            </Text>
          </TouchableOpacity>

          {/* Sleep */}
          <TouchableOpacity style={styles.glassCard} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="bedtime" size={16} color="#E89AAE" />
              <Text style={styles.cardHeaderLabel}>Sleep</Text>
            </View>
            <Text style={styles.cardValueText}>
              {data?.user?.sleepHours !== undefined ? data.user.sleepHours : 7}
              <Text style={styles.cardValueSubText}>h</Text>
              {data?.user?.sleepMins !== undefined ? data.user.sleepMins : 20}
              <Text style={styles.cardValueSubText}>m</Text>
            </Text>
          </TouchableOpacity>

          {/* Heart Rate */}
          <TouchableOpacity style={styles.glassCard} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="favorite" size={16} color="#E89AAE" />
              <Text style={styles.cardHeaderLabel}>Heart Rate</Text>
            </View>
            <Text style={styles.cardValueText}>
              {data?.user?.heartRate !== undefined ? data.user.heartRate : 72}
              <Text style={styles.cardValueSubText}>bpm</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* 7-Day Mood Trend */}
        <View style={styles.trendSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>7-day Mood Trend</Text>
            <TouchableOpacity onPress={() => alert('Trend details coming soon!')}>
              <MaterialIcons name="more-vert" size={20} color="#73796d" />
            </TouchableOpacity>
          </View>
          <View style={styles.chartContainer}>
            {/* Bar 1 */}
            <View style={styles.chartBarColumn}>
              <View style={[styles.chartBarFilled, { height: '40%' }]} />
              <Text style={styles.chartBarLabel}>M</Text>
            </View>
            {/* Bar 2 */}
            <View style={styles.chartBarColumn}>
              <View style={[styles.chartBarFilled, { height: '60%' }]} />
              <Text style={styles.chartBarLabel}>T</Text>
            </View>
            {/* Bar 3 */}
            <View style={styles.chartBarColumn}>
              <View style={[styles.chartBarFilled, { height: '85%' }]} />
              <Text style={styles.chartBarLabel}>W</Text>
            </View>
            {/* Bar 4 */}
            <View style={styles.chartBarColumn}>
              <View style={[styles.chartBarFilled, { height: '45%' }]} />
              <Text style={styles.chartBarLabel}>T</Text>
            </View>
            {/* Bar 5 */}
            <View style={styles.chartBarColumn}>
              <View style={[styles.chartBarFilled, { height: '95%', backgroundColor: '#E89AAE' }]} />
              <Text style={[styles.chartBarLabel, { color: '#E89AAE', fontWeight: 'bold' }]}>F</Text>
            </View>
            {/* Bar 6 */}
            <View style={styles.chartBarColumn}>
              <View style={[styles.chartBarFilled, { height: '70%' }]} />
              <Text style={styles.chartBarLabel}>S</Text>
            </View>
            {/* Bar 7 */}
            <View style={styles.chartBarColumn}>
              <View style={[styles.chartBarFilled, { height: '55%' }]} />
              <Text style={styles.chartBarLabel}>S</Text>
            </View>
          </View>
        </View>

        {/* Last Call Summary Card */}
        <TouchableOpacity style={styles.voiceSummaryCard} activeOpacity={0.7}>
          <View style={styles.voiceHeaderRow}>
            <View style={styles.voiceAvatarContainer}>
              <MaterialIcons name="psychology" size={24} color="#E89AAE" />
            </View>
            <View>
              <Text style={styles.voiceTitle}>Last Voice Summary</Text>
              <Text style={styles.voiceSubtitle}>Yesterday, 9:30 PM</Text>
            </View>
          </View>
          
          <View style={styles.tagsContainer}>
            <View style={[styles.tag, { backgroundColor: '#F9E3E8' }]}>
              <Text style={[styles.tagText, { color: '#2B2B2B' }]}>Restful Sleep</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: '#F6C7D2' }]}>
              <Text style={[styles.tagText, { color: '#2B2B2B' }]}>Calm</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: '#FFFDFD', borderWidth: 1, borderColor: '#F9E3E8' }]}>
              <Text style={[styles.tagText, { color: '#2B2B2B' }]}>Low Anxiety</Text>
            </View>
          </View>

          <View style={styles.distressContainer}>
            <View style={styles.distressLabelRow}>
              <Text style={styles.distressLabel}>Distress level</Text>
              <Text style={styles.distressValue}>{(anomalyScore * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFilled, { width: `${anomalyScore * 100}%` }]} />
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Bottom Nav */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => {}}>
            <MaterialIcons name="home" size={26} color="#E89AAE" />
            <Text style={[styles.navText, { color: '#E89AAE' }]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => {}}>
            <MaterialIcons name="bar-chart" size={26} color="#D9D9D9" />
            <Text style={styles.navText}>Insights</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/breathing-tools')}>
            <MaterialIcons name="waves" size={26} color="#D9D9D9" />
            <Text style={styles.navText}>Calm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/swasthya-chat')}>
            <MaterialIcons name="chat-bubble-outline" size={26} color="#D9D9D9" />
            <Text style={styles.navText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
            <MaterialIcons name="person-outline" size={26} color="#D9D9D9" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFF7F8',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFF7F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgLeaf: {
    position: 'absolute',
    opacity: 0.6,
    zIndex: -1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 120, // space for floating nav
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  greetingText: {
    fontSize: 16,
    color: '#2B2B2B',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  nameText: {
    fontSize: 32,
    color: '#E89AAE',
    fontFamily: 'PlusJakartaSans-Bold',
    marginVertical: 4,
  },
  subGreetingText: {
    fontSize: 14,
    color: '#7B7B7B',
    fontFamily: 'PlusJakartaSans-Regular',
    lineHeight: 20,
  },
  notificationButton: {
    padding: 8,
  },
  wellnessRingSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  wellnessRingOuter: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#FFFDFD',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E89AAE',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 5,
    borderWidth: 6,
    borderColor: '#F9E3E8',
  },
  wellnessRingInner: {
    alignItems: 'center',
  },
  wellnessScoreLabel: {
    fontSize: 10,
    color: '#7B7B7B',
    fontFamily: 'PlusJakartaSans-SemiBold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  wellnessScoreNumber: {
    fontSize: 64,
    color: '#2B2B2B',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  wellnessScoreMessage: {
    fontSize: 14,
    color: '#E89AAE',
    fontFamily: 'PlusJakartaSans-Medium',
    marginTop: 4,
  },
  checkinCard: {
    backgroundColor: '#FFFDFD',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#E89AAE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  checkinTitle: {
    fontSize: 18,
    color: '#2B2B2B',
    fontFamily: 'PlusJakartaSans-SemiBold',
    marginBottom: 4,
  },
  checkinSubtitle: {
    fontSize: 13,
    color: '#7B7B7B',
    fontFamily: 'PlusJakartaSans-Regular',
    marginBottom: 20,
  },
  checkinButton: {
    backgroundColor: '#E89AAE',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    shadowColor: '#E89AAE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  checkinBtnText: {
    color: '#FFF',
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    marginRight: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#2B2B2B',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  viewAllText: {
    fontSize: 13,
    color: '#7B7B7B',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionItem: {
    alignItems: 'center',
    width: '22%',
  },
  actionCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFDFD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#E89AAE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  actionText: {
    fontSize: 11,
    color: '#2B2B2B',
    fontFamily: 'PlusJakartaSans-Medium',
    textAlign: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDFD',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
    marginBottom: 20,
  },
  activityIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F9E3E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 15,
    color: '#2B2B2B',
    fontFamily: 'PlusJakartaSans-SemiBold',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#7B7B7B',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  tagBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F9E3', // Very soft green/sage tint
    borderRadius: 12,
  },
  tagText: {
    color: '#4A6B3C',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFDFD',
    borderRadius: 40,
    paddingVertical: 14,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    width: '100%',
    shadowColor: '#E89AAE',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: '#E89AAE',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 10,
    color: '#D9D9D9',
    fontFamily: 'PlusJakartaSans-Medium',
    marginTop: 6,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 16,
  },
  glassCard: {
    width: '48%',
    backgroundColor: '#FFFDFD',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#E89AAE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FFFDFD',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderLabel: {
    fontSize: 13,
    color: '#7B7B7B',
    fontFamily: 'PlusJakartaSans-Medium',
    marginLeft: 6,
  },
  cardValueText: {
    fontSize: 22,
    color: '#2B2B2B',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  cardValueSubText: {
    fontSize: 12,
    color: '#7B7B7B',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  trendSection: {
    backgroundColor: '#FFFDFD',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#E89AAE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartContainer: {
    height: 120,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  chartBarColumn: {
    width: '10%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartBarFilled: {
    width: '100%',
    backgroundColor: '#F9E3E8',
    borderRadius: 4,
    minHeight: 4,
  },
  chartBarLabel: {
    fontSize: 10,
    color: '#7B7B7B',
    fontFamily: 'PlusJakartaSans-Regular',
    marginTop: 8,
  },
  voiceSummaryCard: {
    backgroundColor: '#FFFDFD',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#E89AAE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  voiceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  voiceAvatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F9E3E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  voiceTitle: {
    fontSize: 16,
    color: '#2B2B2B',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  voiceSubtitle: {
    fontSize: 12,
    color: '#7B7B7B',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  distressContainer: {
    marginTop: 4,
  },
  distressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distressLabel: {
    fontSize: 13,
    color: '#7B7B7B',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  distressValue: {
    fontSize: 13,
    color: '#E89AAE',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#F9E3E8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFilled: {
    height: '100%',
    backgroundColor: '#E89AAE',
    borderRadius: 3,
  },
});
