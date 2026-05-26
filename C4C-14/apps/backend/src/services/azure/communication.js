// Placeholder for Azure Communication Services
// Used for SMS/Voice call workflows and escalations

class CommunicationService {
  async sendSMS(phoneNumber, message) {
    console.log(`Mock: Sending SMS to ${phoneNumber}`);
    return { success: true };
  }

  async initiateCall(phoneNumber) {
    console.log(`Mock: Initiating voice call to ${phoneNumber}`);
    return { success: true };
  }
}

module.exports = new CommunicationService();
