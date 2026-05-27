"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import { getProjects } from "@/lib/api";
import {
  Plus, Sparkles, Bookmark, BarChart3, ArrowRight,
  Image as ImageIcon, Clock, CheckCircle, TrendingUp
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
      } catch {
        // no-op
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const allSaved = projects.flatMap((p) =>
    (p.savedOutputs || []).map((s) => ({ ...s, brandName: p.brandName, projectId: p.id }))
  );

  const stats = [
    { label: "Total Projects", value: projects.length, icon: BarChart3, color: "var(--accent-violet)" },
    { label: "Content Generated", value: projects.filter((p) => p.hasContent).length, icon: Sparkles, color: "var(--accent-pink)" },
    { label: "Creative Ideas", value: projects.filter((p) => p.hasCreative).length, icon: TrendingUp, color: "var(--accent-gold)" },
    { label: "Saved Outputs", value: allSaved.length, icon: Bookmark, color: "var(--accent-green)" },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main className="main-content">
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 32px" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "36px" }}>
            <div>
              <h1 className="font-display" style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: "6px" }}>
                Dashboard
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
                All your marketing projects and saved outputs
              </p>
            </div>
            <Link href="/" style={{ textDecoration: "none" }}>
              <button className="btn-primary" style={{ fontSize: "14px", padding: "11px 20px" }}>
                <Plus size={15} /> New Project
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "32px" }}>
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="card" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <Icon size={14} color={stat.color} />
                    <p className="section-label">{stat.label}</p>
                  </div>
                  <p className="stat-number gradient-text">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="tab-bar" style={{ marginBottom: "24px" }}>
            <button className={`tab-item ${activeTab === "projects" ? "active" : ""}`} onClick={() => setActiveTab("projects")} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <BarChart3 size={13} /> Projects ({projects.length})
            </button>
            <button className={`tab-item ${activeTab === "saved" ? "active" : ""}`} onClick={() => setActiveTab("saved")} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Bookmark size={13} /> Saved Outputs ({allSaved.length})
            </button>
          </div>

          {/* Projects Tab */}
          {activeTab === "projects" && (
            <div>
              {loading ? (
                <div style={{ display: "grid", gap: "14px" }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="card shimmer" style={{ height: "110px" }} />
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="card" style={{ padding: "64px", textAlign: "center" }}>
                  <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: "rgba(159,110,255,0.1)", border: "1px solid rgba(159,110,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <Sparkles size={24} color="var(--accent-violet)" />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: "18px", marginBottom: "8px" }}>No projects yet</h3>
                  <p style={{ color: "var(--text-muted)", marginBottom: "24px", fontSize: "14px" }}>
                    Create your first AI marketing project to get started.
                  </p>
                  <Link href="/" style={{ textDecoration: "none" }}>
                    <button className="btn-primary"><Plus size={15} /> Create First Project</button>
                  </Link>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "14px" }}>
                  {projects.map((project) => (
                    <Link key={project.id} href={`/project/${project.id}`} style={{ textDecoration: "none" }}>
                      <div className="card card-hover" style={{ padding: "20px", display: "flex", gap: "16px", alignItems: "center", cursor: "pointer" }}>
                        {project.imagePath ? (
                          <img src={`${API_BASE}${project.imagePath}`} alt={project.brandName}
                            style={{ width: "60px", height: "60px", borderRadius: "12px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border-subtle)" }}
                          />
                        ) : (
                          <div style={{ width: "60px", height: "60px", borderRadius: "12px", background: "rgba(159,110,255,0.08)", border: "1px solid rgba(159,110,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <ImageIcon size={20} color="var(--accent-violet)" />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>{project.brandName}</p>
                          <p style={{ fontSize: "13px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {project.productDescription}
                          </p>
                          <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                            <span className="badge badge-green"><CheckCircle size={9} /> Analyzed</span>
                            {project.hasContent && <span className="badge badge-violet"><Sparkles size={9} /> Content Ready</span>}
                            {project.hasCreative && <span className="badge badge-pink"><TrendingUp size={9} /> Creative Ready</span>}
                            {project.savedOutputs?.length > 0 && <span className="badge badge-gold"><Bookmark size={9} /> {project.savedOutputs.length} Saved</span>}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", fontSize: "12px" }}>
                              <Clock size={11} /> {new Date(project.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <ArrowRight size={16} color="var(--text-muted)" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Tab */}
          {activeTab === "saved" && (
            <div>
              {allSaved.length === 0 ? (
                <div className="card" style={{ padding: "64px", textAlign: "center" }}>
                  <Bookmark size={32} color="var(--text-muted)" style={{ margin: "0 auto 14px" }} />
                  <h3 style={{ fontWeight: 700, fontSize: "18px", marginBottom: "8px" }}>No saved outputs</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                    Open a project and save content pieces you like.
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {allSaved.map((item) => (
                    <div key={item.id} className="card" style={{ padding: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
                          <span className="badge badge-violet">{item.type.replace(/_/g, " ")}</span>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>from {item.brandName}</span>
                        </div>
                        <p style={{ fontSize: "13px", fontWeight: 600 }}>{item.label}</p>
                      </div>
                      <Link href={`/project/${item.projectId}?tab=saved`} style={{ textDecoration: "none" }}>
                        <button className="btn-secondary" style={{ fontSize: "12px", padding: "7px 12px" }}>
                          <ArrowRight size={12} /> View
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
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
