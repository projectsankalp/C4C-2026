import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface SoundTrack {
  id: string;
  title: string;
  category: string;
  duration: string;
  imageUrl: string;
}

export default function BreathingTools() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('Sleep');
  const [isPlaying, setIsPlaying] = useState(true);
  const [nowPlaying, setNowPlaying] = useState<SoundTrack | null>({
    id: 'rain-tin',
    title: 'Rain on Tin Roof',
    category: 'Sleep',
    duration: '45 min',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7VLME9-pmQg5_DTcVzScOhZcRuxEJ72nBu61-a0ytUVG_uWa8LKxudn9rxdmudwAnQMYzB_g1MqWy4U1d4ffiXzS_cE2TNMhMWUvx8kcoBtLPxVIHIAkZY514es4Sn97B_Y3rM9gSjj3SqgAVn4fa9W20zwYmDk5UJGMdpihEbKXpzzUbngV_f1IiaaOuiE93UfIyxBVL-PbmYnd6876eC2eFPCqNNYHe2JlNuf2TK-5rD_V0z9j8va-e78e6sxOQX0CGOzav6YQ9'
  });

  const categories = ['Sleep', 'Focus', 'Anxiety', 'Grounding', 'Energy'];

  const tracks: SoundTrack[] = [
    {
      id: 'midnight-rain',
      title: 'Midnight Rain',
      category: 'Sleep',
      duration: '45 min',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzLpqbqw3UZCrvfOk44_ZejMKWmjF9HqO9ID9uMZa_8EVrN68ZED0LOoGSBj2Gs_KbdNGtrosHLR5I1yNVEuNZPm9Qx_INU1dGk5hRhQoOnx8pBW7WTiCeHb2u56vRaSRo6r-lxd19ChWDQp7Lv_hV0x1fwy5ndOpDH94v5C7YQejtvqyrGD8HS3ZorWfB4ux3XjD0BA51io4V520NrSBbHz0rPUHaeGJ6BJ_bSdp437D9isoTOZU3Mow51XFZVgt7dzVOH758wf_d'
    },
    {
      id: 'forest-grounding',
      title: 'Ancient Forest Walk',
      category: 'Grounding',
      duration: '30 min',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrsk3gBI5gZ6KHS2HGq0y4bfcn6Plo82c6_nV8YGaOpcl0QLMLxNuBQ3FNws7MGaYGh7PewzTok33goGIN2ae7Zo6n3V0yl2C75ZlXdaYwkCrYoNnlMCKJL9bWrmP6ypbRhA2eGY3tAjg77CfjfGWr5mJ_WYtslZx7seH8-wTW9k_zqkowG3dZfI2dqO21WdFK0zGHhAjwSRQs2h3yZBbMYJvFL4P7hyUPKVqqMobrr4kurSci_FKEyPHgczXulcWcEIxL48kivsF1'
    },
    {
      id: 'deep-sleep-ambient',
      title: 'Midnight Whispers',
      category: 'Sleep',
      duration: '60 min',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7VLME9-pmQg5_DTcVzScOhZcRuxEJ72nBu61-a0ytUVG_uWa8LKxudn9rxdmudwAnQMYzB_g1MqWy4U1d4ffiXzS_cE2TNMhMWUvx8kcoBtLPxVIHIAkZY514es4Sn97B_Y3rM9gSjj3SqgAVn4fa9W20zwYmDk5UJGMdpihEbKXpzzUbngV_f1IiaaOuiE93UfIyxBVL-PbmYnd6876eC2eFPCqNNYHe2JlNuf2TK-5rD_V0z9j8va-e78e6sxOQX0CGOzav6YQ9'
    },
    {
      id: 'focus-waves',
      title: 'Binaural Focus Focus',
      category: 'Focus',
      duration: '25 min',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrsk3gBI5gZ6KHS2HGq0y4bfcn6Plo82c6_nV8YGaOpcl0QLMLxNuBQ3FNws7MGaYGh7PewzTok33goGIN2ae7Zo6n3V0yl2C75ZlXdaYwkCrYoNnlMCKJL9bWrmP6ypbRhA2eGY3tAjg77CfjfGWr5mJ_WYtslZx7seH8-wTW9k_zqkowG3dZfI2dqO21WdFK0zGHhAjwSRQs2h3yZBbMYJvFL4P7hyUPKVqqMobrr4kurSci_FKEyPHgczXulcWcEIxL48kivsF1'
    }
  ];

  const filteredTracks = tracks.filter(t => t.category === activeCategory || activeCategory === 'Sleep');

  return (
    <View style={styles.outerContainer}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <MaterialIcons name="spa" size={24} color="#466736" style={styles.logoIcon} />
          <Text style={styles.headerTitle}>Swasthya</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons name="notifications" size={22} color="#466736" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Find your calm</Text>
          <Text style={styles.subtitleText}>Choose a frequency for your current state.</Text>
        </View>

        {/* Categories Row */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity 
              key={category} 
              style={[
                styles.categoryButton, 
                activeCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text style={[
                styles.categoryText, 
                activeCategory === category && styles.categoryTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recommended Section */}
        <View style={styles.recommendedSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recommended For You</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendedContent}
          >
            {filteredTracks.map((track) => (
              <TouchableOpacity 
                key={track.id} 
                style={styles.trackCard}
                onPress={() => {
                  setNowPlaying(track);
                  setIsPlaying(true);
                }}
              >
                <View style={styles.trackImageContainer}>
                  <Image 
                    source={{ uri: track.imageUrl }} 
                    style={styles.trackImage} 
                    resizeMode="cover"
                  />
                  <View style={styles.playOverlay}>
                    <MaterialIcons name="play-arrow" size={24} color="#ffffff" />
                  </View>
                </View>
                <Text style={styles.trackTitle}>{track.title}</Text>
                <Text style={styles.trackMeta}>{track.category} • {track.duration}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Guided Breathing Circle Tool */}
        <View style={styles.breathingCard}>
          <View style={styles.breathingHeader}>
            <MaterialIcons name="lens" size={24} color="#466736" style={styles.breathingLogo} />
            <View>
              <Text style={styles.breathingTitle}>Somatic Pacer Exercise</Text>
              <Text style={styles.breathingSubtitle}>2-minute deep grounding exercise</Text>
            </View>
          </View>
          <View style={styles.breathingVisualContainer}>
            <View style={styles.breathingCircleOuter}>
              <View style={styles.breathingCircleInner}>
                <Text style={styles.breathingPaceText}>Inhale</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.startExerciseButton}>
            <MaterialIcons name="play-circle-outline" size={20} color="#fafaf3" style={styles.btnIcon} />
            <Text style={styles.startExerciseText}>Begin Grounding Session</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Now Playing Mini Player */}
      {nowPlaying && (
        <View style={styles.miniPlayerContainer}>
          <View style={styles.miniPlayer}>
            <Image 
              source={{ uri: nowPlaying.imageUrl }} 
              style={styles.miniPlayerImage} 
            />
            <View style={styles.miniPlayerDetails}>
              <Text style={styles.miniPlayerTitle}>{nowPlaying.title}</Text>
              <Text style={styles.miniPlayerStatus}>{isPlaying ? 'Playing' : 'Paused'} • 04:20 left</Text>
            </View>
            <View style={styles.miniPlayerActions}>
              <TouchableOpacity 
                style={styles.playButton} 
                onPress={() => setIsPlaying(!isPlaying)}
              >
                <MaterialIcons 
                  name={isPlaying ? "pause" : "play-arrow"} 
                  size={24} 
                  color="#43483e" 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setNowPlaying(null)}>
                <MaterialIcons name="close" size={20} color="#73796d" />
              </TouchableOpacity>
            </View>
            <View style={[styles.playerProgress, { width: '65%' }]} />
          </View>
        </View>
      )}

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {/* Analytics */}
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/calm-wave-home')}>
          <MaterialIcons name="analytics" size={24} color="#79747E" />
          <Text style={styles.navText}>Analytics</Text>
        </TouchableOpacity>

        {/* Calm Waves (Active) */}
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]} onPress={() => {}}>
          <MaterialIcons name="waves" size={24} color="#062100" />
          <Text style={[styles.navText, styles.navTextActive]}>Calm Waves</Text>
        </TouchableOpacity>

        {/* Chat */}
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/swasthya-chat')}>
          <MaterialIcons name="chat-bubble" size={24} color="#79747E" />
          <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          <MaterialIcons name="person" size={24} color="#79747E" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFF7F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 16,
    backgroundColor: '#FFF7F8',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(195, 200, 187, 0.2)',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans-Regular',
    fontWeight: 'bold',
    color: '#E89AAE',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 170, // Make extra space for mini player and bottom tab nav
  },
  titleContainer: {
    marginBottom: 20,
  },
  titleText: {
    fontSize: 26,
    fontFamily: 'PlusJakartaSans-Regular',
    fontWeight: '700',
    color: '#2B2B2B',
  },
  subtitleText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#43483e',
    marginTop: 2,
  },
  categoriesScroll: {
    marginHorizontal: -16,
    marginBottom: 24,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 99,
    backgroundColor: '#FFFDFD',
  },
  categoryButtonActive: {
    backgroundColor: '#E89AAE',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
    fontWeight: '600',
    color: '#43483e',
  },
  categoryTextActive: {
    color: '#FFF7F8',
  },
  recommendedSection: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Regular',
    fontWeight: '700',
    color: '#2B2B2B',
  },
  viewAllText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Regular',
    fontWeight: '700',
    color: '#E89AAE',
  },
  recommendedContent: {
    gap: 16,
  },
  trackCard: {
    width: 170,
  },
  trackImageContainer: {
    width: 170,
    height: 170,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
    backgroundColor: '#FFFDFD',
  },
  trackImage: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  trackTitle: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-Regular',
    fontWeight: '700',
    color: '#2B2B2B',
  },
  trackMeta: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#73796d',
    marginTop: 2,
  },
  breathingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(195, 200, 187, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  breathingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  breathingLogo: {
    marginRight: 12,
  },
  breathingTitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Regular',
    fontWeight: '700',
    color: '#2B2B2B',
  },
  breathingSubtitle: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#73796d',
  },
  breathingVisualContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
    marginBottom: 20,
  },
  breathingCircleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(70, 103, 54, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingCircleInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F6C7D2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E89AAE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  breathingPaceText: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-Regular',
    fontWeight: '700',
    color: '#2B2B2B',
  },
  startExerciseButton: {
    backgroundColor: '#E89AAE',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startExerciseText: {
    color: '#FFF7F8',
    fontWeight: '700',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  btnIcon: {
    marginRight: 6,
  },
  miniPlayerContainer: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    zIndex: 40,
  },
  miniPlayer: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(195, 200, 187, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  miniPlayerImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 12,
  },
  miniPlayerDetails: {
    flex: 1,
  },
  miniPlayerTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
    fontWeight: '700',
    color: '#2B2B2B',
  },
  miniPlayerStatus: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#73796d',
    marginTop: 2,
  },
  miniPlayerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFDFD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerProgress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    backgroundColor: '#E89AAE',
    borderRadius: 99,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: '#f4f4ed',
    borderTopWidth: 1,
    borderTopColor: 'rgba(195, 200, 187, 0.3)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  navItemActive: {
    backgroundColor: '#F9E3E8',
    borderRadius: 99,
    paddingHorizontal: 18,
    paddingVertical: 4,
    transform: [{ scale: 0.95 }],
  },
  navText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#79747E',
    marginTop: 2,
    fontWeight: '500',
  },
  navTextActive: {
    color: '#2B2B2B',
    fontWeight: 'bold',
  },
});
