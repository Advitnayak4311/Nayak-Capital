import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Landmark, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400">
        <Landmark className="h-10 w-10" />
      </div>
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
          Error 404 &bull; Page Not Found
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">
          Requested Document or Route Unavailable
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          The page or record you are searching for might have been archived or does not exist in the Nayak Capital registry.
        </p>
      </div>
      <Link href="/">
        <Button variant="luxury" size="md" className="text-xs uppercase tracking-wider font-bold">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Return to Homepage</span>
        </Button>
      </Link>
    </div>
  );
}
