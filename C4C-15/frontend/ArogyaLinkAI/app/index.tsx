import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Ionicons,
} from '@expo/vector-icons';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL;

export default function LoginScreen() {
  const { t } = useTranslation();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  const styles = createStyles(colors);


  const [username, setUsername] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const handleLogin = async () => {

    if (!username || !password) {
      setError('Please fill all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (!API_BASE_URL) {
        setError('Set EXPO_PUBLIC_API_URL in your frontend .env');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || 'Invalid credentials');
        return;
      }

      await SecureStore.setItemAsync('token', data.token);
      await SecureStore.setItemAsync('username', data.username);
      router.replace('/dashboard');
    } catch {
      setError('Unable to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        style={{ flex: 1 }}
      >

        <ScrollView
          contentContainerStyle={
            styles.scrollContainer
          }
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.card}>

            <View style={styles.logoCircle}>
              <Ionicons
                name="medical"
                size={34}
                color={colors.textInverse}
              />
            </View>

            <View style={styles.brandContainer}>

              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' }}>
                <Text style={styles.title}>Asha</Text>
                <Text style={{ color: colors.tint, fontSize: 22, fontWeight: '700', marginTop: 2 }}>+</Text>
              </View>

              <Text style={styles.subtitle}>
                {t("login.subtitle")}
              </Text>

            </View>

            <View style={styles.inputWrapper}>

              <Ionicons
                name="person-outline"
                size={20}
                color={colors.icon}
              />

              <TextInput
                placeholder={t("login.username")}
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />

            </View>

            <View style={styles.passwordContainer}>

              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.icon}
              />

              <TextInput
                placeholder={t("login.password")}
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                onPress={() =>
                  setShowPassword(!showPassword)
                }
              >
                <Text style={styles.showText}>
                  {showPassword
                    ? 'Hide'
                    : 'Show'}
                </Text>
              </TouchableOpacity>

            </View>

            {error ? (
              <Text style={styles.error}>
                {error}
              </Text>
            ) : null}

            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={loading}
            >

              {loading ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={styles.loginText}>
                  Login
                </Text>
              )}

            </TouchableOpacity>

            <TouchableOpacity>
              <Text style={styles.forgotText}>
                {t("login.forgot")}
              </Text>
            </TouchableOpacity>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },

  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 36,
    padding: 32,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },

  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 40,
    backgroundColor: colors.headerBackground,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },

  brandContainer: {
    alignItems: 'center',
    marginBottom: 34,
  },

  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
  },

  subtitle: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 15,
  },

  inputWrapper: {
    backgroundColor: colors.background,
    borderRadius: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  input: {


    color: colors.text,
    flex: 1,
    paddingVertical: 18,
    paddingLeft: 12,
    fontSize: 16,
  },

  passwordContainer: {
    backgroundColor: colors.background,
    borderRadius: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  passwordInput: {


    color: colors.text,
    flex: 1,
    paddingVertical: 18,
    paddingLeft: 12,
    fontSize: 16,
  },

  showText: {
    color: colors.tint,
    fontWeight: '600',
  },

  error: {
    color: colors.danger,
    marginBottom: 15,
    marginLeft: 4,
  },

  loginBtn: {
    backgroundColor: colors.headerBackground,
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
  },

  loginText: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: '600',
  },

  forgotText: {
    marginTop: 20,
    textAlign: 'center',
    color: colors.tint,
    fontWeight: '500',
  },
});
