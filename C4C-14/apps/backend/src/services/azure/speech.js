// Placeholder for Azure Speech Services
// Used for extracting text and behavioral indicators from voice

class SpeechService {
  async processAudioToText(audioBuffer) {
    console.log('Mock: Converting speech to text...');
    return { transcript: 'I am feeling okay today.', confidence: 0.95 };
  }
}

module.exports = new SpeechService();
