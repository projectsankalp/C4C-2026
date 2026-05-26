// A mock Supabase client to simulate Auth, Storage, and Database.
// This allows the application to be fully interactive and store state in localStorage.

export interface UserProfile {
  id: string;
  phone: string;
  name: string;
  trade: string; // tailoring, beauty, foodprep
  experience: string;
  photoUrl: string;
  portfolioUrls: string[];
  quizScore: number | null;
  assessmentStatus: 'unverified' | 'pending' | 'verified';
  skillLevel: 'Beginner' | 'Intermediate' | 'Expert' | null;
  certifiedAt: string | null;
}

const STORAGE_KEY = 'narishakti_user_profile';

export const SupabaseMock = {
  // Mock Auth
  async login(phone: string): Promise<UserProfile> {
    // Check if user already exists
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const profile = JSON.parse(stored) as UserProfile;
      if (profile.phone === phone) {
        return profile;
      }
    }

    // Create a new default profile
    const newProfile: UserProfile = {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      phone,
      name: "Suman Devi", // default placeholders that can be customized
      trade: "tailoring",
      experience: "3",
      photoUrl: "", // default empty
      portfolioUrls: [],
      quizScore: null,
      assessmentStatus: 'unverified',
      skillLevel: null,
      certifiedAt: null
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    return newProfile;
  },

  async getProfile(): Promise<UserProfile | null> {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = await this.getProfile();
    if (!current) throw new Error("No user logged in");
    
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // Mock Storage Upload (converts File to Base64 to save in localStorage)
  async uploadFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = error => reject(error);
    });
  },

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }
};
