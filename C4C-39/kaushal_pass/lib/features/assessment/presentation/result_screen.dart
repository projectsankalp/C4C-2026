import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/api_service.dart';
import '../../profile/data/user_provider.dart';

class ResultScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic> result;

  const ResultScreen({super.key, required this.result});

  @override
  ConsumerState<ResultScreen> createState() => _ResultScreenState();
}

class _ResultScreenState extends ConsumerState<ResultScreen> {
  bool _addingToPassport = false;
  bool _addedToPassport = false;
  List<Map<String, dynamic>> _schemes = [];
  bool _loadingSchemes = false;

  // Parsed result fields
  late String _skillName;
  late String _skillLevel;
  late int _nsqfLevel;
  late double _confidence;
  late String _reasoning;
  late List<String> _suggestedDocuments;
  late List<String> _verifiedSkills;

  @override
  void initState() {
    super.initState();
    _parseResult();
    _loadSchemes();
  }

  void _parseResult() {
    final r = widget.result;
    _skillName = r['skill_name']?.toString() ??
        r['skillName']?.toString() ??
        'Assessed Skill';
    _skillLevel = r['skill_level']?.toString() ??
        r['skillLevel']?.toString() ??
        'Intermediate';
    _nsqfLevel = (r['nsqf_level'] as num?)?.toInt() ??
        (r['nsqfLevel'] as num?)?.toInt() ??
        3;
    _confidence = (r['confidence_score'] as num?)?.toDouble() ??
        (r['confidence'] as num?)?.toDouble() ??
        0.75;
    _reasoning = r['reasoning']?.toString() ??
        r['analysis']?.toString() ??
        'Your skill has been assessed by our AI system.';
    final rawDocs = r['suggested_documents'] ?? r['suggestedDocuments'];
    _suggestedDocuments = rawDocs is List
        ? rawDocs.map((e) => e.toString()).toList()
        : <String>[];
    final rawSkills = r['verified_skills'] ?? r['verifiedSkills'];
    _verifiedSkills = rawSkills is List
        ? rawSkills.map((e) => e.toString()).toList()
        : <String>[];
  }

  Future<void> _loadSchemes() async {
    setState(() => _loadingSchemes = true);
    try {
      final api = ref.read(apiServiceProvider);
      final data = await api.autoRecommendSchemes();
      final rawSchemes = data['schemes'] as List<dynamic>? ?? [];
      setState(() {
        _schemes = rawSchemes
            .take(3)
            .map((s) => s as Map<String, dynamic>)
            .toList();
        _loadingSchemes = false;
      });
    } catch (e) {
      debugPrint('Schemes load error: $e');
      setState(() => _loadingSchemes = false);
    }
  }

  Future<void> _addToPassport() async {
    setState(() => _addingToPassport = true);
    try {
      await ref.read(passportProvider.notifier).addSkill(
            skillName: _skillName,
            skillLevel: _skillLevel,
            nsqfLevel: _nsqfLevel,
            confidenceScore: _confidence,
            verificationStatus: 'ai_verified',
          );
      setState(() {
        _addingToPassport = false;
        _addedToPassport = true;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Skill added to your passport!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } on ApiException catch (e) {
      setState(() => _addingToPassport = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to add skill: ${e.message}'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } catch (e) {
      setState(() => _addingToPassport = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to add skill. Please try again.'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final confidencePct = (_confidence * 100).toStringAsFixed(0);

    return Scaffold(
      backgroundColor: Colors.white,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('AI Analysis Result',
            style: TextStyle(color: Colors.black87)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
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
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 20),
                const Icon(Icons.verified, size: 80, color: Colors.green)
                    .animate()
                    .scale(duration: 600.ms, curve: Curves.easeOutBack)
                    .shimmer(duration: 1.seconds),
                const SizedBox(height: 16),
                Text(
                  _skillName,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87),
                ).animate().fadeIn(delay: 200.ms).slideY(),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildChip('NSQF Level $_nsqfLevel',
                        const Color(0xFF7C3AED)),
                    const SizedBox(width: 8),
                    _buildChip(_skillLevel, Colors.blue),
                    const SizedBox(width: 8),
                    _buildChip('$confidencePct% Confidence', Colors.green),
                  ],
                ).animate().fadeIn(delay: 400.ms).scale(),

                const SizedBox(height: 32),

                // AI Reasoning
                _buildSectionHeader(
                    'AI Assessment', Icons.psychology_outlined),
                _buildGlassCard(
                  child: Text(
                    _reasoning,
                    style: const TextStyle(
                        color: Colors.black87, fontSize: 15, height: 1.6),
                  ),
                ).animate().fadeIn(delay: 500.ms).slideX(begin: -0.2),

                if (_verifiedSkills.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  _buildSectionHeader(
                      'Verified Skills', Icons.check_circle_outline),
                  _buildGlassCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: _verifiedSkills
                          .map((s) => _buildBulletPoint(s))
                          .toList(),
                    ),
                  ).animate().fadeIn(delay: 600.ms).slideX(begin: -0.2),
                ],

                if (_suggestedDocuments.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  _buildSectionHeader(
                      'Suggested Documents', Icons.folder_outlined),
                  _buildGlassCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: _suggestedDocuments
                          .map((d) => _buildDocumentItem(d))
                          .toList(),
                    ),
                  ).animate().fadeIn(delay: 700.ms).slideX(begin: 0.2),
                ],

