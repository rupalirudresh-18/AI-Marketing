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

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy} className="btn-secondary copy-btn" style={{ padding: "6px 12px", fontSize: "12px", gap: "4px" }}>
      {copied ? <><Check size={12} color="var(--accent-green)" /> Copied!</> : <><Copy size={12} /> {label}</>}
    </button>
  );
}

function SaveButton({ projectId, type, content, label, onSave }: { projectId: string; type: string; content: string; label: string; onSave: () => void }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  async function save() {
    setSaving(true);
    try {
      await saveOutput(projectId, type, content, label);
      setSaved(true);
      onSave();
      toast.success("Saved to outputs!");
      setTimeout(() => setSaved(false), 3000);
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  }
  return (
    <button onClick={save} disabled={saving || saved} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px", gap: "4px" }}>
      {saved ? <><CheckCircle size={12} color="var(--accent-green)" /> Saved</> : saving ? "Saving..." : <><Bookmark size={12} /> Save</>}
    </button>
  );
}

function ContentBox({ title, content, projectId, type, label, onSave, accent }: {
  title: string; content: string; projectId: string; type: string; label: string; onSave: () => void; accent?: string;
}) {
  return (
    <div className="group" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "16px", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, color: accent || "var(--accent-violet)", letterSpacing: "0.05em" }}>{title}</p>
        <div style={{ display: "flex", gap: "6px" }}>
          <CopyButton text={content} label="Copy" />
          <SaveButton projectId={projectId} type={type} content={content} label={label} onSave={onSave} />
        </div>
      </div>
      <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{content}</p>
    </div>
  );
}

function PlatformBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = { High: "badge-pink", Medium: "badge-gold", Low: "badge-violet" };
  return <span className={`badge ${map[priority] || "badge-violet"}`}>{priority}</span>;
}

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
    } catch {
      toast.error("Failed to load project");
    } finally { setLoading(false); }
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
      toast.error(err instanceof Error ? err.message : "Failed to generate content");
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
      toast.error(err instanceof Error ? err.message : "Failed to generate creative ideas");
    } finally { setGenLoading(null); }
  }

  if (loading) {
    return (
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main className="main-content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid rgba(159,110,255,0.2)", borderTop: "3px solid var(--accent-violet)", borderRadius: "50%", margin: "0 auto 16px" }} />
            <p style={{ color: "var(--text-muted)" }}>Loading project...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main className="main-content" style={{ padding: "48px 32px" }}>
          <div className="card" style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)" }}>Project not found</p>
          </div>
        </main>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const analysis = project.analysis as Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = project.content as Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const creative = project.creativeIdeas as Record<string, any> | null;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main className="main-content">
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 32px" }}>

          {/* Project Header */}
          <div className="card" style={{ padding: "28px", marginBottom: "28px", display: "flex", gap: "24px", alignItems: "flex-start" }}>
            {project.imagePath && (
              <img
                src={`${API_BASE}${project.imagePath}`}
                alt="Product"
                style={{ width: "88px", height: "88px", borderRadius: "14px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border-subtle)" }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="badge badge-green" style={{ marginBottom: "10px" }}>
                <CheckCircle size={10} /> Analysis Complete
              </div>
              <h1 className="font-display" style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "6px" }}>
                {project.brandName}
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "12px" }}>
                {project.productDescription.length > 120
                  ? project.productDescription.slice(0, 120) + "..."
                  : project.productDescription}
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {analysis.productCategory && <span className="badge badge-violet">{analysis.productCategory as string}</span>}
                {analysis.brandTone && <span className="badge badge-pink">{analysis.brandTone as string}</span>}
                {project.targetAudience && <span className="badge badge-cyan"><Users size={9} /> {project.targetAudience}</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
              {!project.content && (
                <button onClick={handleGenerateContent} disabled={genLoading !== null} className="btn-primary" style={{ fontSize: "13px", padding: "10px 16px" }}>
                  {genLoading === "content" ? <><div className="spinner" style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%" }} /> Generating...</> : <><Zap size={13} /> Generate Content</>}
                </button>
              )}
              {!project.creativeIdeas && (
                <button onClick={handleGenerateCreative} disabled={genLoading !== null} className="btn-secondary" style={{ fontSize: "13px", padding: "10px 16px" }}>
                  {genLoading === "creative" ? "Generating..." : <><Lightbulb size={13} /> Creative Ideas</>}
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="tab-bar" style={{ marginBottom: "28px" }}>
            {[
              { key: "analysis", label: "AI Analysis", icon: BarChart3 },
              { key: "content", label: "Content", icon: Sparkles },
              { key: "creative", label: "Creative Ideas", icon: Lightbulb },
              { key: "saved", label: `Saved (${project.savedOutputs?.length || 0})`, icon: Bookmark },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  className={`tab-item ${activeTab === tab.key ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Icon size={13} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* === TAB: ANALYSIS === */}
          {activeTab === "analysis" && (
            <div className="fade-in-up" style={{ display: "grid", gap: "20px" }}>
              {/* Brand Insights Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {/* Brand Personality */}
                <div className="card" style={{ padding: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                    <Star size={15} color="var(--accent-gold)" />
                    <p style={{ fontWeight: 700, fontSize: "14px" }}>Brand Personality</p>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                    {analysis.brandPersonality as string}
                  </p>
                </div>

                {/* Marketing Angle */}
                <div className="card" style={{ padding: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                    <Target size={15} color="var(--accent-pink)" />
                    <p style={{ fontWeight: 700, fontSize: "14px" }}>Marketing Angle</p>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "10px" }}>
                    {analysis.marketingAngle as string}
                  </p>
                  <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "10px", marginTop: "10px" }}>
                    <p className="section-label" style={{ marginBottom: "6px" }}>Competitive Edge</p>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                      {analysis.competitiveAdvantage as string}
                    </p>
                  </div>
                </div>
              </div>

              {/* Audience Insights */}
              {analysis.audienceInsights && (
                <div className="card" style={{ padding: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                    <Users size={15} color="var(--accent-cyan)" />
                    <p style={{ fontWeight: 700, fontSize: "14px" }}>Audience Insights</p>
                    <span className="badge badge-cyan">{(analysis.audienceInsights as Record<string, unknown>).primaryAge as string}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                    {["interests", "painPoints", "motivations"].map((key) => {
                      const ai = analysis.audienceInsights as Record<string, unknown>;
                      const items = (ai[key] as string[]) || [];
                      const colors: Record<string, string> = { interests: "var(--accent-violet)", painPoints: "var(--accent-pink)", motivations: "var(--accent-green)" };
                      const labels: Record<string, string> = { interests: "Interests", painPoints: "Pain Points", motivations: "Motivations" };
                      return (
                        <div key={key}>
                          <p className="section-label" style={{ marginBottom: "10px", color: colors[key] }}>{labels[key]}</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {items.map((item, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: colors[key], marginTop: "6px", flexShrink: 0 }} />
                                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Emotional Triggers */}
              {analysis.emotionalTriggers && (
                <div className="card" style={{ padding: "24px" }}>
                  <p style={{ fontWeight: 700, fontSize: "14px", marginBottom: "14px" }}>Emotional Triggers</p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {(analysis.emotionalTriggers as string[]).map((t, i) => (
                      <span key={i} className="badge badge-pink">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform Recommendations */}
              {analysis.platformRecommendations && (
                <div className="card" style={{ padding: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                    <Globe size={15} color="var(--accent-violet)" />
                    <p style={{ fontWeight: 700, fontSize: "14px" }}>Platform Recommendations</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                    {(analysis.platformRecommendations as Array<Record<string, string>>).map((p, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                          <p style={{ fontWeight: 600, fontSize: "14px" }}>{p.platform}</p>
                          <PlatformBadge priority={p.priority} />
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>{p.reason}</p>
                        <p style={{ fontSize: "11px", color: "var(--accent-violet)" }}>{p.contentType}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate Content CTA */}
              {!project.content && (
                <div className="border-gradient" style={{ padding: "1px" }}>
                  <div style={{ background: "rgba(159,110,255,0.05)", borderRadius: "15px", padding: "28px", textAlign: "center" }}>
                    <Sparkles size={28} color="var(--accent-violet)" style={{ margin: "0 auto 12px" }} />
                    <h3 className="font-display" style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Ready to generate your content?</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>Create Instagram captions, ad copy, hooks, CTAs, and hashtags.</p>
                    <button onClick={handleGenerateContent} disabled={genLoading !== null} className="btn-primary">
                      {genLoading === "content" ? "Generating..." : <><Zap size={16} /> Generate Marketing Content <ArrowRight size={16} /></>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === TAB: CONTENT === */}
          {activeTab === "content" && (
            <div className="fade-in-up" style={{ display: "grid", gap: "20px" }}>
              {!content ? (
                <div className="card" style={{ padding: "48px", textAlign: "center" }}>
                  <Zap size={32} color="var(--accent-violet)" style={{ margin: "0 auto 14px" }} />
                  <h3 style={{ fontWeight: 700, marginBottom: "10px" }}>Content not generated yet</h3>
                  <p style={{ color: "var(--text-muted)", marginBottom: "20px", fontSize: "14px" }}>Click the button to create your marketing content.</p>
                  <button onClick={handleGenerateContent} disabled={genLoading !== null} className="btn-primary">
                    {genLoading === "content" ? <><div className="spinner" style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%" }} /> Generating...</> : <><Zap size={15} /> Generate Content</>}
                  </button>
                </div>
              ) : (
                <>
                  {/* Instagram Captions */}
                  <div className="card" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                      <AtSign size={16} color="var(--accent-pink)" />
                      <h3 style={{ fontWeight: 700, fontSize: "16px" }}>Instagram Captions</h3>
                    </div>
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
                          accent="var(--accent-pink)"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Hooks */}
                  <div className="card" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                      <TrendingUp size={16} color="var(--accent-gold)" />
                      <h3 style={{ fontWeight: 700, fontSize: "16px" }}>Scroll-Stopping Hooks</h3>
                    </div>
                    <div style={{ display: "grid", gap: "10px" }}>
                      {((content.hooks as Array<Record<string, string>>) || []).map((h, i) => (
                        <div key={i} className="group" style={{ background: "rgba(245,200,66,0.04)", border: "1px solid rgba(245,200,66,0.1)", borderRadius: "12px", padding: "14px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                          <span className="badge badge-gold" style={{ flexShrink: 0, marginTop: "2px" }}>{h.type}</span>
                          <p style={{ fontSize: "14px", color: "var(--text-primary)", flex: 1, lineHeight: 1.5 }}>"{h.hook}"</p>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <CopyButton text={h.hook} label="Copy" />
                            <SaveButton projectId={project.id} type="hook" content={h.hook} label={`Hook: ${h.type}`} onSave={load} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ad Copy */}
                  <div className="card" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                      <Target size={16} color="var(--accent-violet)" />
                      <h3 style={{ fontWeight: 700, fontSize: "16px" }}>Ad Copy</h3>
                    </div>
                    <div style={{ display: "grid", gap: "12px" }}>
                      {((content.adCopy as Array<Record<string, string>>) || []).map((ad, i) => (
                        <div key={i} style={{ background: "rgba(159,110,255,0.04)", border: "1px solid rgba(159,110,255,0.1)", borderRadius: "12px", padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <span className="badge badge-violet">{ad.platform}</span>
                              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{ad.format}</span>
                            </div>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <CopyButton text={`${ad.headline}\n\n${ad.body}`} label="Copy" />
                              <SaveButton projectId={project.id} type="ad_copy" content={`${ad.headline}\n\n${ad.body}`} label={`Ad Copy: ${ad.platform}`} onSave={load} />
                            </div>
                          </div>
                          <p style={{ fontWeight: 700, fontSize: "14px", marginBottom: "6px" }}>{ad.headline}</p>
                          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{ad.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="card" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                      <ArrowRight size={16} color="var(--accent-green)" />
                      <h3 style={{ fontWeight: 700, fontSize: "16px" }}>CTA Suggestions</h3>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                      {((content.ctaSuggestions as Array<Record<string, string>>) || []).map((cta, i) => (
                        <div key={i} className="group" style={{ background: "rgba(0,229,160,0.04)", border: "1px solid rgba(0,229,160,0.1)", borderRadius: "12px", padding: "14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                            <p style={{ fontWeight: 700, fontSize: "14px", color: "var(--accent-green)" }}>"{cta.action}"</p>
                            <CopyButton text={cta.action} label="Copy" />
                          </div>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <span className={`badge ${cta.urgency === "High" ? "badge-pink" : cta.urgency === "Medium" ? "badge-gold" : "badge-violet"}`}>{cta.urgency} urgency</span>
                          </div>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>{cta.context}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hashtags */}
                  {content.hashtags && (
                    <div className="card" style={{ padding: "24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                        <Hash size={16} color="var(--accent-cyan)" />
                        <h3 style={{ fontWeight: 700, fontSize: "16px" }}>Hashtag Strategy</h3>
                      </div>
                      {Object.entries(content.hashtags as Record<string, string[]>).map(([key, tags]) => (
                        <div key={key} style={{ marginBottom: "14px" }}>
                          <p className="section-label" style={{ marginBottom: "8px", color: "var(--accent-cyan)" }}>{key}</p>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {tags.map((tag, i) => (
                              <span key={i} className="badge badge-cyan" style={{ cursor: "pointer" }} onClick={() => navigator.clipboard.writeText(tag)}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button onClick={() => {
                        const h = content.hashtags as Record<string, string[]>;
                        const all = Object.values(h).flat().join(" ");
                        navigator.clipboard.writeText(all);
                        toast.success("All hashtags copied!");
                      }} className="btn-secondary" style={{ marginTop: "10px", fontSize: "12px" }}>
                        <Copy size={12} /> Copy All Hashtags
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* === TAB: CREATIVE IDEAS === */}
          {activeTab === "creative" && (
            <div className="fade-in-up" style={{ display: "grid", gap: "20px" }}>
              {!creative ? (
                <div className="card" style={{ padding: "48px", textAlign: "center" }}>
                  <Lightbulb size={32} color="var(--accent-gold)" style={{ margin: "0 auto 14px" }} />
                  <h3 style={{ fontWeight: 700, marginBottom: "10px" }}>Creative Ideas not generated yet</h3>
                  <p style={{ color: "var(--text-muted)", marginBottom: "20px", fontSize: "14px" }}>Generate reel ideas, carousel concepts, and full campaign strategies.</p>
                  <button onClick={handleGenerateCreative} disabled={genLoading !== null} className="btn-primary">
                    {genLoading === "creative" ? "Generating..." : <><Lightbulb size={15} /> Generate Creative Ideas</>}
                  </button>
                </div>
              ) : (
                <>
                  {/* Reel Ideas */}
                  <div className="card" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                      <Video size={16} color="var(--accent-pink)" />
                      <h3 style={{ fontWeight: 700, fontSize: "16px" }}>Reel Ideas</h3>
                    </div>
                    <div style={{ display: "grid", gap: "14px" }}>
                      {((creative.reelIdeas as Array<Record<string, string>>) || []).map((reel, i) => (
                        <div key={i} style={{ background: "rgba(255,77,141,0.04)", border: "1px solid rgba(255,77,141,0.1)", borderRadius: "12px", padding: "18px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                            <div>
                              <p style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>{reel.title}</p>
                              <div style={{ display: "flex", gap: "6px" }}>
                                <span className="badge badge-pink">{reel.duration}</span>
                                <span className={`badge ${reel.viralPotential === "High" ? "badge-green" : "badge-gold"}`}>
                                  🔥 {reel.viralPotential} viral
                                </span>
                              </div>
                            </div>
                            <SaveButton projectId={project.id} type="reel_idea" content={`${reel.title}\n\n${reel.concept}\n\nHook: ${reel.hook}`} label={`Reel: ${reel.title}`} onSave={load} />
                          </div>
                          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "10px" }}>{reel.concept}</p>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                            <div><p className="section-label" style={{ marginBottom: "4px" }}>Hook</p><p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{reel.hook}</p></div>
                            <div><p className="section-label" style={{ marginBottom: "4px" }}>Music</p><p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{reel.music}</p></div>
                            <div><p className="section-label" style={{ marginBottom: "4px" }}>Visual Style</p><p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{reel.visualStyle}</p></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Carousel Ideas */}
                  <div className="card" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                      <Layout size={16} color="var(--accent-violet)" />
                      <h3 style={{ fontWeight: 700, fontSize: "16px" }}>Carousel Ideas</h3>
                    </div>
                    <div style={{ display: "grid", gap: "14px" }}>
                      {((creative.carouselIdeas as Array<Record<string, unknown>>) || []).map((car, i) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const carousel = car as Record<string, any>;
                        return (
                          <div key={i} style={{ background: "rgba(159,110,255,0.04)", border: "1px solid rgba(159,110,255,0.1)", borderRadius: "12px", padding: "18px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                              <div>
                                <p style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>{carousel.title as string}</p>
                                <span className={`badge ${carousel.objective === "conversion" ? "badge-green" : carousel.objective === "awareness" ? "badge-cyan" : "badge-violet"}`}>
                                  {carousel.objective as string}
                                </span>
                              </div>
                              <SaveButton projectId={project.id} type="carousel_idea" content={`${carousel.title}\n\n${carousel.concept}`} label={`Carousel: ${carousel.title}`} onSave={load} />
                            </div>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "12px" }}>{carousel.concept as string}</p>
                            <p className="section-label" style={{ marginBottom: "8px" }}>Slide Breakdown</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              {((carousel.slides as string[]) || []).map((slide, si) => (
                                <div key={si} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                                  <div style={{ width: "20px", height: "20px", borderRadius: "6px", background: "rgba(159,110,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "11px", fontWeight: 700, color: "var(--accent-violet)" }}>
                                    {si + 1}
                                  </div>
                                  <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>{slide}</p>
                                </div>
                              ))}
                            </div>
                            {carousel.designTip && (
                              <p style={{ fontSize: "12px", color: "var(--accent-violet)", marginTop: "10px", padding: "8px 12px", background: "rgba(159,110,255,0.06)", borderRadius: "8px" }}>
                                💡 Design Tip: {carousel.designTip as string}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Campaign Suggestions */}
                  <div className="card" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                      <Megaphone size={16} color="var(--accent-gold)" />
                      <h3 style={{ fontWeight: 700, fontSize: "16px" }}>Campaign Strategies</h3>
                    </div>
                    <div style={{ display: "grid", gap: "14px" }}>
                      {((creative.campaignSuggestions as Array<Record<string, unknown>>) || []).map((camp, i) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const campaign = camp as Record<string, any>;
                        return (
                          <div key={i} style={{ border: "1px solid rgba(245,200,66,0.15)", borderRadius: "12px", padding: "20px", background: "rgba(245,200,66,0.02)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                              <div>
                                <p style={{ fontWeight: 800, fontSize: "16px", fontFamily: "var(--font-syne, Syne, sans-serif)", marginBottom: "4px" }}>{campaign.campaignName as string}</p>
                                <p style={{ fontSize: "13px", color: "var(--accent-gold)", fontStyle: "italic", marginBottom: "6px" }}>"{campaign.tagline as string}"</p>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <span className="badge badge-gold">{campaign.duration as string}</span>
                                  <span className={`badge ${campaign.budget === "Low" ? "badge-green" : campaign.budget === "Medium" ? "badge-gold" : "badge-pink"}`}>
                                    {campaign.budget} budget
                                  </span>
                                </div>
                              </div>
                              <SaveButton projectId={project.id} type="campaign" content={`${campaign.campaignName}\n"${campaign.tagline}"\n\n${campaign.concept}`} label={`Campaign: ${campaign.campaignName}`} onSave={load} />
                            </div>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "14px" }}>{campaign.concept as string}</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                              <div>
                                <p className="section-label" style={{ marginBottom: "8px" }}>Key Activations</p>
                                {((campaign.keyActivations as string[]) || []).map((act, ai) => (
                                  <div key={ai} style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
                                    <ChevronRight size={12} color="var(--accent-gold)" style={{ marginTop: "3px", flexShrink: 0 }} />
                                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{act}</p>
                                  </div>
                                ))}
                              </div>
                              <div>
                                <p className="section-label" style={{ marginBottom: "8px" }}>Channels</p>
                                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                                  {((campaign.channels as string[]) || []).map((ch, ci) => (
                                    <span key={ci} className="badge badge-cyan">{ch}</span>
                                  ))}
                                </div>
                                <p className="section-label" style={{ margin: "10px 0 4px" }}>Expected Outcome</p>
                                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{campaign.expectedOutcome as string}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Content Calendar */}
                  {creative.contentCalendarThemes && (
                    <div className="card" style={{ padding: "24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                        <Calendar size={16} color="var(--accent-cyan)" />
                        <h3 style={{ fontWeight: 700, fontSize: "16px" }}>Monthly Content Calendar</h3>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                        {((creative.contentCalendarThemes as Array<Record<string, string>>) || []).map((week, i) => (
                          <div key={i} style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.1)", borderRadius: "12px", padding: "14px" }}>
                            <p className="section-label" style={{ color: "var(--accent-cyan)", marginBottom: "6px" }}>{week.week}</p>
                            <p style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>{week.theme}</p>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>{week.contentMix}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* === TAB: SAVED === */}
          {activeTab === "saved" && (
            <div className="fade-in-up" style={{ display: "grid", gap: "14px" }}>
              {!project.savedOutputs || project.savedOutputs.length === 0 ? (
                <div className="card" style={{ padding: "48px", textAlign: "center" }}>
                  <Bookmark size={32} color="var(--text-muted)" style={{ margin: "0 auto 14px" }} />
                  <h3 style={{ fontWeight: 700, marginBottom: "8px" }}>No saved outputs yet</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Click the Save button on any content piece to bookmark it here.</p>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{project.savedOutputs.length} saved output{project.savedOutputs.length > 1 ? "s" : ""}</p>
                    <button onClick={() => {
                      const all = project.savedOutputs.map(s => `[${s.label}]\n${s.content}`).join("\n\n---\n\n");
                      navigator.clipboard.writeText(all);
                      toast.success("All outputs copied!");
                    }} className="btn-secondary" style={{ fontSize: "12px", padding: "6px 12px", marginLeft: "auto" }}>
                      <Download size={12} /> Export All
                    </button>
                  </div>
                  {project.savedOutputs.map((item) => (
                    <div key={item.id} className="card" style={{ padding: "18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span className="badge badge-violet">{item.type.replace(/_/g, " ")}</span>
                          <p style={{ fontWeight: 600, fontSize: "13px" }}>{item.label}</p>
                        </div>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{new Date(item.savedAt).toLocaleDateString()}</p>
                          <CopyButton text={item.content} label="Copy" />
                        </div>
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                        {item.content.length > 300 ? item.content.slice(0, 300) + "..." : item.content}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
