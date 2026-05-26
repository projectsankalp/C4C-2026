import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../../../core/services/api_service.dart';

// ─── Local UserProfile (Hive-backed) ────────────────────────────────────────

class UserProfile {
  final String name;
  final String state;
  final String language;
  final String occupation;

  UserProfile({
    required this.name,
    required this.state,
    required this.language,
    required this.occupation,
  });

  factory UserProfile.empty() =>
      UserProfile(name: '', state: '', language: 'English', occupation: '');

  UserProfile copyWith(
          {String? name,
          String? state,
          String? language,
          String? occupation}) =>
      UserProfile(
        name: name ?? this.name,
        state: state ?? this.state,
        language: language ?? this.language,
        occupation: occupation ?? this.occupation,
      );
}

class UserProfileNotifier extends Notifier<UserProfile> {
  Box get _box => Hive.box('credoraBox');

  @override
  UserProfile build() {
    return UserProfile(
      name: _box.get('name', defaultValue: ''),
      state: _box.get('state', defaultValue: ''),
      language: _box.get('language', defaultValue: 'English'),
      occupation: _box.get('occupation', defaultValue: ''),
    );
  }

  Future<void> updateProfile(UserProfile profile) async {
    await _box.put('name', profile.name);
    await _box.put('state', profile.state);
    await _box.put('language', profile.language);
    await _box.put('occupation', profile.occupation);
    state = profile;
  }
}

final userProfileProvider =
    NotifierProvider<UserProfileNotifier, UserProfile>(() {
  return UserProfileNotifier();
});

// ─── Backend UserProfile ─────────────────────────────────────────────────────

class BackendUserProfile {
  final String id;
  final String fullName;
  final String passportCode;
  final String passportId;
  final String preferredLanguage;
  final String? phone;
  final String? state;
  final String? occupationCategory;

  BackendUserProfile({
    required this.id,
    required this.fullName,
    required this.passportCode,
    required this.passportId,
    required this.preferredLanguage,
    this.phone,
    this.state,
    this.occupationCategory,
  });

  factory BackendUserProfile.fromJson(Map<String, dynamic> json) {
    return BackendUserProfile(
      id: json['id']?.toString() ?? '',
      fullName: json['full_name']?.toString() ?? '',
      passportCode: json['passport_code']?.toString() ?? '',
      passportId: json['passport_id']?.toString() ?? '',
      preferredLanguage: json['preferred_language']?.toString() ?? 'English',
      phone: json['phone']?.toString(),
      state: json['state']?.toString(),
      occupationCategory: json['occupation_category']?.toString(),
    );
  }
}

class BackendUserNotifier
    extends AsyncNotifier<BackendUserProfile?> {
  @override
  Future<BackendUserProfile?> build() async {
    return _fetchFromBackend();
  }

  Future<BackendUserProfile?> _fetchFromBackend() async {
    try {
      final api = ref.read(apiServiceProvider);
      final data = await api.getMe();
      final profile = BackendUserProfile.fromJson(data);
      // Sync to local Hive cache
      final box = Hive.box('credoraBox');
      await box.put('passport_id', profile.passportId);
      await box.put('passport_code', profile.passportCode);
      return profile;
    } catch (e) {
      debugPrint('BackendUserNotifier fetch error: $e');
      return null;
    }
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_fetchFromBackend);
  }

  Future<BackendUserProfile?> createOrUpdate({
    required String fullName,
    required String preferredLanguage,
    String? phone,
    String? state,
    String? occupationCategory,
  }) async {
    try {
      final api = ref.read(apiServiceProvider);
      final data = await api.createOrUpdateProfile(
        fullName: fullName,
        preferredLanguage: preferredLanguage,
        phone: phone,
        state: state,
        occupationCategory: occupationCategory,
      );
      final profile = BackendUserProfile.fromJson(data);
      // Sync to local Hive cache
      final box = Hive.box('credoraBox');
      await box.put('passport_id', profile.passportId);
      await box.put('passport_code', profile.passportCode);
      this.state = AsyncData(profile);
      return profile;
    } catch (e) {
      debugPrint('BackendUserNotifier createOrUpdate error: $e');
      rethrow;
    }
  }
}

final backendUserProvider =
    AsyncNotifierProvider<BackendUserNotifier, BackendUserProfile?>(() {
  return BackendUserNotifier();
});

// ─── Passport Skill Model ────────────────────────────────────────────────────

class PassportSkill {
  final String id;
  final String skillName;
  final String skillLevel;
  final int nsqfLevel;
  final double confidenceScore;
  final String verificationStatus;
  final bool isVerified;

  PassportSkill({
    required this.id,
    required this.skillName,
    required this.skillLevel,
    required this.nsqfLevel,
    required this.confidenceScore,
    required this.verificationStatus,
    required this.isVerified,
  });

  factory PassportSkill.fromJson(Map<String, dynamic> json) {
    return PassportSkill(
      id: json['id']?.toString() ?? '',
      skillName: json['skill_name']?.toString() ?? '',
      skillLevel: json['skill_level']?.toString() ?? 'Beginner',
      nsqfLevel: (json['nsqf_level'] as num?)?.toInt() ?? 1,
      confidenceScore: (json['confidence_score'] as num?)?.toDouble() ?? 0.0,
      verificationStatus:
          json['verification_status']?.toString() ?? 'pending',
      isVerified: json['is_verified'] == true,
    );
  }
}

class PassportData {
  final String id;
  final String passportCode;
  final List<PassportSkill> skills;

  PassportData({
    required this.id,
    required this.passportCode,
    required this.skills,
  });

  factory PassportData.fromJson(Map<String, dynamic> json) {
    final rawSkills = json['skills'] as List<dynamic>? ?? [];
    return PassportData(
      id: json['id']?.toString() ?? '',
      passportCode: json['passport_code']?.toString() ?? '',
      skills: rawSkills
          .map((s) => PassportSkill.fromJson(s as Map<String, dynamic>))
          .toList(),
    );
  }
}

class PassportNotifier extends AsyncNotifier<PassportData?> {
  @override
  Future<PassportData?> build() async {
    return _fetch();
  }

  Future<PassportData?> _fetch() async {
    try {
      final api = ref.read(apiServiceProvider);
      final data = await api.getPassport();
      return PassportData.fromJson(data);
    } catch (e) {
      debugPrint('PassportNotifier fetch error: $e');
      return null;
    }
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_fetch);
  }

  Future<void> addSkill({
    required String skillName,
    String? skillLevel,
    int? nsqfLevel,
    double? confidenceScore,
    String? verificationStatus,
  }) async {
    try {
      final api = ref.read(apiServiceProvider);
      await api.addSkill(
        skillName: skillName,
        skillLevel: skillLevel,
        nsqfLevel: nsqfLevel,
        confidenceScore: confidenceScore,
        verificationStatus: verificationStatus,
      );
      await refresh();
    } catch (e) {
      debugPrint('PassportNotifier addSkill error: $e');
      rethrow;
    }
  }

  Future<void> deleteSkill(String id) async {
    try {
      final api = ref.read(apiServiceProvider);
      await api.deleteSkill(id);
      await refresh();
    } catch (e) {
      debugPrint('PassportNotifier deleteSkill error: $e');
      rethrow;
    }
  }
}

final passportProvider =
    AsyncNotifierProvider<PassportNotifier, PassportData?>(() {
  return PassportNotifier();
});
