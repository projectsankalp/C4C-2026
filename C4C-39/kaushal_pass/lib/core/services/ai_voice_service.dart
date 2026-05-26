import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:path_provider/path_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final aiVoiceServiceProvider = Provider<AiVoiceService>((ref) {
  return AiVoiceService();
});

class AiVoiceService {
  final String _baseUrl = 'https://api.openai.com/v1'; // Defaulting to OpenAI API format
  late final String _apiKey;

  AiVoiceService() {
    _apiKey = dotenv.env['AI_VOICE_API_KEY'] ?? '';
    if (_apiKey.isEmpty) {
      debugPrint('Warning: AI_VOICE_API_KEY is not set in .env');
    }
  }

  Map<String, String> get _headers => {
        'Authorization': 'Bearer $_apiKey',
        'Content-Type': 'application/json',
      };

  /// Text-to-Speech: Converts text into spoken audio in the specified language.
  /// Returns the path to the generated audio file.
  Future<String?> generateSpeech(String text, String language) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/audio/speech'),
        headers: _headers,
        body: jsonEncode({
          'model': 'tts-1', // Using OpenAI's TTS model
          'input': text,
          'voice': 'nova', // You can change the voice: alloy, echo, fable, onyx, nova, shimmer
        }),
      );

      if (response.statusCode == 200) {
        final dir = await getTemporaryDirectory();
        final file = File('${dir.path}/tts_response_${DateTime.now().millisecondsSinceEpoch}.mp3');
        await file.writeAsBytes(response.bodyBytes);
        return file.path;
      } else {
        debugPrint('Failed to generate speech: ${response.statusCode} - ${response.body}');
        return null;
      }
    } catch (e) {
      debugPrint('Error generating speech: $e');
      return null;
    }
  }

  /// Voice-to-Voice: Takes an audio file path, transcribes it, generates an AI response, and converts it back to speech.
  /// Returns the path to the response audio file.
  Future<String?> processVoiceResponse(String audioFilePath, String language) async {
    try {
      // 1. Transcribe the audio (Speech-to-Text)
      final transcript = await _transcribeAudio(audioFilePath, language);
      if (transcript == null || transcript.isEmpty) return null;
      
      // 2. Generate text response (LLM)
      final aiTextResponse = await _generateTextResponse(transcript, language);
      if (aiTextResponse == null || aiTextResponse.isEmpty) return null;

      // 3. Convert response back to audio (Text-to-Speech)
      final responseAudioPath = await generateSpeech(aiTextResponse, language);
      return responseAudioPath;

    } catch (e) {
      debugPrint('Error in voice-to-voice processing: $e');
      return null;
    }
  }

  Future<String?> _transcribeAudio(String audioFilePath, String language) async {
    try {
      final request = http.MultipartRequest('POST', Uri.parse('$_baseUrl/audio/transcriptions'))
        ..headers.addAll({
          'Authorization': 'Bearer $_apiKey',
        })
        ..fields['model'] = 'whisper-1'
        // Optional: you can map the app's 'language' to ISO-639-1 format here if supported
        ..files.add(await http.MultipartFile.fromPath('file', audioFilePath));

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['text'];
      } else {
        debugPrint('Failed to transcribe: ${response.statusCode} - ${response.body}');
        return null;
      }
    } catch (e) {
      debugPrint('Error transcribing audio: $e');
      return null;
    }
  }

  Future<String?> _generateTextResponse(String userText, String language) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/chat/completions'),
        headers: _headers,
        body: jsonEncode({
          'model': 'gpt-4o',
          'messages': [
            {
              'role': 'system',
              'content': 'You are an AI interviewer for a digital skill passport app called CredOra (formerly KaushalPass). Respond in $language. Keep your response brief, encouraging, and ask one relevant follow-up question about their work experience.'
            },
            {
              'role': 'user',
              'content': userText,
            }
          ]
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['choices'][0]['message']['content'];
      } else {
        debugPrint('Failed to generate AI response: ${response.statusCode} - ${response.body}');
        return null;
      }
    } catch (e) {
      debugPrint('Error generating text response: $e');
      return null;
    }
  }
}
