import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "BrandAI — AI Marketing Assistant",
  description: "AI-powered marketing content generator for brands",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a28",
              color: "#f0f0ff",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#00e5a0", secondary: "#1a1a28" } },
            error: { iconTheme: { primary: "#ff4d8d", secondary: "#1a1a28" } },
          }}
        />
      </body>
    </html>
  );
}
