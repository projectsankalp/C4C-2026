import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../profile/data/user_provider.dart';
import '../../../core/localization/app_localizations.dart';

class CommunityScreen extends ConsumerStatefulWidget {
  const CommunityScreen({super.key});

  @override
  ConsumerState<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends ConsumerState<CommunityScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(userProfileProvider);
    final lang = user.language;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(AppLocales.get('community', lang), style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFF7C3AED),
          unselectedLabelColor: Colors.black54,
          indicatorColor: const Color(0xFF7C3AED),
          tabs: [
            Tab(text: AppLocales.get('verify_peers', lang)),
            Tab(text: AppLocales.get('leaderboard', lang)),
          ],
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFFFEAD2), Color(0xFFE6EFFF)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: TabBarView(
          controller: _tabController,
          children: [
            _buildVerifyPeersTab(lang),
            _buildLeaderboardTab(lang),
          ],
        ),
      ),
    );
  }

  Widget _buildVerifyPeersTab(String lang) {
    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: 3,
      itemBuilder: (context, index) {
        return _buildPeerCard(
          name: ['Priya Sharma', 'Anjali Gupta', 'Sunita Devi'][index],
          skill: ['Advanced Tailoring', 'Basic Beauty Parlour', 'Mehendi Design'][index],
          level: ['NSQF Level 3', 'NSQF Level 2', 'NSQF Level 4'][index],
          imageUrl: 'https://i.pravatar.cc/150?img=${index + 10}',
          delay: index * 200,
          lang: lang,
        );
      },
    );
  }

  Widget _buildPeerCard({required String name, required String skill, required String level, required String imageUrl, required int delay, required String lang}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 15,
            offset: const Offset(0, 5),
          )
        ]
      ),
      child: Column(
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 30,
                backgroundImage: NetworkImage(imageUrl),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
                    const SizedBox(height: 4),
                    Text('$skill • $level', style: const TextStyle(fontSize: 14, color: Colors.black54)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Playing assessment video...')));
                  },
                  icon: const Icon(Icons.play_circle_outline),
                  label: Text(AppLocales.get('watch', lang)),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF7C3AED),
                    side: const BorderSide(color: Color(0xFF7C3AED)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: FilledButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('You endorsed $name!')));
                  },
                  icon: const Icon(Icons.verified),
                  label: Text(AppLocales.get('verify', lang)),
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF7C3AED),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
          )
        ],
      ),
    ).animate().fadeIn(delay: delay.ms).slideY(begin: 0.2, end: 0);
  }

  Widget _buildLeaderboardTab(String lang) {
    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: 5,
      itemBuilder: (context, index) {
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: index == 0 ? const Color(0xFF7C3AED).withValues(alpha: 0.1) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: index == 0 ? Border.all(color: const Color(0xFF7C3AED).withValues(alpha: 0.3)) : null,
            boxShadow: [
              if (index != 0) BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 10,
                offset: const Offset(0, 4),
              )
            ]
          ),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            leading: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('#${index + 1}', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: index == 0 ? const Color(0xFF7C3AED) : Colors.black54)),
                const SizedBox(width: 16),
                CircleAvatar(
                  backgroundImage: NetworkImage('https://i.pravatar.cc/150?img=${index + 20}'),
                ),
              ],
            ),
            title: Text(['Rekha Devi', 'Meena Kumari', 'Kavita Singh', 'Pooja Reddy', 'Neha Verma'][index], style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black87)),
            subtitle: Text('${150 - (index * 25)} ${AppLocales.get('verifications_done', lang)}'),
            trailing: index == 0 ? const Icon(Icons.emoji_events, color: Colors.amber, size: 28) : null,
          ),
        ).animate().fadeIn(delay: (index * 150).ms).slideX(begin: 0.2, end: 0);
      },
    );
  }
}
