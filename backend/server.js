const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error("Only images and videos allowed"));
  },
});

// In-memory store
const projectsStore = new Map();

// Groq AI helper
async function callGroq(systemPrompt, userPrompt) {
  const Groq = require("groq-sdk");
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4096,
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return response.choices[0].message.content;
}

// Parse JSON safely from AI response
function safeParseJSON(text) {
  try {
    const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(clean);
  } catch {
    // Try to extract JSON object from the text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { return null; }
    }
    return null;
  }
}

// POST /api/analyze — Analyze product
app.post("/api/analyze", upload.single("image"), async (req, res) => {
  try {
    const { brandName, productDescription, targetAudience } = req.body;
    if (!brandName || !productDescription) {
      return res.status(400).json({ error: "Brand name and product description are required" });
    }

    const systemPrompt = `You are an expert AI marketing analyst with deep knowledge of brand strategy, consumer psychology, and digital marketing. Analyze products and provide precise, actionable marketing insights. Always respond with valid JSON only — no extra text, no markdown fences.`;

    const userPrompt = `Analyze this product for marketing purposes:

Brand: ${brandName}
Product Description: ${productDescription}
Target Audience: ${targetAudience || "General consumers"}
${req.file ? "A product image was uploaded (use the description for analysis)." : ""}

Return ONLY a valid JSON object with exactly this structure (no extra text):
{
  "productCategory": "specific product category string",
  "brandTone": "2-3 word tone like Bold & Energetic or Elegant & Sophisticated",
  "audienceInsights": {
    "primaryAge": "age range string",
    "interests": ["interest1", "interest2", "interest3"],
    "painPoints": ["pain1", "pain2"],
    "motivations": ["motivation1", "motivation2", "motivation3"]
  },
  "platformRecommendations": [
    { "platform": "Instagram", "reason": "why this platform", "priority": "High", "contentType": "best content type" },
    { "platform": "YouTube", "reason": "why this platform", "priority": "Medium", "contentType": "best content type" },
    { "platform": "LinkedIn", "reason": "why this platform", "priority": "Low", "contentType": "best content type" }
  ],
  "brandPersonality": "2-3 sentence brand personality description",
  "marketingAngle": "the strongest unique selling point to highlight",
  "competitiveAdvantage": "what makes this stand out from competition",
  "emotionalTriggers": ["trigger1", "trigger2", "trigger3"]
}`;

    const result = await callGroq(systemPrompt, userPrompt);
    const analysis = safeParseJSON(result);

    if (!analysis) {
      console.error("Failed to parse:", result);
      return res.status(500).json({ error: "Failed to parse AI analysis. Please try again." });
    }

    const projectId = uuidv4();
    const project = {
      id: projectId,
      brandName,
      productDescription,
      targetAudience,
      imagePath: req.file ? `/uploads/${req.file.filename}` : null,
      analysis,
      content: null,
      creativeIdeas: null,
      createdAt: new Date().toISOString(),
      savedOutputs: [],
    };
    projectsStore.set(projectId, project);

    res.json({ projectId, analysis, imagePath: project.imagePath });
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({ error: err.message || "Analysis failed" });
  }
});

