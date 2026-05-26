import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { Message, Option } from "@/types/chat";
import {
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Search,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Phone,
  ArrowLeft,
  Loader2,
  Check,
  BookOpen,
  Sparkles,
  UploadCloud, 
  FileText
} from "lucide-react";
import { useChatStore } from "@/store/useChatStore";

interface MessageBubbleProps {
  message: Message;
  isLatest: boolean;
  onOptionSelect: (option: Option) => void;
  onMultiSelectSubmit?: (options: Option[]) => void;
  onTextSubmit: (text: string) => void;
}

// --------------------------------------------------------
// MULTILINGUAL UI TRANSLATIONS (For Uploads & Actions)
// --------------------------------------------------------
const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    automated_actions: "Automated Actions Available",
    apply_for: "Apply for",
    auto_fill: "Auto-fill via AI Agent",
    upload_docs: "Upload Required Documents",
    drag_drop: "Drag and drop your files here, or tap to browse. (Aadhaar, PAN, etc.)",
    submit_btn: "Submit & Auto-Apply",
    extracting: "Extracting Details...",
    network_error: "Network error. Please ensure the OCR backend is running.",
    ocr_success_msg: "I have uploaded my documents. Please review the extracted details.",
    upload_success: "Documents processed successfully! Redirecting..."
  },
  hi: {
    automated_actions: "स्वचालित कार्रवाइयां उपलब्ध हैं",
    apply_for: "के लिए आवेदन करें",
    auto_fill: "AI एजेंट के माध्यम से ऑटो-फिल",
    upload_docs: "आवश्यक दस्तावेज़ अपलोड करें",
    drag_drop: "अपनी फ़ाइलें यहाँ खींचें और छोड़ें, या ब्राउज़ करने के लिए टैप करें। (आधार, पैन, आदि)",
    submit_btn: "जमा करें और ऑटो-अप्लाई करें",
    extracting: "विवरण निकाला जा रहा है...",
    network_error: "नेटवर्क त्रुटि। कृपया सुनिश्चित करें कि OCR बैकएंड चल रहा है।",
    ocr_success_msg: "मैंने अपने दस्तावेज़ अपलोड कर दिए हैं। कृपया निकाले गए विवरणों की समीक्षा करें।",
    upload_success: "दस्तावेज़ सफलतापूर्वक संसाधित किए गए! अनुप्रेषित किया जा रहा है..."
  },
  ta: {
    automated_actions: "தானியங்கு செயல்கள் உள்ளன",
    apply_for: "விண்ணப்பிக்கவும்",
    auto_fill: "AI மூலம் தானாக நிரப்பு",
    upload_docs: "தேவையான ஆவணங்களைப் பதிவேற்றவும்",
    drag_drop: "உங்கள் கோப்புகளை இங்கே இழுத்து விடவும் அல்லது உலாவ தட்டவும். (ஆதார், பான் போன்றவை)",
    submit_btn: "சமர்ப்பித்து தானாக விண்ணப்பிக்கவும்",
    extracting: "விவரங்களைப் பிரித்தெடுக்கிறது...",
    network_error: "நெட்வொர்க் பிழை. OCR பின்புலம் இயங்குகிறதா என்பதை உறுதிப்படுத்தவும்.",
    ocr_success_msg: "நான் எனது ஆவணங்களைப் பதிவேற்றியுள்ளேன். பிரித்தெடுக்கப்பட்ட விவரங்களை மதிப்பாய்வு செய்யவும்.",
    upload_success: "ஆவணங்கள் வெற்றிகரமாக செயலாக்கப்பட்டன! வழிமாற்றுகிறது..."
  },
  te: {
    automated_actions: "స్వయంచాలక చర్యలు అందుబాటులో ఉన్నాయి",
    apply_for: "దరఖాస్తు చేయండి",
    auto_fill: "AI ఏజెంట్ ద్వారా ఆటో-ఫిల్",
    upload_docs: "అవసరమైన పత్రాలను అప్‌లోడ్ చేయండి",
    drag_drop: "మీ ఫైల్‌లను ఇక్కడ లాగి వదలండి లేదా బ్రౌజ్ చేయడానికి నొక్కండి. (ఆధార్, పాన్ మొదలైనవి)",
    submit_btn: "సమర్పించి ఆటో-అప్లై చేయండి",
    extracting: "వివరాలను సంగ్రహిస్తోంది...",
    network_error: "నెట్‌వర్క్ లోపం. దయచేసి OCR బ్యాకెండ్ నడుస్తుందో లేదో నిర్ధారించుకోండి.",
    ocr_success_msg: "నేను నా పత్రాలను అప్‌లోడ్ చేసాను. దయచేసి సంగ్రహించిన వివరాలను సమీక్షించండి.",
    upload_success: "పత్రాలు విజయవంతంగా ప్రాసెస్ చేయబడ్డాయి! దారి మళ్లిస్తోంది..."
  },
  bn: {
    automated_actions: "স্বয়ংক্রিয় ক্রিয়া উপলব্ধ",
    apply_for: "আবেদন করুন",
    auto_fill: "এআই এজেন্টের মাধ্যমে অটো-ফিল",
    upload_docs: "প্রয়োজনীয় নথি আপলোড করুন",
    drag_drop: "আপনার ফাইলগুলি এখানে টেনে আনুন, অথবা ব্রাউজ করতে আলতো চাপুন। (আধার, প্যান, ইত্যাদি)",
    submit_btn: "জমা দিন এবং অটো-অ্যাপ্লাই করুন",
    extracting: "বিবরণ বের করা হচ্ছে...",
    network_error: "নেটওয়ার্ক ত্রুটি। অনুগ্রহ করে নিশ্চিত করুন যে OCR ব্যাকএন্ড চলছে।",
    ocr_success_msg: "আমি আমার নথি আপলোড করেছি। অনুগ্রহ করে নিষ্কাশিত বিবরণ পর্যালোচনা করুন।",
    upload_success: "নথি সফলভাবে প্রক্রিয়া করা হয়েছে! পুনঃনির্দেশিত করা হচ্ছে..."
  },
  kan: {
    automated_actions: "ಸ್ವಯಂಚಾಲಿತ ಕ್ರಿಯೆಗಳು ಲಭ್ಯವಿದೆ",
    apply_for: "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
    auto_fill: "AI ಏಜೆಂಟ್ ಮೂಲಕ ಸ್ವಯಂ-ಭರ್ತಿ",
    upload_docs: "ಅಗತ್ಯವಿರುವ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    drag_drop: "ನಿಮ್ಮ ಫೈಲ್‌ಗಳನ್ನು ಇಲ್ಲಿ ಎಳೆದು ಬಿಡಿ, ಅಥವಾ ಬ್ರೌಸ್ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ. (ಆಧಾರ್, ಪ್ಯಾನ್, ಇತ್ಯಾದಿ)",
    submit_btn: "ಸಲ್ಲಿಸಿ ಮತ್ತು ಸ್ವಯಂ-ಅನ್ವಯಿಸಿ",
    extracting: "ವಿವರಗಳನ್ನು ಹೊರತೆಗೆಯಲಾಗುತ್ತಿದೆ...",
    network_error: "ನೆಟ್‌ವರ್ಕ್ ದೋಷ. ದಯವಿಟ್ಟು OCR ಬ್ಯಾಕೆಂಡ್ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆಯೇ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
    ocr_success_msg: "ನಾನು ನನ್ನ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಹೊರತೆಗೆಯಲಾದ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    upload_success: "ದಾಖಲೆಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಂಸ್ಕರಿಸಲಾಗಿದೆ! ಮರುನಿರ್ದೇಶಿಸಲಾಗುತ್ತಿದೆ..."
  }
};

