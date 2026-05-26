import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/api_service.dart';

// ─── Providers ───────────────────────────────────────────────────────────────

final autoSchemesProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final data = await api.autoRecommendSchemes();
  final schemes = data['schemes'] as List<dynamic>? ?? [];
  return schemes.map((s) => s as Map<String, dynamic>).toList();
});

// ─── Screen ───────────────────────────────────────────────────────────────────

class SchemesScreen extends ConsumerStatefulWidget {
  const SchemesScreen({super.key});

  @override
  ConsumerState<SchemesScreen> createState() => _SchemesScreenState();
}

class _SchemesScreenState extends ConsumerState<SchemesScreen> {
  final _searchController = TextEditingController();
  List<Map<String, dynamic>>? _searchResults;
  bool _isSearching = false;
  String? _searchError;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _search() async {
    final problem = _searchController.text.trim();
    if (problem.isEmpty) {
      setState(() {
        _searchResults = null;
        _searchError = null;
      });
      return;
    }

    setState(() {
      _isSearching = true;
      _searchError = null;
    });

    try {
      final api = ref.read(apiServiceProvider);
      final data = await api.recommendSchemes(problem);
      final schemes = data['schemes'] as List<dynamic>? ?? [];
      setState(() {
        _searchResults =
            schemes.map((s) => s as Map<String, dynamic>).toList();
        _isSearching = false;
      });
    } on ApiException catch (e) {
      setState(() {
        _isSearching = false;
        _searchError = e.message;
      });
    } catch (e) {
      setState(() {
        _isSearching = false;
        _searchError = 'Failed to search schemes. Please try again.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final autoSchemes = ref.watch(autoSchemesProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Government Schemes',
            style: TextStyle(
                color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
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
        child: Column(
          children: [
            // Search bar
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                        color: Colors.black.withValues(alpha: 0.06),
                        blurRadius: 12,
                        offset: const Offset(0, 4))
                  ],
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        style: const TextStyle(color: Colors.black87),
                        decoration: InputDecoration(
                          hintText:
                              'Describe your problem (e.g. need loan for tools)',
                          hintStyle:
                              const TextStyle(color: Colors.black38),
                          prefixIcon: const Icon(Icons.search,
                              color: Colors.black38),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 14),
                        ),
                        onSubmitted: (_) => _search(),
                      ),
                    ),
                    if (_searchController.text.isNotEmpty)
                      IconButton(
                        icon: const Icon(Icons.clear,
                            color: Colors.black38),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {
                            _searchResults = null;
                            _searchError = null;
                          });
                        },
                      ),
                    Container(
                      margin: const EdgeInsets.only(right: 8),
                      child: FilledButton(
                        onPressed: _isSearching ? null : _search,
                        style: FilledButton.styleFrom(
                          backgroundColor: const Color(0xFF7C3AED),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14)),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 12),
                        ),
                        child: _isSearching
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white),
                              )
                            : const Text('Search'),
                      ),
                    ),
                  ],
                ),
              ),
            ).animate().fadeIn().slideY(begin: -0.1),

            const SizedBox(height: 8),

            // Content
            Expanded(
              child: _buildContent(autoSchemes),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(AsyncValue<List<Map<String, dynamic>>> autoSchemes) {
    // Show search results if available
    if (_searchResults != null) {
      return _buildSchemesList(
        schemes: _searchResults!,
        title: 'Search Results (${_searchResults!.length})',
        emptyMessage: 'No schemes found for your query.',
      );
    }

    if (_searchError != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline,
                  color: Colors.redAccent, size: 48),
              const SizedBox(height: 12),
              Text(_searchError!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.black54)),
            ],
          ),
        ),
      );
    }

    // Show auto-recommended schemes
    return autoSchemes.when(
      loading: () => const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(color: Color(0xFF7C3AED)),
            SizedBox(height: 16),
            Text('Finding schemes for you...',
                style: TextStyle(color: Colors.black54)),
          ],
        ),
      ),
      error: (e, _) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.cloud_off,
                  color: Colors.black26, size: 48),
              const SizedBox(height: 12),
              const Text(
                'Could not load schemes.\nSearch above to find relevant schemes.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.black54),
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () =>
                    ref.invalidate(autoSchemesProvider),
                style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF7C3AED)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
      data: (schemes) => _buildSchemesList(
        schemes: schemes,
        title: 'Recommended for You',
        emptyMessage:
            'No schemes found. Try searching with a specific problem.',
      ),
    );
  }

  Widget _buildSchemesList({
    required List<Map<String, dynamic>> schemes,
    required String title,
    required String emptyMessage,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
          child: Text(
            title,
            style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.black87),
          ),
        ),
        Expanded(
          child: schemes.isEmpty
              ? Center(
                  child: Text(emptyMessage,
                      style: const TextStyle(color: Colors.black54)),
                )
              : ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                  itemCount: schemes.length,
                  itemBuilder: (context, index) {
                    return _buildSchemeCard(schemes[index], index);
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildSchemeCard(Map<String, dynamic> scheme, int index) {
    final name = scheme['name']?.toString() ?? 'Scheme';
    final tagline = scheme['tagline']?.toString() ?? '';
    final ministry = scheme['ministry']?.toString() ?? '';
    final aiReasoning = scheme['ai_reasoning']?.toString() ?? '';
    final benefits = scheme['benefits']?.toString() ?? '';
    final benefitsList = benefits.isNotEmpty ? [benefits] : <String>[];
    final eligibility = scheme['eligibility']?.toString() ?? '';
    final eligibilityList = eligibility.isNotEmpty ? [eligibility] : <String>[];
    final link = scheme['link']?.toString() ?? '';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 12,
              offset: const Offset(0, 4))
        ],
      ),
      child: Theme(
        data: Theme.of(context).copyWith(
          dividerColor: Colors.transparent,
        ),
        child: ExpansionTile(
          tilePadding:
              const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          childrenPadding:
              const EdgeInsets.fromLTRB(20, 0, 20, 16),
          leading: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF7C3AED).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.account_balance,
                color: Color(0xFF7C3AED), size: 24),
          ),
          title: Text(
            name,
            style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.black87,
                fontSize: 16),
          ),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (tagline.isNotEmpty)
                Text(tagline,
                    style: const TextStyle(
                        color: Colors.black54, fontSize: 13)),
              if (ministry.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(ministry,
                      style: const TextStyle(
                          color: Color(0xFF7C3AED),
                          fontSize: 11,
                          fontWeight: FontWeight.w500)),
                ),
            ],
          ),
          children: [
            if (aiReasoning.isNotEmpty) ...[
              _buildSection('Why this scheme?', Icons.psychology_outlined,
                  [aiReasoning]),
              const SizedBox(height: 12),
            ],
            if (benefitsList.isNotEmpty) ...[
              _buildSection(
                  'Benefits', Icons.star_outline, benefitsList),
              const SizedBox(height: 12),
            ],
            if (eligibilityList.isNotEmpty) ...[
              _buildSection('Eligibility', Icons.check_circle_outline,
                  eligibilityList),
              const SizedBox(height: 12),
            ],
            if (link.isNotEmpty)
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {
                    // Copy link to clipboard
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                          content: Text('Link: $link'),
                          action: SnackBarAction(
                              label: 'OK', onPressed: () {})),
                    );
                  },
                  icon: const Icon(Icons.open_in_new,
                      color: Color(0xFF7C3AED), size: 16),
                  label: const Text('View Scheme'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF7C3AED),
                    side: const BorderSide(color: Color(0xFF7C3AED)),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
          ],
        ),
      ),
    )
        .animate()
        .fadeIn(delay: Duration(milliseconds: 100 + index * 80))
        .slideY(begin: 0.1);
  }

  Widget _buildSection(
      String title, IconData icon, List<String> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: const Color(0xFF7C3AED), size: 16),
            const SizedBox(width: 6),
            Text(title,
                style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                    fontSize: 14)),
          ],
        ),
        const SizedBox(height: 6),
        ...items.map((item) => Padding(
              padding: const EdgeInsets.only(bottom: 4, left: 4),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('• ',
                      style: TextStyle(
                          color: Color(0xFF7C3AED),
                          fontWeight: FontWeight.bold)),
                  Expanded(
                      child: Text(item,
                          style: const TextStyle(
                              color: Colors.black54,
                              fontSize: 13,
                              height: 1.4))),
                ],
              ),
            )),
      ],
    );
  }
}
