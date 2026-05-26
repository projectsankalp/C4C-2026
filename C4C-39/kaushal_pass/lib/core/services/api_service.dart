import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;

final apiServiceProvider = Provider<ApiService>((ref) => ApiService());

class ApiService {
  late final String _baseUrl;
  String? _token;

  ApiService() {
    final backendUrl = dotenv.env['BACKEND_URL'] ?? 'http://10.0.2.2:8000';
    _baseUrl = '$backendUrl/api/v1';
  }

  void setToken(String token) {
    _token = token;
  }

  void clearToken() {
    _token = null;
  }

  Map<String, String> get _authHeaders => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  // ─── Auth ────────────────────────────────────────────────────────────────

  /// POST /auth/profile — create or update user profile
  Future<Map<String, dynamic>> createOrUpdateProfile({
    required String fullName,
    required String preferredLanguage,
    String? phone,
    String? state,
    String? occupationCategory,
  }) async {
    final body = <String, dynamic>{
      'full_name': fullName,
      'preferred_language': preferredLanguage,
      if (phone != null && phone.isNotEmpty) 'phone': phone,
      if (state != null && state.isNotEmpty) 'state': state,
      if (occupationCategory != null && occupationCategory.isNotEmpty)
        'occupation_category': occupationCategory,
    };
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/profile'),
      headers: _authHeaders,
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  /// GET /auth/me — fetch current user profile
  Future<Map<String, dynamic>> getMe() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/auth/me'),
      headers: _authHeaders,
    );
    return _handleResponse(response);
  }

  // ─── Voice Assessment ────────────────────────────────────────────────────

  /// POST /voice/assess — SSE stream
  /// Yields raw SSE lines. Caller parses [DONE] and [TTS] events.
  Stream<String> assessVoice({
    required String audioFilePath,
    required String languageCode,
  }) async* {
    final uri = Uri.parse('$_baseUrl/voice/assess');
    final request = http.MultipartRequest('POST', uri)
      ..headers.addAll({
        if (_token != null) 'Authorization': 'Bearer $_token',
      })
      ..fields['language_code'] = languageCode
      ..files.add(await http.MultipartFile.fromPath('audio', audioFilePath));

    final streamedResponse = await request.send();
    if (streamedResponse.statusCode != 200) {
      final body = await streamedResponse.stream.bytesToString();
      throw ApiException(streamedResponse.statusCode, body);
    }

    final lines = streamedResponse.stream
        .transform(utf8.decoder)
        .transform(const LineSplitter());

    await for (final line in lines) {
      yield line;
    }
  }

  // ─── Passport ────────────────────────────────────────────────────────────

  /// GET /passport/me
  Future<Map<String, dynamic>> getPassport() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/passport/me'),
      headers: _authHeaders,
    );
    return _handleResponse(response);
  }

  /// POST /passport/skills
  Future<Map<String, dynamic>> addSkill({
    required String skillName,
    String? skillLevel,
    int? nsqfLevel,
    double? confidenceScore,
    String? verificationStatus,
  }) async {
    final body = <String, dynamic>{
      'skill_name': skillName,
      if (skillLevel != null) 'skill_level': skillLevel,
      if (nsqfLevel != null) 'nsqf_level': nsqfLevel,
      if (confidenceScore != null) 'confidence_score': confidenceScore,
      if (verificationStatus != null) 'verification_status': verificationStatus,
    };
    final response = await http.post(
      Uri.parse('$_baseUrl/passport/skills'),
      headers: _authHeaders,
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  /// PUT /passport/skills/{id}
  Future<Map<String, dynamic>> updateSkill(
      String id, Map<String, dynamic> updates) async {
    final response = await http.put(
      Uri.parse('$_baseUrl/passport/skills/$id'),
      headers: _authHeaders,
      body: jsonEncode(updates),
    );
    return _handleResponse(response);
  }

  /// DELETE /passport/skills/{id}
  Future<void> deleteSkill(String id) async {
    final response = await http.delete(
      Uri.parse('$_baseUrl/passport/skills/$id'),
      headers: _authHeaders,
    );
    if (response.statusCode != 200 && response.statusCode != 204) {
      throw ApiException(response.statusCode, response.body);
    }
  }

  // ─── Documents ───────────────────────────────────────────────────────────

  /// POST /documents/upload
  Future<Map<String, dynamic>> uploadDocument(
      String filePath, {String? skillId}) async {
    final request = http.MultipartRequest(
        'POST', Uri.parse('$_baseUrl/documents/upload'))
      ..headers.addAll({
        if (_token != null) 'Authorization': 'Bearer $_token',
      })
      ..files.add(await http.MultipartFile.fromPath('file', filePath));
    if (skillId != null) request.fields['skill_id'] = skillId;

    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    return _handleResponse(response);
  }

  /// GET /documents/{id}/url
  Future<Map<String, dynamic>> getDocumentUrl(String id) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/documents/$id/url'),
      headers: _authHeaders,
    );
    return _handleResponse(response);
  }

  // ─── Certificate ─────────────────────────────────────────────────────────

  /// POST /certificate/generate
  Future<Map<String, dynamic>> generateCertificate() async {
    final response = await http.post(
      Uri.parse('$_baseUrl/certificate/generate'),
      headers: _authHeaders,
    );
    return _handleResponse(response);
  }

  /// GET /certificate/status/{job_id}
  Future<Map<String, dynamic>> getCertificateStatus(String jobId) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/certificate/status/$jobId'),
      headers: _authHeaders,
    );
    return _handleResponse(response);
  }

  // ─── Schemes ─────────────────────────────────────────────────────────────

  /// POST /schemes/recommend
  Future<Map<String, dynamic>> recommendSchemes(String problem) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/schemes/recommend'),
      headers: _authHeaders,
      body: jsonEncode({'problem': problem}),
    );
    return _handleResponse(response);
  }

  /// GET /schemes/recommend/auto
  Future<Map<String, dynamic>> autoRecommendSchemes() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/schemes/recommend/auto'),
      headers: _authHeaders,
    );
    return _handleResponse(response);
  }

  // ─── Verifier ────────────────────────────────────────────────────────────

  /// GET /verify/{passport_id} — public, no auth
  Future<Map<String, dynamic>> verifyPassport(String passportId) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/verify/$passportId'),
    );
    return _handleResponse(response);
  }

  // ─── Health ──────────────────────────────────────────────────────────────

  Future<bool> healthCheck() async {
    try {
      final response = await http
          .get(Uri.parse(
              '${dotenv.env['BACKEND_URL'] ?? 'http://10.0.2.2:8000'}/health'))
          .timeout(const Duration(seconds: 5));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  Map<String, dynamic> _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return {};
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    debugPrint('API Error ${response.statusCode}: ${response.body}');
    throw ApiException(response.statusCode, response.body);
  }
}

class ApiException implements Exception {
  final int statusCode;
  final String body;

  ApiException(this.statusCode, this.body);

  String get message {
    try {
      final decoded = jsonDecode(body);
      return decoded['detail']?.toString() ?? 'Request failed ($statusCode)';
    } catch (_) {
      return 'Request failed ($statusCode)';
    }
  }

  @override
  String toString() => 'ApiException($statusCode): $message';
}
