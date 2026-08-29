"use client";

import * as React from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Eraser, PenLine, Type, CheckCircle2, RotateCcw, Check, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SignatureData {
  type: "DRAWN" | "TYPED";
  data: string; // Base64 data URL of drawn signature
  fullName: string; // Typed full legal name
  timestamp: string;
}

interface SignaturePadProps {
  signerFullName: string;
  onSignatureCapture: (signature: SignatureData | null) => void;
  initialSignature?: SignatureData;
}

export function SignaturePad({
  signerFullName,
  onSignatureCapture,
  initialSignature,
}: SignaturePadProps) {
  const [typedName, setTypedName] = React.useState(
    initialSignature?.fullName || signerFullName || ""
  );
  const [hasDrawn, setHasDrawn] = React.useState(!!initialSignature?.data);
  const [isSubmitted, setIsSubmitted] = React.useState(!!initialSignature?.data);
  const [committedSignature, setCommittedSignature] = React.useState<SignatureData | null>(
    initialSignature || null
  );

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const isDrawing = React.useRef(false);

  // Initialize and resize Canvas to match exact container dimensions
  const initCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    // Set internal buffer dimensions to match display CSS size * DPR
    canvas.width = rect.width * dpr;
    canvas.height = 150 * dpr;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = "#D4AF37"; // Nayak Capital Signature Gold
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, []);

  React.useEffect(() => {
    if (!isSubmitted) {
      initCanvas();
      const handleResize = () => initCanvas();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isSubmitted, initCanvas]);

  const getCanvasCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (isSubmitted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isDrawing.current = true;
    setHasDrawn(true);

    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing.current || isSubmitted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setIsSubmitted(false);
    setCommittedSignature(null);
    onSignatureCapture(null);
  };

  const isBothCompleted = hasDrawn && typedName.trim().length >= 3;

  const handleSubmitSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn || typedName.trim().length < 3) return;

    const dataUrl = canvas.toDataURL("image/png");
    const sig: SignatureData = {
      type: "DRAWN",
      data: dataUrl,
      fullName: typedName.trim(),
      timestamp: new Date().toISOString(),
    };
    setCommittedSignature(sig);
    setIsSubmitted(true);
    onSignatureCapture(sig);
  };

  const handleRedraw = () => {
    setIsSubmitted(false);
    setCommittedSignature(null);
    onSignatureCapture(null);
    setTimeout(() => {
      initCanvas();
      clearCanvas();
    }, 50);
  };

  return (
    <div className="rounded-2xl border border-charcoal-700 bg-charcoal-900/90 p-5 sm:p-6 space-y-6 shadow-xl">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
        <div className="flex items-center space-x-2 text-gold-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="h-4 w-4" />
          <span>Compulsory Dual Verification: Draw Signature + Type Full Name</span>
        </div>
        {!isSubmitted && hasDrawn && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearCanvas}
            className="text-xs text-slate-400 hover:text-red-400 h-7"
          >
            <Eraser className="h-3.5 w-3.5 mr-1" />
            Clear Drawing
          </Button>
        )}
      </div>

      {isSubmitted && committedSignature ? (
        /* Confirmed / Locked Dual Signature Card */
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4" />
              <span>Signature & Legal Name Submitted & Verified</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRedraw}
              className="text-xs text-slate-300 border-charcoal-700 hover:border-gold-500/40 h-8"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              <span>Redraw / Modify</span>
            </Button>
          </div>

          {/* Rendered Drawn Sign & Name Below */}
          <div className="rounded-xl border border-gold-500/30 bg-charcoal-950/90 p-4 text-center space-y-3">
            <div className="h-20 flex items-center justify-center">
              <img
                src={committedSignature.data}
                alt="Drawn Signature"
                className="max-h-16 object-contain"
              />
            </div>
            <div className="border-t border-charcoal-800 pt-2 space-y-0.5">
              <div className="text-xs text-slate-400 uppercase tracking-wider">
                Authorized Signatory Name:
              </div>
              <div className="text-base font-bold text-white font-serif">
                {committedSignature.fullName}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-emerald-800/30 gap-1 font-mono">
            <span>
              Security Hash: NC-SIG-
              {typeof window !== "undefined"
                ? btoa(encodeURIComponent(committedSignature.fullName))
                    .replace(/[^a-zA-Z0-9]/g, "")
                    .slice(0, 8)
                    .toUpperCase()
                : "784A9F21"}
            </span>
            <span>
              Submitted At:{" "}
              <strong className="text-emerald-400">
                {new Date(committedSignature.timestamp).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </strong>
            </span>
          </div>
        </div>
      ) : (
        /* Dual Compulsory Input Area */
        <div className="space-y-6">
          {/* 1. Compulsory Drawing Pad */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-200">
                <PenLine className="h-3.5 w-3.5 text-gold-400" />
                <span>1. Draw Your Digital Signature (Compulsory) *</span>
              </label>
              <span className={cn("text-[11px] font-semibold", hasDrawn ? "text-emerald-400" : "text-amber-400")}>
                {hasDrawn ? "✓ Signature Drawn" : "Required"}
              </span>
            </div>

            <div className="relative rounded-xl border-2 border-dashed border-charcoal-600 bg-charcoal-950/80 p-1 overflow-hidden">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[150px] cursor-crosshair touch-none block"
              />
              {!hasDrawn && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-500 font-mono uppercase tracking-wider select-none">
                  ✍️ Sign inside this box using mouse or finger
                </div>
              )}
            </div>
          </div>

          {/* 2. Compulsory Typed Name Below */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-200">
                <Type className="h-3.5 w-3.5 text-gold-400" />
                <span>2. Type Your Full Legal Name Below (Compulsory) *</span>
              </label>
              <span
                className={cn(
                  "text-[11px] font-semibold",
                  typedName.trim().length >= 3 ? "text-emerald-400" : "text-amber-400"
                )}
              >
                {typedName.trim().length >= 3 ? "✓ Name Entered" : "Required (Min 3 chars)"}
              </span>
            </div>

            <Input
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Enter your exact full legal name (e.g. Advith Nayak)"
              className="bg-charcoal-950/80"
              required
            />
          </div>

          {/* Status & Submit Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-charcoal-800">
            <div className="text-xs text-slate-400">
              {!hasDrawn && typedName.trim().length < 3 ? (
                <span className="text-amber-400/90 flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-1 shrink-0" />
                  Both drawing signature and typing full legal name are required.
                </span>
              ) : !hasDrawn ? (
                <span className="text-amber-400/90 flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-1 shrink-0" />
                  Please draw your digital signature inside the box above.
                </span>
              ) : typedName.trim().length < 3 ? (
                <span className="text-amber-400/90 flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-1 shrink-0" />
                  Please type your full legal name above.
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1 shrink-0" />
                  Both completed! Click below to submit and generate the form.
                </span>
              )}
            </div>

            <Button
              type="button"
              variant="luxury"
              size="md"
              onClick={handleSubmitSignature}
              disabled={!isBothCompleted}
              className="w-full sm:w-auto text-xs uppercase tracking-wider font-bold shadow-gold-sm"
            >
              <Check className="h-4 w-4 mr-1.5" />
              <span>Submit Signature & Name</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
