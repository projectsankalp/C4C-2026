import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import 'package:http/http.dart' as http;
import '../../../core/services/api_service.dart';
import '../../profile/data/user_provider.dart';

class AssessmentScreen extends ConsumerStatefulWidget {
  const AssessmentScreen({super.key});

  @override
  ConsumerState<AssessmentScreen> createState() => _AssessmentScreenState();
}

class _AssessmentScreenState extends ConsumerState<AssessmentScreen> {
  final AudioPlayer _audioPlayer = AudioPlayer();
  final AudioRecorder _audioRecorder = AudioRecorder();

  bool _isRecording = false;
  bool _isProcessing = false;
  String _statusText = 'Tap the mic to start your assessment';
  String _streamedText = '';

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
    _audioPlayer.dispose();
    _audioRecorder.dispose();
    super.dispose();
  }

  Future<void> _toggleRecording() async {
    if (_isRecording) {
      await _stopAndProcess();
    } else {
      await _startRecording();
    }
  }

  Future<void> _startRecording() async {
    final hasPermission = await _audioRecorder.hasPermission();
    if (!hasPermission) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text(
                  'Microphone permission is required for assessment')),
        );
      }
      return;
    }

    final dir = await getTemporaryDirectory();
    final audioFilePath =
        '${dir.path}/assessment_${DateTime.now().millisecondsSinceEpoch}.m4a';

    await _audioRecorder.start(
      const RecordConfig(encoder: AudioEncoder.aacLc),
      path: audioFilePath,
    );

    setState(() {
      _isRecording = true;
      _statusText = 'Recording... Speak about your skills';
      _streamedText = '';
    });
  }

  Future<void> _stopAndProcess() async {
    final path = await _audioRecorder.stop();
    if (path == null) return;

    setState(() {
      _isRecording = false;
      _isProcessing = true;
      _statusText = 'AI is analysing your response...';
      _streamedText = '';
    });

    final user = ref.read(userProfileProvider);
    final langCode = _languageCodes[user.language] ?? 'en-IN';
    final api = ref.read(apiServiceProvider);

    Map<String, dynamic>? resultJson;
    String? ttsUrl;

    try {
      final stream = api.assessVoice(
        audioFilePath: path,
        languageCode: langCode,
      );

      await for (final line in stream) {
        if (!mounted) break;

        if (line.startsWith('data: ')) {
          final data = line.substring(6);

          if (data.startsWith('[DONE]:')) {
            final jsonStr = data.substring(7);
            try {
              final decoded = jsonDecode(jsonStr);
              if (decoded is Map<String, dynamic>) {
                resultJson = decoded;
              }
            } catch (e) {
              debugPrint('Failed to parse DONE json: $e');
            }
          } else if (data.startsWith('[TTS]:')) {
            ttsUrl = data.substring(6);
          } else if (data != '[DONE]') {
            setState(() {
              _streamedText += data;
              _statusText = 'AI is responding...';
            });
          }
        }
      }

      // Play TTS audio if available
      if (ttsUrl != null && ttsUrl.isNotEmpty) {
        await _playTtsFromUrl(ttsUrl);
      }

      if (mounted) {
        setState(() {
          _isProcessing = false;
          _statusText = 'Assessment complete!';
        });

        await Future.delayed(const Duration(milliseconds: 800));
        if (mounted) {
          context.push('/result', extra: resultJson ?? <String, dynamic>{});
        }
      }
    } on ApiException catch (e) {
      if (mounted) {
        setState(() {
          _isProcessing = false;
          _statusText = 'Error: ${e.message}';
        });
      }
    } catch (e) {
      debugPrint('Assessment error: $e');
      if (mounted) {
        setState(() {
          _isProcessing = false;
          _statusText = 'Something went wrong. Please try again.';
        });
      }
    }
  }

  Future<void> _playTtsFromUrl(String url) async {
    try {
      final response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        final dir = await getTemporaryDirectory();
        final file = File(
            '${dir.path}/tts_${DateTime.now().millisecondsSinceEpoch}.mp3');
        await file.writeAsBytes(response.bodyBytes);
        await _audioPlayer.play(DeviceFileSource(file.path));
      }
    } catch (e) {
      debugPrint('TTS playback error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(userProfileProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text('AI Assessment — ${user.language}',
            style: const TextStyle(color: Colors.black87)),
        backgroundColor: Colors.white.withValues(alpha: 0.9),
        iconTheme: const IconThemeData(color: Colors.black87),
        elevation: 0,
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
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Status card
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 20, vertical: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                          color: Colors.black.withValues(alpha: 0.08),
                          blurRadius: 12,
                          offset: const Offset(0, 4))
                    ],
                  ),
                  child: Text(
                    _statusText,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                        color: Colors.black87,
                        fontSize: 16,
                        fontWeight: FontWeight.w500),
                  ),
                ).animate().fadeIn().slideY(begin: -0.2),

                const SizedBox(height: 24),

                // Streamed text area
                if (_streamedText.isNotEmpty)
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                              color: Colors.black.withValues(alpha: 0.05),
                              blurRadius: 10,
                              offset: const Offset(0, 4))
                        ],
                      ),
                      child: SingleChildScrollView(
                        child: Text(
                          _streamedText,
                          style: const TextStyle(
                              color: Colors.black87,
                              fontSize: 15,
                              height: 1.6),
                        ),
                      ),
                    ),
                  )
                else
                  const Spacer(),

                // Processing indicator
                if (_isProcessing && _streamedText.isEmpty)
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                              color: Colors.black.withValues(alpha: 0.08),
                              blurRadius: 20,
                              offset: const Offset(0, 8))
                        ],
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const CircularProgressIndicator(
                              color: Color(0xFF7C3AED)),
                          const SizedBox(height: 16),
                          const Text(
                            'AI is analysing your response...',
                            style: TextStyle(
                                fontSize: 16,
                                color: Colors.black87,
                                fontWeight: FontWeight.w500),
                          ).animate(onPlay: (c) => c.repeat(reverse: true))
                              .fadeIn(duration: 600.ms),
                        ],
                      ),
                    ),
                  ),

                const SizedBox(height: 32),

                // Record button
                if (!_isProcessing)
                  Center(
                    child: GestureDetector(
                      onTap: _toggleRecording,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        width: _isRecording ? 88 : 76,
                        height: _isRecording ? 88 : 76,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                              color: _isRecording
                                  ? Colors.redAccent
                                  : const Color(0xFF7C3AED),
                              width: 4),
                          color: _isRecording
                              ? Colors.redAccent.withValues(alpha: 0.15)
                              : Colors.white,
                          boxShadow: [
                            BoxShadow(
                                color: Colors.black.withValues(alpha: 0.15),
                                blurRadius: 12,
                                offset: const Offset(0, 6))
                          ],
                        ),
                        child: _isRecording
                            ? const Icon(Icons.stop,
                                color: Colors.redAccent, size: 40)
                            : const Icon(Icons.mic,
                                color: Color(0xFF7C3AED), size: 36),
                      ),
                    ).animate(target: _isRecording ? 1 : 0).shimmer(
                        duration: 1.seconds,
                        color: Colors.redAccent.withValues(alpha: 0.3)),
                  ),

                const SizedBox(height: 12),

                if (_isRecording)
                  const Text(
                    'Recording... Tap to stop',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        color: Colors.redAccent,
                        fontSize: 15,
                        fontWeight: FontWeight.w600),
                  ).animate(onPlay: (c) => c.repeat(reverse: true))
                      .fadeIn(duration: 500.ms),

                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
