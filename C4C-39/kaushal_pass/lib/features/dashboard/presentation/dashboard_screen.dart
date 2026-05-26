import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../profile/data/user_provider.dart';
import '../../../core/localization/app_localizations.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProfileProvider);
    final backendUser = ref.watch(backendUserProvider);
    final passportAsync = ref.watch(passportProvider);
    final lang = user.language;

    final displayName = backendUser.valueOrNull?.fullName.isNotEmpty == true
        ? backendUser.valueOrNull!.fullName.split(' ')[0]
        : user.name.isNotEmpty
            ? user.name.split(' ')[0]
            : 'User';

    return Scaffold(
      backgroundColor: Colors.white,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text(AppLocales.get('dashboard', lang),
            style: const TextStyle(
                color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            decoration: const BoxDecoration(
              color: Color(0xFF7C3AED),
              shape: BoxShape.circle,
            ),
            child: IconButton(
              icon: const Icon(Icons.person, color: Colors.white),
              onPressed: () => context.push('/profile'),
            ),
          ).animate().scale(delay: 400.ms),
        ],
      ),
      body: Container(
        height: MediaQuery.of(context).size.height,
        width: double.infinity,
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
                RichText(
                  text: TextSpan(
                    style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                        height: 1.2),
                    children: [
                      TextSpan(
                          text: "${AppLocales.get('welcome', lang)},\n"),
                      TextSpan(
                          text: '$displayName!',
                          style: const TextStyle(
                              color: Color(0xFF7C3AED))),
                    ],
                  ),
                ).animate().fadeIn(duration: 600.ms).slideX(begin: -0.2),
                const SizedBox(height: 8),
                Text(
                  AppLocales.get('verify_skills', lang),
                  style: const TextStyle(fontSize: 16, color: Colors.black54),
                ).animate().fadeIn(delay: 200.ms).slideX(begin: -0.2),
                const SizedBox(height: 40),

                // Assessment CTA
                GestureDetector(
                  onTap: () => context.push('/assessment'),
                  child: Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(28),
                      boxShadow: [
                        BoxShadow(
                            color: Colors.black.withValues(alpha: 0.05),
                            blurRadius: 20,
                            offset: const Offset(0, 10))
                      ],
                    ),
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFF7C3AED)
                                .withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.mic,
                              color: Color(0xFF7C3AED), size: 48),
                        ).animate(onPlay: (c) => c.repeat(reverse: true))
                            .scale(
                                duration: 1.seconds,
                                begin: const Offset(0.95, 0.95)),
                        const SizedBox(height: 24),
                        Text(
                          AppLocales.get('start_assessment', lang),
                          style: const TextStyle(
                              color: Colors.black87,
                              fontSize: 22,
                              fontWeight: FontWeight.bold),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          AppLocales.get('record_work', lang),
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                              color: Colors.black54, fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.2, end: 0),

                const SizedBox(height: 24),

                // Quick actions row
                Row(
                  children: [
                    Expanded(
                      child: _buildQuickAction(
                        context,
                        icon: Icons.account_balance,
                        label: 'Schemes',
                        color: Colors.teal,
                        onTap: () => context.push('/schemes'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildQuickAction(
                        context,
                        icon: Icons.badge_outlined,
                        label: 'Passport',
                        color: const Color(0xFF7C3AED),
                        onTap: () => context.push('/passport'),
                      ),
                    ),
                  ],
                ).animate().fadeIn(delay: 450.ms).slideY(begin: 0.2),

                const SizedBox(height: 24),

                // Community Banner
                GestureDetector(
                  onTap: () => context.push('/community'),
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 15,
                            offset: const Offset(0, 5))
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.blue.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.people,
                              color: Colors.blue, size: 28),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(AppLocales.get('community', lang),
                                  style: const TextStyle(
                                      color: Colors.black87,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 18)),
                              const Text(
                                  'Help verify others or get verified by peers.',
                                  style: TextStyle(
                                      color: Colors.black54,
                                      fontSize: 14)),
                            ],
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios,
                            color: Colors.black26, size: 16),
                      ],
                    ),
                  ),
                ).animate().fadeIn(delay: 500.ms).slideX(begin: -0.2),

                const SizedBox(height: 32),

                // Skills section
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      AppLocales.get('top_skills', lang),
                      style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87),
                    ).animate().fadeIn(delay: 600.ms),
                    TextButton(
                      onPressed: () => context.push('/passport'),
                      child: Text(AppLocales.get('view_passport', lang),
                          style: const TextStyle(
                              color: Color(0xFF7C3AED),
                              fontWeight: FontWeight.bold)),
                    ).animate().fadeIn(delay: 600.ms),
                  ],
                ),
                const SizedBox(height: 16),

                passportAsync.when(
                  loading: () => const Center(
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: CircularProgressIndicator(
                          color: Color(0xFF7C3AED)),
                    ),
                  ),
                  error: (_, __) => _buildEmptySkillsCard(context, lang),
                  data: (passport) {
                    if (passport == null || passport.skills.isEmpty) {
                      return _buildEmptySkillsCard(context, lang);
                    }
                    return Column(
                      children: passport.skills
                          .take(3)
                          .toList()
                          .asMap()
                          .entries
                          .map((entry) {
                        final i = entry.key;
                        final skill = entry.value;
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                  color: Colors.black
                                      .withValues(alpha: 0.03),
                                  blurRadius: 15,
                                  offset: const Offset(0, 5))
                            ],
                          ),
                          child: ListTile(
                            contentPadding: const EdgeInsets.all(16),
                            leading: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.green.shade50,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.check_circle,
                                  color: Colors.green),
                            ),
                            title: Text(skill.skillName,
                                style: const TextStyle(
                                    color: Colors.black87,
                                    fontWeight: FontWeight.bold)),
                            subtitle: Text(
                                'NSQF Level ${skill.nsqfLevel} • ${skill.skillLevel}',
                                style: const TextStyle(
                                    color: Colors.black54)),
                            trailing: const Icon(Icons.arrow_forward_ios,
                                size: 16, color: Colors.black26),
                            onTap: () => context.push('/passport'),
                          ),
                        )
                            .animate()
                            .fadeIn(
                                delay: Duration(
                                    milliseconds: 800 + i * 150))
                            .slideX(begin: 0.2, end: 0);
                      }).toList(),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/chat'),
        backgroundColor: const Color(0xFF7C3AED),
        icon: const Icon(Icons.chat_bubble_outline, color: Colors.white),
        label: const Text(
          'Ask AI',
          style: TextStyle(
              color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ).animate().scale(delay: 800.ms),
    );
  }

  Widget _buildQuickAction(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 12,
                offset: const Offset(0, 4))
          ],
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(height: 8),
            Text(label,
                style: TextStyle(
                    color: color,
                    fontWeight: FontWeight.bold,
                    fontSize: 14)),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptySkillsCard(BuildContext context, String lang) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 15,
              offset: const Offset(0, 5))
        ],
      ),
      child: Column(
        children: [
          const Icon(Icons.workspace_premium_outlined,
              color: Colors.black26, size: 40),
          const SizedBox(height: 12),
          const Text(
            'No skills yet. Start an assessment to add your first skill!',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.black54, fontSize: 14),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: () => context.push('/assessment'),
            style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFF7C3AED)),
            child: const Text('Start Assessment'),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 800.ms);
  }
}