// --------------------------------------------------------
// PREMIUM 2-STEP MOBILE VERIFICATION COMPONENT
// --------------------------------------------------------
const MobileVerificationCard: React.FC<{ onSubmit: (phone: string) => void }> = ({ onSubmit }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Use env variable, fallback to the teammate's specific IP for the hackathon
  const API_BASE = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://10.27.0.10:8080";

  // STEP 1: Call your teammate's Send OTP endpoint
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit number.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          role: "artisan", // Hardcoded per your backend spec, or pull from Zustand
          lang: "hi"       // Updated to match your expected backend route
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStep('otp');
        // Auto-focus first OTP input slightly after render
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(data.error || "Failed to send OTP.");
      }
    } catch (err) {
      setError("Network error. Make sure the backend is running.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Call your teammate's Verify OTP endpoint
  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          otp: otpString
        })
      });
      
      const data = await response.json();

      if (data.success) {
        // Successfully verified! Save the access token securely.
        localStorage.setItem('access_token', data.data.tokens.access_token);
        
        // Pass the phone number back to the chat to trigger the next AI question
        onSubmit(phone);
      } else {
        setError(data.error || "Incorrect OTP.");
        // Clear the OTP fields so they can try again
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    } catch (err) {
      setError("Network error while verifying OTP.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Input Handler
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when the 6th digit is typed
    if (value !== '' && index === 5) {
      setTimeout(() => {
        const submitButton = document.getElementById('verify-otp-btn');
        if (submitButton) submitButton.click();
      }, 50);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 w-full max-w-sm mx-auto">
      <div className="flex justify-center mb-6">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
          <Phone size={24} strokeWidth={2} />
        </div>
      </div>
      
      {step === 'phone' ? (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Verify your number</h3>
            <p className="text-sm text-slate-500">We'll send you a secure OTP</p>
          </div>
          
          <div>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400 font-medium">+91</span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter mobile number"
                className="w-full bg-slate-50 border border-gray-200 text-slate-900 rounded-xl px-4 py-3 pl-14 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:font-normal"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-2 text-center font-medium">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={phone.length !== 10 || isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Send OTP'
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Enter code</h3>
            <p className="text-sm text-slate-500">Sent to +91 {phone}</p>
          </div>

          <div className="flex justify-between gap-2 mb-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => { otpRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-bold bg-slate-50 border border-gray-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
              />
            ))}
          </div>
          
          {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

          <button
            id="verify-otp-btn"
            onClick={handleVerify}
            disabled={otp.join('').length !== 6 || isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3.5 rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Verify & Continue'
            )}
          </button>
          
          <button 
            onClick={() => { setStep('phone'); setError(null); }}
            className="w-full text-sm text-slate-500 hover:text-slate-800 font-medium py-2 transition-colors mt-2"
          >
            Change number
          </button>
        </div>
      )}
    </div>
  );
};

