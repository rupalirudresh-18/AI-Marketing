"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import { getProject, generateContent, generateCreative, saveOutput } from "@/lib/api";
import toast from "react-hot-toast";
import {
  Sparkles, Copy, Check, Bookmark, ChevronRight, Zap,
  AtSign, Target, Hash, Lightbulb, Video, Layout,
  Megaphone, Calendar, TrendingUp, Users, Globe, Star,
  ArrowRight, Download, CheckCircle, BarChart3
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

type Project = {
  id: string;
  brandName: string;
  productDescription: string;
  targetAudience: string;
  imagePath: string | null;
  analysis: Record<string, unknown>;
  content: Record<string, unknown> | null;
  creativeIdeas: Record<string, unknown> | null;
  savedOutputs: Array<{ id: string; type: string; content: string; label: string; savedAt: string }>;
};

/* ─── MICRO COMPONENTS ─── */

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy} className={`btn-ghost copy-btn`} style={{ fontSize: "12px", padding: "5px 10px" }}>
      {copied
        ? <><Check size={11} color="#10b981" /> Copied</>
        : <><Copy size={11} /> {label}</>}
    </button>
  );
}

function SaveButton({ projectId, type, content, label, onSave }: {
  projectId: string; type: string; content: string; label: string; onSave: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  async function save() {
    setSaving(true);
    try {
      await saveOutput(projectId, type, content, label);
      setSaved(true);
      onSave();
      toast.success("Saved!");
      setTimeout(() => setSaved(false), 3000);
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  }
  return (
    <button onClick={save} disabled={saving || saved} className="btn-ghost" style={{ fontSize: "12px", padding: "5px 10px" }}>
      {saved
        ? <><CheckCircle size={11} color="#10b981" /> Saved</>
        : saving ? "Saving..." : <><Bookmark size={11} /> Save</>}
    </button>
  );
}

function ContentBox({ title, content, projectId, type, label, onSave, accentColor }: {
  title: string; content: string; projectId: string; type: string; label: string; onSave: () => void; accentColor?: string;
}) {
  return (
    <div className="group" style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid var(--border)",
      borderRadius: "11px",
      padding: "16px",
      transition: "border-color 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <p style={{ fontSize: "11px", fontWeight: 800, color: accentColor || "#a09cff", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
          {title}
        </p>
        <div style={{ display: "flex", gap: "4px" }}>
          <CopyButton text={content} label="Copy" />
          <SaveButton projectId={projectId} type={type} content={content} label={label} onSave={onSave} />
        </div>
      </div>
      <p style={{ fontSize: "13.5px", color: "var(--text-2)", lineHeight: 1.75, whiteSpace: "pre-wrap", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
        {content}
      </p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, color }: { icon: React.ElementType; title: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid var(--border)" }}>
      <div style={{
        width: "34px", height: "34px", borderRadius: "9px",
        background: `${color}14`, border: `1px solid ${color}28`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={16} color={color} />
      </div>
      <h3 style={{ fontWeight: 800, fontSize: "15px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>{title}</h3>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc, onAction, actionLabel, loading }: {
  icon: React.ElementType; title: string; desc: string; onAction: () => void; actionLabel: string; loading: boolean;
}) {
  return (
    <div className="card" style={{ padding: "64px 40px", textAlign: "center" }}>
      <div style={{
        width: "60px", height: "60px", borderRadius: "16px",
        background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.18)",
        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
      }}>
        <Icon size={24} color="#6c63ff" />
      </div>
      <h3 style={{ fontWeight: 800, fontSize: "18px", marginBottom: "8px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>{title}</h3>
      <p style={{ color: "var(--text-2)", marginBottom: "24px", fontSize: "14px", maxWidth: "340px", margin: "0 auto 24px" }}>{desc}</p>
      <button onClick={onAction} disabled={loading} className="btn-primary">
        {loading
          ? <><div className="spinner" style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.25)", borderTop: "2px solid white", borderRadius: "50%" }} /> Generating...</>
          : <><Zap size={14} /> {actionLabel}</>}
      </button>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"analysis" | "content" | "creative" | "saved">("analysis");
  const [genLoading, setGenLoading] = useState<"content" | "creative" | null>(null);

  async function load() {
    try {
      const data = await getProject(projectId);
      setProject(data.project);
    } catch { toast.error("Failed to load project"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [projectId]);

  async function handleGenerateContent() {
    setGenLoading("content");
    try {
      await generateContent(projectId);
      await load();
      setActiveTab("content");
      toast.success("Content generated!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally { setGenLoading(null); }
  }

  async function handleGenerateCreative() {
    setGenLoading("creative");
    try {
      await generateCreative(projectId);
      await load();
      setActiveTab("creative");
      toast.success("Creative ideas generated!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally { setGenLoading(null); }
  }

  if (loading) {
    return (
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main className="main-content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div className="spinner" style={{ width: "36px", height: "36px", border: "2px solid rgba(108,99,255,0.2)", borderTop: "2px solid #6c63ff", borderRadius: "50%", margin: "0 auto 14px" }} />
            <p style={{ color: "var(--text-3)", fontSize: "14px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>Loading project...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main className="main-content" style={{ padding: "56px" }}>
          <div className="card" style={{ padding: "56px", textAlign: "center" }}>
            <p style={{ color: "var(--text-3)" }}>Project not found.</p>
          </div>
        </main>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const analysis = project.analysis as Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content  = project.content as Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const creative = project.creativeIdeas as Record<string, any> | null;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main className="main-content">
        {/* Top accent line */}
        <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, #6c63ff, #ff6b6b, #fbbf24, transparent)", opacity: 0.5 }} />

        <div style={{ padding: "40px 56px 64px", maxWidth: "1200px" }}>

          {/* ── PROJECT HEADER ── */}
          <div style={{ marginBottom: "36px" }}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
              <span className="label">Projects</span>
              <ChevronRight size={11} color="var(--text-3)" />
              <span className="label" style={{ color: "var(--text-2)" }}>{project.brandName}</span>
            </div>

            <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
              {/* Product image */}
              {project.imagePath ? (
                <img
                  src={`${API_BASE}${project.imagePath}`}
                  alt="Product"
                  style={{ width: "80px", height: "80px", borderRadius: "14px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border)" }}
                />
              ) : (
                <div style={{
                  width: "80px", height: "80px", borderRadius: "14px", flexShrink: 0,
                  background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Sparkles size={28} color="#6c63ff" />
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                  <span className="badge badge-emerald"><CheckCircle size={9} /> Analysis Complete</span>
                  {analysis.productCategory && <span className="badge badge-indigo">{analysis.productCategory as string}</span>}
                  {analysis.brandTone && <span className="badge badge-coral">{analysis.brandTone as string}</span>}
                  {project.targetAudience && <span className="badge badge-sky"><Users size={9} /> {project.targetAudience}</span>}
                </div>
                <h1 style={{
                  fontSize: "clamp(26px, 3vw, 38px)",
                  fontWeight: 900,
                  letterSpacing: "-1.5px",
                  marginBottom: "8px",
                  fontFamily: "'Cabinet Grotesk', sans-serif",
                  lineHeight: 1.1,
                }}>
                  {project.brandName}
                </h1>
                <p style={{ color: "var(--text-2)", fontSize: "14px", maxWidth: "600px", lineHeight: 1.6, fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                  {project.productDescription.length > 140
                    ? project.productDescription.slice(0, 140) + "..."
                    : project.productDescription}
                </p>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "8px", flexShrink: 0, flexWrap: "wrap" }}>
                {!project.content && (
                  <button onClick={handleGenerateContent} disabled={genLoading !== null} className="btn-primary" style={{ fontSize: "13px", padding: "9px 16px" }}>
                    {genLoading === "content"
                      ? <><div className="spinner" style={{ width: "13px", height: "13px", border: "2px solid rgba(255,255,255,0.25)", borderTop: "2px solid white", borderRadius: "50%" }} /> Generating...</>
                      : <><Zap size={13} /> Generate Content</>}
                  </button>
                )}
                {!project.creativeIdeas && (
                  <button onClick={handleGenerateCreative} disabled={genLoading !== null} className="btn-secondary" style={{ fontSize: "13px", padding: "9px 16px" }}>
                    {genLoading === "creative" ? "Generating..." : <><Lightbulb size={13} /> Creative Ideas</>}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── TABS ── */}
          <div className="tab-bar" style={{ marginBottom: "32px", width: "fit-content" }}>
            {[
              { key: "analysis", label: "AI Analysis",     icon: BarChart3  },
              { key: "content",  label: "Content",         icon: Sparkles   },
              { key: "creative", label: "Creative Ideas",  icon: Lightbulb  },
              { key: "saved",    label: `Saved (${project.savedOutputs?.length || 0})`, icon: Bookmark },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  className={`tab-item ${activeTab === tab.key ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                >
                  <Icon size={13} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* ════════════════════════════════════════
              TAB: ANALYSIS
          ════════════════════════════════════════ */}
          {activeTab === "analysis" && (
            <div className="fade-up">
              {/* Row 1: Brand Personality + Marketing Angle */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div className="card" style={{ padding: "24px" }}>
                  <SectionHeader icon={Star} title="Brand Personality" color="#fbbf24" />
                  <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.75, fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                    {analysis.brandPersonality as string}
                  </p>
                </div>

                <div className="card" style={{ padding: "24px" }}>
                  <SectionHeader icon={Target} title="Marketing Angle" color="#ff6b6b" />
                  <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.75, marginBottom: "16px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                    {analysis.marketingAngle as string}
                  </p>
                  {analysis.competitiveAdvantage && (
                    <div style={{ padding: "12px 14px", background: "rgba(255,107,107,0.05)", border: "1px solid rgba(255,107,107,0.12)", borderRadius: "9px" }}>
                      <p className="label" style={{ marginBottom: "5px", color: "#ff9d9d" }}>Competitive Edge</p>
                      <p style={{ fontSize: "12.5px", color: "var(--text-2)", lineHeight: 1.65, fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                        {analysis.competitiveAdvantage as string}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Audience Insights */}
              {analysis.audienceInsights && (
                <div className="card" style={{ padding: "24px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Users size={16} color="#38bdf8" />
                    </div>
                    <h3 style={{ fontWeight: 800, fontSize: "15px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>Audience Insights</h3>
                    {(analysis.audienceInsights as Record<string, any>).primaryAge && (
                      <span className="badge badge-sky">{(analysis.audienceInsights as Record<string, unknown>).primaryAge as string}</span>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                    {(["interests", "painPoints", "motivations"] as const).map((key) => {
                      const ai = analysis.audienceInsights as Record<string, unknown>;
                      const items = (ai[key] as string[]) || [];
                      const cfg: Record<string, { color: string; label: string; dot: string }> = {
                        interests:   { color: "#a09cff", label: "Interests",    dot: "#6c63ff" },
                        painPoints:  { color: "#ff9d9d", label: "Pain Points",  dot: "#ff6b6b" },
                        motivations: { color: "#34d399", label: "Motivations",  dot: "#10b981" },
                      };
                      return (
                        <div key={key}>
                          <p className="label" style={{ marginBottom: "12px", color: cfg[key].color }}>{cfg[key].label}</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {items.map((item, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: cfg[key].dot, marginTop: "8px", flexShrink: 0 }} />
                                <span style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.6, fontFamily: "'Cabinet Grotesk', sans-serif" }}>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Row 2: Emotional Triggers + Platform Recs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                {analysis.emotionalTriggers && (
                  <div className="card" style={{ padding: "24px" }}>
                    <SectionHeader icon={Sparkles} title="Emotional Triggers" color="#6c63ff" />
                    <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                      {(analysis.emotionalTriggers as string[]).map((t, i) => (
                        <span key={i} className="badge badge-coral">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.platformRecommendations && (
                  <div className="card" style={{ padding: "24px" }}>
                    <SectionHeader icon={Globe} title="Platform Recommendations" color="#6c63ff" />
                    <div style={{ display: "grid", gap: "10px" }}>
                      {(analysis.platformRecommendations as Array<Record<string, string>>).map((p, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: "9px" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                              <p style={{ fontWeight: 700, fontSize: "13px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>{p.platform}</p>
                              <span className={`badge ${p.priority === "High" ? "badge-coral" : p.priority === "Medium" ? "badge-amber" : "badge-indigo"}`}>{p.priority}</span>
                            </div>
                            <p style={{ fontSize: "12px", color: "var(--text-3)", fontFamily: "'Cabinet Grotesk', sans-serif" }}>{p.contentType}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CTA if content not generated */}
              {!project.content && (
                <div className="card-accent" style={{ marginTop: "8px" }}>
                  <div style={{ background: "linear-gradient(145deg, rgba(108,99,255,0.06), rgba(255,107,107,0.04))", borderRadius: "13px", padding: "36px", textAlign: "center" }}>
                    <div style={{
                      width: "52px", height: "52px", borderRadius: "14px",
                      background: "rgba(108,99,255,0.12)", border: "1px solid rgba(108,99,255,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
                    }}>
                      <Zap size={22} color="#6c63ff" />
                    </div>
                    <h3 style={{ fontWeight: 900, fontSize: "22px", letterSpacing: "-0.5px", marginBottom: "8px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                      Ready to generate your content?
                    </h3>
                    <p style={{ color: "var(--text-2)", fontSize: "14px", marginBottom: "24px", maxWidth: "420px", margin: "0 auto 24px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                      Create captions, ad copy, hooks, CTAs and a complete hashtag strategy.
                    </p>
                    <button onClick={handleGenerateContent} disabled={genLoading !== null} className="btn-primary" style={{ fontSize: "14px", padding: "12px 24px" }}>
                      {genLoading === "content"
                        ? "Generating..."
                        : <><Zap size={15} /> Generate Marketing Content <ArrowRight size={15} /></>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════
              TAB: CONTENT
          ════════════════════════════════════════ */}
          {activeTab === "content" && (
            <div className="fade-up" style={{ display: "grid", gap: "16px" }}>
              {!content ? (
                <EmptyState
                  icon={Zap} title="Content not generated yet"
                  desc="Generate Instagram captions, ad copy, hooks, CTAs, and hashtags."
                  onAction={handleGenerateContent} actionLabel="Generate Content"
                  loading={genLoading === "content"}
                />
              ) : (
                <>
                  {/* Instagram Captions */}
                  <div className="card" style={{ padding: "26px" }}>
                    <SectionHeader icon={AtSign} title="Instagram Captions" color="#ff6b6b" />
                    <div style={{ display: "grid", gap: "12px" }}>
                      {((content.instagramCaptions as Array<Record<string, unknown>>) || []).map((cap, i) => (
                        <ContentBox
                          key={i}
                          title={cap.style as string}
                          content={cap.caption as string}
                          projectId={project.id}
                          type="instagram_caption"
                          label={`Caption: ${cap.style}`}
                          onSave={load}
                          accentColor="#ff9d9d"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Hooks */}
                  <div className="card" style={{ padding: "26px" }}>
                    <SectionHeader icon={TrendingUp} title="Scroll-Stopping Hooks" color="#fbbf24" />
                    <div style={{ display: "grid", gap: "10px" }}>
                      {((content.hooks as Array<Record<string, string>>) || []).map((h, i) => (
                        <div key={i} className="group" style={{
                          background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.1)",
                          borderRadius: "11px", padding: "14px 16px",
                          display: "flex", gap: "14px", alignItems: "flex-start",
                        }}>
                          <span className="badge badge-amber" style={{ flexShrink: 0, marginTop: "2px" }}>{h.type}</span>
                          <p style={{ fontSize: "14px", color: "var(--text-1)", flex: 1, lineHeight: 1.65, fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                            &ldquo;{h.hook}&rdquo;
                          </p>
                          <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                            <CopyButton text={h.hook} label="Copy" />
                            <SaveButton projectId={project.id} type="hook" content={h.hook} label={`Hook: ${h.type}`} onSave={load} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ad Copy + CTAs side by side */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    {/* Ad Copy */}
                    <div className="card" style={{ padding: "26px" }}>
                      <SectionHeader icon={Target} title="Ad Copy" color="#6c63ff" />
                      <div style={{ display: "grid", gap: "12px" }}>
                        {((content.adCopy as Array<Record<string, string>>) || []).map((ad, i) => (
                          <div key={i} style={{ background: "rgba(108,99,255,0.04)", border: "1px solid rgba(108,99,255,0.12)", borderRadius: "11px", padding: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                              <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
                                <span className="badge badge-indigo">{ad.platform}</span>
                                <span style={{ fontSize: "11px", color: "var(--text-3)", fontFamily: "'Cabinet Grotesk', sans-serif" }}>{ad.format}</span>
                              </div>
                              <div style={{ display: "flex", gap: "4px" }}>
                                <CopyButton text={`${ad.headline}\n\n${ad.body}`} label="Copy" />
                                <SaveButton projectId={project.id} type="ad_copy" content={`${ad.headline}\n\n${ad.body}`} label={`Ad: ${ad.platform}`} onSave={load} />
                              </div>
                            </div>
                            <p style={{ fontWeight: 800, fontSize: "14px", marginBottom: "6px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>{ad.headline}</p>
                            <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.65, fontFamily: "'Cabinet Grotesk', sans-serif" }}>{ad.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="card" style={{ padding: "26px" }}>
                      <SectionHeader icon={ArrowRight} title="CTA Suggestions" color="#10b981" />
                      <div style={{ display: "grid", gap: "10px" }}>
                        {((content.ctaSuggestions as Array<Record<string, string>>) || []).map((cta, i) => (
                          <div key={i} className="group" style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)", borderRadius: "10px", padding: "14px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "7px" }}>
                              <p style={{ fontWeight: 800, fontSize: "14px", color: "#34d399", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                                &ldquo;{cta.action}&rdquo;
                              </p>
                              <CopyButton text={cta.action} label="Copy" />
                            </div>
                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                              <span className={`badge ${cta.urgency === "High" ? "badge-coral" : cta.urgency === "Medium" ? "badge-amber" : "badge-indigo"}`}>
                                {cta.urgency} urgency
                              </span>
                            </div>
                            {cta.context && (
                              <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "6px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>{cta.context}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Hashtags */}
                  {content.hashtags && (
                    <div className="card" style={{ padding: "26px" }}>
                      <SectionHeader icon={Hash} title="Hashtag Strategy" color="#38bdf8" />
                      {Object.entries(content.hashtags as Record<string, string[]>).map(([key, tags]) => (
                        <div key={key} style={{ marginBottom: "18px" }}>
                          <p className="label" style={{ marginBottom: "10px", color: "#7dd3fc" }}>{key}</p>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {tags.map((tag, i) => (
                              <span
                                key={i}
                                className="badge badge-sky"
                                style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                                onClick={() => { navigator.clipboard.writeText(tag); toast.success("Copied!"); }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const h = content.hashtags as Record<string, string[]>;
                          navigator.clipboard.writeText(Object.values(h).flat().join(" "));
                          toast.success("All hashtags copied!");
                        }}
                        className="btn-secondary"
                        style={{ fontSize: "12px", padding: "7px 14px" }}
                      >
                        <Copy size={12} /> Copy All Hashtags
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════
              TAB: CREATIVE IDEAS
          ════════════════════════════════════════ */}
          {activeTab === "creative" && (
            <div className="fade-up" style={{ display: "grid", gap: "16px" }}>
              {!creative ? (
                <EmptyState
                  icon={Lightbulb} title="Creative Ideas not generated yet"
                  desc="Generate reel concepts, carousel breakdowns, and full campaign strategies."
                  onAction={handleGenerateCreative} actionLabel="Generate Creative Ideas"
                  loading={genLoading === "creative"}
                />
              ) : (
                <>
                  {/* Reel Ideas */}
                  <div className="card" style={{ padding: "26px" }}>
                    <SectionHeader icon={Video} title="Reel Ideas" color="#ff6b6b" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      {((creative.reelIdeas as Array<Record<string, string>>) || []).map((reel, i) => (
                        <div key={i} style={{ background: "rgba(255,107,107,0.04)", border: "1px solid rgba(255,107,107,0.12)", borderRadius: "12px", padding: "18px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                            <div>
                              <p style={{ fontWeight: 800, fontSize: "14px", marginBottom: "6px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>{reel.title}</p>
                              <div style={{ display: "flex", gap: "6px" }}>
                                <span className="badge badge-coral">{reel.duration}</span>
                                <span className={`badge ${reel.viralPotential === "High" ? "badge-emerald" : "badge-amber"}`}>
                                  🔥 {reel.viralPotential}
                                </span>
                              </div>
                            </div>
                            <SaveButton
                              projectId={project.id} type="reel_idea"
                              content={`${reel.title}\n\n${reel.concept}\n\nHook: ${reel.hook}`}
                              label={`Reel: ${reel.title}`} onSave={load}
                            />
                          </div>
                          <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.65, marginBottom: "12px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                            {reel.concept}
                          </p>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", paddingTop: "12px", borderTop: "1px solid rgba(255,107,107,0.1)" }}>
                            {[["Hook", reel.hook], ["Music", reel.music], ["Visual", reel.visualStyle]].map(([lbl, val]) => (
                              <div key={lbl}>
                                <p className="label" style={{ marginBottom: "4px" }}>{lbl}</p>
                                <p style={{ fontSize: "11.5px", color: "var(--text-2)", lineHeight: 1.5, fontFamily: "'Cabinet Grotesk', sans-serif" }}>{val}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Carousel Ideas */}
                  <div className="card" style={{ padding: "26px" }}>
                    <SectionHeader icon={Layout} title="Carousel Ideas" color="#6c63ff" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      {((creative.carouselIdeas as Array<Record<string, unknown>>) || []).map((car, i) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const carousel = car as Record<string, any>;
                        return (
                          <div key={i} style={{ background: "rgba(108,99,255,0.04)", border: "1px solid rgba(108,99,255,0.12)", borderRadius: "12px", padding: "18px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                              <div>
                                <p style={{ fontWeight: 800, fontSize: "14px", marginBottom: "6px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>{carousel.title as string}</p>
                                <span className={`badge ${carousel.objective === "conversion" ? "badge-emerald" : carousel.objective === "awareness" ? "badge-sky" : "badge-indigo"}`}>
                                  {carousel.objective as string}
                                </span>
                              </div>
                              <SaveButton projectId={project.id} type="carousel_idea" content={`${carousel.title}\n\n${carousel.concept}`} label={`Carousel: ${carousel.title}`} onSave={load} />
                            </div>
                            <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.65, marginBottom: "14px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                              {carousel.concept as string}
                            </p>
                            <p className="label" style={{ marginBottom: "8px" }}>Slides</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              {((carousel.slides as string[]) || []).map((slide, si) => (
                                <div key={si} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                                  <div style={{
                                    width: "20px", height: "20px", borderRadius: "6px",
                                    background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.2)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0, fontSize: "10px", fontWeight: 800, color: "#a09cff",
                                  }}>
                                    {si + 1}
                                  </div>
                                  <p style={{ fontSize: "12px", color: "var(--text-2)", lineHeight: 1.6, fontFamily: "'Cabinet Grotesk', sans-serif" }}>{slide}</p>
                                </div>
                              ))}
                            </div>
                            {carousel.designTip && (
                              <p style={{ fontSize: "12px", color: "#a09cff", marginTop: "12px", padding: "9px 12px", background: "rgba(108,99,255,0.07)", borderRadius: "8px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                                💡 {carousel.designTip as string}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Campaign Strategies */}
                  <div className="card" style={{ padding: "26px" }}>
                    <SectionHeader icon={Megaphone} title="Campaign Strategies" color="#fbbf24" />
                    <div style={{ display: "grid", gap: "16px" }}>
                      {((creative.campaignSuggestions as Array<Record<string, unknown>>) || []).map((camp, i) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const campaign = camp as Record<string, any>;
                        return (
                          <div key={i} style={{ border: "1px solid rgba(251,191,36,0.15)", borderRadius: "12px", padding: "22px", background: "rgba(251,191,36,0.025)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                              <div>
                                <p style={{ fontWeight: 900, fontSize: "16px", fontFamily: "'Cabinet Grotesk', sans-serif", marginBottom: "4px" }}>
                                  {campaign.campaignName as string}
                                </p>
                                <p style={{ fontSize: "13px", color: "#fcd34d", fontStyle: "italic", marginBottom: "8px", fontFamily: "'Instrument Serif', serif" }}>
                                  &ldquo;{campaign.tagline as string}&rdquo;
                                </p>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <span className="badge badge-amber">{campaign.duration as string}</span>
                                  <span className={`badge ${campaign.budget === "Low" ? "badge-emerald" : campaign.budget === "Medium" ? "badge-amber" : "badge-coral"}`}>
                                    {campaign.budget} budget
                                  </span>
                                </div>
                              </div>
                              <SaveButton
                                projectId={project.id} type="campaign"
                                content={`${campaign.campaignName}\n"${campaign.tagline}"\n\n${campaign.concept}`}
                                label={`Campaign: ${campaign.campaignName}`} onSave={load}
                              />
                            </div>
                            <p style={{ fontSize: "13.5px", color: "var(--text-2)", lineHeight: 1.75, marginBottom: "18px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                              {campaign.concept as string}
                            </p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                              <div>
                                <p className="label" style={{ marginBottom: "10px" }}>Key Activations</p>
                                {((campaign.keyActivations as string[]) || []).map((act, ai) => (
                                  <div key={ai} style={{ display: "flex", gap: "7px", marginBottom: "6px" }}>
                                    <ChevronRight size={12} color="#fbbf24" style={{ marginTop: "4px", flexShrink: 0 }} />
                                    <p style={{ fontSize: "12.5px", color: "var(--text-2)", lineHeight: 1.55, fontFamily: "'Cabinet Grotesk', sans-serif" }}>{act}</p>
                                  </div>
                                ))}
                              </div>
                              <div>
                                <p className="label" style={{ marginBottom: "10px" }}>Channels</p>
                                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "14px" }}>
                                  {((campaign.channels as string[]) || []).map((ch, ci) => (
                                    <span key={ci} className="badge badge-sky">{ch}</span>
                                  ))}
                                </div>
                                <p className="label" style={{ marginBottom: "6px" }}>Expected Outcome</p>
                                <p style={{ fontSize: "12.5px", color: "var(--text-2)", lineHeight: 1.55, fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                                  {campaign.expectedOutcome as string}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Content Calendar */}
                  {creative.contentCalendarThemes && (
                    <div className="card" style={{ padding: "26px" }}>
                      <SectionHeader icon={Calendar} title="Monthly Content Calendar" color="#38bdf8" />
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                        {((creative.contentCalendarThemes as Array<Record<string, string>>) || []).map((week, i) => (
                          <div key={i} style={{ background: "rgba(56,189,248,0.04)", border: "1px solid rgba(56,189,248,0.1)", borderRadius: "11px", padding: "16px" }}>
                            <p className="label" style={{ color: "#7dd3fc", marginBottom: "6px" }}>{week.week}</p>
                            <p style={{ fontWeight: 800, fontSize: "14px", marginBottom: "5px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>{week.theme}</p>
                            <p style={{ fontSize: "12.5px", color: "var(--text-2)", lineHeight: 1.6, fontFamily: "'Cabinet Grotesk', sans-serif" }}>{week.contentMix}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════
              TAB: SAVED
          ════════════════════════════════════════ */}
          {activeTab === "saved" && (
            <div className="fade-up">
              {!project.savedOutputs || project.savedOutputs.length === 0 ? (
                <div className="card" style={{ padding: "72px 40px", textAlign: "center" }}>
                  <Bookmark size={32} color="var(--text-3)" style={{ margin: "0 auto 16px" }} />
                  <h3 style={{ fontWeight: 800, fontSize: "20px", marginBottom: "8px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                    No saved outputs yet
                  </h3>
                  <p style={{ color: "var(--text-2)", fontSize: "14px" }}>
                    Click Save on any content piece to bookmark it here.
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <p style={{ color: "var(--text-2)", fontSize: "14px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                      {project.savedOutputs.length} saved output{project.savedOutputs.length > 1 ? "s" : ""}
                    </p>
                    <button
                      onClick={() => {
                        const all = project.savedOutputs.map((s) => `[${s.label}]\n${s.content}`).join("\n\n---\n\n");
                        navigator.clipboard.writeText(all);
                        toast.success("All outputs copied!");
                      }}
                      className="btn-secondary"
                      style={{ fontSize: "12px", padding: "7px 14px" }}
                    >
                      <Download size={12} /> Export All
                    </button>
                  </div>

                  <div style={{ display: "grid", gap: "12px" }}>
                    {project.savedOutputs.map((item) => (
                      <div key={item.id} className="card" style={{ padding: "20px 24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span className="badge badge-indigo">{item.type.replace(/_/g, " ")}</span>
                            <p style={{ fontWeight: 700, fontSize: "13px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>{item.label}</p>
                          </div>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <p style={{ fontSize: "11px", color: "var(--text-3)", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                              {new Date(item.savedAt).toLocaleDateString()}
                            </p>
                            <CopyButton text={item.content} label="Copy" />
                          </div>
                        </div>
                        <p style={{ fontSize: "13.5px", color: "var(--text-2)", lineHeight: 1.75, whiteSpace: "pre-wrap", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                          {item.content.length > 300 ? item.content.slice(0, 300) + "..." : item.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
