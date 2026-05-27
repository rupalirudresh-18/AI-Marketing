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
      {/* Logo */}
      <div style={{ padding: "28px 24px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "var(--gradient-brand)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0
          }}>
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <div className="font-display" style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text-primary)" }}>
              Brand<span className="gradient-text">AI</span>
            </div>
          </div>
        </div>
        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", paddingLeft: "46px" }}>
          AI Marketing Assistant
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--border-subtle)", margin: "0 24px" }} />

      {/* Nav */}
      <nav style={{ padding: "16px 12px", flex: 1 }}>
        <p className="section-label" style={{ padding: "0 12px", marginBottom: "8px" }}>Navigation</p>
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.split("?")[0]);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "10px", marginBottom: "2px",
                transition: "all 0.2s",
                background: isActive ? "rgba(159,110,255,0.12)" : item.accent ? "rgba(255,77,141,0.06)" : "transparent",
                border: isActive ? "1px solid rgba(159,110,255,0.25)" : "1px solid transparent",
                color: isActive ? "var(--accent-violet)" : item.accent ? "var(--accent-pink)" : "var(--text-secondary)",
                cursor: "pointer",
              }}>
                <Icon size={16} />
                <span style={{ fontSize: "14px", fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                {isActive && <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.7 }} />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom promo */}
      <div style={{ padding: "16px 12px 24px" }}>
        <div className="border-gradient" style={{ padding: "1px" }}>
          <div style={{
            background: "rgba(159,110,255,0.06)",
            borderRadius: "15px",
            padding: "16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Zap size={14} color="var(--accent-gold)" />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-gold)" }}>AI-Powered</span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Upload your product and let AI craft your entire marketing strategy.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
