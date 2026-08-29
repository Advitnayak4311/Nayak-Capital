export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-gold-500/20" />
        <div className="h-14 w-14 animate-spin rounded-full border-2 border-gold-400 border-t-transparent shadow-gold-sm" />
        <span className="font-serif font-black text-xs text-gold-400">NC</span>
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 animate-pulse">
        Nayak Capital &bull; Loading...
      </p>
    </div>
  );
}
