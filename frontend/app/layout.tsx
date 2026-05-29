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
        <div className="bg-glow bg-glow-1" />
        <div className="bg-glow bg-glow-2" />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#16161f",
              color: "#f4f4ff",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "12px",
              fontSize: "13px",
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontWeight: 600,
              boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#16161f" } },
            error:   { iconTheme: { primary: "#ff6b6b", secondary: "#16161f" } },
          }}
        />
      </body>
    </html>
  );
}
