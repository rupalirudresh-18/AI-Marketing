"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import { analyzeProduct } from "@/lib/api";
import toast from "react-hot-toast";
import {
  Upload, Image as ImageIcon, X, Sparkles, ArrowRight,
  Users, FileText, Tag, Cpu, BarChart3, Lightbulb, AtSign
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    label: "AI Analysis",
    desc: "Brand tone, audience insights, platform recommendations & competitive edge",
    color: "#6c63ff",
    bg: "rgba(108,99,255,0.08)",
    border: "rgba(108,99,255,0.18)",
  },
  {
    icon: AtSign,
    label: "Content Generation",
    desc: "Instagram captions, ad copy, scroll-stopping hooks, CTAs & hashtag strategy",
    color: "#ff6b6b",
    bg: "rgba(255,107,107,0.08)",
    border: "rgba(255,107,107,0.18)",
  },
  {
    icon: Lightbulb,
    label: "Creative Ideas",
    desc: "Viral reel concepts, carousel breakdowns & full campaign strategies",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.18)",
  },
];

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<string>("");
  const [form, setForm] = useState({ brandName: "", productDescription: "", targetAudience: "" });
  const [dragOver, setDragOver] = useState(false);

  function handleFile(f: File) {
    setFile(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.brandName || !form.productDescription) {
      toast.error("Brand name and description are required");
      return;
    }
    setLoading(true);
    setStep("Analyzing with AI...");
    try {
      const fd = new FormData();
      fd.append("brandName", form.brandName);
      fd.append("productDescription", form.productDescription);
      fd.append("targetAudience", form.targetAudience);
      if (file) fd.append("image", file);
      const data = await analyzeProduct(fd);
      toast.success("Analysis complete!");
      router.push(`/project/${data.projectId}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setStep("");
    }
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main className="main-content">
        {/* Full-width top accent line */}
        <div style={{
          height: "2px",
          background: "linear-gradient(90deg, transparent, #6c63ff, #ff6b6b, #fbbf24, transparent)",
          opacity: 0.5,
        }} />

        <div style={{ padding: "48px 56px 64px", maxWidth: "1200px" }}>
          {/* ── HERO HEADER ── */}
          <div style={{ marginBottom: "52px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", marginBottom: "20px", padding: "5px 12px", background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)", borderRadius: "99px" }}>
              <Sparkles size={12} color="#a09cff" />
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#a09cff", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                AI Marketing Suite
              </span>
            </div>

            <h1 style={{
              fontSize: "clamp(38px, 4.5vw, 58px)",
              fontWeight: 900,
              letterSpacing: "-2.5px",
              lineHeight: 1.06,
              marginBottom: "18px",
              fontFamily: "'Cabinet Grotesk', sans-serif",
              maxWidth: "680px",
            }}>
              Build your brand&apos;s{" "}
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}>
                complete{" "}
              </span>
              <span className="gradient-text">marketing kit</span>
            </h1>

            <p style={{
              fontSize: "16px",
              color: "var(--text-2)",
              maxWidth: "520px",
              lineHeight: 1.7,
              fontFamily: "'Cabinet Grotesk', sans-serif",
            }}>
              Upload your product, fill in the details, and watch AI generate your entire marketing strategy — captions, ads, hooks, campaigns — in seconds.
            </p>
          </div>

          {/* ── TWO-COLUMN LAYOUT ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "32px", alignItems: "start" }}>

            {/* LEFT: Form */}
            <form onSubmit={handleSubmit}>
              <div className="card" style={{ padding: "36px", marginBottom: "0" }}>

                {/* Upload zone */}
                <div style={{ marginBottom: "28px" }}>
                  <label className="label" style={{ display: "block", marginBottom: "10px" }}>
                    Product Image / Video <span style={{ color: "var(--text-3)", textTransform: "none", letterSpacing: 0, fontSize: "11px", fontWeight: 500 }}> — optional</span>
                  </label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => !file && fileInputRef.current?.click()}
                    style={{
                      border: `1.5px dashed ${dragOver ? "rgba(108,99,255,0.6)" : file ? "rgba(108,99,255,0.35)" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: "12px",
                      padding: file && preview ? "16px" : "36px 24px",
                      textAlign: "center",
                      cursor: file ? "default" : "pointer",
                      background: dragOver
                        ? "rgba(108,99,255,0.07)"
                        : file
                          ? "rgba(108,99,255,0.04)"
                          : "rgba(255,255,255,0.015)",
                      transition: "all 0.25s",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      minHeight: preview ? "auto" : "148px",
                    }}
                  >
                    {preview ? (
                      <>
                        <img
                          src={preview}
                          alt="preview"
                          style={{ maxHeight: "200px", maxWidth: "100%", borderRadius: "9px", objectFit: "contain" }}
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                          style={{
                            position: "absolute", top: "10px", right: "10px",
                            width: "28px", height: "28px", borderRadius: "50%",
                            background: "rgba(255,107,107,0.18)", border: "1px solid rgba(255,107,107,0.3)",
                            color: "#ff6b6b", display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                          }}>
                          <X size={13} />
                        </button>
                      </>
                    ) : file ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        <FileText size={26} color="#6c63ff" />
                        <p style={{ color: "var(--text-1)", fontWeight: 600, fontSize: "13px" }}>{file.name}</p>
                        <button type="button" onClick={() => { setFile(null); setPreview(null); }}
                          style={{ color: "#ff6b6b", fontSize: "12px", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <div style={{
                          width: "52px", height: "52px", borderRadius: "13px",
                          background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)",
                          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px",
                        }}>
                          <Upload size={22} color="#6c63ff" />
                        </div>
                        <p style={{ color: "var(--text-2)", marginBottom: "4px", fontSize: "14px", fontWeight: 600 }}>
                          <span style={{ color: "#a09cff" }}>Click to upload</span> or drag & drop
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--text-3)" }}>PNG, JPG, WebP, MP4 — up to 20MB</p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>

                {/* Brand Name */}
                <div style={{ marginBottom: "18px" }}>
                  <label className="label" style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "9px" }}>
                    <Tag size={9} /> Brand Name <span style={{ color: "#ff6b6b", fontWeight: 800 }}>*</span>
                  </label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="e.g. Nike, Nykaa, Mamaearth..."
                    value={form.brandName}
                    onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                    required
                  />
                </div>

                {/* Product Description */}
                <div style={{ marginBottom: "18px" }}>
                  <label className="label" style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "9px" }}>
                    <FileText size={9} /> Product Description <span style={{ color: "#ff6b6b", fontWeight: 800 }}>*</span>
                  </label>
                  <textarea
                    className="input-field"
                    placeholder="Describe your product — features, benefits, what makes it special. The more detail, the better the AI output."
                    value={form.productDescription}
                    onChange={(e) => setForm({ ...form, productDescription: e.target.value })}
                    rows={4}
                    required
                    style={{ resize: "vertical", minHeight: "105px" }}
                  />
                </div>

                {/* Target Audience */}
                <div style={{ marginBottom: "32px" }}>
                  <label className="label" style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "9px" }}>
                    <Users size={9} /> Target Audience
                  </label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="e.g. Women 25–35, fitness enthusiasts, urban professionals..."
                    value={form.targetAudience}
                    onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: "15px" }}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.25)", borderTop: "2px solid white", borderRadius: "50%", flexShrink: 0 }} />
                      {step || "Analyzing..."}
                    </>
                  ) : (
                    <><Cpu size={16} /> Analyze & Generate Marketing Kit <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </form>

            {/* RIGHT: Feature cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* What you'll get header */}
              <div style={{ marginBottom: "4px" }}>
                <p style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                  What you&apos;ll get
                </p>
              </div>

              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="card" style={{ padding: "22px 20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                      <div style={{
                        width: "40px", height: "40px", borderRadius: "10px",
                        background: f.bg, border: `1px solid ${f.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginTop: "1px",
                      }}>
                        <Icon size={18} color={f.color} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: "14px", marginBottom: "5px", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                          {f.label}
                        </p>
                        <p style={{ fontSize: "12.5px", color: "var(--text-2)", lineHeight: 1.6, fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Trust signal */}
              <div style={{
                marginTop: "8px",
                padding: "18px 20px",
                background: "rgba(16,185,129,0.05)",
                border: "1px solid rgba(16,185,129,0.15)",
                borderRadius: "12px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981" }} />
                  <p style={{ fontSize: "12px", fontWeight: 800, color: "#34d399", letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                    Powered by Claude AI
                  </p>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-2)", lineHeight: 1.55, fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                  Deep brand analysis in under 30 seconds. No templates — every output is unique to your product.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