                // Scheme Recommendations
                const SizedBox(height: 24),
                _buildSectionHeader(
                    'Recommended Schemes', Icons.account_balance_outlined),
                if (_loadingSchemes)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: CircularProgressIndicator(
                          color: Color(0xFF7C3AED)),
                    ),
                  )
                else if (_schemes.isEmpty)
                  _buildGlassCard(
                    child: const Text(
                      'No schemes found for your profile.',
                      style: TextStyle(color: Colors.black54),
                    ),
                  )
                else
                  ..._schemes.asMap().entries.map((entry) {
                    final i = entry.key;
                    final scheme = entry.value;
                    return _buildSchemeCard(scheme)
                        .animate()
                        .fadeIn(delay: (800 + i * 150).ms)
                        .slideY(begin: 0.2);
                  }),

                const SizedBox(height: 40),

                // Add to Passport button
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: (_addingToPassport || _addedToPassport)
                        ? null
                        : _addToPassport,
                    icon: _addedToPassport
                        ? const Icon(Icons.check, color: Colors.white)
                        : const Icon(Icons.wallet, color: Colors.white),
                    label: _addingToPassport
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white),
                          )
                        : Text(
                            _addedToPassport
                                ? 'Added to Passport'
                                : 'Add to Passport',
                            style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold),
                          ),
                    style: FilledButton.styleFrom(
                      backgroundColor: _addedToPassport
                          ? Colors.green
                          : const Color(0xFF7C3AED),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 20),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                  ),
                ).animate().fadeIn(delay: 1000.ms).slideY(begin: 0.2, end: 0),

                const SizedBox(height: 16),

                OutlinedButton.icon(
                  onPressed: () => context.push('/passport'),
                  icon: const Icon(Icons.badge_outlined,
                      color: Color(0xFF7C3AED)),
                  label: const Text('View Passport'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF7C3AED),
                    side: const BorderSide(color: Color(0xFF7C3AED)),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                ).animate().fadeIn(delay: 1100.ms),

                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(label,
          style: TextStyle(
              color: color, fontWeight: FontWeight.bold, fontSize: 13)),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF7C3AED), size: 20),
          const SizedBox(width: 8),
          Text(title,
              style: const TextStyle(
                  color: Colors.black87,
                  fontSize: 18,
                  fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildGlassCard({required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 20,
              offset: const Offset(0, 10))
        ],
      ),
      child: child,
    );
  }

  Widget _buildBulletPoint(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('• ',
              style: TextStyle(
                  color: Color(0xFF7C3AED),
                  fontSize: 16,
                  fontWeight: FontWeight.bold)),
          Expanded(
              child: Text(text,
                  style: const TextStyle(
                      color: Colors.black87, fontSize: 14))),
        ],
      ),
    );
  }

  Widget _buildDocumentItem(String doc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          const Icon(Icons.description_outlined,
              color: Color(0xFF7C3AED), size: 18),
          const SizedBox(width: 8),
          Expanded(
              child: Text(doc,
                  style: const TextStyle(
                      color: Colors.black87, fontSize: 14))),
        ],
      ),
    );
  }

  Widget _buildSchemeCard(Map<String, dynamic> scheme) {
    final name = scheme['name']?.toString() ?? 'Scheme';
    final tagline = scheme['tagline']?.toString() ?? '';
    final benefits = scheme['benefits']?.toString() ?? '';
    final benefitsList = benefits.isNotEmpty
        ? benefits.split('.').where((s) => s.trim().isNotEmpty).take(2).toList()
        : <String>[];

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF7C3AED).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.account_balance,
                    color: Color(0xFF7C3AED), size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name,
                        style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                            fontSize: 15)),
                    if (tagline.isNotEmpty)
                      Text(tagline,
                          style: const TextStyle(
                              color: Colors.black54, fontSize: 12)),
                  ],
                ),
              ),
            ],
          ),
          if (benefitsList.isNotEmpty) ...[
            const SizedBox(height: 10),
            ...benefitsList.map((b) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.check_circle,
                          color: Colors.green, size: 14),
                      const SizedBox(width: 6),
                      Expanded(
                          child: Text(b,
                              style: const TextStyle(
                                  color: Colors.black54,
                                  fontSize: 13))),
                    ],
                  ),
                )),
          ],
        ],
      ),
    );
  }
}