// --------------------------------------------------------
// MAIN MESSAGE BUBBLE
// --------------------------------------------------------
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isLatest,
  onOptionSelect,
  onMultiSelectSubmit,
  onTextSubmit,
}) => {
  const isAI = message.role === "ai";
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { setSidePanel, profile } = useChatStore();
  
  // Resolve Language using Zustand state profile
  const langCode = (profile.preferredLanguage as string) || 'en';
  const t = UI_TRANSLATIONS[langCode] || UI_TRANSLATIONS['en'];

  // MULTI-SELECT LOGIC
  const isMultiSelect = message.field === "needCategory" || message.field === "existingRegistrations";
  const [selectedMulti, setSelectedMulti] = useState<Option[]>([]);

  // UPLOAD LOGIC & STATES
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleOcrSubmit = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    // 1. Create the multipart payload
    const formData = new FormData();
    
    // 2. Append all uploaded images
    uploadedFiles.forEach((file) => {
      formData.append("files", file); 
    });
    
    // 3. Append the document type
    formData.append("doc_type", "aadhaar");

    try {
      // 4. Fire the request
      const OCR_API = process.env.NEXT_PUBLIC_OCR_API_URL || "https://kaarigarconnect-production.up.railway.app";
      const response = await fetch(`${OCR_API}/api/v1/automate/ocr`, {
        method: "POST",
        body: formData,
        // ⚠️ CRITICAL WARNING: Browser handles Content-Type and boundary automatically! Do not set headers manually.
      });

      const result = await response.json();
      
      if (result.success) {
        // --- NEW DATA INJECTION LOGIC ---
        // Extract the required data from your OCR endpoint
        let autoFillData = result.data?.categorized?.auto_fill;
        
        // If no proper data is extracted, fallback to dummy data
        if (!autoFillData || Object.keys(autoFillData).length === 0) {
          autoFillData = { name: "prince kumar" };
          console.log("No proper data extracted. Using dummy data:", autoFillData);
        } else {
          console.log("Auto-Fill these into UI:", autoFillData);
        }

        console.log("Ask user to review:", result.data?.categorized?.needs_review);
        
        // Show success banner
        setUploadSuccess(true);

        // Notify chat so AI can transition to Playwright confirmation
        onTextSubmit(t.ocr_success_msg);
        
        // --- NEW REDIRECT LOGIC ---
        // Wait 1.5 seconds so the user can see the success state, then redirect
        setTimeout(() => {
          window.location.href = "https://women-ent-8q33-74qlh4hcd-priyanshivora1006-8861s-projects.vercel.app/";
        }, 1500);

      } else {
        setUploadError(result.error || "Failed to process documents.");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError(t.network_error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleMultiToggle = (option: Option) => {
    if (option.value === "none") {
      setSelectedMulti([option]);
      return;
    }
    
    setSelectedMulti((prev) => {
      const filtered = prev.filter((p) => p.value !== "none");
      const exists = filtered.find((p) => p.value === option.value);
      if (exists) return filtered.filter((p) => p.value !== option.value); 
      return [...filtered, option]; 
    });
  };

  const isPillsOnly = message.field === "preferredLanguage";
  const isSearchable = !isPillsOnly && message.options && message.options.length > 8;
  const hasDetailedOptions = !isPillsOnly && message.options?.some((opt) => opt.description);

  const displayedOptions = message.options?.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.description && opt.description.toLowerCase().includes(searchTerm.toLowerCase())),
  ) || [];

  return (
    <>
      <div
        className={`flex w-full ${isAI ? "justify-start" : "justify-end"} ${isLatest && message.field === "mobileNumber" ? "mb-6" : "mb-8"} animate-fade-in-up`}
      >
        <div
          className={`max-w-[90%] sm:max-w-[75%] flex flex-col gap-3 ${isAI ? "items-start" : "items-end"}`}
        >
          <div
            className={`px-5 py-4 rounded-3xl text-[15px] leading-relaxed tracking-wide
              ${
                isAI
                  ? "bg-white border border-gray-100 text-slate-700 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-tl-sm"
                  : "bg-slate-900 text-white shadow-md rounded-tr-sm"
              }`}
          >
            <ReactMarkdown
              components={{
                p: ({node, ...props}) => <p className="mb-3 last:mb-0 leading-relaxed" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold text-indigo-900" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1.5 marker:text-indigo-400" {...props} />,
                li: ({node, ...props}) => <li className="text-slate-700" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 mt-4" {...props} />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {message.options && message.options.length > 0 && (
            <div className="w-full mt-2">
              {isSearchable && (
                <div className="mb-4 relative sm:min-w-95">
                  <input
                    type="text"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-sm text-slate-800 rounded-xl px-4 py-3.5 pl-11 focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-300 transition-all placeholder:text-gray-400 shadow-sm"
                  />
                  <Search
                    className="absolute left-4 top-4 text-gray-400"
                    size={16}
                  />
                </div>
              )}

              <div
                className={`
                ${isPillsOnly ? "flex flex-wrap gap-2.5" : "flex flex-col gap-3 sm:min-w-95"}
                ${isSearchable ? "max-h-95 overflow-y-auto pr-2 pb-2 custom-scrollbar-light" : ""}
              `}
              >
                {displayedOptions.length === 0 ? (
                  <div className="text-sm text-gray-400 italic px-2 py-4 text-center border border-dashed border-gray-200 rounded-xl">
                    No options found.
                  </div>
                ) : (
                  displayedOptions.map((option) => {
                    const isSelected = selectedMulti.some((p) => p.value === option.value);

                    if (!hasDetailedOptions) {
                      return (
                        <button
                          key={option.value}
                          onClick={() => isMultiSelect ? handleMultiToggle(option) : onOptionSelect(option)}
                          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:-translate-y-0.5 ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                              : "bg-white border-gray-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:shadow-md"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    }

                    const isExpanded = expandedOption === option.value;
                    return (
                      <div
                        key={option.value}
                        className={`bg-white border rounded-2xl overflow-hidden flex flex-col transition-all duration-300 shadow-sm shrink-0 ${
                          isSelected
                            ? "border-indigo-500 shadow-indigo-100"
                            : "border-gray-200 hover:shadow-md hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between group">
                          <button
                            onClick={() => isMultiSelect ? handleMultiToggle(option) : onOptionSelect(option)}
                            className="flex-1 flex items-center gap-3 text-left px-5 py-4 font-medium text-slate-800 group-hover:text-slate-900 transition-colors"
                          >
                            {/* Visual Checkbox for Multi-Select */}
                            {isMultiSelect && (
                              <div
                                className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                                  isSelected
                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                    : "bg-slate-50 border-gray-300"
                                }`}
                              >
                                {isSelected && <Check size={14} strokeWidth={3} />}
                              </div>
                            )}
                            {option.label}
                          </button>

                          {option.description && (
                            <button
                              onClick={() =>
                                setExpandedOption(
                                  isExpanded ? null : option.value,
                                )
                              }
                              className={`p-4 border-l border-gray-100 text-gray-400 h-14 hover:text-slate-900 hover:bg-gray-50 transition-colors flex items-center justify-center ${isExpanded ? "bg-gray-50" : ""}`}
                              title="View description"
                            >
                              {isExpanded ? (
                                <ChevronDown size={18} />
                              ) : (
                                <ChevronRight
                                  size={18}
                                  className="group-hover:translate-x-0.5 transition-transform"
                                />
                              )}
                            </button>
                          )}
                        </div>

                        {/* EXPANDED CONTENT WITH CONDITIONAL "SEE VISUAL GUIDE" BUTTON */}
                        {isExpanded && option.description && (
                          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 text-[14px] text-slate-600 leading-relaxed animate-fade-in-up">
                            <p>{option.description}</p>

                            <div className="flex items-center gap-3 mt-4">
                              {/* STRICT CONDITION: Only show for Registrations, and exclude the "None" option */}
                              {message.field === "existingRegistrations" &&
                                option.value !== "none" && (
                                  <button
                                    onClick={() =>
                                      setSidePanel(true, "detail", option)
                                    }
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 rounded-xl font-medium transition-all duration-300"
                                  >
                                    <BookOpen size={16} /> Explain with Visuals
                                  </button>
                                )}

                              {/* Official Gov Link */}
                              {option.infoLink && (
                                <a
                                  href={option.infoLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-indigo-800 font-medium transition-colors"
                                >
                                  Govt Link <ExternalLink size={14} />
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* NEW: CONFIRM BUTTON FOR MULTI-SELECT */}
              {isMultiSelect && displayedOptions.length > 0 && isLatest && (
                <div className="mt-4 flex justify-end animate-fade-in-up">
                  <button
                    disabled={selectedMulti.length === 0}
                    onClick={() => onMultiSelectSubmit && onMultiSelectSubmit(selectedMulti)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Confirm Selection <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* NEW: PLAYWRIGHT ACTION TRIGGER BUTTONS */}
          {message.matchedSchemes && message.matchedSchemes.length > 0 && (
            <div className="flex flex-col gap-2 mt-4 w-full sm:min-w-[380px] animate-fade-in-up delay-300">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 px-1">
                {t.automated_actions}
              </div>
              {message.matchedSchemes.map((schemeId) => (
                <button
                  key={schemeId}
                  onClick={() => {
                    console.log(`Triggering Playwright agent for: ${schemeId}`);
                    alert(`Starting automated application for ${schemeId}...`);
                  }}
                  className="flex items-center justify-between w-full px-5 py-4 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-2xl transition-all duration-300 group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Sparkles size={16} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-emerald-900 group-hover:text-emerald-950">
                        {t.apply_for} {schemeId.split('_')[0].toUpperCase()}
                      </h4>
                      <p className="text-[11px] font-medium text-emerald-700">{t.auto_fill}</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          )}

          {/* OCR FILE UPLOAD COMPONENT */}
          {message.requiresUpload && isLatest && (
            <div className="mt-5 w-full sm:min-w-[380px] animate-fade-in-up delay-300">
              <div className="bg-white border-2 border-dashed border-indigo-200 rounded-2xl p-6 text-center hover:bg-indigo-50/50 transition-colors relative">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                
                <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-2">
                    <UploadCloud size={24} />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800">{t.upload_docs}</h4>
                  <p className="text-xs text-slate-500 max-w-[200px]">
                    {t.drag_drop}
                  </p>
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                      <FileText size={16} className="text-indigo-500 shrink-0" />
                      <span className="text-sm text-slate-700 truncate font-medium flex-1">{file.name}</span>
                      <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                  
                  {/* Error Message Display */}
                  {uploadError && (
                    <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl border border-red-100 text-center">
                      {uploadError}
                    </div>
                  )}

                  {/* Success Message Display */}
                  {uploadSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-xl border border-emerald-100 text-center flex items-center justify-center gap-2">
                      <Check size={16} />
                      {t.upload_success}
                    </div>
                  )}

                  {/* Ready to Submit Button with Spinner */}
                  {!uploadSuccess && (
                    <button 
                      onClick={handleOcrSubmit}
                      disabled={isUploading}
                      className="mt-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          {t.extracting}
                        </>
                      ) : (
                        t.submit_btn
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* COMMENTED OUT TEMPORARILY:
        Uncomment this block when you want to re-enable the OTP verification flow.

      {isAI && isLatest && message.field === "mobileNumber" && (
        <div
          className="flex w-full justify-center mb-10 px-4 animate-fade-in-up"
          style={{ animationDelay: "100ms" }}
        >
          <MobileVerificationCard onSubmit={onTextSubmit} />
        </div>
      )} 
      */}
     
    </>
  );
};