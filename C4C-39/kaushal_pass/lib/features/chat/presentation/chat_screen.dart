import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:record/record.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:path_provider/path_provider.dart';
import '../../../core/services/sarvam_chat_service.dart';
import '../../profile/data/user_provider.dart';

class ChatMessage {
  final String text;
  final bool isUser;
  String? audioPath;
  
  ChatMessage({required this.text, required this.isUser, this.audioPath});
}

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final List<ChatMessage> _messages = [];
  final ScrollController _scrollController = ScrollController();
  bool _isLoading = false;
  bool _isRecording = false;
  late final SarvamChatService _chatService;
  late final AudioRecorder _audioRecorder;
  late final AudioPlayer _audioPlayer;

  @override
  void initState() {
    super.initState();
    _chatService = ref.read(sarvamChatServiceProvider);
    _audioRecorder = AudioRecorder();
    _audioPlayer = AudioPlayer();
    
    // Add initial greeting
    _messages.add(ChatMessage(text: "Hello! How can I help you today?", isUser: false));
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _audioRecorder.dispose();
    _audioPlayer.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      Future.delayed(const Duration(milliseconds: 100), () {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      });
    }
  }

  Future<void> _toggleRecording() async {
    if (_isRecording) {
      // Stop recording
      final path = await _audioRecorder.stop();
      setState(() {
        _isRecording = false;
        _isLoading = true;
      });

      if (path != null) {
        final user = ref.read(userProfileProvider);
        // 1. Convert Voice to Text
        final transcribedText = await _chatService.speechToText(path, user.language);
        if (transcribedText != null && transcribedText.isNotEmpty) {
          setState(() {
            _messages.add(ChatMessage(text: transcribedText, isUser: true, audioPath: path));
          });
          _scrollToBottom();
          
          // 2. Get AI Response
          await _processAIResponse(transcribedText, user.language);
        } else {
          setState(() => _isLoading = false);
        }
      }
    } else {
      // Start recording
      if (await _audioRecorder.hasPermission()) {
        final dir = await getTemporaryDirectory();
        final path = '${dir.path}/chat_audio_${DateTime.now().millisecondsSinceEpoch}.m4a';
        await _audioRecorder.start(const RecordConfig(), path: path);
        setState(() {
          _isRecording = true;
        });
      }
    }
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    _messageController.clear();
    setState(() {
      _messages.add(ChatMessage(text: text, isUser: true));
      _isLoading = true;
    });
    _scrollToBottom();

    final user = ref.read(userProfileProvider);
    await _processAIResponse(text, user.language);
  }

  Future<void> _processAIResponse(String text, String language) async {
    final response = await _chatService.sendMessage(text, language);

    if (!mounted) return;

    if (response != null && response.isNotEmpty) {
      final newMessage = ChatMessage(text: response, isUser: false);
      
      setState(() {
        _isLoading = false;
        _messages.add(newMessage);
      });
      _scrollToBottom();

      // Fetch TTS asynchronously without blocking the UI
      _chatService.textToSpeech(response, language).then((audioPath) {
        if (mounted && audioPath != null) {
          setState(() {
            newMessage.audioPath = audioPath;
          });
          // Play the response once ready
          _audioPlayer.play(DeviceFileSource(audioPath));
        }
      });
    } else {
      setState(() {
        _isLoading = false;
        _messages.add(ChatMessage(text: "Failed to get a response.", isUser: false));
      });
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text('CredOra Assistant', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 1,
        iconTheme: const IconThemeData(color: Colors.black87),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                final isUser = message.isUser;
                
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                    decoration: BoxDecoration(
                      color: isUser ? const Color(0xFF7C3AED) : Colors.white,
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(20),
                        topRight: const Radius.circular(20),
                        bottomLeft: Radius.circular(isUser ? 20 : 0),
                        bottomRight: Radius.circular(isUser ? 0 : 20),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 5,
                          offset: const Offset(0, 2),
                        )
                      ]
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          message.text,
                          style: TextStyle(
                            color: isUser ? Colors.white : Colors.black87,
                            fontSize: 16,
                          ),
                        ),
                        if (message.audioPath != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: InkWell(
                              onTap: () => _audioPlayer.play(DeviceFileSource(message.audioPath!)),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.play_circle_fill, color: isUser ? Colors.white70 : const Color(0xFF7C3AED), size: 24),
                                  const SizedBox(width: 4),
                                  Text('Play', style: TextStyle(color: isUser ? Colors.white70 : const Color(0xFF7C3AED), fontSize: 12)),
                                ],
                              ),
                            ),
                          )
                      ],
                    ),
                  ).animate().fadeIn().slideY(begin: 0.1),
                );
              },
            ),
          ),
          if (_isLoading)
            Align(
              alignment: Alignment.centerLeft,
              child: Container(
                margin: const EdgeInsets.only(left: 16, bottom: 12),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 5,
                      offset: const Offset(0, 2),
                    )
                  ]
                ),
                child: const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF7C3AED)),
                ),
              ),
            ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12).copyWith(
              bottom: MediaQuery.of(context).padding.bottom + 12,
            ),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -5),
                )
              ]
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: _isRecording ? 'Listening...' : 'Type your query...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: _isRecording ? Colors.red.shade50 : const Color(0xFFF3F4F6),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                    ),
                    textInputAction: TextInputAction.send,
                    onSubmitted: (_) => _sendMessage(),
                    enabled: !_isRecording,
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: _toggleRecording,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _isRecording ? Colors.red : Colors.grey.shade200,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      _isRecording ? Icons.stop : Icons.mic,
                      color: _isRecording ? Colors.white : Colors.black54,
                    ),
                  ),
                ).animate(target: _isRecording ? 1 : 0).scale(begin: const Offset(1,1), end: const Offset(1.1, 1.1)),
                const SizedBox(width: 8),
                Container(
                  decoration: const BoxDecoration(
                    color: Color(0xFF7C3AED),
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.white),
                    onPressed: _sendMessage,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
