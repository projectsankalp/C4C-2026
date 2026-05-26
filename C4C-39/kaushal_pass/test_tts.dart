import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

void main() async {
  await dotenv.load(fileName: ".env");
  final apiKey = dotenv.env['AI_VOICE_API_KEY'] ?? '';
  
  final response = await http.post(
    Uri.parse('https://api.sarvam.ai/text-to-speech'),
    headers: {
      'api-subscription-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      "inputs": ["Hello"],
      "target_language_code": "hi-IN",
      "speaker": "meera",
      "pitch": 0,
      "pace": 1.65,
      "loudness": 1.5,
      "speech_sample_rate": 8000,
      "enable_preprocessing": true,
      "model": "bulbul:v1"
    }),
  );
  print('Inputs payload: \${response.statusCode} - \${response.body.substring(0, 100)}');

  final response2 = await http.post(
    Uri.parse('https://api.sarvam.ai/text-to-speech'),
    headers: {
      'api-subscription-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      "text": "Hello",
      "speaker": "meera",
      "model": "bulbul:v3",
      "target_language_code": "hi-IN"
    }),
  );
  print('Text payload: \${response2.statusCode} - \${response2.body.substring(0, 100)}');
}
