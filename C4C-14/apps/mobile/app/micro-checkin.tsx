import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { getUser } from '../utils/store';
import { api } from '../utils/api';

export default function MicroCheckin() {
  const router = useRouter();
  const [mood, setMood] = useState(3);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const userId = await getUser();
      if (!userId) return;

      await api.post('/checkins', {
        userId,
        type: 'daily_micro',
        responses: {
          mood,
          textNotes: notes
        }
      });
      // Return to home page
      router.back();
    } catch (e) {
      console.error('Failed to submit check-in', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.outerContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Back navigation */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={18} color="#466736" style={styles.backIcon} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Daily Somatic Check-In</Text>
          <Text style={styles.subtitle}>How are your fatigue and energy levels right now?</Text>
        </View>

        {/* Mood/Energy Scale (1-5) */}
        <View style={styles.scaleCard}>
          <Text style={styles.cardTitle}>Current Vitality Score</Text>
          <View style={styles.moodContainer}>
            {[1, 2, 3, 4, 5].map((val) => (
              <TouchableOpacity 
                key={val} 
                style={[
                  styles.moodCircle, 
                  mood === val && styles.moodCircleActive
                ]}
                onPress={() => setMood(val)}
              >
                <Text 
                  style={[
                    styles.moodText, 
                    mood === val && styles.moodTextActive
                  ]}
                >
                  {val}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.labels}>
            <Text style={styles.label}>Exhausted (1)</Text>
            <Text style={styles.label}>Balanced (3)</Text>
            <Text style={styles.label}>Vibrant (5)</Text>
          </View>
        </View>

        {/* Thoughts Notes */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Somatic & Behavioral Notes</Text>
          <TextInput
            style={styles.input}
            placeholder="Describe any somatic signs, sleep notes, or routine changes you are experiencing..."
            placeholderTextColor="#79747E"
            multiline
            numberOfLines={5}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Submit */}
        {loading ? (
          <ActivityIndicator size="large" color="#466736" style={{ marginTop: 24 }} />
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <MaterialIcons name="check-circle" size={20} color="#fafaf3" style={styles.submitIcon} />
            <Text style={styles.submitText}>Submit Check-In</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#fafaf3',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  backIcon: {
    marginRight: 4,
  },
  backText: {
    color: '#466736',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Plus Jakarta Sans',
  },
  headerSection: {
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1c18',
    fontFamily: 'Plus Jakarta Sans',
  },
  subtitle: {
    fontSize: 14,
    color: '#43483e',
    marginTop: 6,
    lineHeight: 20,
    fontFamily: 'Plus Jakarta Sans',
  },
  scaleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(195, 200, 187, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1c18',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  moodCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8e9e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodCircleActive: {
    backgroundColor: '#466736',
    shadowColor: '#466736',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  moodText: {
    color: '#43483e',
    fontSize: 18,
    fontWeight: '700',
  },
  moodTextActive: {
    color: '#fafaf3',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: '#73796d',
    fontSize: 11,
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1c18',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    color: '#1a1c18',
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1.5,
    borderColor: 'rgba(195, 200, 187, 0.5)',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#466736',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#466736',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  submitIcon: {
    marginRight: 6,
  },
  submitText: {
    color: '#fafaf3',
    fontSize: 16,
    fontWeight: '700',
  }
});
