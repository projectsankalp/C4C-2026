import axios from "axios";

// Default local backend port is 5000
const BASE_URL = "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically inject JWT token from localStorage if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("arogya_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const api = {
  // --- AUTH SERVICES ---
  auth: {
    sendOtp: async (phone) => {
      const response = await apiClient.post("/auth/send-otp", { phone });
      return response.data;
    },
    verifyOtp: async (phone, otp) => {
      const response = await apiClient.post("/auth/verify-otp", { phone, otp });
      if (response.data.success && response.data.token) {
        localStorage.setItem("arogya_token", response.data.token);
        localStorage.setItem("arogya_user_id", response.data.user._id);
      }
      return response.data;
    },
    register: async (profileData) => {
      const response = await apiClient.post("/auth/register", profileData);
      return response.data;
    }
  },

  // --- DASHBOARD SERVICES ---
  dashboard: {
    getData: async (userId) => {
      const response = await apiClient.get(`/dashboard/${userId}`);
      return response.data;
    }
  },

  // --- PROFILE SERVICES ---
  profile: {
    get: async (userId) => {
      const response = await apiClient.get(`/profile/${userId}`);
      return response.data;
    },
    update: async (userId, profileData) => {
      const response = await apiClient.put(`/profile/${userId}`, profileData);
      return response.data;
    },
    changeLanguage: async (userId, language) => {
      const response = await apiClient.post(`/profile/${userId}/language`, { language });
      return response.data;
    },
    getSettings: async (userId) => {
      const response = await apiClient.get(`/profile/${userId}/settings`);
      return response.data;
    },
    triggerTestCall: async (userId) => {
      const response = await apiClient.post(`/profile/${userId}/test-call`);
      return response.data;
    }
  },

  // --- PREDICTION SERVICES (ML-powered Health Screening) ---
  predict: {
    saveRecord: async (userId, answers) => {
      const response = await apiClient.post("/predict", { userId, answers });
      return response.data;
    },
    getRecords: async (userId) => {
      const response = await apiClient.get(`/predict/${userId}`);
      return response.data;
    }
  },

  // --- HOSPITAL SERVICES ---
  hospitals: {
    getAll: async () => {
      const response = await apiClient.get("/hospitals");
      return response.data;
    },
    getGov: async () => {
      const response = await apiClient.get("/hospitals/government");
      return response.data;
    },
    getPrivate: async () => {
      const response = await apiClient.get("/hospitals/private");
      return response.data;
    },
    getTesting: async () => {
      const response = await apiClient.get("/hospitals/testing");
      return response.data;
    },
    getNearestPHC: async () => {
      const response = await apiClient.get("/hospitals/nearest-phc");
      return response.data;
    }
  },

  // --- APPOINTMENT SERVICES ---
  appointments: {
    book: async (appointmentData) => {
      const response = await apiClient.post("/appointments", appointmentData);
      return response.data;
    },
    getByUser: async (userId) => {
      const response = await apiClient.get(`/appointments/user/${userId}`);
      return response.data;
    },
    cancel: async (id) => {
      const response = await apiClient.put(`/appointments/${id}/cancel`);
      return response.data;
    }
  },

  // --- EMERGENCY SERVICES ---
  emergency: {
    create: async (emergencyData) => {
      const response = await apiClient.post("/emergency", emergencyData);
      return response.data;
    },
    getHistory: async (userId) => {
      const response = await apiClient.get(`/emergency/history/${userId}`);
      return response.data;
    },
    resolve: async (id) => {
      const response = await apiClient.put(`/emergency/${id}/resolve`);
      return response.data;
    }
  },

  // --- NOTIFICATION SERVICES ---
  notifications: {
    get: async (userId) => {
      const response = await apiClient.get(`/notifications/user/${userId}`);
      return response.data;
    },
    markRead: async (id) => {
      const response = await apiClient.put(`/notifications/${id}/read`);
      return response.data;
    },
    sendMedicineReminder: async (userId) => {
      const response = await apiClient.post(`/notifications/user/${userId}/medicine-reminder`);
      return response.data;
    },
    sendAppointmentReminder: async (userId) => {
      const response = await apiClient.post(`/notifications/user/${userId}/appointment-reminder`);
      return response.data;
    }
  },

  // --- VOICE AGENTS (VAPI OUTBOUND CALLS) ---
  voice: {
    triggerHealthAssistant: async (phoneNumber) => {
      const response = await apiClient.post("/voice/assistant", { phoneNumber });
      return response.data;
    },
    triggerEmergencyAssistant: async (phoneNumber) => {
      const response = await apiClient.post("/voice/emergency", { phoneNumber });
      return response.data;
    },
    triggerSchedulerAssistant: async (phoneNumber) => {
      const response = await apiClient.post("/voice/scheduler", { phoneNumber });
      return response.data;
    }
  },

  // --- AWARENESS & GENERAL ---
  awareness: {
    getTips: async () => {
      const response = await apiClient.get("/awareness/tips");
      return response.data;
    }
  },
  languages: {
    get: async () => {
      const response = await apiClient.get("/languages");
      return response.data;
    }
  }
};
