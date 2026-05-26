import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'api_service.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref.read(apiServiceProvider));
});

class AuthService {
  final ApiService _apiService;

  AuthService(this._apiService);

  SupabaseClient get _supabase => Supabase.instance.client;

  /// Send OTP to the given phone number (E.164 format, e.g. +919876543210)
  Future<void> sendOtp(String phone) async {
    await _supabase.auth.signInWithOtp(phone: phone);
  }

  /// Verify OTP and return the Supabase session.
  /// Also sets the JWT token on the ApiService.
  Future<Session?> verifyOtp(String phone, String otp) async {
    final response = await _supabase.auth.verifyOTP(
      phone: phone,
      token: otp,
      type: OtpType.sms,
    );
    final session = response.session;
    if (session != null) {
      _apiService.setToken(session.accessToken);
    }
    return session;
  }

  /// Returns the current JWT access token, refreshing if needed.
  Future<String?> getToken() async {
    final session = _supabase.auth.currentSession;
    if (session == null) return null;

    // Refresh if expired
    if (session.isExpired) {
      try {
        final refreshed = await _supabase.auth.refreshSession();
        final newToken = refreshed.session?.accessToken;
        if (newToken != null) _apiService.setToken(newToken);
        return newToken;
      } catch (e) {
        debugPrint('Token refresh failed: $e');
        return null;
      }
    }

    _apiService.setToken(session.accessToken);
    return session.accessToken;
  }

  /// Returns the current session synchronously (may be null).
  Session? get currentSession => _supabase.auth.currentSession;

  /// Returns the current user synchronously (may be null).
  User? get currentUser => _supabase.auth.currentUser;

  /// Sign out and clear the stored token.
  Future<void> signOut() async {
    await _supabase.auth.signOut();
    _apiService.clearToken();
  }

  /// Listen to auth state changes.
  Stream<AuthState> get authStateChanges => _supabase.auth.onAuthStateChange;
}