// POST /api/generate-content — Generate marketing content
app.post("/api/generate-content", async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ error: "projectId required" });

    const project = projectsStore.get(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const { brandName, productDescription, targetAudience, analysis } = project;

    const systemPrompt = `You are a world-class marketing copywriter who crafts viral, high-converting content. Always respond with valid JSON only — no extra text, no markdown fences.`;

    const userPrompt = `Create comprehensive marketing content for:

Brand: ${brandName}
Product: ${productDescription}
Audience: ${targetAudience || "General consumers"}
Brand Tone: ${analysis.brandTone}
Marketing Angle: ${analysis.marketingAngle}
Product Category: ${analysis.productCategory}

Return ONLY a valid JSON object with exactly this structure:
{
  "instagramCaptions": [
    { "style": "Storytelling", "caption": "full caption with emojis here", "characterCount": 150 },
    { "style": "Question Hook", "caption": "full caption with emojis here", "characterCount": 120 },
    { "style": "Bold Statement", "caption": "full caption with emojis here", "characterCount": 100 }
  ],
  "adCopy": [
    { "format": "Short Form", "headline": "headline here", "body": "ad body here", "platform": "Facebook/Instagram" },
    { "format": "Search Ad", "headline": "headline here", "body": "ad body here", "platform": "Google" },
    { "format": "Professional Ad", "headline": "headline here", "body": "ad body here", "platform": "LinkedIn" }
  ],
  "hooks": [
    { "type": "Curiosity Hook", "hook": "one powerful opening line" },
    { "type": "Problem Hook", "hook": "one powerful opening line" },
    { "type": "Shock Hook", "hook": "one powerful opening line" },
    { "type": "Social Proof Hook", "hook": "one powerful opening line" },
    { "type": "Story Hook", "hook": "one powerful opening line" }
  ],
  "ctaSuggestions": [
    { "action": "Shop Now", "urgency": "High", "context": "when to use this CTA" },
    { "action": "Learn More", "urgency": "Medium", "context": "when to use this CTA" },
    { "action": "Get Started Free", "urgency": "High", "context": "when to use this CTA" },
    { "action": "Claim Your Offer", "urgency": "High", "context": "when to use this CTA" }
  ],
  "hashtags": {
    "primary": ["#hashtag1", "#hashtag2", "#hashtag3"],
    "niche": ["#niche1", "#niche2", "#niche3", "#niche4"],
    "trending": ["#trend1", "#trend2", "#trend3"],
    "brand": ["#brand1", "#brand2"]
  }
}`;

    const result = await callGroq(systemPrompt, userPrompt);
    const content = safeParseJSON(result);

    if (!content) {
      console.error("Failed to parse content:", result);
      return res.status(500).json({ error: "Failed to generate content. Please try again." });
    }

    project.content = content;
    projectsStore.set(projectId, project);
    res.json({ content });
  } catch (err) {
    console.error("Content gen error:", err);
    res.status(500).json({ error: err.message || "Content generation failed" });
  }
});

// POST /api/generate-creative — Generate creative ideas
app.post("/api/generate-creative", async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ error: "projectId required" });

    const project = projectsStore.get(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const { brandName, productDescription, targetAudience, analysis } = project;

    const systemPrompt = `You are a viral content strategist and creative director. Always respond with valid JSON only — no extra text, no markdown fences.`;

    const userPrompt = `Generate creative content ideas for:

Brand: ${brandName}
Product: ${productDescription}
Audience: ${targetAudience || "General consumers"}
Brand Tone: ${analysis.brandTone}
Emotional Triggers: ${(analysis.emotionalTriggers || []).join(", ")}
Competitive Advantage: ${analysis.competitiveAdvantage}

Return ONLY a valid JSON object with exactly this structure:
{
  "reelIdeas": [
    {
      "title": "reel title",
      "concept": "detailed concept description",
      "hook": "opening 3 seconds description",
      "duration": "15-30 seconds",
      "music": "music vibe or genre",
      "visualStyle": "visual style description",
      "viralPotential": "High"
    },
    {
      "title": "reel title 2",
      "concept": "detailed concept description",
      "hook": "opening 3 seconds description",
      "duration": "30-60 seconds",
      "music": "music vibe or genre",
      "visualStyle": "visual style description",
      "viralPotential": "Medium"
    },
    {
      "title": "reel title 3",
      "concept": "detailed concept description",
      "hook": "opening 3 seconds description",
      "duration": "15-30 seconds",
      "music": "music vibe or genre",
      "visualStyle": "visual style description",
      "viralPotential": "High"
    }
  ],
  "carouselIdeas": [
    {
      "title": "carousel title",
      "concept": "concept description",
      "slides": ["Slide 1: content", "Slide 2: content", "Slide 3: content", "Slide 4: content", "Slide 5: CTA"],
      "objective": "awareness",
      "designTip": "design tip for this carousel"
    },
    {
      "title": "carousel title 2",
      "concept": "concept description",
      "slides": ["Slide 1: content", "Slide 2: content", "Slide 3: content", "Slide 4: content", "Slide 5: CTA"],
      "objective": "conversion",
      "designTip": "design tip for this carousel"
    }
  ],
  "campaignSuggestions": [
    {
      "campaignName": "Creative Campaign Name",
      "tagline": "catchy tagline",
      "concept": "detailed campaign concept",
      "duration": "4 weeks",
      "channels": ["Instagram", "YouTube", "TikTok"],
      "keyActivations": ["activation 1", "activation 2", "activation 3"],
      "expectedOutcome": "expected result",
      "budget": "Medium"
    },
    {
      "campaignName": "Creative Campaign Name 2",
      "tagline": "catchy tagline 2",
      "concept": "detailed campaign concept",
      "duration": "2 weeks",
      "channels": ["Instagram", "Facebook"],
      "keyActivations": ["activation 1", "activation 2", "activation 3"],
      "expectedOutcome": "expected result",
      "budget": "Low"
    }
  ],
  "contentCalendarThemes": [
    { "week": "Week 1", "theme": "theme name", "contentMix": "3 Reels, 2 Carousels, 5 Stories" },
    { "week": "Week 2", "theme": "theme name", "contentMix": "2 Reels, 3 Carousels, 4 Stories" },
    { "week": "Week 3", "theme": "theme name", "contentMix": "4 Reels, 1 Carousel, 6 Stories" },
    { "week": "Week 4", "theme": "theme name", "contentMix": "2 Reels, 2 Carousels, 5 Stories" }
  ]
}`;

    const result = await callGroq(systemPrompt, userPrompt);
    const creativeIdeas = safeParseJSON(result);

    if (!creativeIdeas) {
      console.error("Failed to parse creative:", result);
      return res.status(500).json({ error: "Failed to generate creative ideas. Please try again." });
    }

    project.creativeIdeas = creativeIdeas;
    projectsStore.set(projectId, project);
    res.json({ creativeIdeas });
  } catch (err) {
    console.error("Creative gen error:", err);
    res.status(500).json({ error: err.message || "Creative generation failed" });
  }
});

