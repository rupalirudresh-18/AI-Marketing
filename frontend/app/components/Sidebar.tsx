"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles, LayoutDashboard, PlusCircle, Bookmark, ChevronRight, Zap
} from "lucide-react";

const navItems = [
  { href: "/", label: "New Project", icon: PlusCircle, accent: true },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard?tab=saved", label: "Saved Outputs", icon: Bookmark },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Logo area */}
      <div style={{ padding: "28px 20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "11px",
            background: "linear-gradient(135deg, #6c63ff 0%, #ff6b6b 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: "0 4px 16px rgba(108,99,255,0.35)",
          }}>
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <div style={{
              fontSize: "17px", fontWeight: 900, letterSpacing: "-0.5px",
              color: "var(--text-1)", fontFamily: "'Cabinet Grotesk', sans-serif",
            }}>
              Brand<span className="gradient-text">AI</span>
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "1px" }}>
              Marketing Suite
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--border)", margin: "0 20px" }} />

      {/* Nav */}
      <nav style={{ padding: "16px 12px", flex: 1 }}>
        <p className="label" style={{ padding: "0 10px", marginBottom: "10px" }}>Menu</p>
        {navItems.map((item) => {
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href.split("?")[0]);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none", display: "block", marginBottom: "3px" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 10px", borderRadius: "9px",
                transition: "all 0.2s",
                background: isActive
                  ? "var(--indigo-soft)"
                  : item.accent
                    ? "rgba(255,107,107,0.06)"
                    : "transparent",
                border: isActive
                  ? "1px solid var(--indigo-border)"
                  : "1px solid transparent",
                color: isActive
                  ? "#a09cff"
                  : item.accent
                    ? "#ff9d9d"
                    : "var(--text-2)",
              }}>
                <Icon size={15} style={{ flexShrink: 0 }} />
                <span style={{
                  fontSize: "13px",
                  fontWeight: isActive ? 700 : 500,
                  fontFamily: "'Cabinet Grotesk', sans-serif",
                }}>
                  {item.label}
                </span>
                {isActive && (
                  <ChevronRight size={13} style={{ marginLeft: "auto", opacity: 0.6 }} />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom card */}
      <div style={{ padding: "12px 12px 24px" }}>
        <div className="card-accent" style={{ padding: "1px" }}>
          <div style={{
            background: "linear-gradient(145deg, rgba(108,99,255,0.08), rgba(255,107,107,0.04))",
            borderRadius: "13px",
            padding: "16px 14px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
              <div style={{
                width: "24px", height: "24px", borderRadius: "7px",
                background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Zap size={13} color="#fbbf24" />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#fbbf24", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                AI-Powered
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-2)", lineHeight: 1.55, fontFamily: "'Cabinet Grotesk', sans-serif" }}>
              Upload your product and let AI craft your entire marketing strategy instantly.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
