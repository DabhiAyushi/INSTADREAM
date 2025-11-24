import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/navbar";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://instadream.app"),
  title: {
    default: "InstaDream - AI-Powered Instagram Post Generator",
    template: "%s | InstaDream",
  },
  description:
    "Generate stunning Instagram posts with AI. Create professional images and engaging captions using cutting-edge AI technology. Perfect for content creators, marketers, and social media enthusiasts.",
  keywords: [
    "instagram generator",
    "AI image generation",
    "caption generator",
    "social media content",
    "AI content creation",
    "instagram posts",
    "FLUX",
    "image AI",
    "content creation",
  ],
  authors: [{ name: "InstaDream" }],
  creator: "InstaDream",
  publisher: "InstaDream",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://instadream.app",
    title: "InstaDream - AI-Powered Instagram Post Generator",
    description:
      "Generate stunning Instagram posts with AI-powered images and captions. Create professional content in seconds.",
    siteName: "InstaDream",
  },
  twitter: {
    card: "summary_large_image",
    title: "InstaDream - AI-Powered Instagram Post Generator",
    description:
      "Generate stunning Instagram posts with AI-powered images and captions. Create professional content in seconds.",
    creator: "@instadream",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          enableSystem
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <Navbar />
          <div className="pt-14 px-3">{children}</div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
