
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./webview.css";
import "./backend-status.css";
import { AuthProvider } from "@/lib/AuthContext";
import { NotificationProvider } from "@/components/NotificationProvider";
import { BackendStatusProvider } from "@/components/BackendStatusProvider";
import ConditionalShell from "@/components/ConditionalShell";
import { GoogleOAuthProvider } from "@react-oauth/google";
import WebviewWarning from "@/components/WebviewWarning";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexcart | Multi-Vendor E-Commerce",
  description: "Your one-stop shop for everything",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "no-id-set";

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GoogleOAuthProvider clientId={googleClientId}>
          <BackendStatusProvider>
            <AuthProvider>
              <NotificationProvider>
                <WebviewWarning />
                <ConditionalShell>{children}</ConditionalShell>
              </NotificationProvider>
            </AuthProvider>
          </BackendStatusProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}

