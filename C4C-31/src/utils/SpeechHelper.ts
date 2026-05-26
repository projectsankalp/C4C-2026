// Web Speech API Helpers for Accessibility (Text-to-Speech and Speech-to-Text)

export const SpeechHelper = {
  // TTS: Read text aloud
  speak(text: string, lang: 'en' | 'hi', enabled: boolean = true) {
    if (!enabled) return;
    
    // Stop any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    } else {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    
    // Try to find a good voice matching the language
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(voice => 
      lang === 'hi' ? voice.lang.includes('hi') : voice.lang.includes('en')
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    
    // Slower speech rate for easy understanding
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  },

  // Stop speaking
  stop() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  },

  // STT: Speech to Text (Voice Search)
  startListening(
    lang: 'en' | 'hi',
    onResult: (text: string) => void,
    onError: (err: unknown) => void,
    onEnd: () => void
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognition = 
      win.SpeechRecognition || 
      win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError("Your browser does not support voice input. Please type instead.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      onResult(speechToText);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      onError(event.error || "Voice error");
    };

    recognition.onend = () => {
      onEnd();
    };

    recognition.start();
    return recognition;
  }
};
