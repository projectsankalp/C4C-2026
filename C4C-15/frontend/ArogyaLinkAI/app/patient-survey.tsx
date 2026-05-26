import { useTranslation } from 'react-i18next';
import React, { useEffect, useMemo, useState } from 'react';

import { useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

type PatientRecord = {
  id: string;
  full_name: string;
  address: string;
  dob: string;
  mobile: string;
  created_at?: string;
};

type SurveyResult = {
  diabetesRisk: string;
  diabetesProbability: number;
  hypertensionRisk: string;
  hypertensionProbability: number;
  overallRisk: string;
  overallProbability: number;
  explainability: {
    diabetes_factors: { feature: string; impact: number }[];
    hypertension_factors: { feature: string; impact: number }[];
  };
  riskReasons: string[];
};

type SurveyFields = {
  age: string;
  bmi: string;
  family_history: string;
  exercise: string;
  sugary_food: string;
  smoking: string;
  thirst: string;
  headaches: string;
  sleep: string;
  stress: string;
};

const INITIAL_SURVEY: SurveyFields = {
  age: '45',
  bmi: '24.5',
  family_history: '0',
  exercise: '2',
  sugary_food: '2',
  smoking: '0',
  thirst: '0',
  headaches: '0',
  sleep: '7',
  stress: '1',
};

const SURVEY_FIELDS: {
  key: keyof SurveyFields;
  label: string;
  helper: string;
  keyboardType?: 'default' | 'numeric' | 'number-pad';
}[] = [
  { key: 'age', label: 'Age', helper: 'Years', keyboardType: 'number-pad' },
  { key: 'bmi', label: 'BMI', helper: 'Body mass index', keyboardType: 'numeric' },
  { key: 'family_history', label: 'Family History', helper: '0 = No, 1 = Yes', keyboardType: 'number-pad' },
  { key: 'exercise', label: 'Exercise', helper: '0 to 4 times/week', keyboardType: 'number-pad' },
  { key: 'sugary_food', label: 'Sugary Food Intake', helper: '0 to 4 scale', keyboardType: 'number-pad' },
  { key: 'smoking', label: 'Smoking', helper: '0 = No, 1 = Yes', keyboardType: 'number-pad' },
  { key: 'thirst', label: 'Excessive Thirst', helper: '0 = No, 1 = Yes', keyboardType: 'number-pad' },
  { key: 'headaches', label: 'Headaches / Dizziness', helper: '0 = No, 1 = Yes', keyboardType: 'number-pad' },
  { key: 'sleep', label: 'Sleep Duration', helper: 'Hours per night', keyboardType: 'number-pad' },
  { key: 'stress', label: 'Stress', helper: '0 to 3 scale', keyboardType: 'number-pad' },
];

export default function PatientSurveyScreen() {
  const { t } = useTranslation();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  const styles = createStyles(colors);

  const getRiskClass = (risk: string) => {
    const normalized = String(risk || '').toLowerCase();
    if (normalized === 'high') return styles.highRisk;
    if (normalized === 'moderate') return styles.moderateRisk;
    return styles.lowRisk;
  };

  const [permission, requestPermission] = useCameraPermissions();
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const [surveyResult, setSurveyResult] = useState<SurveyResult | null>(null);
  const [answers, setAnswers] = useState<SurveyFields>(INITIAL_SURVEY);
  const [cameraLocked, setCameraLocked] = useState(false);

  useEffect(() => {
    if (!patient) {
      return;
    }

    setSurveySubmitted(false);
    setSurveyResult(null);
  }, [patient]);

  const updateAnswer = (field: keyof SurveyFields, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const resetSurvey = () => {
    setPatient(null);
    setAnswers(INITIAL_SURVEY);
    setSurveySubmitted(false);
    setSurveyResult(null);
    setScanLoading(false);
    setCameraLocked(false);
  };

  const normalizeQrValue = (value: string) => {
    const trimmed = value.trim();
    const uuidMatch = trimmed.match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);
    return uuidMatch ? uuidMatch[0] : trimmed;
  };

  const loadPatientByQr = async (qrValue: string) => {
    const token = await SecureStore.getItemAsync('token');

    if (!token || !API_BASE_URL) {
      throw new Error('Missing API configuration');
    }

    const response = await fetch(`${API_BASE_URL}/patients/${encodeURIComponent(qrValue)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) {
      throw new Error('SESSION_EXPIRED');
    }

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error || 'Patient not found');
    }

    return response.json();
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (cameraLocked) {
      return;
    }

    setCameraLocked(true);
    setScanLoading(true);

    try {
      const foundPatient = await loadPatientByQr(normalizeQrValue(data));
      setPatient(foundPatient);
      setAnswers(INITIAL_SURVEY);
      setSurveySubmitted(false);
      setSurveyResult(null);
      setScannerVisible(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to read patient QR';
      if (message === 'SESSION_EXPIRED') {
        Alert.alert('Session expired', 'Your login has expired. Please go back and log in again.');
      } else {
        Alert.alert('Scan failed', message);
      }
    } finally {
      setScanLoading(false);
      setCameraLocked(false);
    }
  };

  const startScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Camera permission required', 'Allow camera access to scan the patient QR code.');
        return;
      }
    }

    setScannerVisible(true);
  };

  const submitSurvey = async () => {
    if (!patient) {
      Alert.alert('Missing patient', 'Scan the patient QR first.');
      return;
    }

    setSubmitLoading(true);

    try {
      const token = await SecureStore.getItemAsync('token');
      const username = await SecureStore.getItemAsync('username');

      const response = await fetch(`${API_BASE_URL}/screenings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patient_id: patient.id,
          submitted_by: username || '',
          ...answers,
          answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data?.error || 'Failed to save screening');
        return;
      }

      setSurveyResult(data.computed);
      setSurveySubmitted(true);
    } catch {
      Alert.alert('Error', 'Unable to connect to server');
    } finally {
      setSubmitLoading(false);
    }
  };

  const surveySummary = useMemo(() => {
    if (!surveyResult) {
      return null;
    }

    return [
      `Diabetes: ${surveyResult.diabetesRisk} (${surveyResult.diabetesProbability}%)`,
      `Hypertension: ${surveyResult.hypertensionRisk} (${surveyResult.hypertensionProbability}%)`,
      `Overall: ${surveyResult.overallRisk} (${surveyResult.overallProbability}%)`,
    ];
  }, [surveyResult]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Patient Survey</Text>
          <Text style={styles.headerSubtitle}>
            Scan the patient QR code, complete the ASHA questionnaire, and save the screening for the doctor workspace.
          </Text>
        </View>

        <View style={styles.scanCard}>
          <View style={styles.scanIconWrap}>
            <Ionicons name="qr-code-outline" size={34} color={colors.tint} />
          </View>

          <Text style={styles.scanTitle}>Scan Patient QR</Text>
          <Text style={styles.scanSubtitle}>
            Open the camera, scan the printed patient card, and the details will appear here.
          </Text>

          <TouchableOpacity style={styles.scanButton} onPress={startScan}>
            <Text style={styles.scanButtonText}>Open Camera</Text>
          </TouchableOpacity>
        </View>

        {patient && (
          <View style={styles.patientCard}>
            <View style={styles.patientHeader}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={28} color={colors.textInverse} />
              </View>

              <View style={styles.patientMeta}>
                <Text style={styles.patientName}>{patient.full_name}</Text>
                <Text style={styles.patientInfo}>{patient.id}</Text>
                <Text style={styles.patientInfo}>{patient.address || 'No address saved'}</Text>
              </View>
            </View>

            <View style={styles.detailGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>DOB</Text>
                <Text style={styles.detailValue}>{patient.dob}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Mobile</Text>
                <Text style={styles.detailValue}>+91 {patient.mobile}</Text>
              </View>
            </View>

            <View style={styles.statusPill}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.statusText}>Patient loaded from QR</Text>
            </View>

            <TouchableOpacity style={styles.rescanButton} onPress={resetSurvey}>
              <Text style={styles.rescanButtonText}>Scan Another QR</Text>
            </TouchableOpacity>
          </View>
        )}

        {patient && (
          <>
            <Text style={styles.sectionTitle}>Health Survey</Text>

            {SURVEY_FIELDS.map((field) => (
              <View key={field.key} style={styles.questionCard}>
                <Text style={styles.questionText}>{field.label}</Text>
                <Text style={styles.questionHelper}>{field.helper}</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType={field.keyboardType}
                  value={answers[field.key]}
                  onChangeText={(value) => updateAnswer(field.key, value)}
                  placeholder={field.label}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            ))}

            <TouchableOpacity style={[styles.submitButton, submitLoading && { opacity: 0.7 }]} onPress={submitSurvey} disabled={submitLoading}>
              {submitLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Survey</Text>}
            </TouchableOpacity>
          </>
        )}

        {surveySubmitted && patient && surveyResult && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Risk Assessment</Text>
            <Text style={[styles.resultValue, getRiskClass(surveyResult.overallRisk)]}>{surveyResult.overallRisk}</Text>

            <View style={styles.resultBreakdown}>
              {surveySummary?.map((line) => (
                <Text key={line} style={styles.resultLine}>{line}</Text>
              ))}
            </View>

            <View style={styles.factorCard}>
              <Text style={styles.factorTitle}>Top Risk Factors</Text>
              {surveyResult.riskReasons.slice(0, 5).map((reason) => (
                <Text key={reason} style={styles.factorLine}>• {reason}</Text>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <Modal visible={scannerVisible} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.scannerScreen}>
          <View style={styles.scannerHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setScannerVisible(false)}>
              <Ionicons name="close" size={26} color={colors.text} />
            </TouchableOpacity>

            <Text style={styles.scannerTitle}>Scan Patient QR</Text>
            <Text style={styles.scannerSubtitle}>Point the camera at the QR code on the patient card.</Text>
          </View>

          <View style={styles.cameraFrame}>
            {permission?.granted ? (
              <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={scanLoading ? undefined : handleBarcodeScanned}
              />
            ) : (
              <View style={styles.permissionCard}>
                <Ionicons name="camera-outline" size={34} color={colors.tint} />
                <Text style={styles.permissionText}>Camera permission is needed to scan QR codes.</Text>
              </View>
            )}

            <View style={styles.scanFrameOverlay}>
              <View style={styles.scanCornerTopLeft} />
              <View style={styles.scanCornerTopRight} />
              <View style={styles.scanCornerBottomLeft} />
              <View style={styles.scanCornerBottomRight} />
            </View>
          </View>

          <View style={styles.scannerFooter}>
            {scanLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.tint} />
                <Text style={styles.loadingText}>Loading patient details...</Text>
              </View>
            ) : (
              <Text style={styles.scannerHint}>Hold steady until the QR is detected.</Text>
            )}
          </View>
        </SafeAreaView>
      </Modal>
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
  header: {
    marginBottom: 22,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    marginTop: 8,
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
  scanCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 30,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
  },
  scanIconWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D9FFF6',
  },
  scanTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 14,
  },
  scanSubtitle: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 22,
    lineHeight: 22,
  },
  scanButton: {
    backgroundColor: colors.headerBackground,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 28,
  },
  scanButtonText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 16,
  },
  patientCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 30,
    padding: 24,
    marginBottom: 28,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.headerBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientMeta: {
    marginLeft: 14,
    flex: 1,
  },
  patientName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  patientInfo: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 15,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  detailItem: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    padding: 14,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  detailValue: {
    marginTop: 6,
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  statusPill: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statusText: {
    marginLeft: 8,
    color: '#166534',
    fontWeight: '700',
  },
  rescanButton: {
    marginTop: 16,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  rescanButtonText: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 18,
  },
  questionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    padding: 22,
    marginBottom: 18,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  answerRow: {
    flexDirection: 'row',
    marginTop: 18,
  },
  answerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#F3F4F6',
  },
  selectedYes: {
    backgroundColor: colors.headerBackground,
  },
  selectedNo: {
    backgroundColor: '#DC2626',
  },
  answerText: {
    color: colors.text,
    fontWeight: '700',
  },
  selectedAnswerText: {
    color: colors.textInverse,
  },
  submitButton: {
    backgroundColor: colors.headerBackground,
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 18,
  },
  submitText: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    marginTop: 24,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  resultValue: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.tint,
    marginTop: 16,
  },
  scannerScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scannerHeader: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 18,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  scannerTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
  },
  scannerSubtitle: {
    marginTop: 8,
    color: colors.textMuted,
    lineHeight: 22,
  },
  cameraFrame: {
    marginHorizontal: 22,
    borderRadius: 32,
    overflow: 'hidden',
    height: 440,
    backgroundColor: '#111827',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  scanFrameOverlay: {
    position: 'absolute',
    left: 32,
    right: 32,
    top: 90,
    bottom: 90,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  scanCornerTopLeft: {
    position: 'absolute',
    left: -2,
    top: -2,
    width: 28,
    height: 28,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#19a38c',
    borderTopLeftRadius: 18,
  },
  scanCornerTopRight: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 28,
    height: 28,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#19a38c',
    borderTopRightRadius: 18,
  },
  scanCornerBottomLeft: {
    position: 'absolute',
    left: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#19a38c',
    borderBottomLeftRadius: 18,
  },
  scanCornerBottomRight: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#19a38c',
    borderBottomRightRadius: 18,
  },
  scannerFooter: {
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  scannerHint: {
    textAlign: 'center',
    color: colors.textMuted,
  },
  loadingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  permissionCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  permissionText: {
    marginTop: 12,
    color: colors.textInverse,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
  },
});
