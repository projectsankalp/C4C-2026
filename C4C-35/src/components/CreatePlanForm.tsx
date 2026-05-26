import React, { useState, useEffect, useRef } from "react";
import { SAMPLE_PRODUCTS, SampleProduct } from "./SampleProducts";
import { Sparkles, ArrowRight, Lightbulb, Upload, X, Camera, FileText } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

interface CreatePlanFormProps {
  onGenerate: (name: string, description: string, imageBase64?: string, mimeType?: string, fileUrl?: string) => void;
  isLoading: boolean;
}

const LOADING_STEPS = [
  "🌸 Calculating local raw material margins...",
  "📢 Fine-tuning emotional Instagram copy...",
  "🎯 Outlining direct contact templates for target clients...",
  "🚚 Coordinating simple hyper-local shipping advice...",
  "🏆 Combining tips to launch your micro-brand...",
];

const VISION_LOADING_STEPS = [
  "🔍 Examining product photo contours & styling...",
  "📦 Evaluating design aesthetics and packaging quality...",
  "🎨 Spotting unique features and quality benchmarks...",
  "📍 Grounding local market competitiveness (INR ₹)...",
  "✍️ Preparing custom captions and instant action blueprints...",
];

export default function CreatePlanForm({ onGenerate, isLoading }: CreatePlanFormProps) {
  const { t } = useLanguage();
  const [activeMode, setActiveMode] = useState<"text" | "image">("text");
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);

  // Image Upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rotate loading suggestions for delightful user wait
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const currentSteps = activeMode === "image" ? VISION_LOADING_STEPS : LOADING_STEPS;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStepIdx((prev) => (prev + 1) % currentSteps.length);
      }, 3000);
    } else {
      setLoadingStepIdx(0);
    }
    return () => clearInterval(interval);
  }, [isLoading, activeMode]);

  const handleSelectSample = (sample: SampleProduct) => {
    setActiveMode("text");
    setProductName(sample.name);
    setProductDescription(sample.description);
  };

  // Convert File to Base64
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, JPEG).");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      const mime = result.split(",")[0].split(":")[1].split(";")[0];
      setImageBase64(base64);
      setImageMimeType(mime);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Drag and Drop Handling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (isLoading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClearImage = () => {
    if (isLoading) return;
    setImagePreview(null);
    setImageBase64(null);
    setImageMimeType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileSelect = () => {
    if (isLoading) return;
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeMode === "text") {
      if (!productName.trim() && !productDescription.trim()) return;
      onGenerate(productName, productDescription);
    } else {
      if (!imageBase64 || !imageMimeType) return;
      onGenerate("", "", imageBase64, imageMimeType, imagePreview || undefined);
    }
  };

  const currentSteps = activeMode === "image" ? VISION_LOADING_STEPS : LOADING_STEPS;

  return (
    <div className="bg-white rounded-3xl border border-[#F1E4DF] shadow-xs overflow-hidden">
      {/* Tab Switcher Headers */}
      <div className="flex border-b border-[#F1E4DF] bg-slate-50/50">
        <button
          type="button"
          id="btn-mode-text"
          onClick={() => setActiveMode("text")}
          disabled={isLoading}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 cursor-pointer transition-all ${
            activeMode === "text"
              ? "border-[#FF6B6B] text-[#FF6B6B] bg-white font-black"
              : "border-transparent text-slate-500 hover:text-[#1A237E]"
          } disabled:opacity-50`}
        >
          <FileText className="w-4 h-4" />
          <span>{t("app.plan.create.tab.text")}</span>
        </button>
        <button
          type="button"
          id="btn-mode-image"
          onClick={() => setActiveMode("image")}
          disabled={isLoading}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 cursor-pointer transition-all ${
            activeMode === "image"
              ? "border-[#FF6B6B] text-[#FF6B6B] bg-white font-black"
              : "border-transparent text-slate-500 hover:text-[#1A237E]"
          } disabled:opacity-50`}
        >
          <Camera className="w-4 h-4" />
          <span>{t("app.plan.create.tab.image")} 📸</span>
        </button>
      </div>

      <div className="p-6 md:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0F0] border border-[#F1E4DF] flex items-center justify-center shrink-0">
            {activeMode === "text" ? (
              <Lightbulb className="w-5 h-5 text-[#FF6B6B] animate-pulse" />
            ) : (
              <Camera className="w-5 h-5 text-[#FF6B6B] animate-pulse" />
            )}
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-[#1A237E]">
              {activeMode === "text" ? t("app.plan.create.title") : t("app.plan.create.title")}
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              {activeMode === "text"
                ? t("app.plan.create.desc.text")
                : t("app.plan.create.desc.image")}
            </p>
          </div>
        </div>

        {/* Templates Selector (only shown in text mode) */}
        {activeMode === "text" && (
          <div className="mb-6">
            <label className="block text-[11px] font-black uppercase tracking-wider text-[#FF6B6B] mb-3">
              ✨ {t("app.plan.create.samples")}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SAMPLE_PRODUCTS.map((sample) => (
                <button
                  type="button"
                  key={sample.name}
                  onClick={() => handleSelectSample(sample)}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                    productName === sample.name
                      ? "border-[#FF6B6B] bg-[#FFF0F0] ring-2 ring-[#FF6B6B]/20"
                      : "border-[#F1E4DF] bg-white hover:bg-[#FDF8F5] hover:border-slate-300"
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{sample.icon}</span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#1A237E] truncate">{sample.name}</h4>
                    <p className="text-[11px] text-[#FF6B6B] font-medium line-clamp-1 mt-0.5">{sample.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeMode === "text" ? (
            <>
              {/* Custom Product Inputs */}
              <div>
                <label htmlFor="product-name" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="text-[#1A237E] font-bold">{t("app.plan.create.name")}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{t("app.plan.create.name.hint")}</span>
                </label>
                <input
                  id="product-name"
                  type="text"
                  placeholder="Enter simple or descriptive name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 text-sm bg-slate-50/50 border border-[#F1E4DF] rounded-2xl focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] focus:bg-white text-slate-800 placeholder:text-slate-400 outline-none transition-all disabled:opacity-60"
                />
              </div>

              <div>
                <label htmlFor="product-description" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="text-[#1A237E] font-bold">{t("app.plan.create.desc")}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{t("app.plan.create.desc.hint")}</span>
                </label>
                <textarea
                  id="product-description"
                  rows={4}
                  placeholder="Describe what makes your product unique, what colors or flavors it has, who it is for..."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 text-sm bg-slate-50/50 border border-[#F1E4DF] rounded-2xl focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] focus:bg-white text-slate-800 placeholder:text-slate-400 outline-none transition-all resize-none disabled:opacity-60"
                />
              </div>
            </>
          ) : (
            /* Image Upload Uploader Block */
            <div className="space-y-4">
              <label className="block text-xs font-black uppercase text-[#1A237E] tracking-wider mb-1">
                {t("app.plan.create.upload")}
              </label>

              {/* Hidden file input */}
              <input
                id="product-image-uploader"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
                className="hidden"
              />

              {/* Drag and Drop Zone Container */}
              {!imagePreview ? (
                <div
                  id="drag-and-drop-zone"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerFileSelect}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-3 cursor-pointer transition-all select-none ${
                    isDragActive
                      ? "border-[#FF6B6B] bg-[#FFF0F0]"
                      : "border-[#F1E4DF] bg-slate-50 hover:bg-[#FFF0F0]/10 hover:border-[#FF6B6B]/40"
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF]/80 border border-[#F1E4DF] shadow-2xs flex items-center justify-center text-[#FF6B6B]">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#1A237E]">
                      {t("app.plan.create.upload.drag")}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {t("app.plan.create.upload.formats")}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-500/10 text-emerald-700 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                    {t("app.plan.create.upload.badge")}
                  </div>
                </div>
              ) : (
                /* Selected File Preview Mode */
                <div className="border border-[#F1E4DF] rounded-3xl bg-[#FDF8F5] p-4 flex flex-col items-center relative animate-fade-in">
                  <button
                    type="button"
                    onClick={handleClearImage}
                    disabled={isLoading}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white text-slate-500 hover:text-red-500 shadow-sm border border-slate-100 transition-all cursor-pointer disabled:opacity-50"
                    title={t("app.plan.create.upload.remove")}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="max-w-[280px] rounded-2xl overflow-hidden shadow-xs border border-white max-h-56">
                    <img
                      src={imagePreview}
                      alt="Uploaded product preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs font-bold text-emerald-600 mt-3 flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    {t("app.plan.create.upload.success")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Trigger */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={
                isLoading ||
                (activeMode === "text" && !productName.trim() && !productDescription.trim()) ||
                (activeMode === "image" && !imageBase64)
              }
              className={`w-full py-3.5 px-6 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 shadow-md transition-all ${
                isLoading
                  ? "bg-[#FF6B6B]/70 cursor-not-allowed"
                  : "bg-[#FF6B6B] hover:bg-[#ff5252] hover:shadow-lg active:scale-[0.99]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>{activeMode === "image" ? t("app.plan.create.loading.image") : t("app.plan.create.loading.text")}</span>
                  </div>
                </div>
              ) : (
                <>
                  <span>
                    {activeMode === "image"
                      ? t("app.plan.create.submit.image") + " 📸"
                      : t("app.plan.create.submit.text")}
                  </span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Loading Progress State */}
      {isLoading && (
        <div className="bg-[#FFF0F0] border-t border-[#F1E4DF] p-4 transition-all animate-pulse">
          <div className="max-w-xl mx-auto flex items-center gap-3">
            <div className="p-1 rounded-full bg-[#FFF0F0] border border-[#FF6B6B]/20 shrink-0">
              <Sparkles className="w-4 h-4 text-[#FF6B6B]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#1A237E] transition-all">
                {currentSteps[loadingStepIdx]}
              </p>
              <p className="text-[10px] text-[#FF6B6B]/90 mt-0.5">
                {t("app.plan.create.loading.subtitle")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