// GET /api/projects
app.get("/api/projects", (req, res) => {
  const projects = Array.from(projectsStore.values()).map((p) => ({
    id: p.id,
    brandName: p.brandName,
    productDescription: p.productDescription,
    imagePath: p.imagePath,
    createdAt: p.createdAt,
    hasContent: !!p.content,
    hasCreative: !!p.creativeIdeas,
    savedOutputs: p.savedOutputs || [],
  }));
  res.json({ projects: projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
});

// GET /api/projects/:id
app.get("/api/projects/:id", (req, res) => {
  const project = projectsStore.get(req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json({ project });
});

// POST /api/projects/:id/save
app.post("/api/projects/:id/save", (req, res) => {
  const project = projectsStore.get(req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });
  const { type, content, label } = req.body;
  if (!type || !content) return res.status(400).json({ error: "type and content required" });
  const savedItem = { id: uuidv4(), type, content, label, savedAt: new Date().toISOString() };
  project.savedOutputs = project.savedOutputs || [];
  project.savedOutputs.push(savedItem);
  projectsStore.set(req.params.id, project);
  res.json({ saved: savedItem, totalSaved: project.savedOutputs.length });
});

// DELETE /api/projects/:id/save/:itemId
app.delete("/api/projects/:id/save/:itemId", (req, res) => {
  const project = projectsStore.get(req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });
  project.savedOutputs = (project.savedOutputs || []).filter((s) => s.id !== req.params.itemId);
  projectsStore.set(req.params.id, project);
  res.json({ success: true });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 BrandAI backend running on http://localhost:${PORT}`);
  console.log(`🤖 Using Groq AI (llama-3.3-70b-versatile)`);
});

// GET /api/generate-image — Proxy Pollinations.ai (bypasses browser CORS)
app.get("/api/generate-image", async (req, res) => {
  try {
    const { prompt, width = "768", height = "768", seed } = req.query;
    if (!prompt) return res.status(400).json({ error: "prompt required" });

    const s = seed || Math.floor(Math.random() * 99999);
    const encoded = encodeURIComponent(String(prompt));
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${s}&nologo=true&model=flux`;

    console.log("Fetching image:", url.slice(0, 120) + "...");

    const https = require("https");
    const http = require("http");

    function fetchWithRedirects(targetUrl, hops = 0) {
      return new Promise((resolve, reject) => {
        if (hops > 6) return reject(new Error("Too many redirects"));
        const lib = targetUrl.startsWith("https") ? https : http;
        const req2 = lib.get(targetUrl, {
          headers: { "User-Agent": "Mozilla/5.0 BrandAI/1.0", "Accept": "image/*" },
          timeout: 60000,
        }, (resp) => {
          if ([301,302,303,307,308].includes(resp.statusCode) && resp.headers.location) {
            resp.resume();
            return resolve(fetchWithRedirects(resp.headers.location, hops + 1));
          }
          if (resp.statusCode !== 200) {
            resp.resume();
            return reject(new Error("HTTP " + resp.statusCode));
          }
          resolve(resp);
        });
        req2.on("error", reject);
        req2.on("timeout", () => { req2.destroy(); reject(new Error("Timeout after 60s")); });
      });
    }

    const imgResp = await fetchWithRedirects(url);
    res.setHeader("Content-Type", imgResp.headers["content-type"] || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("Access-Control-Allow-Origin", "*");
    imgResp.pipe(res);
  } catch (err) {
    console.error("Image proxy error:", err.message);
    res.status(500).json({ error: err.message || "Image generation failed" });
  }
});
