import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/services/api_service.dart';
import '../../profile/data/user_provider.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _stateController = TextEditingController();

  String _selectedLanguage = 'English';
  String _selectedOccupation = 'Artisan';
  bool _isLoading = false;
  String? _errorMessage;

  static const _languages = [
    'English',
    'Hindi',
    'Tamil',
    'Telugu',
    'Kannada',
    'Bengali',
    'Marathi',
    'Gujarati',
  ];

  static const _occupations = [
    'Artisan',
    'Farmer',
    'Trader',
    'Service Provider',
    'Construction Worker',
    'Domestic Worker',
    'Healthcare Worker',
    'Other',
  ];

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

  @override
  void dispose() {
    _nameController.dispose();
    _stateController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final langCode = _languageCodes[_selectedLanguage] ?? 'en-IN';

      // Save to backend
      await ref.read(backendUserProvider.notifier).createOrUpdate(
            fullName: _nameController.text.trim(),
            preferredLanguage: langCode,
            state: _stateController.text.trim(),
            occupationCategory: _selectedOccupation,
          );

      // Save to local Hive
      await ref.read(userProfileProvider.notifier).updateProfile(
            UserProfile(
              name: _nameController.text.trim(),
              state: _stateController.text.trim(),
              language: _selectedLanguage,
              occupation: _selectedOccupation,
            ),
          );

      if (mounted) context.go('/dashboard');
    } on ApiException catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = e.message;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Something went wrong. Please try again.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFFFEAD2), Color(0xFFE6EFFF)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 40),
                  const Icon(Icons.person_add_alt_1,
                          size: 72, color: Color(0xFF7C3AED))
                      .animate()
                      .scale(duration: 600.ms, curve: Curves.easeOutBack),
                  const SizedBox(height: 16),
                  Text(
                    'Tell us about yourself',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                    textAlign: TextAlign.center,
                  ).animate().fadeIn(delay: 200.ms),
                  const SizedBox(height: 8),
                  Text(
                    'This helps us personalise your experience',
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(color: Colors.black54),
                    textAlign: TextAlign.center,
                  ).animate().fadeIn(delay: 300.ms),
                  const SizedBox(height: 40),
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                            color: Colors.black.withValues(alpha: 0.05),
                            blurRadius: 20,
                            offset: const Offset(0, 10))
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Full Name
                        TextFormField(
                          controller: _nameController,
                          style: const TextStyle(color: Colors.black87),
                          decoration: InputDecoration(
                            labelText: 'Full Name',
                            labelStyle:
                                const TextStyle(color: Colors.black54),
                            prefixIcon: const Icon(Icons.person,
                                color: Colors.black54),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide:
                                  const BorderSide(color: Colors.black12),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: const BorderSide(
                                  color: Color(0xFF7C3AED)),
                            ),
                            errorBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide:
                                  const BorderSide(color: Colors.redAccent),
                            ),
                            focusedErrorBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide:
                                  const BorderSide(color: Colors.redAccent),
                            ),
                            filled: true,
                            fillColor:
                                Colors.black.withValues(alpha: 0.03),
                          ),
                          validator: (v) => (v == null || v.trim().isEmpty)
                              ? 'Please enter your name'
                              : null,
                        ),
                        const SizedBox(height: 16),

                        // State
                        TextFormField(
                          controller: _stateController,
                          style: const TextStyle(color: Colors.black87),
                          decoration: InputDecoration(
                            labelText: 'State',
                            labelStyle:
                                const TextStyle(color: Colors.black54),
                            prefixIcon: const Icon(Icons.location_on,
                                color: Colors.black54),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide:
                                  const BorderSide(color: Colors.black12),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: const BorderSide(
                                  color: Color(0xFF7C3AED)),
                            ),
                            filled: true,
                            fillColor:
                                Colors.black.withValues(alpha: 0.03),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Language
                        DropdownButtonFormField<String>(
                          value: _selectedLanguage,
                          decoration: InputDecoration(
                            labelText: 'Preferred Language',
                            labelStyle:
                                const TextStyle(color: Colors.black54),
                            prefixIcon: const Icon(Icons.language,
                                color: Colors.black54),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide:
                                  const BorderSide(color: Colors.black12),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: const BorderSide(
                                  color: Color(0xFF7C3AED)),
                            ),
                            filled: true,
                            fillColor:
                                Colors.black.withValues(alpha: 0.03),
                          ),
                          dropdownColor: Colors.white,
                          style: const TextStyle(
                              color: Colors.black87, fontSize: 16),
                          items: _languages
                              .map((l) => DropdownMenuItem(
                                  value: l, child: Text(l)))
                              .toList(),
                          onChanged: (v) {
                            if (v != null) {
                              setState(() => _selectedLanguage = v);
                            }
                          },
                        ),
                        const SizedBox(height: 16),

                        // Occupation
                        DropdownButtonFormField<String>(
                          value: _selectedOccupation,
                          decoration: InputDecoration(
                            labelText: 'Occupation Category',
                            labelStyle:
                                const TextStyle(color: Colors.black54),
                            prefixIcon: const Icon(Icons.work,
                                color: Colors.black54),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide:
                                  const BorderSide(color: Colors.black12),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: const BorderSide(
                                  color: Color(0xFF7C3AED)),
                            ),
                            filled: true,
                            fillColor:
                                Colors.black.withValues(alpha: 0.03),
                          ),
                          dropdownColor: Colors.white,
                          style: const TextStyle(
                              color: Colors.black87, fontSize: 16),
                          items: _occupations
                              .map((o) => DropdownMenuItem(
                                  value: o, child: Text(o)))
                              .toList(),
                          onChanged: (v) {
                            if (v != null) {
                              setState(() => _selectedOccupation = v);
                            }
                          },
                        ),

                        if (_errorMessage != null) ...[
                          const SizedBox(height: 12),
                          Text(
                            _errorMessage!,
                            style: const TextStyle(
                                color: Colors.redAccent, fontSize: 14),
                            textAlign: TextAlign.center,
                          ),
                        ],

                        const SizedBox(height: 24),
                        SizedBox(
                          width: double.infinity,
                          child: FilledButton(
                            onPressed: _isLoading ? null : _submit,
                            style: FilledButton.styleFrom(
                              backgroundColor: const Color(0xFF7C3AED),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(
                                  vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                            ),
                            child: _isLoading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.white),
                                  )
                                : const Text('Get Started',
                                    style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ],
                    ),
                  ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.2, end: 0),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
