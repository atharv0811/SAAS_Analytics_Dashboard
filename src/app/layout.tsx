import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { PREFERENCES_STORAGE_KEY } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MetricFlow — SaaS Analytics Dashboard",
    template: "%s · MetricFlow",
  },
  description:
    "A modern SaaS analytics dashboard for monitoring revenue, customers, subscriptions, and business performance.",
  applicationName: "MetricFlow",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfa" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1012" },
  ],
};

/*
 * Runs before first paint: applies the persisted theme and sidebar state to
 * <html> so there is no flash of the wrong theme or layout on load.
 */
const preferencesScript = `(function(){try{var t="system",c=false,r=localStorage.getItem(${JSON.stringify(
  PREFERENCES_STORAGE_KEY,
)});if(r){var s=(JSON.parse(r)||{}).state||{};if(s.theme)t=s.theme;c=!!s.sidebarCollapsed}var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.classList.toggle("dark",d);if(c)e.setAttribute("data-sidebar-collapsed","")}catch(_){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferencesScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
