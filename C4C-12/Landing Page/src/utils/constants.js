/**
 * @file constants.js
 * @description Holds all the text, colors, and static configuration used across the GraamSehat brand website.
 * Centralizes content for easier maintenance and translation support.
 */

export const COLORS = {
  primary: "#0D9488", // Teal
  secondary: "#1D4ED8", // Navy Blue
  accent: "#D97706", // Amber
};

export const HERO_TEXT = {
  title: "Doctor ki Samajh, Gaon ke Haath Mein",
  subtitle: "India's first offline-first NFC health ecosystem for rural communities",
  ctaLearnMore: "Learn More",
  ctaDownload: "Download Apps",
  stats: [
    { value: 3.5, suffix: "Crore", label: "Undiagnosed Patients", description: "Target rural population lacking access to screenings" },
    { value: 10.4, suffix: "Lakh", label: "ASHA Workers", description: "Empowered frontline healthcare advocates" },
    { value: 5, suffix: "", label: "Indian Languages", description: "Hindi, Bengali, Marathi, Telugu, and English" },
  ]
};

export const PROBLEM_TEXT = {
  title: "The Problem",
  subtitle: "Why rural healthcare delivery fails at the last mile",
  cards: [
    {
      id: 1,
      title: "No Local Doctor Access",
      desc: "Primary Health Centres (PHCs) are often 15-20km away with severe absenteeism of medical personnel."
    },
    {
      id: 2,
      title: "Paper Record Loss",
      desc: "Health history is kept on paper slips that get damaged, misplaced, or are not carried during emergencies."
    },
    {
      id: 3,
      title: "Zero Connectivity",
      desc: "Internet dropouts render cloud-based health apps completely useless in deep rural environments."
    },
    {
      id: 4,
      title: "High Referral Friction",
      desc: "Patients must travel to cities for simple consultant advice, resulting in massive wage loss."
    },
    {
      id: 5,
      title: "Undiagnosed Diseases",
      desc: "Hypertension, diabetes, and cancers go undetected until they reach late, non-treatable stages."
    },
    {
      id: 6,
      title: "Overworked Frontline",
      desc: "ASHA workers spend more time filling tedious paper forms than actually examining patients."
    }
  ],
  story: {
    title: "Lakshmi's Story: The Cost of Fragmented Care",
    timeline: [
      {
        stage: "Stage 1",
        title: "The Silent Symptoms",
        desc: "Lakshmi, a 48-year-old weaver in rural Bihar, develops chronic headaches and fatigue. She assumes it's due to the heat."
      },
      {
        stage: "Stage 2",
        title: "Lost Health Slips",
        desc: "An ASHA worker notes her elevated blood pressure on a paper form. The slip is lost in the monsoon rains a week later."
      },
      {
        stage: "Stage 3",
        title: "The Crisis",
        desc: "Two months later, Lakshmi collapses. Her family borrows money at 10% monthly interest to hire a private vehicle to the district hospital."
      },
      {
        stage: "Stage 4",
        title: "The Diagnosis",
        desc: "Doctors diagnose a severe stroke triggered by untreated chronic hypertension. Immediate treatment is started, but mobility is permanently compromised."
      },
      {
        stage: "Stage 5",
        title: "Financial Ruin",
        desc: "The family spends ₹45,000 on hospital bills—exceeding their annual income—and falls into deep generational debt."
      }
    ]
  }
};

export const HOW_IT_WORKS = {
  title: "How It Works",
  subtitle: "Our offline-first NFC clinical workflow is simple, fast, and secure.",
  steps: [
    {
      step: "01",
      title: "Scan Health Card",
      desc: "ASHA worker taps the patient's offline NFC health card on her smartphone. The complete medical history loads instantly, even without internet access.",
      mockupText: "NFC Tap: Scanning Card ID GS-8927...",
      deviceType: "phone"
    },
    {
      step: "02",
      title: "Input Vitals",
      desc: "She measures vitals (BP, glucose, SpO2) using portable sensors and logs them in the app. Data is auto-saved locally on the device.",
      mockupText: "Vitals: Sys: 138, Dia: 88, Sugar: 120 mg/dL",
      deviceType: "phone"
    },
    {
      step: "03",
      title: "Instant Offline Feedback",
      desc: "The app uses on-device triage algorithms to give the patient color-coded health warnings and basic advisories in their local language.",
      mockupText: "⚠️ Pre-hypertension. Avoid excessive salt intake.",
      deviceType: "phone"
    },
    {
      step: "04",
      title: "Doctor Sync & Follow-up",
      desc: "When the ASHA worker returns to an area with connectivity, data syncs to the cloud. Remote doctors review alerts and send prescription updates.",
      mockupText: "Dr. Sharma: Recommended lifestyle modifications + review in 30 days.",
      deviceType: "dashboard"
    }
  ]
};

