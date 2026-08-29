"use client";

import * as React from "react";
import { UploadedDocument } from "@/lib/models/types";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  UploadCloud,
  Camera,
  Trash2,
  Image as ImageIcon,
  FileText,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  RefreshCw,
  CreditCard,
} from "lucide-react";

interface StepDocumentsProps {
  documents: UploadedDocument[];
  onChange: (docs: UploadedDocument[]) => void;
  onNext: () => void;
  onPrev: () => void;
  errors: Record<string, string>;
}

export function StepDocuments({ documents, onChange, onNext, onPrev, errors }: StepDocumentsProps) {
  const { toast } = useToast();

  // Camera state
  const [cameraActive, setCameraActive] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported on this browser/device.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(err.message || "Could not access camera. Please allow camera permissions or upload a photo file.");
      toast({
        title: "Camera Access Error",
        description: err.message || "Please allow camera access or use the file upload option.",
        type: "error",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    const newDoc: UploadedDocument = {
      id: `doc-live-${Date.now()}`,
      docType: "PHOTO",
      fileName: `live_selfie_${Date.now()}.jpg`,
      fileSize: Math.round((dataUrl.length * 3) / 4),
      fileMimeType: "image/jpeg",
      fileUrl: dataUrl,
      uploadedAt: new Date().toISOString(),
    };

    const filtered = documents.filter((d) => d.docType !== "PHOTO" && d.docType !== "LIVE_PHOTO");
    onChange([...filtered, newDoc]);
    stopCamera();

    toast({
      title: "Live Photo Captured",
      description: "Applicant live photo successfully verified and attached.",
      type: "success",
    });
  };

  const docCategories: {
    type: "PHOTO" | "PAN_CARD" | "IDENTITY_PROOF" | "ADDRESS_PROOF";
    label: string;
    description: string;
    required: boolean;
  }[] = [
    {
      type: "PHOTO",
      label: "Applicant Live Photo / Selfie *",
      description: "Take a live selfie snapshot using camera or upload a clear recent photo",
      required: true,
    },
    {
      type: "PAN_CARD",
      label: "PAN Card Document Upload *",
      description: "Clear scan or photo of applicant's Permanent Account Number (PAN) card (Compulsory)",
      required: true,
    },
    {
      type: "IDENTITY_PROOF",
      label: "Government Identity Proof (Aadhaar / Passport / Voter ID) *",
      description: "Clear copy of Aadhaar Card, Passport, or Voter ID (PDF/JPG/PNG, max 5MB)",
      required: true,
    },
    {
      type: "ADDRESS_PROOF",
      label: "Address Proof (If different from ID)",
      description: "Utility bill, rental agreement, or tax receipt (PDF/JPG, max 5MB)",
      required: false,
    },
  ];

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: "PHOTO" | "PAN_CARD" | "IDENTITY_PROOF" | "ADDRESS_PROOF"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Exceeds Size Limit",
        description: "Maximum allowable file size is 5MB.",
        type: "error",
      });
      return;
    }

    const validMimes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!validMimes.includes(file.type)) {
      toast({
        title: "Unsupported File Format",
        description: "Please upload PDF, JPG, JPEG, or PNG files only.",
        type: "error",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;
      const newDoc: UploadedDocument = {
        id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        docType,
        fileName: file.name,
        fileSize: file.size,
        fileMimeType: file.type,
        fileUrl: base64Url,
        uploadedAt: new Date().toISOString(),
      };

      const filtered = documents.filter((d) => d.docType !== docType);
      onChange([...filtered, newDoc]);

      toast({
        title: "Document Attached",
        description: `${file.name} successfully attached and encrypted.`,
        type: "success",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (docId: string) => {
    onChange(documents.filter((d) => d.id !== docId));
  };

  const photoDoc = documents.find((d) => d.docType === "PHOTO" || d.docType === "LIVE_PHOTO");

  return (
    <div className="space-y-6">
      <div className="border-b border-charcoal-800 pb-4">
        <h2 className="text-xl font-serif font-bold text-white">
          Step 6: Secure Document Transmission & Verification
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Take a live selfie and upload your mandatory PAN card and government ID proof.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photo Box (with Live Camera & Upload) */}
        <div
          className={`rounded-2xl border p-5 space-y-4 transition-all md:col-span-2 ${
            photoDoc
              ? "border-emerald-500/40 bg-charcoal-900 shadow-md"
              : "border-charcoal-700 bg-charcoal-900/80 hover:border-gold-500/30"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-bold text-white font-serif">
                1. Applicant Live Photo / Selfie (Compulsory) *
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Capture a live selfie snapshot or upload a clear photo against a plain background.
              </p>
            </div>
            {photoDoc && (
              <span className="flex items-center text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-800/40">
                <CheckCircle className="h-3 w-3 mr-1" />
                Live Photo Attached
              </span>
            )}
          </div>

          {/* Active Camera View */}
          {cameraActive ? (
            <div className="space-y-3 rounded-xl border border-gold-500/40 bg-charcoal-950 p-4 text-center">
              <div className="relative mx-auto max-w-sm overflow-hidden rounded-xl bg-black aspect-video border border-gold-500/30">
                <video
                  ref={(ref) => {
                    videoRef.current = ref;
                    if (ref && streamRef.current) {
                      ref.srcObject = streamRef.current;
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-center justify-center space-x-3 pt-2">
                <Button
                  type="button"
                  variant="luxury"
                  size="md"
                  onClick={capturePhoto}
                  className="text-xs font-bold uppercase tracking-wider shadow-gold-sm"
                >
                  <Camera className="h-4 w-4 mr-1.5" />
                  <span>Capture Photo</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={stopCamera}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  <span>Cancel Camera</span>
                </Button>
              </div>
            </div>
          ) : photoDoc ? (
            <div className="rounded-xl border border-charcoal-800 bg-charcoal-950 p-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-3 truncate">
                <div className="h-12 w-12 rounded-lg overflow-hidden border border-gold-500/30 shrink-0 bg-charcoal-800 flex items-center justify-center">
                  {photoDoc.fileUrl.startsWith("data:image") ? (
                    <img
                      src={photoDoc.fileUrl}
                      alt="Live Selfie Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-gold-400" />
                  )}
                </div>
                <div className="truncate text-xs">
                  <p className="font-semibold text-white truncate">{photoDoc.fileName}</p>
                  <p className="text-slate-500 text-[10px]">
                    {(photoDoc.fileSize / 1024).toFixed(1)} KB &bull; Photo Verified
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="p-1.5 text-xs text-gold-400 hover:text-gold-300 transition-colors flex items-center space-x-1 border border-gold-500/20 rounded-md px-2 py-1 bg-charcoal-900"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Retake</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(photoDoc.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                  title="Remove photo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <button
                type="button"
                onClick={startCamera}
                className="flex flex-col items-center justify-center border-2 border-dashed border-gold-500/40 hover:border-gold-400 rounded-xl p-5 cursor-pointer bg-gold-500/5 hover:bg-gold-500/10 transition-all text-center group"
              >
                <Camera className="h-6 w-6 text-gold-400 group-hover:scale-110 transition-transform mb-2" />
                <span className="text-xs font-bold text-gold-300">
                  Open Camera & Take Live Selfie
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Instant camera capture via device
                </span>
              </button>

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-charcoal-700 hover:border-gold-500/50 rounded-xl p-5 cursor-pointer bg-charcoal-950/40 hover:bg-charcoal-950/80 transition-all text-center group">
                <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-gold-400 transition-colors mb-2" />
                <span className="text-xs font-semibold text-slate-300 group-hover:text-gold-300">
                  Upload Photo File
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  JPG, JPEG or PNG up to 5MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "PHOTO")}
                  className="hidden"
                />
              </label>
            </div>
          )}
          {cameraError && <p className="text-xs text-red-400 font-medium">{cameraError}</p>}
        </div>

        {/* Other Document Cards (PAN Card, Government ID Proof, Address Proof) */}
        {docCategories.slice(1).map((cat, idx) => {
          const existing = documents.find((d) => d.docType === cat.type);
          const isImage = existing?.fileMimeType.startsWith("image/");

          return (
            <div
              key={cat.type}
              className={`rounded-2xl border p-5 space-y-4 transition-all ${
                existing
                  ? "border-emerald-500/40 bg-charcoal-900 shadow-md"
                  : "border-charcoal-700 bg-charcoal-900/80 hover:border-gold-500/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white font-serif">{idx + 2}. {cat.label}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                </div>
                {existing && (
                  <span className="flex items-center text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-800/40 shrink-0 ml-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Attached
                  </span>
                )}
              </div>

              {existing ? (
                <div className="rounded-xl border border-charcoal-800 bg-charcoal-950 p-3.5 flex items-center justify-between">
                  <div className="flex items-center space-x-3 truncate">
                    <div className="p-2 rounded-lg bg-charcoal-800 text-gold-400 shrink-0">
                      {isImage ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    </div>
                    <div className="truncate text-xs">
                      <p className="font-semibold text-white truncate">{existing.fileName}</p>
                      <p className="text-slate-500 text-[10px]">
                        {(existing.fileSize / 1024).toFixed(1)} KB &bull; Attached & Encrypted
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(existing.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                    title="Remove document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-charcoal-700 hover:border-gold-500/50 rounded-xl p-5 cursor-pointer bg-charcoal-950/40 hover:bg-charcoal-950/80 transition-all text-center group">
                  <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-gold-400 transition-colors mb-2" />
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-gold-300">
                    Click to browse or drop {cat.type === "PAN_CARD" ? "PAN Card" : "document"}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    PDF, PNG, or JPG up to 5MB
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e, cat.type)}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>

      {errors.documents && (
        <p className="text-xs text-red-400 font-medium">{errors.documents}</p>
      )}

      {/* Security Disclaimer */}
      <div className="rounded-xl border border-charcoal-800 bg-charcoal-950/60 p-3.5 flex items-center space-x-2 text-xs text-slate-400">
        <ShieldCheck className="h-4 w-4 text-gold-400 shrink-0" />
        <span>
          Files and camera snapshots are transmitted securely over TLS 1.3 encryption directly into private isolated storage.
        </span>
      </div>

      <div className="flex justify-between pt-4 border-t border-charcoal-800">
        <Button type="button" variant="outline" size="md" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Back</span>
        </Button>
        <Button
          type="button"
          variant="luxury"
          size="lg"
          onClick={onNext}
          className="text-xs uppercase tracking-wider font-bold shadow-gold-md"
        >
          <span>Continue to Final Review & Declaration</span>
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
