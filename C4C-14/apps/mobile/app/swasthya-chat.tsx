import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { getUser } from '../utils/store';
import { api } from '../utils/api';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export default function SwasthyaChat() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: "I'm here for you. How has your day been?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lang, setLang] = useState<'en' | 'hi' | 'kn'>('en');
  const [loadingContext, setLoadingContext] = useState(true);

  useEffect(() => {
    loadChatContext();
  }, []);

  const loadChatContext = async () => {
    try {
      const uId = await getUser();
      if (!uId) return;

      const res = await api.get(`/dashboard/${uId}`);
      if (res.data.success && res.data.data.user) {
        const userLang = res.data.data.user.language || 'en';
        setLang(userLang);

        let welcomeText = "I'm here for you. How has your day been?";
        if (userLang === 'kn') welcomeText = "ನಾನು ನಿಮಗಾಗಿ ಇಲ್ಲಿದ್ದೇನೆ. ನಿಮ್ಮ ದಿನ ಹೇಗಿತ್ತು?";
        else if (userLang === 'hi') welcomeText = "मैं आपके लिए यहाँ हूँ। आपका दिन कैसा रहा?";

        setMessages([{
          id: '1',
          sender: 'ai',
          text: welcomeText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      console.error('Failed to load chat language preferences:', err);
    } finally {
      setLoadingContext(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessageText = inputText;
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMessageText,
      time: timeString
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const uId = await getUser();
      const res = await api.post('/chat', {
        userId: uId,
        message: userMessageText,
        history: messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      });

      if (res.data.success && res.data.reply) {
        const newAiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: res.data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, newAiMsg]);
      }
    } catch (err) {
      console.error('Failed to get reply from Gemma Chat:', err);
      let fallbackReply = "I had a connection issue. Please describe your feelings again.";
      if (lang === 'kn') fallbackReply = "ಸಂಪರ್ಕಿಸುವಲ್ಲಿ ಸ್ವಲ್ಪ ತೊಂದರೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ.";
      else if (lang === 'hi') fallbackReply = "कनेक्ट करने में थोड़ी समस्या हुई है। कृपया फिर से कहें।";

      const newAiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: fallbackReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newAiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const loc = {
    en: { placeholder: "Type a message..." },
    kn: { placeholder: "ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ..." },
    hi: { placeholder: "संदेश टाइप करें..." }
  }[lang];

  if (loadingContext) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E89AAE" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.outerContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Background Floral Accents */}
      <MaterialIcons name="eco" size={140} color="#F9E3E8" style={[styles.bgLeaf, { top: -40, left: -40, transform: [{ rotate: '45deg' }] }]} />
      <MaterialIcons name="eco" size={120} color="#F9E3E8" style={[styles.bgLeaf, { top: 60, right: -40, transform: [{ rotate: '-135deg' }] }]} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <MaterialIcons name="chevron-left" size={28} color="#2B2B2B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="more-vert" size={24} color="#2B2B2B" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.threadContainer}>
          {messages.map((message, index) => {
            const isUser = message.sender === 'user';
            const showAvatar = !isUser && (index === 0 || messages[index - 1].sender === 'user');
            
            return (
              <View key={message.id} style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAi]}>
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
                  <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextAi]}>
                    {message.text}
                  </Text>
                </View>
                {!isUser && (
                  <View style={styles.aiFooter}>
                    <Text style={styles.timeText}>{message.time}</Text>
                    <MaterialIcons name="favorite-border" size={14} color="#E89AAE" style={{ marginLeft: 6 }} />
                  </View>
                )}
                {isUser && (
                  <View style={styles.userFooter}>
                    <Text style={styles.timeText}>{message.time}</Text>
                  </View>
                )}
              </View>
            );
          })}

          {isTyping && (
            <View style={[styles.messageRow, styles.messageRowAi]}>
              <View style={[styles.bubble, styles.bubbleAi, { paddingVertical: 12, paddingHorizontal: 16 }]}>
                <ActivityIndicator size="small" color="#E89AAE" />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Soft Floating Input Area */}
      <View style={styles.inputArea}>
        <TouchableOpacity style={styles.plusButton}>
          <MaterialIcons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder={loc.placeholder}
            placeholderTextColor="#7B7B7B"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
        </View>

        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]} 
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <MaterialIcons name="chevron-right" size={26} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFF7F8',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFF7F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgLeaf: {
    position: 'absolute',
    opacity: 0.6,
    zIndex: -1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#2B2B2B',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  threadContainer: {
    paddingTop: 10,
  },
  messageRow: {
    marginBottom: 20,
    maxWidth: '85%',
  },
  messageRowAi: {
    alignSelf: 'flex-start',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
  },
  bubble: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#E89AAE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  bubbleAi: {
    backgroundColor: '#FFFDFD',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#F9E3E8',
  },
  bubbleUser: {
    backgroundColor: '#F9E3E8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  messageTextAi: {
    color: '#2B2B2B',
  },
  messageTextUser: {
    color: '#2B2B2B',
  },
  aiFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
    paddingRight: 8,
  },
  userFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
    paddingRight: 8,
  },
  timeText: {
    fontSize: 10,
    color: '#A0A0A0',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: 'transparent',
  },
  plusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E89AAE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#E89AAE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  inputWrapper: {
    flex: 1,
    minHeight: 52,
    maxHeight: 120,
    backgroundColor: '#FFFDFD',
    borderRadius: 26,
    marginHorizontal: 12,
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F9E3E8',
  },
  textInput: {
    flex: 1,
    color: '#2B2B2B',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-Medium',
    paddingTop: 14,
    paddingBottom: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E89AAE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#E89AAE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});