export const PILLARS_TEXT = {
  title: "The 5 Pillars of GraamSehat",
  subtitle: "A holistic digital health ecosystem engineered specifically for rural India.",
  pillars: [
    {
      title: "NFC Health Card",
      desc: "A durable, battery-free card that securely holds patient vitals, history, and demographics offline. Costs under ₹15.",
      color: "border-teal-500",
      bg: "bg-teal-50/50",
      accent: "#0D9488",
      iconName: "CreditCard"
    },
    {
      title: "ASHA Worker App",
      desc: "A multilingual, offline-first Android application designed with giant buttons and simplified workflows for fast screening.",
      color: "border-blue-500",
      bg: "bg-blue-50/50",
      accent: "#1D4ED8",
      iconName: "Smartphone"
    },
    {
      title: "Villager App",
      desc: "A lightweight web app allowing patients to view their prescription history, scan cards using Web-NFC, and read local health content.",
      color: "border-amber-500",
      bg: "bg-amber-50/50",
      accent: "#D97706",
      iconName: "Users"
    },
    {
      title: "IVR Phone Line",
      desc: "A toll-free phone number that reads back the latest doctor advice and medicine dosage in the villager's native dialect via automated calls.",
      color: "border-purple-500",
      bg: "bg-purple-50/50",
      accent: "#8B5CF6",
      iconName: "PhoneCall"
    },
    {
      title: "Admin Dashboard",
      desc: "A central control centre for block medical officers to track disease hotspots, manage ASHA registrations, and audit medicine stocks.",
      color: "border-emerald-500",
      bg: "bg-emerald-50/50",
      accent: "#10B981",
      iconName: "LayoutDashboard"
    }
  ]
};

export const STATS_SECTION = {
  title: "Proven Impact & Efficiency",
  subtitle: "Designed to run with zero added infrastructure, leveraging existing resources.",
  stats: [
    { value: 3.5, suffix: "Cr", label: "Target Population", subtext: "Aims to cover rural clusters across 4 states" },
    { value: 0, prefix: "₹", suffix: "", label: "Infrastructure Cost", subtext: "Uses existing ASHA and family smartphones" },
    { value: 24, suffix: "hr", label: "Sync SLA Window", subtext: "Guaranteed doctor consultation feedback loop" },
    { value: 5, suffix: "", label: "Languages Supported", subtext: "Hindi, Marathi, Telugu, Bengali & English" }
  ]
};

export const APP_DOWNLOADS = [
  {
    id: "villager",
    name: "Villager App",
    description: "Access your medical records, scan cards using your phone's NFC, and receive local health notifications.",
    platform: "Web PWA",
    version: "v1.2.4 (Stable)",
    ctaText: "Open Web App",
    isPublic: true,
    badge: "Public Access"
  },
  {
    id: "asha",
    name: "ASHA Worker App",
    description: "Register patients, issue NFC health cards, and perform offline-first health screenings in remote areas.",
    platform: "Web PWA / Android APK",
    version: "v2.0.1-beta (Secure)",
    ctaText: "Request Access",
    isPublic: false,
    badge: "ASHA Workers Only"
  },
  {
    id: "admin",
    name: "Admin Dashboard",
    description: "Monitor community disease patterns, verify ASHA worker profiles, and review regional analytics.",
    platform: "Web App (Desktop)",
    version: "v2.1.0 (Enterprise)",
    ctaText: "Admin Login",
    isPublic: false,
    badge: "Admins Only"
  }
];
