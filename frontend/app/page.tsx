"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import { analyzeProduct } from "@/lib/api";
import toast from "react-hot-toast";
import {
  Upload, Image as ImageIcon, X, Sparkles, ArrowRight,
  Users, FileText, Tag, Cpu
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<string>("");
  const [form, setForm] = useState({ brandName: "", productDescription: "", targetAudience: "" });

  function handleFile(f: File) {
    setFile(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else { setPreview(null); }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.brandName || !form.productDescription) {
      toast.error("Brand name and product description are required");
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
    } finally { setLoading(false); setStep(""); }
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main className="main-content">
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 32px" }}>

          <div style={{ marginBottom: "44px" }}>
            <div className="badge badge-violet" style={{ marginBottom: "16px" }}>
              <Sparkles size={10} /> AI Marketing Assistant
            </div>
            <h1 className="font-display" style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, marginBottom: "16px" }}>
              Create your brand&apos;s{" "}
              <span className="gradient-text">AI marketing kit</span>
            </h1>
            <p style={{ fontSize: "16px", color: "var(--text-secondary)", maxWidth: "500px", lineHeight: 1.7 }}>
              Upload your product, add brand details, and let AI generate your complete marketing content in seconds.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="card" style={{ padding: "32px", marginBottom: "24px" }}>
              {/* Upload */}
              <div style={{ marginBottom: "28px" }}>
                <label className="section-label" style={{ display: "block", marginBottom: "10px" }}>Product Image / Video (Optional)</label>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => !file && fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${file ? "rgba(159,110,255,0.4)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: "14px", padding: "32px", textAlign: "center",
                    cursor: file ? "default" : "pointer",
                    background: file ? "rgba(159,110,255,0.04)" : "rgba(255,255,255,0.01)",
                    transition: "all 0.3s", position: "relative",
                    minHeight: "160px", display: "flex", alignItems: "center",
                    justifyContent: "center", flexDirection: "column",
                  }}
                >
                  {preview ? (
                    <>
                      <img src={preview} alt="preview" style={{ maxHeight: "180px", maxWidth: "100%", borderRadius: "10px", objectFit: "contain" }} />
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                        style={{ position: "absolute", top: "10px", right: "10px", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,77,141,0.2)", border: "1px solid rgba(255,77,141,0.4)", color: "var(--accent-pink)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <X size={14} />
                      </button>
                    </>
                  ) : file ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <FileText size={28} color="var(--accent-violet)" />
                      <p style={{ color: "var(--text-primary)", fontWeight: 500, fontSize: "14px" }}>{file.name}</p>
                      <button type="button" onClick={() => { setFile(null); setPreview(null); }} style={{ color: "var(--accent-pink)", fontSize: "12px", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(159,110,255,0.1)", border: "1px solid rgba(159,110,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                        <ImageIcon size={20} color="var(--accent-violet)" />
                      </div>
                      <p style={{ color: "var(--text-secondary)", marginBottom: "4px", fontSize: "14px" }}>
                        <span style={{ color: "var(--accent-violet)", fontWeight: 600 }}>Click to upload</span> or drag & drop
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>PNG, JPG, WebP, MP4 up to 20MB</p>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: "none" }} />
                </div>
              </div>

              {/* Brand Name */}
              <div style={{ marginBottom: "18px" }}>
                <label className="section-label" style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px" }}>
                  <Tag size={10} /> Brand Name *
                </label>
                <input className="input-field" type="text" placeholder="e.g. Nike, Apple, Nykaa..." value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })} required />
              </div>

              {/* Product Description */}
              <div style={{ marginBottom: "18px" }}>
                <label className="section-label" style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px" }}>
                  <FileText size={10} /> Product Description *
                </label>
                <textarea className="input-field" placeholder="Describe your product — features, benefits, what makes it special..." value={form.productDescription} onChange={(e) => setForm({ ...form, productDescription: e.target.value })} rows={4} required style={{ resize: "vertical", minHeight: "100px" }} />
              </div>

              {/* Target Audience */}
              <div style={{ marginBottom: "28px" }}>
                <label className="section-label" style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px" }}>
                  <Users size={10} /> Target Audience
                </label>
                <input className="input-field" type="text" placeholder="e.g. Women 25-35, fitness enthusiasts, urban professionals..." value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} />
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "15px", fontSize: "15px" }}>
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: "17px", height: "17px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%" }} />
                    {step}
                  </>
                ) : (
                  <><Cpu size={17} /> Analyze & Generate Marketing Kit <ArrowRight size={17} /></>
                )}
              </button>
            </div>
          </form>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
            {[
              { label: "AI Analysis", desc: "Category, tone, audience & platform insights", color: "var(--accent-violet)" },
              { label: "Content Generation", desc: "Captions, ads, hooks, CTAs & hashtags", color: "var(--accent-pink)" },
              { label: "Creative Ideas", desc: "Reels, carousels & full campaigns", color: "var(--accent-gold)" },
            ].map((item) => (
              <div key={item.label} className="card" style={{ padding: "18px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color, marginBottom: "10px" }} />
                <p style={{ fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>{item.label}</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
