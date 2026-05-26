"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, Image as ImageIcon, Video, Sparkles, Send, Globe2, Mic, Square, Loader2, X, File as FileIcon, Wand2, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { useState, useRef } from "react";

export default function PostComposer({ linkedProviders = [], user }: { linkedProviders?: string[], user?: any }) {
  const [content, setContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(linkedProviders);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [postLength, setPostLength] = useState<"short" | "medium" | "long">("short");
  const [editingImageIdx, setEditingImageIdx] = useState<number | null>(null);
  const [mediaEdits, setMediaEdits] = useState({ rotate: 0, filter: 'none' });
  
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Character limit ring logic
  const maxChars = 3000;
  const chars = content.length;
  const percentage = Math.min((chars / maxChars) * 100, 100);
  const ringColor = percentage > 90 ? "stroke-nx-coral" : percentage > 75 ? "stroke-nx-amber" : "stroke-nx-mint";

  const [isPublishing, setIsPublishing] = useState(false);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0 || (!content && attachedFiles.length === 0)) return;
    
    // Validation
    const hasImages = attachedFiles.some(f => f.type.startsWith("image/"));
    const videoCount = attachedFiles.filter(f => f.type.startsWith("video/")).length;

    if (hasImages && videoCount > 0) {
      alert("LinkedIn does not allow mixing photos and videos in the same post. Please remove one or the other.");
      return;
    }
    if (videoCount > 1) {
      alert("LinkedIn only allows 1 video per post. Please remove extra videos.");
      return;
    }
    if (attachedFiles.length > 20) {
      alert("LinkedIn allows a maximum of 20 images per post.");
      return;
    }

    if (scheduledDate && new Date(scheduledDate) <= new Date()) {
      alert("Scheduled time must be in the future.");
      return;
    }

    setIsPublishing(true);
    
    try {
      if (selectedPlatforms.includes("linkedin")) {
        let mediaUrns: string[] = [];

        // Upload media files directly to LinkedIn
        for (const file of attachedFiles) {
          if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
            // 1. Get secure upload URL
            const regRes = await fetch("/api/publish/linkedin/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fileType: file.type })
            });
            if (!regRes.ok) throw new Error("Failed to register media upload with LinkedIn");
            const { uploadUrl, assetUrn } = await regRes.json();

            // 2. Upload via backend proxy to bypass browser CORS
            const proxyFormData = new FormData();
            proxyFormData.append("file", file);
            proxyFormData.append("uploadUrl", uploadUrl);

            const uploadRes = await fetch("/api/publish/linkedin/upload", {
              method: "POST",
              body: proxyFormData,
            });
            
            if (!uploadRes.ok) throw new Error("Failed to upload media to LinkedIn proxy");
            mediaUrns.push(assetUrn);
          }
        }

        if (scheduledDate) {
          // Save to Database for later
          const response = await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              content, 
              mediaUrns, 
              scheduledAt: scheduledDate,
              platform: "linkedin"
            })
          });
          
          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Failed to schedule post");
          }
          alert("Post successfully scheduled!");
        } else {
          // 3. Publish post instantly
          const response = await fetch("/api/publish/linkedin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content, mediaUrns })
          });
          
          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Failed to publish to LinkedIn");
          }
          alert("Successfully published to LinkedIn!");
        }
      }
      
      setContent("");
      setAttachedFiles([]);
      setScheduledDate("");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to publish.");
    } finally {
      setIsPublishing(false);
    }
  };



  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setAttachedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const moveFile = (idx: number, direction: 'left' | 'right') => {
    setAttachedFiles(prev => {
      const newArr = [...prev];
      if (direction === 'left' && idx > 0) {
        [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]];
      } else if (direction === 'right' && idx < newArr.length - 1) {
        [newArr[idx + 1], newArr[idx]] = [newArr[idx], newArr[idx + 1]];
      }
      return newArr;
    });
  };

  const toggleRotate = () => {
    setMediaEdits(prev => ({ ...prev, rotate: (prev.rotate + 90) % 360 }));
  };

  const toggleFilter = (filter: string) => {
    setMediaEdits(prev => ({ ...prev, filter: prev.filter === filter ? 'none' : filter }));
  };

  const saveMediaEdits = async () => {
    if (editingImageIdx === null) return;
    
    // If no edits were made, just close
    if (mediaEdits.rotate === 0 && mediaEdits.filter === 'none') {
      setEditingImageIdx(null);
      return;
    }

    const file = attachedFiles[editingImageIdx];
    if (!file.type.startsWith("image/")) return;
    
    setIsGeneratingImage(true);
    try {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      await new Promise(resolve => img.onload = resolve);
      
      const canvas = document.createElement("canvas");
      // If rotated 90 or 270, swap dimensions
      const isRotatedSwapped = mediaEdits.rotate === 90 || mediaEdits.rotate === 270;
      canvas.width = isRotatedSwapped ? img.height : img.width;
      canvas.height = isRotatedSwapped ? img.width : img.height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      // Move to center, apply rotation, apply filter, draw
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(mediaEdits.rotate * Math.PI / 180);
      if (mediaEdits.filter !== 'none') {
        ctx.filter = mediaEdits.filter;
      }
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        const newFile = new File([blob], file.name, { type: file.type });
        setAttachedFiles(prev => {
          const newArr = [...prev];
          newArr[editingImageIdx] = newFile;
          return newArr;
        });
        setEditingImageIdx(null);
        setMediaEdits({ rotate: 0, filter: 'none' });
      }, file.type);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleTranscription(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required to use voice notes.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscription = async (audioBlob: Blob) => {
    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "voice-note.webm");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Transcription failed");
      
      const data = await response.json();
      const transcript = data.text;
      
      await handleGenerate(transcript);
    } catch (err) {
      console.error(err);
      alert("Failed to transcribe audio.");
      setIsGenerating(false);
    }
  };

  const handleGenerate = async (transcript?: string) => {
    setIsGenerating(true);
    try {
      const formData = new FormData();
      if (transcript) formData.append("transcript", transcript);
      else if (aiPrompt) formData.append("transcript", aiPrompt);
      if (content) formData.append("currentText", content);
      formData.append("length", postLength);
      
      attachedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Generation failed");
      }

      const data = await response.json();
      setContent(data.text);
      setAiPrompt("");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to generate post.");
    } finally {
      setIsGenerating(false);
    }
  };
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt })
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate image.");
      }
      
      const blob = await response.blob();
      const file = new File([blob], `ai-image-${Date.now()}.jpg`, { type: "image/jpeg" });
      
      setAttachedFiles(prev => [...prev, file]);
      setShowImagePrompt(false);
      setImagePrompt("");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to generate AI image.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 items-stretch h-full min-h-[600px]">
      
      {/* LEFT: Composer Canvas */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="flex-[3] pr-card flex flex-col relative overflow-hidden"
      >
        <div className="flex justify-between items-center px-8 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <h2 className="font-sans font-semibold text-xl tracking-tight" style={{ color: "#F0F0F5" }}>
            Compose
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-sans uppercase tracking-widest" style={{ color: "#9CA3AF" }}>
              {isGenerating ? "Syncing with AI..." : isRecording ? "Recording..." : chars > 0 ? "Drafting" : "Ready"}
            </span>
            {/* Circular Progress */}
            {!isGenerating && !isRecording && (
              <svg className="w-6 h-6 transform -rotate-90 transition-all">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" style={{ color: "rgba(255,255,255,0.1)" }} />
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" className={ringColor} strokeDasharray="62.8" strokeDashoffset={62.8 - (62.8 * percentage) / 100} />
              </svg>
            )}
            {isRecording && (
              <span className="flex h-2.5 w-2.5 relative mx-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "#EF4444" }}></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: "#EF4444" }}></span>
              </span>
            )}
            {isGenerating && (
              <Loader2 size={18} className="animate-spin" style={{ color: "#4A90E2" }} />
            )}
          </div>
        </div>

        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's the signal today? Type, paste links/code, or attach files for AI to analyze."
          className="flex-1 w-full bg-transparent p-8 font-sans text-lg leading-relaxed resize-none focus:outline-none pb-28"
          style={{ color: "#F0F0F5" }}
          disabled={isGenerating}
        ></textarea>

        {/* Floating Image Prompt */}
        <AnimatePresence>
          {showImagePrompt && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-[116px] left-6 right-6 rounded-2xl p-4 flex gap-3 items-center shadow-2xl z-10"
              style={{ background: "rgba(20,20,30,0.9)", backdropFilter: "blur(20px)", border: "1px solid rgba(247,147,30,0.3)" }}
            >
              <Wand2 size={20} style={{ color: "#F7931E" }} className="shrink-0" />
              <input 
                type="text" 
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe an image to generate... (e.g. 'cyberpunk city sunset')"
                className="flex-1 bg-transparent border-none text-[15px] text-white focus:outline-none placeholder:text-slate-500"
                onKeyDown={(e) => { if(e.key === 'Enter') handleGenerateImage() }}
                disabled={isGeneratingImage}
              />
              <button 
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || !imagePrompt.trim()}
                className="pr-btn-primary whitespace-nowrap px-4 py-2"
              >
                {isGeneratingImage ? "Generating..." : "Generate Image"}
              </button>
              <button onClick={() => setShowImagePrompt(false)} className="p-1 text-slate-400 hover:text-white shrink-0 ml-1">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Attachments Row */}
        {attachedFiles.length > 0 && (
          <div className="absolute bottom-[88px] left-6 right-6 flex gap-2 overflow-x-auto py-2 scrollbar-hide">
            <AnimatePresence>
              {attachedFiles.map((file, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap"
                  style={{ background: "rgba(30,30,45,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "#E5E7EB" }}
                >
                  {file.type.startsWith("image/") ? (
                    <img src={URL.createObjectURL(file)} alt="preview" className="w-6 h-6 rounded-full object-cover shadow-sm" />
                  ) : file.type.startsWith("video/") ? (
                    <Video size={14} className="ml-1" style={{ color: "#9CA3AF" }} />
                  ) : (
                    <FileIcon size={14} className="ml-1" style={{ color: "#9CA3AF" }} />
                  )}
                  <span className="max-w-[150px] truncate ml-1">{file.name}</span>
                  <button onClick={() => removeFile(idx)} className="hover:text-red-400 transition-colors ml-1" disabled={isGenerating}>
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Floating Toolbar (Gemini Style) */}
        <div 
          className="absolute bottom-6 left-6 right-6 rounded-[32px] p-2 flex justify-between items-end shadow-xl z-20"
          style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          {/* LEFT: + Menu and Mic */}
          <div className="flex gap-1 items-center relative">
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              disabled={isGenerating}
            />
            
            {/* The + Button */}
            <button 
              onClick={() => setShowPlusMenu(!showPlusMenu)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              style={{ color: "#9CA3AF", backgroundColor: showPlusMenu ? "rgba(255,255,255,0.1)" : "transparent" }}
              onMouseEnter={(e) => !showPlusMenu && (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
              onMouseLeave={(e) => !showPlusMenu && (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </button>

            {/* The + Menu Popover */}
            <AnimatePresence>
              {showPlusMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-14 left-0 rounded-2xl p-3 flex flex-col gap-2 shadow-2xl z-20 w-[240px]"
                  style={{ background: "rgba(20,20,30,0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-wider mb-1 px-2" style={{ color: "#6B7280" }}>Attachments & Tools</div>
                  <button onClick={() => { handleFileClick(); setShowPlusMenu(false); }} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-[13px] transition-colors" style={{ color: "#E5E7EB" }}>
                    <Paperclip size={16} /> Attach Files
                  </button>
                  <button onClick={() => { handleFileClick(); setShowPlusMenu(false); }} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-[13px] transition-colors" style={{ color: "#E5E7EB" }}>
                    <ImageIcon size={16} /> Attach Media
                  </button>
                  <button onClick={() => { setShowImagePrompt(true); setShowPlusMenu(false); }} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-[13px] transition-colors" style={{ color: "#E5E7EB" }}>
                    <Wand2 size={16} /> Generate AI Image
                  </button>

                  <div className="h-px w-full my-1" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />
                  
                  <div className="text-[11px] font-semibold uppercase tracking-wider mb-1 px-2" style={{ color: "#6B7280" }}>Settings</div>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-[13px]" style={{ color: "#E5E7EB" }}>Post Length</span>
                    <select 
                      value={postLength} 
                      onChange={(e: any) => setPostLength(e.target.value)}
                      className="bg-transparent text-[13px] font-medium focus:outline-none cursor-pointer"
                      style={{ color: "#F7931E" }}
                    >
                      <option value="short" style={{ backgroundColor: "#111118", color: "#F0F0F5" }}>Short</option>
                      <option value="medium" style={{ backgroundColor: "#111118", color: "#F0F0F5" }}>Medium</option>
                      <option value="long" style={{ backgroundColor: "#111118", color: "#F0F0F5" }}>Long</option>
                    </select>
                  </div>

                  <div className="h-px w-full my-1" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />
                  
                  <div className="text-[11px] font-semibold uppercase tracking-wider mb-1 px-2" style={{ color: "#6B7280" }}>Platforms</div>
                  <div className="flex items-center gap-1.5 px-2 pb-1">
                    {linkedProviders.map(provider => {
                      const isSelected = selectedPlatforms.includes(provider);
                      const toggle = () => {
                        setSelectedPlatforms(prev => 
                          isSelected ? prev.filter(p => p !== provider) : [...prev, provider]
                        );
                      };
                      
                      let icon: any = <Globe2 size={14} />;
                      if (provider === "linkedin") icon = <span className="text-[12px] font-bold">in</span>;
                      if (provider === "twitter") icon = <span className="text-[12px] font-bold">X</span>;
                      if (provider === "github") icon = <span className="text-[12px] font-bold">gh</span>;

                      return (
                        <button 
                          key={provider}
                          onClick={toggle}
                          className={`w-8 h-8 flex justify-center items-center rounded-lg transition-colors ${isSelected ? 'text-white shadow-sm' : 'hover:bg-white/10'}`}
                          style={{ backgroundColor: isSelected ? "#0A66C2" : "transparent", color: isSelected ? "white" : "#9CA3AF" }}
                          title={`Toggle ${provider}`}
                        >
                          {icon}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mic Button */}
            {isRecording ? (
              <button 
                onClick={stopRecording}
                className="h-10 px-3 hover:bg-red-500/10 rounded-full transition-colors flex items-center gap-2 text-sm font-medium"
                style={{ color: "#EF4444" }}
              >
                <Square size={16} fill="currentColor" />
                Stop
              </button>
            ) : (
              <button 
                onClick={startRecording}
                disabled={isGenerating}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                style={{ color: "#9CA3AF" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                title="Voice Record"
              >
                <Mic size={20} strokeWidth={2} />
              </button>
            )}
            
            {/* AI Assist Button next to Mic */}
            <button 
              onClick={() => handleGenerate()}
              disabled={isGenerating || (content.length === 0 && attachedFiles.length === 0 && aiPrompt.length === 0)}
              className="h-10 px-4 ml-1 text-[13px] font-medium rounded-full transition-all disabled:opacity-50 disabled:hover:bg-transparent flex items-center gap-2 shrink-0"
              style={{ color: "#FF6B35", backgroundColor: "rgba(255,107,53,0.1)" }}
            >
              <Sparkles size={16} strokeWidth={2} />
              AI Assist
            </button>
          </div>

          {/* CENTER: AI Input */}
          <div className="flex-1 px-4 self-center h-10 flex items-center">
            <input 
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter' && !isGenerating && (aiPrompt || content || attachedFiles.length)) handleGenerate() }}
              placeholder="Ask AI to write or refine..."
              className="w-full bg-transparent text-[#F0F0F5] placeholder-[#6B7280] text-[15px] focus:outline-none"
              disabled={isGenerating}
            />
          </div>

          {/* RIGHT: Schedule and Send/Publish */}
          <div className="flex gap-2 items-center shrink-0">
            {/* Schedule (Replaces Model Selector) */}
            <button 
              onClick={() => setShowScheduleModal(true)} 
              className={`text-[13px] px-4 h-10 rounded-full font-medium transition-colors ${scheduledDate ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20' : ''}`} 
              style={{ color: scheduledDate ? undefined : "#9CA3AF", backgroundColor: scheduledDate ? undefined : "rgba(255,255,255,0.05)" }}
              onMouseEnter={(e) => !scheduledDate && (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
              onMouseLeave={(e) => !scheduledDate && (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
              disabled={isGenerating || selectedPlatforms.length === 0}
            >
              {scheduledDate ? `Scheduled: ${new Date(scheduledDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Schedule'}
            </button>

            {/* Publish / Send Button */}
            <button 
              onClick={handlePublish} 
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`} 
              style={{ 
                background: (content.length > 0 || attachedFiles.length > 0) ? "linear-gradient(135deg, #0A66C2, #4A90E2)" : "rgba(255,255,255,0.05)", 
                color: (content.length > 0 || attachedFiles.length > 0) ? "#FFFFFF" : "#6B7280",
                border: (content.length > 0 || attachedFiles.length > 0) ? "none" : "1px solid rgba(255,255,255,0.1)"
              }}
              disabled={isGenerating || isPublishing || selectedPlatforms.length === 0 || (content.length === 0 && attachedFiles.length === 0)}
              title={isPublishing ? "Publishing..." : "Publish"}
            >
              {isPublishing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="mr-0.5 mt-0.5" />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* RIGHT: Preview */}
      <motion.div 
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 30 }}
        className="hidden xl:flex flex-[2] max-w-[460px] bg-white rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] p-6 flex-col gap-4 font-sans text-slate-800 border"
        style={{ borderColor: "rgba(255,255,255,0.1)" }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-slate-100 shadow-sm border border-slate-200">
            {user?.image ? <img src={user.image} alt="Avatar" className="w-full h-full object-cover" /> : <Globe2 size={24} className="text-slate-400" />}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-[16px] leading-tight text-slate-900">{user?.name || "Jane Doe"}</span>
            <span className="text-[13px] text-slate-500 leading-tight mt-0.5">Professional Signaling</span>
            <span className="text-[12px] text-slate-500 flex items-center gap-1 mt-1">
              Just now <span className="w-[3px] h-[3px] rounded-full bg-slate-400" /> <Globe2 size={11} className="text-slate-500" />
            </span>
          </div>
        </div>
        <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words text-slate-800">
          {content || <span className="text-slate-400">Your post preview will appear here...</span>}
        </div>

        {attachedFiles.length > 0 && (
          <div className={`mt-2 grid gap-1 rounded-lg overflow-hidden border border-slate-200 ${attachedFiles.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {attachedFiles.map((f, i) => (
              <div 
                key={i} 
                onClick={() => {
                  if (f.type.startsWith("image/")) {
                    setEditingImageIdx(i);
                    setMediaEdits({ rotate: 0, filter: 'none' });
                  }
                }}
                className={`relative aspect-square bg-slate-100 flex items-center justify-center overflow-hidden ${f.type.startsWith("image/") ? "cursor-pointer group" : ""}`}
              >
                {f.type.startsWith("image/") ? (
                  <>
                    <img src={URL.createObjectURL(f)} alt="preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-full flex items-center gap-1">
                        <Wand2 size={12} /> Edit
                      </span>
                    </div>
                  </>
                ) : f.type.startsWith("video/") ? (
                  <div className="w-full h-full relative">
                    <video src={URL.createObjectURL(f)} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                        <Video size={16} className="text-slate-800 ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 p-4 text-center">
                    <FileIcon size={24} className="text-slate-400" />
                    <span className="text-xs text-slate-600 truncate max-w-full px-2">{f.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Media Editor Modal */}
      <AnimatePresence>
        {editingImageIdx !== null && attachedFiles[editingImageIdx] && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0F172A] border border-[#1E293B] rounded-2xl overflow-hidden w-full max-w-4xl flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#1E293B] bg-[#0B1120]">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Wand2 size={16} className="text-nx-blue" /> Media Studio
                </h3>
                <button onClick={() => setEditingImageIdx(null)} className="text-slate-400 hover:text-white transition-colors p-1">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 bg-black/50 p-6 flex items-center justify-center min-h-[400px]">
                {isGeneratingImage ? (
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <Loader2 size={32} className="animate-spin text-nx-blue" />
                    <span className="text-sm">Applying edits...</span>
                  </div>
                ) : (
                  <img 
                    src={URL.createObjectURL(attachedFiles[editingImageIdx])} 
                    alt="Editor Preview" 
                    className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg transition-all duration-300 ease-in-out"
                    style={{
                      transform: `rotate(${mediaEdits.rotate}deg)`,
                      filter: mediaEdits.filter !== 'none' ? mediaEdits.filter : undefined
                    }}
                  />
                )}
              </div>

              <div className="p-4 bg-[#0B1120] border-t border-[#1E293B] flex items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={() => {
                    moveFile(editingImageIdx, 'left');
                    setEditingImageIdx(editingImageIdx - 1);
                  }} disabled={editingImageIdx === 0} className="px-3 py-2 bg-[#1E293B] text-white rounded-lg hover:bg-[#334155] disabled:opacity-50 transition-colors flex items-center gap-1 text-sm">
                    <ChevronLeft size={16} /> Move Left
                  </button>
                  <button onClick={() => {
                    moveFile(editingImageIdx, 'right');
                    setEditingImageIdx(editingImageIdx + 1);
                  }} disabled={editingImageIdx === attachedFiles.length - 1} className="px-3 py-2 bg-[#1E293B] text-white rounded-lg hover:bg-[#334155] disabled:opacity-50 transition-colors flex items-center gap-1 text-sm">
                    Move Right <ChevronRight size={16} />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button onClick={toggleRotate} disabled={isGeneratingImage} className="px-4 py-2 bg-[#1E293B] text-white rounded-lg hover:bg-[#334155] disabled:opacity-50 transition-colors flex items-center gap-2 text-sm font-medium">
                    <RotateCw size={16} /> Rotate 90°
                  </button>
                  <div className="w-[1px] h-8 bg-[#334155] mx-2 self-center" />
                  <button onClick={() => toggleFilter('grayscale(100%)')} disabled={isGeneratingImage} className={`px-3 py-2 rounded-lg transition-colors text-sm ${mediaEdits.filter === 'grayscale(100%)' ? 'bg-nx-blue text-white' : 'bg-[#1E293B] text-white hover:bg-[#334155] disabled:opacity-50'}`}>
                    B&W
                  </button>
                  <button onClick={() => toggleFilter('sepia(100%)')} disabled={isGeneratingImage} className={`px-3 py-2 rounded-lg transition-colors text-sm ${mediaEdits.filter === 'sepia(100%)' ? 'bg-nx-blue text-white' : 'bg-[#1E293B] text-white hover:bg-[#334155] disabled:opacity-50'}`}>
                    Sepia
                  </button>
                  <button onClick={() => toggleFilter('brightness(120%) contrast(110%)')} disabled={isGeneratingImage} className={`px-3 py-2 rounded-lg transition-colors text-sm ${mediaEdits.filter === 'brightness(120%) contrast(110%)' ? 'bg-nx-blue text-white' : 'bg-[#1E293B] text-white hover:bg-[#334155] disabled:opacity-50'}`}>
                    Enhance
                  </button>
                </div>
                
                <button onClick={saveMediaEdits} className="px-6 py-2 bg-nx-blue text-white rounded-lg hover:bg-nx-blue/90 transition-colors font-medium">
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0F172A] border border-[#1E293B] rounded-2xl overflow-hidden w-full max-w-md flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#1E293B] bg-[#0B1120]">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Globe2 size={16} className="text-nx-blue" /> Schedule Post
                </h3>
                <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white transition-colors p-1">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 flex flex-col gap-4">
                <p className="text-sm text-slate-400">
                  Select a date and time to publish this post. Your media will be securely uploaded now and held until the scheduled time.
                </p>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-slate-300 font-medium">Publish Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-nx-blue transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="p-4 bg-[#0B1120] border-t border-[#1E293B] flex items-center justify-end gap-3">
                <button onClick={() => {
                  setScheduledDate("");
                  setShowScheduleModal(false);
                }} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
                  Clear & Cancel
                </button>
                <button onClick={() => setShowScheduleModal(false)} disabled={!scheduledDate} className="px-6 py-2 bg-nx-blue text-white rounded-lg hover:bg-nx-blue/90 transition-colors font-medium text-sm disabled:opacity-50 flex items-center gap-2">
                  Set Date
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
