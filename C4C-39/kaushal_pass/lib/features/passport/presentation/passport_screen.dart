import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/services/api_service.dart';
import '../../profile/data/user_provider.dart';

class PassportScreen extends ConsumerStatefulWidget {
  const PassportScreen({super.key});

  @override
  ConsumerState<PassportScreen> createState() => _PassportScreenState();
}

class _PassportScreenState extends ConsumerState<PassportScreen> {
  bool _generatingCert = false;

  @override
  void initState() {
    super.initState();
    // Refresh passport data when screen opens
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(passportProvider.notifier).refresh();
    });
  }

  Future<void> _downloadCertificate() async {
    setState(() => _generatingCert = true);
    try {
      final api = ref.read(apiServiceProvider);
      final result = await api.generateCertificate();
      final downloadUrl = result['download_url']?.toString();
      final jobId = result['job_id']?.toString();

      if (downloadUrl != null && downloadUrl.isNotEmpty) {
        await _openUrl(downloadUrl);
      } else if (jobId != null) {
        // Poll for completion
        await _pollCertificate(api, jobId);
      }
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Certificate error: ${e.message}'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to generate certificate'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _generatingCert = false);
    }
  }

  Future<void> _pollCertificate(ApiService api, String jobId) async {
    for (int i = 0; i < 10; i++) {
      await Future.delayed(const Duration(seconds: 2));
      try {
        final status = await api.getCertificateStatus(jobId);
        final downloadUrl = status['download_url']?.toString();
        if (downloadUrl != null && downloadUrl.isNotEmpty) {
          await _openUrl(downloadUrl);
          return;
        }
        if (status['status'] == 'failed') break;
      } catch (_) {
        break;
      }
    }
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Certificate generation timed out')),
      );
    }
  }

  Future<void> _openUrl(String url) async {
    // Copy URL to clipboard and show snackbar
    await Clipboard.setData(ClipboardData(text: url));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Certificate URL copied: $url'),
          action: SnackBarAction(
            label: 'OK',
            onPressed: () {},
          ),
        ),
      );
    }
  }

  Future<void> _deleteSkill(String skillId, String skillName) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Remove Skill'),
        content: Text('Remove "$skillName" from your passport?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(
                backgroundColor: Colors.redAccent),
            child: const Text('Remove'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await ref.read(passportProvider.notifier).deleteSkill(skillId);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Skill removed')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to remove skill')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final passportAsync = ref.watch(passportProvider);
    final backendUser = ref.watch(backendUserProvider);
    final localUser = ref.watch(userProfileProvider);

    final displayName =
        backendUser.valueOrNull?.fullName ?? localUser.name;
    final passportId = backendUser.valueOrNull?.passportId ?? '';
    final passportCode = backendUser.valueOrNull?.passportCode ?? '';
    final qrData = passportId.isNotEmpty
        ? 'https://kaushalpass.in/verify/$passportId'
        : 'https://kaushalpass.in';

    return Scaffold(
      backgroundColor: Colors.white,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Digital Skill Passport',
            style: TextStyle(color: Colors.black87)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.black87),
            onPressed: () =>
                ref.read(passportProvider.notifier).refresh(),
          ),
        ],
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
              children: [
                // Passport card
                Container(
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(32),
                    boxShadow: [
                      BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 20,
                          offset: const Offset(0, 10))
                    ],
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Container(
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                  color: const Color(0xFF7C3AED),
                                  width: 2),
                            ),
                            child: const CircleAvatar(
                              radius: 32,
                              backgroundImage: NetworkImage(
                                  'https://i.pravatar.cc/150?img=47'),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment:
                                  CrossAxisAlignment.start,
                              children: [
                                Text(
                                  displayName.isNotEmpty
                                      ? displayName
                                      : 'Unknown User',
                                  style: const TextStyle(
                                      color: Colors.black87,
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold),
                                ),
                                if (passportCode.isNotEmpty)
                                  Text(
                                    'ID: $passportCode',
                                    style: const TextStyle(
                                        color: Colors.black54,
                                        fontSize: 13),
                                  ),
                              ],
                            ),
                          ),
                          const Icon(Icons.verified,
                              color: Colors.blueAccent, size: 36),
                        ],
                      ),
                      const SizedBox(height: 32),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                                color: Colors.black.withValues(alpha: 0.03),
                                blurRadius: 10,
                                offset: const Offset(0, 5))
                          ],
                        ),
                        child: QrImageView(
                          data: qrData,
                          version: QrVersions.auto,
                          size: 200.0,
                          eyeStyle: const QrEyeStyle(
                              eyeShape: QrEyeShape.square,
                              color: Color(0xFF7C3AED)),
                          dataModuleStyle: const QrDataModuleStyle(
                              dataModuleShape:
                                  QrDataModuleShape.square,
                              color: Colors.black87),
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Scan to Verify Skills',
                        style: TextStyle(
                            color: Colors.black54,
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.5),
                      ),
                    ],
                  ),
                ).animate().fadeIn(duration: 600.ms).slideY(begin: -0.1),

                const SizedBox(height: 40),

                // Skills section
                const Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Verified Skills',
                    style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87),
                  ),
                ).animate().fadeIn(delay: 400.ms),
                const SizedBox(height: 16),

                passportAsync.when(
                  loading: () => const Center(
                    child: Padding(
                      padding: EdgeInsets.all(32),
                      child: CircularProgressIndicator(
                          color: Color(0xFF7C3AED)),
                    ),
                  ),
                  error: (e, _) => Center(
                    child: Column(
                      children: [
                        const Icon(Icons.error_outline,
                            color: Colors.redAccent, size: 48),
                        const SizedBox(height: 8),
                        Text('Failed to load passport: $e',
                            style: const TextStyle(
                                color: Colors.black54)),
                        const SizedBox(height: 16),
                        FilledButton(
                          onPressed: () => ref
                              .read(passportProvider.notifier)
                              .refresh(),
                          style: FilledButton.styleFrom(
                              backgroundColor:
                                  const Color(0xFF7C3AED)),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                  data: (passport) {
                    if (passport == null || passport.skills.isEmpty) {
                      return Container(
                        padding: const EdgeInsets.all(32),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                                color: Colors.black
                                    .withValues(alpha: 0.05),
                                blurRadius: 10,
                                offset: const Offset(0, 4))
                          ],
                        ),
                        child: const Column(
                          children: [
                            Icon(Icons.workspace_premium_outlined,
                                color: Colors.black26, size: 48),
                            SizedBox(height: 12),
                            Text(
                              'No skills yet.\nComplete an assessment to add skills.',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                  color: Colors.black54,
                                  fontSize: 15),
                            ),
                          ],
                        ),
                      );
                    }

                    return ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: passport.skills.length,
                      itemBuilder: (context, index) {
                        final skill = passport.skills[index];
                        return _buildSkillTile(skill, index)
                            .animate()
                            .fadeIn(
                                delay: Duration(
                                    milliseconds: 600 + index * 150))
                            .slideX(begin: 0.2);
                      },
                    );
                  },
                ),

                const SizedBox(height: 40),

                // Download Certificate button
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed:
                        _generatingCert ? null : _downloadCertificate,
                    icon: _generatingCert
                        ? const SizedBox(
                            height: 18,
                            width: 18,
                            child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Color(0xFF7C3AED)),
                          )
                        : const Icon(Icons.picture_as_pdf,
                            color: Color(0xFF7C3AED)),
                    label: Text(
                      _generatingCert
                          ? 'Generating...'
                          : 'Download PDF Certificate',
                    ),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF7C3AED),
                      side: const BorderSide(
                          color: Color(0xFF7C3AED), width: 2),
                      padding:
                          const EdgeInsets.symmetric(vertical: 20),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                      textStyle: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                ).animate().fadeIn(delay: 1000.ms),

                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSkillTile(PassportSkill skill, int index) {
    final verificationColor = skill.isVerified
        ? Colors.green
        : skill.verificationStatus == 'ai_verified'
            ? Colors.blue
            : Colors.orange;

    final verificationLabel = skill.isVerified
        ? 'Verified'
        : skill.verificationStatus == 'ai_verified'
            ? 'AI Verified'
            : 'Pending';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
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
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Colors.amber.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.star, color: Colors.amber),
        ),
        title: Text(skill.skillName,
            style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.black87,
                fontSize: 16)),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 6),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'NSQF Level ${skill.nsqfLevel} • ${skill.skillLevel}',
                style: const TextStyle(color: Colors.black54),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: verificationColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      verificationLabel,
                      style: TextStyle(
                          color: verificationColor,
                          fontSize: 11,
                          fontWeight: FontWeight.w600),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${(skill.confidenceScore * 100).toStringAsFixed(0)}% confidence',
                    style: const TextStyle(
                        color: Colors.black38, fontSize: 11),
                  ),
                ],
              ),
            ],
          ),
        ),
        trailing: IconButton(
          icon: const Icon(Icons.delete_outline,
              color: Colors.black26, size: 20),
          onPressed: () => _deleteSkill(skill.id, skill.skillName),
        ),
      ),
    );
  }
}
