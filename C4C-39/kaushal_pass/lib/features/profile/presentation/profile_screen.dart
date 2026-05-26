import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hive/hive.dart';
import '../data/user_provider.dart';
import '../../../core/localization/app_localizations.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/auth_service.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _isSyncing = false;

  static const _languageCodes = {
    'English': 'en-IN',
    'Hindi': 'hi-IN',
    'Tamil': 'ta-IN',
    'Telugu': 'te-IN',
    'Kannada': 'kn-IN',
    'Bengali': 'bn-IN',
    'Marathi': 'mr-IN',
    'Gujarati': 'gu-IN',
  };

  void _showLanguagePicker(
      BuildContext context, WidgetRef ref, String currentLang) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 16),
              Text(
                AppLocales.get('change_language', currentLang),
                style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87),
              ),
              const SizedBox(height: 16),
              ...['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Bengali']
                  .map((lang) {
                return ListTile(
                  title: Text(lang,
                      style: TextStyle(
                          color: lang == currentLang
                              ? const Color(0xFF7C3AED)
                              : Colors.black87)),
                  trailing: lang == currentLang
                      ? const Icon(Icons.check, color: Color(0xFF7C3AED))
                      : null,
                  onTap: () async {
                    final user = ref.read(userProfileProvider);
                    await ref
                        .read(userProfileProvider.notifier)
                        .updateProfile(user.copyWith(language: lang));
                    if (context.mounted) Navigator.pop(context);
                    // Sync language change to backend
                    _syncToBackend(ref, user.copyWith(language: lang));
                  },
                );
              }),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }

  Future<void> _syncToBackend(WidgetRef ref, UserProfile user) async {
    if (!mounted) return;
    setState(() => _isSyncing = true);
    try {
      final langCode = _languageCodes[user.language] ?? 'en-IN';
      await ref.read(backendUserProvider.notifier).createOrUpdate(
            fullName: user.name,
            preferredLanguage: langCode,
            state: user.state,
            occupationCategory: user.occupation,
          );
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Sync failed: ${e.message}')),
        );
      }
    } catch (_) {
      // Silently fail — local data is still saved
    } finally {
      if (mounted) setState(() => _isSyncing = false);
    }
  }

  Future<void> _logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(
                backgroundColor: Colors.redAccent),
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      try {
        await ref.read(authServiceProvider).signOut();
      } catch (_) {}
      await Hive.box('credoraBox').clear();
      if (mounted) context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(userProfileProvider);
    final backendUser = ref.watch(backendUserProvider);

    final displayName =
        backendUser.valueOrNull?.fullName ?? user.name;
    final passportCode =
        backendUser.valueOrNull?.passportCode ?? '';

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(AppLocales.get('profile', user.language),
            style: const TextStyle(color: Colors.black87)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
        actions: [
          if (_isSyncing)
            const Padding(
              padding: EdgeInsets.only(right: 16),
              child: Center(
                child: SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: Color(0xFF7C3AED)),
                ),
              ),
            ),
        ],
      ),
      body: Container(
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFFFEAD2), Color(0xFFE6EFFF)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              const CircleAvatar(
                radius: 50,
                backgroundImage:
                    NetworkImage('https://i.pravatar.cc/150?img=47'),
              ),
              const SizedBox(height: 16),
              Text(
                displayName.isNotEmpty ? displayName : 'Unknown User',
                style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87),
              ),
              if (passportCode.isNotEmpty)
                Text(
                  'ID: $passportCode',
                  style: const TextStyle(
                      fontSize: 15, color: Colors.black54),
                ),
              const SizedBox(height: 32),

              _buildProfileItem(
                Icons.location_on,
                AppLocales.get('state', user.language),
                user.state.isEmpty ? 'Not set' : user.state,
              ),
              _buildProfileItem(
                Icons.language,
                AppLocales.get('language', user.language),
                user.language,
                onTap: () => _showLanguagePicker(
                    context, ref, user.language),
              ),
              _buildProfileItem(
                Icons.work,
                AppLocales.get('occupation', user.language),
                user.occupation.isEmpty ? 'Not set' : user.occupation,
              ),

              // Backend sync status
              if (backendUser.hasValue && backendUser.valueOrNull != null)
                Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.green.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                        color: Colors.green.withValues(alpha: 0.3)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.cloud_done,
                          color: Colors.green, size: 20),
                      SizedBox(width: 8),
                      Text('Profile synced with backend',
                          style: TextStyle(
                              color: Colors.green, fontSize: 14)),
                    ],
                  ),
                ),

              if (backendUser.hasError)
                Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.orange.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                        color: Colors.orange.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.cloud_off,
                          color: Colors.orange, size: 20),
                      const SizedBox(width: 8),
                      const Expanded(
                        child: Text('Offline mode — changes saved locally',
                            style: TextStyle(
                                color: Colors.orange, fontSize: 14)),
                      ),
                      TextButton(
                        onPressed: () =>
                            ref.read(backendUserProvider.notifier).refresh(),
                        child: const Text('Retry',
                            style: TextStyle(color: Colors.orange)),
                      ),
                    ],
                  ),
                ),

              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: _logout,
                  icon: const Icon(Icons.logout, color: Colors.white),
                  label: Text(AppLocales.get('logout', user.language)),
                  style: FilledButton.styleFrom(
                    backgroundColor: Colors.redAccent,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileItem(IconData icon, String title, String value,
      {VoidCallback? onTap}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 5))
        ],
      ),
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFF7C3AED)),
        title: Text(title,
            style: const TextStyle(color: Colors.black54, fontSize: 14)),
        subtitle: Text(value,
            style: const TextStyle(
                color: Colors.black87,
                fontSize: 18,
                fontWeight: FontWeight.w500)),
        trailing: onTap != null
            ? const Icon(Icons.edit, color: Colors.black26)
            : null,
        onTap: onTap,
      ),
    );
  }
}
