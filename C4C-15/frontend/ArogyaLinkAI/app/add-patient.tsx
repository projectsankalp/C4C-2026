import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';
import { router } from 'expo-router';

import {
  Platform,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';

import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Ionicons,
} from '@expo/vector-icons';

// @ts-ignore
import QRCodeSVG from 'react-native-qrcode-svg';

import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function AddPatientScreen() {
  const { t } = useTranslation();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  const styles = createStyles(colors);


  const [fullName, setFullName] =
    useState('');

  const [dob, setDob] =
    useState('');

  const [dobDate, setDobDate] =
    useState<Date | null>(null);

  const [showDobPicker, setShowDobPicker] =
    useState(false);

  const [mobile, setMobile] =
    useState('');

  const [patientId, setPatientId] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [gender, setGender] =
    useState('Male');

  // ADDRESS STATES

  const [houseNo, setHouseNo] =
    useState('');

  const [streetName, setStreetName] =
    useState('');

  const [village, setVillage] =
    useState('');

  const [district, setDistrict] =
    useState('');

  const [state, setState] =
    useState('');

  const [zipCode, setZipCode] =
    useState('');

  const generatePatientId = async () => {

    if (!fullName || !dob || !mobile) {
      Alert.alert('Missing Details', t('add_patient.error_fill') || 'Please fill name, date of birth and mobile');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      Alert.alert('Invalid Number', t('add_patient.error_mobile') || 'Enter a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);

    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: fullName,
          address: fullAddressPreview,
          dob,
          mobile,
          gender,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data?.error || t('add_patient.error_reg') || 'Failed to register patient');
        return;
      }

      setPatientId(data.id);

    } catch {
      Alert.alert('Error', t('add_patient.error_conn') || 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fullAddressPreview = [
    [houseNo, streetName].filter(Boolean).join(', '),
    [village, district].filter(Boolean).join(', '),
    [state, zipCode].filter(Boolean).join(' - '),
  ].filter(Boolean).join('\n');

  const formatDob = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const handleDobValueChange = (_event: unknown, selectedDate?: Date) => {
    if (!selectedDate) {
      return;
    }

    setDobDate(selectedDate);
    setDob(formatDob(selectedDate));
  };

  const openDobPicker = () => {
    const initialDate = dobDate ?? new Date();

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initialDate,
        mode: 'date',
        display: 'calendar',
        onChange: handleDobValueChange,
      });

      return;
    }

    setShowDobPicker(true);
  };

  return (

    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContainer
        }
      >

        {/* HEADER */}

        <View style={styles.headerRow}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >

            <Ionicons
              name="arrow-back"
              size={24}
              color={colors.text}
            />

          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Add Patient
          </Text>

        </View>

        {/* FORM CARD */}

        <View style={styles.formCard}>

          {/* FULL NAME */}

          <Text style={styles.label}>
            {t('add_patient.full_name')}
          </Text>

          <TextInput
            style={styles.input}
            placeholder={t("add_patient.name_placeholder")}
            placeholderTextColor={colors.textMuted}
            value={fullName}
            onChangeText={setFullName}
          />

          {/* ADDRESS */}

          <Text style={styles.label}>
            Address
          </Text>

          <View style={styles.addressContainer}>

            {/* HOUSE NO */}

            <View style={styles.halfInputWrapper}>

              <TextInput
                style={styles.halfInput}
                placeholder={t("add_patient.house_no")}
                placeholderTextColor={colors.textMuted}
                value={houseNo}
                onChangeText={setHouseNo}
              />

            </View>

            {/* STREET */}

            <View style={styles.halfInputWrapper}>

              <TextInput
                style={styles.halfInput}
                placeholder={t("add_patient.street_name")}
                placeholderTextColor={colors.textMuted}
                value={streetName}
                onChangeText={setStreetName}
              />

            </View>

            {/* VILLAGE */}

            <View style={styles.halfInputWrapper}>

              <TextInput
                style={styles.halfInput}
                placeholder={t("add_patient.village")}
                placeholderTextColor={colors.textMuted}
                value={village}
                onChangeText={setVillage}
              />

            </View>

            {/* DISTRICT */}

            <View style={styles.halfInputWrapper}>

              <TextInput
                style={styles.halfInput}
                placeholder={t("add_patient.district")}
                placeholderTextColor={colors.textMuted}
                value={district}
                onChangeText={setDistrict}
              />

            </View>

            {/* STATE */}

            <View style={styles.halfInputWrapper}>

              <TextInput
                style={styles.halfInput}
                placeholder={t("add_patient.state")}
                placeholderTextColor={colors.textMuted}
                value={state}
                onChangeText={setState}
              />

            </View>

            {/* ZIP CODE */}

            <View style={styles.halfInputWrapper}>

              <TextInput
                style={styles.halfInput}
                placeholder={t("add_patient.zip_code")}
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={6}
                value={zipCode}
                onChangeText={setZipCode}
              />

            </View>

            {/* FULL ADDRESS PREVIEW */}

            <View style={styles.fullWidthWrapper}>

              <TextInput
                style={styles.fullWidthInput}
                placeholder={t("add_patient.preview")}
                placeholderTextColor={colors.textMuted}
                multiline
                editable={false}
                selectTextOnFocus={false}
                showSoftInputOnFocus={false}
                value={fullAddressPreview}
              />

            </View>

          </View>

          {/* GENDER */}
          <Text style={styles.label}>
            Gender
          </Text>
          <View style={styles.genderRow}>
            {[{k: 'Male', v: t('add_patient.male')}, {k: 'Female', v: t('add_patient.female')}, {k: 'Other', v: t('add_patient.other')}].map(g => (
              <TouchableOpacity
                key={g.k}
                style={[
                  styles.genderBtn,
                  gender === g.k && styles.genderBtnActive
                ]}
                onPress={() => setGender(g.k)}
              >
                <Text style={[
                  styles.genderBtnText,
                  gender === g.k && styles.genderBtnTextActive
                ]}>
                  {g.v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* DATE OF BIRTH */}

          <Text style={styles.label}>
            Date of Birth
          </Text>

          <TouchableOpacity
            style={styles.dateInputWrapper}
            activeOpacity={0.85}
            onPress={openDobPicker}
          >

            <TextInput
              style={styles.dateInput}
              placeholder={t("add_patient.dob_placeholder")}
              placeholderTextColor={colors.textMuted}
              value={dob}
              editable={false}
              pointerEvents="none"
            />

            <Ionicons
              name="calendar-outline"
              size={22}
              color={colors.tint}
            />

          </TouchableOpacity>

          {showDobPicker && Platform.OS !== 'android' && (
            <DateTimePicker
              value={dobDate ?? new Date()}
              mode="date"
              display="default"
              onChange={(_event, selectedDate) => {
                setShowDobPicker(false);
                if (selectedDate) {
                  setDobDate(selectedDate);
                  setDob(formatDob(selectedDate));
                }
              }}
            />
          )}

          {/* MOBILE */}

          <Text style={styles.label}>
            Mobile Number
          </Text>

          <View style={styles.mobileWrapper}>

            <Text style={styles.countryCode}>
              +91
            </Text>

            <TextInput
              style={styles.mobileInput}
              placeholder={t("add_patient.mobile_placeholder")}
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={10}
              value={mobile}
              onChangeText={setMobile}
            />

          </View>

          {/* BUTTON */}

          <TouchableOpacity
            style={[styles.generateButton, (loading || !!patientId) && { opacity: 0.5 }]}
            onPress={generatePatientId}
            disabled={loading || !!patientId}
          >

            {loading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={styles.generateButtonText}>
                {patientId ? 'Patient Registered' : 'Generate Patient ID'}
              </Text>
            )}

          </TouchableOpacity>

        </View>

        {/* QR CARD */}

        {!!patientId && (

          <View style={styles.qrCard}>

            <Text style={styles.qrTitle}>
              {t('add_patient.health_id')}
            </Text>

            <Text style={styles.patientId}>
              {patientId}
            </Text>

            <View style={styles.qrWrapper}>

              {/* @ts-ignore */}

              <QRCodeSVG
                value={patientId}
                size={180}
              />

            </View>

          </View>

        )}

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

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },

  backButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
  },

  formCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 30,
    padding: 22,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    marginTop: 12,
  },

  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 15,
    color: colors.text,
  },

  addressContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  halfInputWrapper: {
    width: '48%',
    marginBottom: 16,
  },

  halfInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 15,
    color: colors.text,
  },

  fullWidthWrapper: {
    width: '100%',
    marginTop: 4,
  },

  fullWidthInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
    fontSize: 15,
    color: colors.text,
    minHeight: 70,
    textAlignVertical: 'top',
  },

  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  genderBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },

  genderBtnActive: {
    backgroundColor: colors.iconBgGreen,
    borderColor: colors.tint,
  },

  genderBtnText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 15,
  },

  genderBtnTextActive: {
    color: colors.tint,
  },

  dateInputWrapper: {
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dateInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
    color: colors.text,
  },

  mobileWrapper: {
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },

  countryCode: {
    fontSize: 16,
    color: colors.textMuted,
    marginRight: 10,
  },

  mobileInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },

  generateButton: {
    backgroundColor: colors.headerBackground,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 28,
  },

  generateButtonText: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: '700',
  },

  qrCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 30,
    padding: 24,
    marginTop: 24,
    alignItems: 'center',
  },

  qrTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },

  patientId: {
    marginTop: 10,
    fontSize: 16,
    color: colors.tint,
    fontWeight: '700',
  },

  qrWrapper: {
    marginTop: 24,
  },

});