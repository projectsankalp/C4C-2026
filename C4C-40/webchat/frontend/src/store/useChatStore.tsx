import { create } from 'zustand';
import { Message, UserProfile } from '@/types/chat';

export type SidePanelView = 'tracker' | 'detail';

interface ChatState {
  messages: Message[];
  profile: UserProfile;
  currentStepIndex: number;
  isBotTyping: boolean;
  
  // Side Panel State
  isSidePanelOpen: boolean;
  sidePanelView: SidePanelView;
  sidePanelData: any | null;

  isCallMode: boolean;
  setCallMode: (isCallMode: boolean) => void;

  isOnboardingComplete: boolean;
  setOnboardingComplete: (status: boolean) => void;

  addMessage: (message: Message) => void;
  updateProfileField: (field: keyof UserProfile, value: any) => void;
  setBotTyping: (typing: boolean) => void;
  clearOptionsFromLastMessage: () => void;
  resetChat: () => void;
  
  // Side Panel Actions
  setSidePanel: (isOpen: boolean, view?: SidePanelView, data?: any) => void;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'init-1',
    role: 'ai',
    content: "Welcome! To help you find the best government schemes or microloans, I need to collect a few essential details about your business venture. Let's start with your full name.",
  },
];

const INITIAL_PROFILE: UserProfile = {
  fullName: '',
  mobileNumber: '',
  state: '', 
  preferredLanguage: '',
  businessStage: undefined,
  businessCategory: '',
  annualRevenue: '',
  needCategory: undefined,
  existingRegistrations: [],
};

export const useChatStore = create<ChatState>((set) => ({
  messages: INITIAL_MESSAGES,
  profile: INITIAL_PROFILE,
  currentStepIndex: 0,
  isBotTyping: false,

  isSidePanelOpen: false,
  sidePanelView: 'tracker',
  sidePanelData: null,
  isCallMode: false,
  setCallMode: (isCallMode) => set({ isCallMode }),

  isOnboardingComplete: false,
  setOnboardingComplete: (status) => set({ isOnboardingComplete: status }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateProfileField: (field, value) =>
    set((state) => ({
      profile: { ...state.profile, [field]: value },
    })),

  setBotTyping: (typing) => set({ isBotTyping: typing }),

  clearOptionsFromLastMessage: () =>
    set((state) => {
      if (state.messages.length === 0) return {};
      const updatedMessages = [...state.messages];
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      if (lastMessage.role === 'ai') {
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          options: undefined,
        };
      }
      return { messages: updatedMessages };
    }),

  resetChat: () =>
    set({
      messages: INITIAL_MESSAGES,
      profile: INITIAL_PROFILE,
      currentStepIndex: 0,
      isBotTyping: false,
      isSidePanelOpen: false,
      sidePanelView: 'tracker',
      sidePanelData: null,
      isCallMode: false,
      isOnboardingComplete: false,
    }),

  setSidePanel: (isOpen, view = 'tracker', data = null) =>
    set({ isSidePanelOpen: isOpen, sidePanelView: view, sidePanelData: data }),
}));