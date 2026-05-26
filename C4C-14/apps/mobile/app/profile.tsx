import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { getUser, removeUser } from '../utils/store';
import { api } from '../utils/api';

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userId = await getUser();
      if (!userId) {
        router.replace('/otp-login');
        return;
      }
      const res = await api.get(`/dashboard/${userId}`);
      if (res.data.success && res.data.data.user) {
        setUser(res.data.data.user);
      }
    } catch (e) {
      console.error('Failed to load profile', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await removeUser();
    router.replace('/otp-login');
  };

  const handleToggleLanguage = async () => {
    if (!user?._id) return;
    
    let nextLang = 'en';
    if (user.language === 'en' || !user.language) nextLang = 'kn';
    else if (user.language === 'kn') nextLang = 'en';

    try {
      setLoading(true);
      const res = await api.post('/users/update-language', {
        userId: user._id,
        language: nextLang
      });
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Failed to toggle language:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCallASHA = () => {
    Linking.openURL('tel:+919353048159');
  };

  const handleCallAI = () => {
    Linking.openURL('tel:+19412063766');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E89AAE" />
      </View>
    );
  }

  const name = user?.name ?? (user?.email ? user.email.split('@')[0] : 'Swasthya User');
  const displayId = user?._id ? `SW-${user._id.slice(-4).toUpperCase()}` : 'SW-4OF1';
  
  let displayLang = 'English';
  if (user?.language === 'kn') displayLang = 'Kannada';
  else if (user?.language === 'hi') displayLang = 'Hindi';

  return (
    <View style={styles.outerContainer}>
      {/* Background Floral Accents */}
      <MaterialIcons name="eco" size={180} color="#F9E3E8" style={[styles.bgLeaf, { top: -20, left: -60, transform: [{ rotate: '45deg' }] }]} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}></Text>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="more-horiz" size={28} color="#2B2B2B" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero with Botanical Halo */}
        <View style={styles.profileHero}>
          <View style={styles.haloOuter}>
            <View style={styles.haloInner}>
              <Image
                source={{ uri: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png' }}
                style={styles.avatarImage}
              />
            </View>
            {/* Small decorative leaves around the halo */}
            <MaterialIcons name="eco" size={32} color="#F6C7D2" style={[styles.haloLeaf, { top: -10, right: 0, transform: [{ rotate: '30deg' }] }]} />
            <MaterialIcons name="eco" size={24} color="#EBCFC4" style={[styles.haloLeaf, { bottom: 10, left: -10, transform: [{ rotate: '-120deg' }] }]} />
          </View>
          
          <Text style={styles.userName}>{name}</Text>
          <View style={styles.idBadge}>
            <Text style={styles.idText}>Wellness ID: {displayId}</Text>
            <MaterialIcons name="content-copy" size={14} color="#7B7B7B" style={styles.badgeIcon} />
          </View>
        </View>

        {/* Assigned ASHA Worker Support Widget */}
        <View style={styles.supportCard}>
          <View style={styles.supportLeft}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBW0abyKUet7oLRgDXWMFSVkgZXRZyjYuksmMbmniXwR6p-BU6QwIAVFgiYClCk1a3ZAAgofZANUD0KjIbWtDxdTz0_oS7Whddaq3jyskDCNXuUcS47guFEFvNKW2k4ZBct1LezHNpOzlQ5dSXyASSygx8MwnUCwZ2kUXaomnDXby2SiFfxTDNcnAN2VlmlqP2t5pok-0x-vhZX96rm1FZj2rA_9h7maPTDOm11k5ecEPyAr_lwutVMhBCPj2tB1-rLH7iBHs2x2DQx' }} 
              style={styles.supportAvatar} 
            />
            <View>
              <Text style={styles.supportLabel}>Assigned ASHA Worker</Text>
              <Text style={styles.supportName}>Sunita D.</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.supportCallButton} onPress={handleCallASHA}>
            <MaterialIcons name="call" size={20} color="#E89AAE" />
          </TouchableOpacity>
        </View>

        {/* AI Voice Assistant */}
        <View style={[styles.supportCard, { marginTop: 16 }]}>
          <View style={styles.supportLeft}>
            <View style={styles.aiAvatar}>
              <MaterialIcons name="psychology" size={24} color="#E89AAE" />
            </View>
            <View>
              <Text style={styles.supportLabel}>AI Voice Bot</Text>
              <Text style={styles.supportName}>Swasthya Assistant</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.supportCallButton} onPress={handleCallAI}>
            <MaterialIcons name="call" size={20} color="#E89AAE" />
          </TouchableOpacity>
        </View>

        {/* Settings List */}
        <View style={styles.settingsGroup}>
          <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              <MaterialIcons name="person-outline" size={24} color="#7B7B7B" style={styles.settingsIcon} />
              <Text style={styles.settingsText}>Personal Information</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#7B7B7B" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity style={styles.settingsItem} onPress={handleToggleLanguage}>
            <View style={styles.settingsItemLeft}>
              <MaterialIcons name="language" size={24} color="#7B7B7B" style={styles.settingsIcon} />
              <Text style={styles.settingsText}>Language</Text>
            </View>
            <View style={styles.settingsItemRight}>
              <Text style={styles.settingsValue}>{displayLang}</Text>
              <MaterialIcons name="chevron-right" size={24} color="#E89AAE" />
            </View>
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              <MaterialIcons name="lock-outline" size={24} color="#7B7B7B" style={styles.settingsIcon} />
              <Text style={styles.settingsText}>Privacy & Security</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#7B7B7B" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              <MaterialIcons name="notifications-none" size={24} color="#7B7B7B" style={styles.settingsIcon} />
              <Text style={styles.settingsText}>Notifications</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#7B7B7B" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Floating Bottom Nav */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/calm-wave-home')}>
            <MaterialIcons name="home" size={26} color="#D9D9D9" />
            <Text style={styles.navText}>Home</Text>
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
          <TouchableOpacity style={styles.navItem} onPress={() => {}}>
            <MaterialIcons name="person-outline" size={26} color="#E89AAE" />
            <Text style={[styles.navText, { color: '#E89AAE' }]}>Profile</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#2B2B2B',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  profileHero: {
    alignItems: 'center',
    marginBottom: 40,
  },
  haloOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F9E3E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  haloInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFFDFD',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E89AAE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  haloLeaf: {
    position: 'absolute',
  },
  userName: {
    fontSize: 24,
    color: '#2B2B2B',
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 8,
  },
  idBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  idText: {
    fontSize: 12,
    color: '#7B7B7B',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  badgeIcon: {
    marginLeft: 6,
  },
  supportCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFDFD',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
    marginBottom: 32,
  },
  supportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  aiAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9E3E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supportLabel: {
    fontSize: 11,
    color: '#7B7B7B',
    fontFamily: 'PlusJakartaSans-Medium',
    marginBottom: 2,
  },
  supportName: {
    fontSize: 15,
    color: '#2B2B2B',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  supportCallButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F9E3E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsGroup: {
    marginBottom: 40,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
    marginRight: 16,
  },
  settingsText: {
    fontSize: 15,
    color: '#2B2B2B',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsValue: {
    fontSize: 14,
    color: '#E89AAE',
    fontFamily: 'PlusJakartaSans-Medium',
    marginRight: 8,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(235, 207, 196, 0.3)', // Warm Clay tint
  },
  logoutButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#FFFDFD',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F9E3E8',
  },
  logoutText: {
    color: '#E89AAE',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-SemiBold',
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
});
