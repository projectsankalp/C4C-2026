import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';

final sarvamChatServiceProvider = Provider<SarvamChatService>((ref) {
  return SarvamChatService();
});

class SarvamChatService {
  late final String _apiKey;

  SarvamChatService() {
    _apiKey = dotenv.env['AI_VOICE_API_KEY'] ?? '';
    if (_apiKey.isEmpty) {
      debugPrint('Warning: API Key is not set in .env');
    }
  }

  Map<String, String> get _headers => {
        'api-subscription-key': _apiKey,
        'Content-Type': 'application/json',
      };

  /// Sends a message to the Sarvam Chat API and returns the response.
  Future<String?> sendMessage(String message, String language) async {
    try {
      // Note: sarvam uses api-subscription-key but /v1/chat/completions might need Authorization Bearer or just api-subscription-key
      final headers = {
        'api-subscription-key': _apiKey,
        'Authorization': 'Bearer $_apiKey', // Adding both to be safe
        'Content-Type': 'application/json',
      };
      
      final response = await http.post(
        Uri.parse('https://api.sarvam.ai/v1/chat/completions'),
        headers: headers,
        body: jsonEncode({
          'model': 'sarvam-30b', // Using their conversational model
          'messages': [
            {
              'role': 'system',
              'content': 'You are a helpful assistant for CredOra. You MUST respond ONLY in $language. If the user writes in English, translate your thought and reply in $language script. Never reply in English unless $language is English. Be concise and polite.'
            },
            {
              'role': 'user',
              'content': message,
            }
          ],
          'temperature': 0.7,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['choices'][0]['message']['content'];
      } else {
        debugPrint('Sarvam Chat API Error: ${response.statusCode} - ${response.body}');
        return 'Sorry, I encountered an error. Please try again later.';
      }
    } catch (e) {
      debugPrint('Error sending message to Sarvam: $e');
      return 'Sorry, there was a network error. Please check your connection.';
    }
  }

  /// Voice-to-Text using Sarvam API
  Future<String?> speechToText(String audioFilePath, String language) async {
    try {
      final request = http.MultipartRequest('POST', Uri.parse('https://api.sarvam.ai/speech-to-text'))
        ..headers['api-subscription-key'] = _apiKey
        ..fields['model'] = 'saaras:v3'
        ..fields['language_code'] = _mapLanguageToCode(language) // Map to 'hi-IN' etc
        ..fields['mode'] = 'transcribe' // Force native script transcription, NOT translation to English
        ..files.add(await http.MultipartFile.fromPath('file', audioFilePath));

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['transcript'] ?? data['text']; // Depending on the exact payload return
      } else {
        debugPrint('Sarvam STT Error: ${response.statusCode} - ${response.body}');
        return null;
      }
    } catch (e) {
      debugPrint('Error transcribing audio with Sarvam: $e');
      return null;
    }
  }

  /// Text-to-Speech using Sarvam API
  Future<String?> textToSpeech(String text, String language) async {
    try {
      final response = await http.post(
        Uri.parse('https://api.sarvam.ai/text-to-speech'),
        headers: _headers,
        body: jsonEncode({
          "inputs": [text],
          "speaker": "priya",
          "model": "bulbul:v3",
          "target_language_code": _mapLanguageToCode(language),
          "pace": 1.0,
          "sampling_rate": 24000
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final base64Audio = data['audios'] != null ? data['audios'][0] : data['audio']; // Handle array or single
        
        if (base64Audio != null) {
          final dir = await getTemporaryDirectory();
          final file = File('${dir.path}/sarvam_tts_${DateTime.now().millisecondsSinceEpoch}.wav');
          await file.writeAsBytes(base64Decode(base64Audio));
          return file.path;
        }
        return null;
      } else {
        debugPrint('Sarvam TTS Error: ${response.statusCode} - ${response.body}');
        return null;
      }
    } catch (e) {
      debugPrint('Error generating speech with Sarvam: $e');
      return null;
    }
  }

  String _mapLanguageToCode(String language) {
    switch (language.toLowerCase()) {
      case 'hindi': return 'hi-IN';
      case 'bengali': return 'bn-IN';
      case 'marathi': return 'mr-IN';
      case 'telugu': return 'te-IN';
      case 'tamil': return 'ta-IN';
      case 'gujarati': return 'gu-IN';
      case 'kannada': return 'kn-IN';
      case 'malayalam': return 'ml-IN';
      case 'punjabi': return 'pa-IN';
      case 'english': return 'en-IN';
      default: return 'hi-IN'; // Default to Hindi
    }
  }
}
