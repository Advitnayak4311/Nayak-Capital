export interface SiteConfig {
  name: string;
  subName: string;
  tagline: string;
  description: string;
  url: string;
  contact: {
    phone: string;
    email: string;
    supportEmail: string;
    address?: string;
    hours: string;
    emergencyLine: string;
  };
  navigation: {
    label: string;
    href: string;
  }[];
  adminNavigation: {
    label: string;
    href: string;
    icon: string;
  }[];
  socials: {
    linkedin?: string;
    twitter?: string;
  };
}

export const siteConfig: SiteConfig = {
  name: "NAYAK CAPITAL",
  subName: "LENDERS",
  tagline: "TRUSTED LOANS. STRONGER FUTURES.",
  description:
    "Trusted personal lending solutions, tailored personal credit facilities, transparent repayment terms, and bank-grade privacy.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  contact: {
    phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || "+91 9380810711",
    email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "nayakloanservices@gmail.com",
    supportEmail: "nayakloanservices@gmail.com",
    hours: "Monday – Saturday: 9:00 AM – 6:00 PM IST",
    emergencyLine: "+91 9380810711",
  },
  navigation: [
    { label: "Home", href: "/" },
    { label: "Personal Loans", href: "/loans" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  adminNavigation: [
    { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
    { label: "Applications", href: "/admin/applications", icon: "FileSpreadsheet" },
    { label: "Active Loans", href: "/admin/loans", icon: "Landmark" },
    { label: "Audit Trail", href: "/admin/audit-logs", icon: "ShieldCheck" },
    { label: "System Settings", href: "/admin/settings", icon: "Sliders" },
  ],
  socials: {
    linkedin: "https://linkedin.com/company/nayak-capital",
    twitter: "https://twitter.com/nayakcapital",
  },
};
