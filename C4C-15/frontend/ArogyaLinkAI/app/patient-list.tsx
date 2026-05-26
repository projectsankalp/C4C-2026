import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';

import { useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Ionicons,
} from '@expo/vector-icons';

import { router } from 'expo-router';
import * as Print from 'expo-print';
import * as SecureStore from 'expo-secure-store';
import QRCode from 'qrcode';

// @ts-ignore
import QRCodeSVG from 'react-native-qrcode-svg';

type PatientRecord = {
  id: string;
  name: string;
  address: string;
  dob: string;
  mobile: string;
  risk: string;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const getRiskColor = (risk: string) => {
  switch (risk.toLowerCase()) {
    case 'high': return '#DC2626';
    case 'moderate': return '#D97706';
    case 'low': return '#16A34A';
    default: return '#6B7280';
  }
};

export default function PatientDetailsScreen() {
  const { t } = useTranslation();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  const styles = createStyles(colors);


  const [searchQuery, setSearchQuery] =
    useState('');

  const [filterType, setFilterType] =
    useState<'name' | 'village' | 'risk'>('name');

  const [showFilterDropdown, setShowFilterDropdown] =
    useState(false);

  const [selectedPatient, setSelectedPatient] =
    useState<PatientRecord | null>(null);

  const [patients, setPatients] =
    useState<PatientRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');

        if (!token || !API_BASE_URL) {
          return;
        }

        const response = await fetch(`${API_BASE_URL}/patients`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const rows = await response.json();

        setPatients(
          rows.map((patient: any) => ({
            id: patient.id,
            name: patient.full_name,
            address: patient.address || '',
            dob: patient.dob,
            mobile: patient.mobile,
            risk: patient.overall_risk || 'Not Screened',
          }))
        );
      } catch {
        // Leave the list empty on network failure.
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  const filteredPatients =
    patients.filter((patient) => {
      const query = searchQuery.toLowerCase();
      if (!query) return true;

      if (filterType === 'name') {
        return patient.name.toLowerCase().includes(query);
      } else if (filterType === 'village') {
        return patient.address.toLowerCase().includes(query);
      } else if (filterType === 'risk') {
        return patient.risk.toLowerCase().includes(query);
      }

      return true;
    });

  const printPatientCard = async (patient: PatientRecord) => {
    const qrSvg = await QRCode.toString(patient.id, {
      type: 'svg',
      margin: 0,
      width: 180,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
    });

    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style="font-family: Arial, sans-serif; padding: 24px; color: #111827; background: #F4F7F9;">
          <div style="border: 2px solid #19a38c; border-radius: 24px; padding: 22px; max-width: 420px; background: linear-gradient(180deg, #ffffff 0%, #f7fffd 100%); box-shadow: 0 12px 28px rgba(25, 163, 140, 0.12);">
            <div style="text-align: center; margin-bottom: 18px;">
              <h2 style="margin: 0; color: #19a38c; font-size: 24px;">ArogyaLink AI</h2>
              <p style="margin: 6px 0 0 0; color: #6B7280; font-size: 14px;">Community Health Card</p>
            </div>
            <div style="border-top: 1px solid #E5E7EB; padding-top: 16px;">
              <div style="margin-bottom: 10px;"><strong>Name:</strong> ${patient.name}</div>
              <div style="margin-bottom: 10px;"><strong>Date of Birth:</strong> ${patient.dob}</div>
              <div style="margin-bottom: 10px;"><strong>Address:</strong> ${patient.address || 'N/A'}</div>
              <div style="margin-bottom: 10px;"><strong>Mobile:</strong> +91 ${patient.mobile}</div>
            </div>
            <div style="margin-top: 18px; padding: 18px; border-radius: 20px; background: #FFFFFF; border: 1px solid #E5E7EB; text-align: center;">
              <div style="font-size: 12px; color: #6B7280; margin-bottom: 10px; letter-spacing: 0.08em; text-transform: uppercase;">Patient ID</div>
              <div style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 14px;">${patient.id}</div>
              <div style="display: inline-block; padding: 12px; background: #fff; border: 1px solid #E5E7EB; border-radius: 18px;">
                ${qrSvg}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await Print.printAsync({ html });
  };

  return (

    <SafeAreaView style={styles.container}>

      <ScrollView
        contentContainerStyle={
          styles.scrollContainer
        }
        showsVerticalScrollIndicator={false}
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
            Patient Details
          </Text>

        </View>

        {/* FILTERS */}

        <View style={styles.filterCard}>

          <View style={styles.searchRow}>

            <Ionicons
              name="search-outline"
              size={20}
              color={colors.textMuted}
            />

            <TextInput
              style={styles.searchInput}
              placeholder={t(`patient_list.search_${filterType}` as any) || `Search by ${filterType}`}
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <TouchableOpacity onPress={() => setShowFilterDropdown(!showFilterDropdown)}>
              <Ionicons
                name="filter"
                size={22}
                color={colors.tint}
              />
            </TouchableOpacity>

          </View>

          {showFilterDropdown && (
            <View style={styles.dropdown}>
              {['name', 'village', 'risk'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFilterType(type as any);
                    setShowFilterDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownText, filterType === type && styles.dropdownTextActive]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                  {filterType === type && (
                    <Ionicons name="checkmark" size={18} color={colors.tint} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

        </View>

        {/* PATIENT LIST */}

        {loading ? (

          <View style={styles.loadingCard}>

            <ActivityIndicator color={colors.tint} />

            <Text style={styles.loadingText}>
              Loading saved patients...
            </Text>

          </View>

        ) : filteredPatients.length === 0 ? (

          <View style={styles.loadingCard}>

            <Text style={styles.loadingText}>
              No saved patients found.
            </Text>

          </View>

        ) : filteredPatients.map(
          (patient, index) => (

          <View
            key={index}
            style={styles.patientCard}
          >

            <View style={{ flex: 1 }}>

              <Text style={styles.patientName}>
                {patient.name}
              </Text>

              <Text style={styles.patientInfo}>
                {patient.address || t('patient_list.no_address')}
              </Text>

              <Text style={styles.patientId}>
                {patient.id}
              </Text>

              <Text style={[styles.riskText, { color: getRiskColor(patient.risk) }]}>
                {patient.risk}
              </Text>

            </View>

            <View style={styles.cardActions}>

              <TouchableOpacity
                style={styles.showButton}
                onPress={() =>
                  setSelectedPatient(patient)
                }
              >

                <Text style={styles.showButtonText}>
                  Show Card
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={styles.printButton}
                onPress={() => printPatientCard(patient)}
              >

                <Ionicons
                  name="print-outline"
                  size={18}
                  color={colors.textInverse}
                />

              </TouchableOpacity>

            </View>

          </View>

        ))}

      </ScrollView>

      {/* CARD MODAL */}

      <Modal
        visible={!!selectedPatient}
        transparent
        animationType="slide"
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalCard}>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() =>
                setSelectedPatient(null)
              }
            >

              <Ionicons
                name="close"
                size={26}
                color={colors.text}
              />

            </TouchableOpacity>

            {selectedPatient && (

              <>

                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' }}>
                  <Text style={styles.cardHeader}>Asha</Text>
                  <Text style={{ color: colors.tint, fontSize: 18, fontWeight: '700', marginTop: 2 }}>+</Text>
                </View>

                <Text style={styles.cardSubHeader}>
                  Community Health Card
                </Text>

                <View style={styles.divider} />

                <Text style={styles.cardLabel}>
                  Name
                </Text>

                <Text style={styles.cardValue}>
                  {selectedPatient.name}
                </Text>

                <Text style={styles.cardLabel}>
                  Date of Birth
                </Text>

                <Text style={styles.cardValue}>
                  {selectedPatient.dob}
                </Text>

                <Text style={styles.cardLabel}>
                  Address
                </Text>

                <Text style={styles.cardValue}>
                  {selectedPatient.address || t('patient_list.no_address')}
                </Text>

                <Text style={styles.cardLabel}>
                  Mobile Number
                </Text>

                <Text style={styles.cardValue}>
                  +91 {selectedPatient.mobile}
                </Text>

                <Text style={styles.cardLabel}>
                  Health ID
                </Text>

                <Text style={styles.healthId}>
                  {selectedPatient.id}
                </Text>

                <View style={styles.qrWrapper}>

                  {/* @ts-ignore */}

                  <QRCodeSVG
                    value={selectedPatient.id}
                    size={150}
                  />

                </View>

                <Text style={styles.footerText}>
                  ASHA Worker Verified
                </Text>

                <TouchableOpacity
                  style={styles.modalPrintButton}
                  onPress={() => printPatientCard(selectedPatient)}
                >

                  <Ionicons
                    name="print-outline"
                    size={18}
                    color={colors.textInverse}
                  />

                  <Text style={styles.modalPrintText}>
                    Print Card
                  </Text>

                </TouchableOpacity>

              </>

            )}

          </View>

        </View>

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

  filterCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 28,
    padding: 18,
    marginBottom: 24,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  searchInput: {
    color: colors.text,
    flex: 1,
    paddingVertical: 16,
    paddingLeft: 10,
    fontSize: 15,
  },

  dropdown: {
    marginTop: 8,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },

  dropdownText: {
    fontSize: 15,
    color: colors.text,
  },

  dropdownTextActive: {
    color: colors.tint,
    fontWeight: '700',
  },

  loadingCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  loadingText: {
    marginTop: 10,
    color: colors.textMuted,
    fontSize: 15,
  },

  patientCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  patientName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },

  patientInfo: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 14,
  },

  patientId: {
    marginTop: 6,
    color: colors.tint,
    fontWeight: '700',
  },

  riskText: {
    marginTop: 8,
    fontWeight: '600',
  },

  cardActions: {
    alignItems: 'center',
    marginLeft: 12,
    gap: 10,
  },

  showButton: {
    backgroundColor: colors.headerBackground,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
  },

  printButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },

  showButtonText: {
    color: colors.textInverse,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalCard: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: 32,
    padding: 28,
  },

  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1,
  },

  cardHeader: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.tint,
    textAlign: 'center',
  },

  cardSubHeader: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 22,
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 20,
  },

  cardLabel: {
    color: colors.textMuted,
    marginTop: 12,
    fontSize: 13,
  },

  cardValue: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },

  healthId: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: colors.tint,
  },

  qrWrapper: {
    marginTop: 28,
    alignItems: 'center',
  },

  footerText: {
    textAlign: 'center',
    marginTop: 24,
    color: colors.textMuted,
    fontWeight: '600',
  },

  modalPrintButton: {
    marginTop: 20,
    backgroundColor: colors.text,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },

  modalPrintText: {
    color: colors.textInverse,
    fontWeight: '700',
    marginLeft: 10,
  },

});