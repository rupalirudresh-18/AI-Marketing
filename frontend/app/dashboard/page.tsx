"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import { getProjects } from "@/lib/api";
import {
  Plus, Sparkles, Bookmark, BarChart3, ArrowRight,
  Image as ImageIcon, Clock, CheckCircle, TrendingUp, Zap
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

type Project = {
  id: string;
  brandName: string;
  productDescription: string;
  imagePath: string | null;
  createdAt: string;
  hasContent: boolean;
  hasCreative: boolean;
  savedOutputs: Array<{ id: string; type: string; label: string }>;
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "saved" ? "saved" : "projects";
  const [activeTab, setActiveTab] = useState<"projects" | "saved">(initialTab as "projects" | "saved");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getProjects();
        setProjects(data.projects);
      } catch { /* no-op */ }
      finally { setLoading(false); }
    })();
  }, []);

  const allSaved = projects.flatMap((p) =>
    (p.savedOutputs || []).map((s) => ({ ...s, brandName: p.brandName, projectId: p.id }))
  );

  const stats = [
    { label: "Projects", value: projects.length, icon: BarChart3, color: "#6c63ff", bg: "rgba(108,99,255,0.1)", border: "rgba(108,99,255,0.2)" },
    { label: "Content Ready", value: projects.filter((p) => p.hasContent).length, icon: Sparkles, color: "#ff6b6b", bg: "rgba(255,107,107,0.1)", border: "rgba(255,107,107,0.2)" },
    { label: "Creative Sets", value: projects.filter((p) => p.hasCreative).length, icon: TrendingUp, color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" },
    { label: "Saved Outputs", value: allSaved.length, icon: Bookmark, color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)" },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main className="main-content">
        {/* Top accent line */}
        <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, #6c63ff, #ff6b6b, #fbbf24, transparent)", opacity: 0.5 }} />

        <div style={{ padding: "48px 56px 64px", maxWidth: "1200px" }}>

          {/* ── HEADER ── */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "44px" }}>
            <div>
              <p className="label" style={{ marginBottom: "10px" }}>Overview</p>
              <h1 style={{
                fontSize: "clamp(30px, 3.5vw, 44px)",
                fontWeight: 900,
                letterSpacing: "-2px",
                lineHeight: 1.05,
                fontFamily: "'Cabinet Grotesk', sans-serif",
                marginBottom: "8px",
              }}>
                Dashboard
              </h1>
              <p style={{ color: "var(--text-2)", fontSize: "15px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                All your marketing projects and saved outputs in one place.
              </p>
            </div>
            <Link href="/" style={{ textDecoration: "none" }}>
              <button className="btn-primary" style={{ fontSize: "13px", padding: "10px 18px" }}>
                <Plus size={14} /> New Project
              </button>
            </Link>
          </div>

          {/* ── STATS ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "40px" }}>
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="card" style={{ padding: "22px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "9px",
                      background: stat.bg, border: `1px solid ${stat.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon size={16} color={stat.color} />
                    </div>
                  </div>
                  <p className="stat-number gradient-text" style={{ marginBottom: "4px" }}>{stat.value}</p>
                  <p className="label">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* ── TABS ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <div className="tab-bar">
              <button
                className={`tab-item ${activeTab === "projects" ? "active" : ""}`}
                onClick={() => setActiveTab("projects")}
              >
                <BarChart3 size={13} /> Projects ({projects.length})
              </button>
              <button
                className={`tab-item ${activeTab === "saved" ? "active" : ""}`}
                onClick={() => setActiveTab("saved")}
              >
                <Bookmark size={13} /> Saved ({allSaved.length})
              </button>
            </div>
          </div>

          {/* ── PROJECTS TAB ── */}
          {activeTab === "projects" && (
            <div className="fade-up">
              {loading ? (
                <div style={{ display: "grid", gap: "12px" }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="card shimmer" style={{ height: "96px" }} />
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="card" style={{ padding: "72px 40px", textAlign: "center" }}>
                  <div style={{
                    width: "64px", height: "64px", borderRadius: "16px",
                    background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 18px",
                  }}>
                    <Sparkles size={26} color="#6c63ff" />
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: "20px", marginBottom: "8px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                    No projects yet
                  </h3>
                  <p style={{ color: "var(--text-2)", marginBottom: "28px", fontSize: "14px", maxWidth: "340px", margin: "0 auto 28px" }}>
                    Create your first AI marketing project to generate content, reels, campaigns and more.
                  </p>
                  <Link href="/" style={{ textDecoration: "none" }}>
                    <button className="btn-primary">
                      <Plus size={15} /> Create First Project
                    </button>
                  </Link>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {projects.map((project) => (
                    <Link key={project.id} href={`/project/${project.id}`} style={{ textDecoration: "none" }}>
                      <div className="card card-hover" style={{ padding: "20px 24px", display: "flex", gap: "18px", alignItems: "center", cursor: "pointer" }}>
                        {/* Image */}
                        {project.imagePath ? (
                          <img
                            src={`${API_BASE}${project.imagePath}`}
                            alt={project.brandName}
                            style={{ width: "56px", height: "56px", borderRadius: "11px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border)" }}
                          />
                        ) : (
                          <div style={{
                            width: "56px", height: "56px", borderRadius: "11px",
                            background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.15)",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          }}>
                            <ImageIcon size={20} color="#6c63ff" />
                          </div>
                        )}

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 800, fontSize: "15px", marginBottom: "4px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                            {project.brandName}
                          </p>
                          <p style={{ fontSize: "13px", color: "var(--text-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "500px" }}>
                            {project.productDescription}
                          </p>
                          <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
                            <span className="badge badge-emerald"><CheckCircle size={9} /> Analyzed</span>
                            {project.hasContent && <span className="badge badge-indigo"><Sparkles size={9} /> Content</span>}
                            {project.hasCreative && <span className="badge badge-coral"><Zap size={9} /> Creative</span>}
                            {project.savedOutputs?.length > 0 && (
                              <span className="badge badge-amber"><Bookmark size={9} /> {project.savedOutputs.length} saved</span>
                            )}
                          </div>
                        </div>

                        {/* Meta */}
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--text-3)", fontSize: "12px" }}>
                            <Clock size={11} />
                            <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                              {new Date(project.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                          <div style={{
                            width: "30px", height: "30px", borderRadius: "8px",
                            background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <ArrowRight size={14} color="var(--text-2)" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SAVED TAB ── */}
          {activeTab === "saved" && (
            <div className="fade-up">
              {allSaved.length === 0 ? (
                <div className="card" style={{ padding: "72px 40px", textAlign: "center" }}>
                  <Bookmark size={32} color="var(--text-3)" style={{ margin: "0 auto 16px" }} />
                  <h3 style={{ fontWeight: 800, fontSize: "20px", marginBottom: "8px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                    No saved outputs
                  </h3>
                  <p style={{ color: "var(--text-2)", fontSize: "14px" }}>
                    Open a project and save content pieces you like to see them here.
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "10px" }}>
                  {allSaved.map((item) => (
                    <div key={item.id} className="card" style={{ padding: "16px 20px", display: "flex", gap: "14px", alignItems: "center" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", gap: "7px", alignItems: "center", marginBottom: "4px", flexWrap: "wrap" }}>
                          <span className="badge badge-indigo">{item.type.replace(/_/g, " ")}</span>
                          <span style={{ fontSize: "12px", color: "var(--text-3)", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                            from {item.brandName}
                          </span>
                        </div>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-1)", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                          {item.label}
                        </p>
                      </div>
                      <Link href={`/project/${item.projectId}?tab=saved`} style={{ textDecoration: "none" }}>
                        <button className="btn-ghost" style={{ flexShrink: 0 }}>
                          <ArrowRight size={13} /> View
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="spinner" style={{ width: "32px", height: "32px", border: "2px solid rgba(108,99,255,0.2)", borderTop: "2px solid #6c63ff", borderRadius: "50%" }} />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
