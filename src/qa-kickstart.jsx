import { useState, useRef } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────


const INPUT_MODES = [
  { id: "single", label: "Single Story", desc: "One user story or ticket", placeholder: `As a user, I want to reset my password via email so that I can regain access if I forget my credentials.` },
  { id: "multiple", label: "Multiple Stories", desc: "Several stories at once", placeholder: `1. As a user, I want to log in with email and password...\n2. As a user, I want to reset my password...\n3. As an admin, I want to manage user accounts...` },
  { id: "epic", label: "Epic / Feature", desc: "Full feature test suite", placeholder: `Epic: User Authentication\nGoal: Allow users to securely register, log in, and manage their accounts.\n\nStories:\n- As a new user, I want to register with email...\n- As a returning user, I want to log in...\n- As a user, I want to reset my password...` },
];

const DOC_MODES = [
  { id: "testplan", label: "Test Plan", desc: "Formal document for stakeholders", placeholder: `Paste your feature or epic description here.\n\nEpic: User Authentication\nGoal: Allow users to securely register, log in, and manage their accounts.\n\nStories:\n- As a new user, I want to register with email and password...\n- As a returning user, I want to log in...\n- As a user, I want to reset my password via email...` },
  { id: "onboarding", label: "QA Onboarding Doc", desc: "Guide for a new QA joining the team", placeholder: `Paste your feature description. Include what the feature does, who uses it, and any known complexity.\n\nExample:\nWe are building a multiplayer leaderboard for a mobile game. Players compete weekly, scores sync in real-time, and rewards distribute automatically at the end of each cycle...` },
  { id: "automation", label: "Automation Plan", desc: "What to automate, what to skip", placeholder: `Paste your feature description or list of test cases here.\n\nExample:\n- Verify user login with valid credentials\n- Verify password reset flow\n- Verify session expires after 30 minutes\n- Verify UI renders correctly on different screen sizes\n- Verify payment confirmation email is sent...` },
];

const TEST_TYPES = [
  { id: "functional", label: "Functional", desc: "Happy path & core flows", activeColor: { bg: "#e6f1fb", border: "#185fa5", text: "#185fa5", icon: "#185fa5" } },
  { id: "edge", label: "Edge Cases", desc: "Boundaries & unusual inputs", activeColor: { bg: "#faeeda", border: "#854f0b", text: "#854f0b", icon: "#ba7517" } },
  { id: "negative", label: "Negative", desc: "Error states & failures", activeColor: { bg: "#fcebeb", border: "#a32d2d", text: "#a32d2d", icon: "#a32d2d" } },
  { id: "bdd", label: "BDD / Gherkin", desc: "Given / When / Then", activeColor: { bg: "#eeedfe", border: "#534ab7", text: "#534ab7", icon: "#534ab7" } },
];

const BADGE_COLORS = {
  functional: { bg: "#e6f1fb", color: "#185fa5" },
  edge:       { bg: "#faeeda", color: "#854f0b" },
  negative:   { bg: "#fcebeb", color: "#a32d2d" },
  bdd:        { bg: "#eeedfe", color: "#534ab7" },
};

const RISK_SCORE_META = {
  Critical: { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5", dot: "#dc2626" },
  High:     { bg: "#fef3c7", color: "#92400e", border: "#fcd34d", dot: "#f59e0b" },
  Medium:   { bg: "#e6f1fb", color: "#185fa5", border: "#93c5fd", dot: "#3b82f6" },
  Low:      { bg: "#f0fdf4", color: "#166534", border: "#86efac", dot: "#22c55e" },
};

const LEVEL_SCORE = { High: 3, Medium: 2, Low: 1 };

function getRiskScore(impact, likelihood) {
  const score = LEVEL_SCORE[impact] * LEVEL_SCORE[likelihood];
  if (score >= 6) return "Critical";
  if (score >= 4) return "High";
  if (score >= 2) return "Medium";
  return "Low";
}

// ─── ICONS ───────────────────────────────────────────────────────────────────

const TYPE_ICONS = {
  functional: (c) => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>),
  edge:       (c) => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" /><line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" /></svg>),
  negative:   (c) => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
  bdd:        (c) => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>),
};

const MODE_ICONS = {
  single:   (c) => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="16" x2="12" y2="16" /></svg>),
  multiple: (c) => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="14" height="14" rx="2" /><rect x="7" y="7" width="14" height="14" rx="2" /></svg>),
  epic:     (c) => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>),
};

// ─── PROMPTS ──────────────────────────────────────────────────────────────────

function buildGeneratorPrompt(mode, input, selectedTypes) {
  const typeDescriptions = selectedTypes.map(t => { const f = TEST_TYPES.find(x => x.id === t); return f ? `${f.label} (${f.desc})` : t; }).join(", ");
  const modeInstructions = {
    single:   `You are given a single user story. Generate a thorough set of test cases based on complexity — typically 3–6 per type.`,
    multiple: `You are given multiple user stories. Generate test cases for each story based on its complexity.`,
    epic:     `You are given an epic or full feature description. Generate a complete, production-ready test suite covering all stories.`,
  };
  return `You are an expert QA engineer. ${modeInstructions[mode]}

Input:
${input}

Generate test cases for these types: ${typeDescriptions}

Respond ONLY with a valid JSON array. No explanation, no markdown, no backticks. Raw JSON only.

Each object must have:
- "type": one of ${JSON.stringify(selectedTypes)}
- "title": short descriptive title (max 10 words)
- "group": short label for grouping (story title or feature area)
- "steps": array of step strings (for functional/edge/negative), null for bdd
- "expected": expected result string (for functional/edge/negative), null for bdd
- "scenario": Gherkin scenario string (only for bdd), null otherwise
- "whyItMatters": 1-2 sentences written like a senior QA explaining to a junior why this test case is important, what risk it covers, and what happens if it fails in production

Return one flat array of all test cases.`;
}

function buildGapPrompt(feature, existingTests) {
  return `You are an expert QA engineer performing a test coverage gap analysis.

Feature / User Story:
${feature}

Existing test cases (plain titles, one per line):
${existingTests}

Respond ONLY with a valid JSON object. No explanation, no markdown, no backticks. Raw JSON only.

The object must have:
- "summary": one sentence overall assessment
- "coverageScore": integer 0-100
- "missing": array of objects with: "title", "reason", "steps" (array), "expected", "whyItMatters"
- "weak": array of objects with: "area", "reason"
- "redundant": array of objects with: "tests" (array of titles), "reason"`;
}

function buildRiskPrompt(description) {
  return `You are an expert QA engineer and risk analyst.

Analyse this product/feature and identify ALL relevant risks: Functional, Technical, Performance, Security, Integration, UX, Data, Edge Case.

Product / Feature Description:
${description}

Respond ONLY with a valid JSON object. No explanation, no markdown, no backticks. Raw JSON only.

The object must have:
- "summary": 2-3 sentence overall risk assessment
- "overallRisk": one of "Critical", "High", "Medium", "Low"
- "risks": array of risk objects each with:
  - "id": sequential number starting at 1
  - "name": short risk name (max 6 words)
  - "category": one of "Functional", "Technical", "Performance", "Security", "Integration", "UX", "Data", "Edge Case"
  - "description": 1-2 sentences describing the risk
  - "impact": "High", "Medium", or "Low"
  - "impactReason": one sentence
  - "likelihood": "High", "Medium", or "Low"
  - "likelihoodReason": one sentence
  - "score": "Critical", "High", "Medium", or "Low"
  - "mitigation": array of 2-3 specific QA actions
  - "testPriority": integer 1-N (1 = test first)

Sort risks by testPriority ascending.`;
}

function buildTestPlanPrompt(input) {
  return `You are an expert QA engineer writing a formal test plan document.

Feature / Epic:
${input}

Respond ONLY with a valid JSON object. No explanation, no markdown, no backticks. Raw JSON only.

The object must have:
- "title": test plan title
- "version": "1.0"
- "sections": array of section objects each with "heading" and "content" (use \\n for line breaks)

Include these sections: Overview, Scope, Objectives, Test Approach, Entry & Exit Criteria, Test Environment, Resources & Roles, Risks & Mitigations, Schedule, Deliverables`;
}

function buildOnboardingPrompt(input) {
  return `You are an expert QA engineer writing a practical onboarding guide for a new QA team member.

Feature / Epic:
${input}

Respond ONLY with a valid JSON object. No explanation, no markdown, no backticks. Raw JSON only.

The object must have:
- "title": document title
- "sections": array of section objects each with "heading" and "content" (use \\n for line breaks)

Include these sections: Welcome & Context, How It Works, Key Areas to Focus On, Common Gotchas, Test Environment Setup, Where to Find Things, Your First Week, Key Contacts`;
}

function buildAutomationPrompt(input) {
  return `You are an expert QA automation strategist. Analyse this feature or test list and produce a practical E2E automation plan.

Input:
${input}

Respond ONLY with a valid JSON object. No explanation, no markdown, no backticks. Raw JSON only.

The object must have:
- "summary": 2-3 sentence overview of the automation opportunity
- "automationScore": integer 0-100 (how suitable for automation)
- "automate": array of candidates TO automate, each with: "name", "reason", "level" (E2E/API/Unit/Integration), "approach", "priority" (High/Medium/Low)
- "avoid": array of candidates to KEEP MANUAL, each with: "name", "reason"
- "frameworkSuggestions": array of objects each with: "level", "tools" (array of tool names), "reason"
- "recommendations": array of 3-5 strategy recommendation strings`;
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return <p style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>{children}</p>;
}

function GenerateButton({ onClick, disabled, loading, label, loadingLabel }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: "100%", padding: "13px", borderRadius: "8px", background: disabled ? "#e2e8f0" : "#185fa5", border: "none", color: disabled ? "#94a3b8" : "#ffffff", fontSize: "14px", fontWeight: "600", cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
      {loading ? (<><span style={{ width: "15px", height: "15px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />{loadingLabel}</>) : label}
    </button>
  );
}

function LevelBadge({ level, type }) {
  const colors = { High: type === "impact" ? { bg: "#fee2e2", color: "#991b1b" } : { bg: "#fef3c7", color: "#92400e" }, Medium: { bg: "#e6f1fb", color: "#185fa5" }, Low: { bg: "#f0fdf4", color: "#166534" } };
  const c = colors[level] || colors.Medium;
  return <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "4px", background: c.bg, color: c.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{level}</span>;
}

function ScoreBadge({ score }) {
  const m = RISK_SCORE_META[score] || RISK_SCORE_META.Medium;
  return <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 9px", borderRadius: "4px", background: m.bg, color: m.color, border: `1px solid ${m.border}`, textTransform: "uppercase", letterSpacing: "0.05em" }}>{score}</span>;
}

function WhyItMatters({ text }) {
  if (!text) return null;
  return (
    <div style={{ marginTop: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderLeft: "3px solid #185fa5", borderRadius: "6px", padding: "8px 12px" }}>
      <p style={{ fontSize: "11px", fontWeight: "700", color: "#185fa5", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 4px" }}>💡 Why it matters</p>
      <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6", margin: 0 }}>{text}</p>
    </div>
  );
}

function StepsExpanded({ tc }) {
  return (
    <>
      {tc.steps?.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <p style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>Steps</p>
          {tc.steps.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "5px" }}>
              <span style={{ color: "#94a3b8", fontSize: "12px", minWidth: "18px", fontFamily: "monospace" }}>{i + 1}.</span>
              <span style={{ color: "#475569", fontSize: "13px", lineHeight: "1.5" }}>{s}</span>
            </div>
          ))}
        </div>
      )}
      {tc.expected && (
        <div style={{ marginBottom: "10px" }}>
          <p style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px" }}>Expected Result</p>
          <p style={{ color: "#166534", fontSize: "13px", lineHeight: "1.5", background: "#f0fdf4", padding: "8px 12px", borderRadius: "6px", borderLeft: "3px solid #86efac", margin: 0 }}>{tc.expected}</p>
        </div>
      )}
      {tc.scenario && (
        <pre style={{ color: "#3730a3", fontSize: "12px", lineHeight: "1.8", background: "#eef2ff", padding: "12px", borderRadius: "6px", fontFamily: "monospace", whiteSpace: "pre-wrap", margin: "0 0 10px" }}>{tc.scenario}</pre>
      )}
      <WhyItMatters text={tc.whyItMatters} />
    </>
  );
}

function TestCaseCard({ tc, index }) {
  const [open, setOpen] = useState(false);
  const badge = BADGE_COLORS[tc.type] || BADGE_COLORS.functional;
  return (
    <div onClick={() => setOpen(!open)} style={{ background: open ? "#f8fafc" : "#ffffff", border: `1px solid ${open ? "#cbd5e1" : "#e2e8f0"}`, borderRadius: "8px", padding: "12px 14px", cursor: "pointer", transition: "all 0.15s", marginBottom: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ color: "#94a3b8", fontFamily: "monospace", fontSize: "11px", minWidth: "24px" }}>#{String(index + 1).padStart(2, "0")}</span>
        <span style={{ fontSize: "10px", fontWeight: "600", padding: "2px 7px", borderRadius: "4px", background: badge.bg, color: badge.color, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{tc.type}</span>
        <span style={{ color: "#1e293b", fontSize: "13px", flex: 1, fontWeight: "500" }}>{tc.title}</span>
        <span style={{ color: "#94a3b8", fontSize: "11px" }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}><StepsExpanded tc={tc} /></div>}
    </div>
  );
}

function MissingTestCard({ tc, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} style={{ background: open ? "#fffbeb" : "#ffffff", border: `1px solid ${open ? "#fcd34d" : "#e2e8f0"}`, borderRadius: "8px", padding: "12px 14px", cursor: "pointer", transition: "all 0.15s", marginBottom: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ color: "#94a3b8", fontFamily: "monospace", fontSize: "11px", minWidth: "24px" }}>#{String(index + 1).padStart(2, "0")}</span>
        <span style={{ fontSize: "10px", fontWeight: "600", padding: "2px 7px", borderRadius: "4px", background: "#fef3c7", color: "#92400e", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>missing</span>
        <span style={{ color: "#1e293b", fontSize: "13px", flex: 1, fontWeight: "500" }}>{tc.title}</span>
        <span style={{ color: "#94a3b8", fontSize: "11px" }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #fde68a" }}>
          <p style={{ color: "#92400e", fontSize: "12px", background: "#fef3c7", padding: "7px 10px", borderRadius: "6px", margin: "0 0 12px", lineHeight: "1.5" }}><strong>Why it's missing:</strong> {tc.reason}</p>
          <StepsExpanded tc={tc} />
        </div>
      )}
    </div>
  );
}

// ─── RISK MATRIX ──────────────────────────────────────────────────────────────

function RiskMatrix({ risks }) {
  const levels = ["High", "Medium", "Low"];
  return (
    <div style={{ marginBottom: "32px" }}>
      <SectionLabel>Risk Matrix</SectionLabel>
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "20px", overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "80px repeat(3, 1fr)", gap: "6px", minWidth: "500px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", writingMode: "vertical-rl", transform: "rotate(180deg)", paddingBottom: "8px" }}>Impact →</span>
          </div>
          {["Low Likelihood", "Med Likelihood", "High Likelihood"].map(l => (
            <div key={l} style={{ textAlign: "center", padding: "6px", fontSize: "11px", color: "#64748b", fontWeight: "600" }}>{l}</div>
          ))}
          {levels.map(impact => (
            <>
              <div key={`lbl-${impact}`} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>{impact}</span>
              </div>
              {["Low", "Medium", "High"].map(likelihood => {
                const score = getRiskScore(impact, likelihood);
                const meta = RISK_SCORE_META[score];
                const cellRisks = risks.filter(r => r.impact === impact && r.likelihood === likelihood);
                return (
                  <div key={`${impact}-${likelihood}`} style={{ background: meta.bg, border: `1px solid ${meta.border}`, borderRadius: "8px", padding: "10px", minHeight: "70px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "9px", color: meta.color, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.7 }}>{score}</span>
                    {cellRisks.length === 0 && <span style={{ fontSize: "11px", color: meta.color, opacity: 0.4 }}>—</span>}
                    {cellRisks.map(r => (
                      <div key={r.id} style={{ background: "rgba(255,255,255,0.7)", borderRadius: "4px", padding: "3px 6px", fontSize: "11px", color: meta.color, fontWeight: "500", lineHeight: "1.3" }}>#{r.id} {r.name}</div>
                    ))}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

function RiskCard({ risk }) {
  const [open, setOpen] = useState(false);
  const meta = RISK_SCORE_META[risk.score] || RISK_SCORE_META.Medium;
  const catColors = { Functional: "#185fa5", Technical: "#534ab7", Performance: "#854f0b", Security: "#991b1b", Integration: "#166534", UX: "#6d28d9", Data: "#0e7490", "Edge Case": "#475569" };
  const catColor = catColors[risk.category] || "#475569";
  return (
    <div onClick={() => setOpen(!open)} style={{ background: open ? "#f8fafc" : "#ffffff", border: `1px solid ${open ? meta.border : "#e2e8f0"}`, borderLeft: `4px solid ${meta.dot}`, borderRadius: "8px", padding: "12px 14px", cursor: "pointer", transition: "all 0.15s", marginBottom: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ color: "#94a3b8", fontFamily: "monospace", fontSize: "11px", minWidth: "20px" }}>#{risk.id}</span>
        <ScoreBadge score={risk.score} />
        <span style={{ fontSize: "10px", fontWeight: "600", padding: "2px 7px", borderRadius: "4px", background: "#f1f5f9", color: catColor, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{risk.category}</span>
        <span style={{ color: "#1e293b", fontSize: "13px", flex: 1, fontWeight: "500" }}>{risk.name}</span>
        <span style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>Priority #{risk.testPriority}</span>
        <span style={{ color: "#94a3b8", fontSize: "11px" }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #e2e8f0" }}>
          <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6", margin: "0 0 14px" }}>{risk.description}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "10px 12px" }}>
              <p style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>Impact</p>
              <div style={{ marginBottom: "4px" }}><LevelBadge level={risk.impact} type="impact" /></div>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: "1.5" }}>{risk.impactReason}</p>
            </div>
            <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "10px 12px" }}>
              <p style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>Likelihood</p>
              <div style={{ marginBottom: "4px" }}><LevelBadge level={risk.likelihood} type="likelihood" /></div>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: "1.5" }}>{risk.likelihoodReason}</p>
            </div>
          </div>
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "12px 14px" }}>
            <p style={{ fontSize: "11px", color: "#166534", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>🛡 Mitigation</p>
            {Array.isArray(risk.mitigation) ? risk.mitigation.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "5px" }}>
                <span style={{ color: "#86efac", fontSize: "12px", minWidth: "16px" }}>{i + 1}.</span>
                <span style={{ color: "#166534", fontSize: "13px", lineHeight: "1.5" }}>{m}</span>
              </div>
            )) : <p style={{ color: "#166534", fontSize: "13px", lineHeight: "1.5", margin: 0 }}>{risk.mitigation}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DOC COMPONENTS ───────────────────────────────────────────────────────────

function DocSection({ heading, content }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", margin: "0 0 10px", paddingBottom: "8px", borderBottom: "1px solid #e2e8f0" }}>{heading}</h3>
      <div style={{ fontSize: "13px", color: "#475569", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>{content}</div>
    </div>
  );
}

function AutomationCard({ item, type }) {
  const isAutomate = type === "automate";
  const priorityColors = { High: { bg: "#fee2e2", color: "#991b1b" }, Medium: { bg: "#fef3c7", color: "#92400e" }, Low: { bg: "#f0fdf4", color: "#166534" } };
  const levelColors = { E2E: { bg: "#eeedfe", color: "#534ab7" }, API: { bg: "#e6f1fb", color: "#185fa5" }, Unit: { bg: "#faeeda", color: "#854f0b" }, Integration: { bg: "#f0fdf4", color: "#166534" } };
  const pc = priorityColors[item.priority] || priorityColors.Medium;
  const lc = levelColors[item.level] || levelColors.E2E;
  return (
    <div style={{ background: "#ffffff", border: `1px solid ${isAutomate ? "#e2e8f0" : "#fee2e2"}`, borderLeft: `4px solid ${isAutomate ? "#185fa5" : "#dc2626"}`, borderRadius: "8px", padding: "12px 14px", marginBottom: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
        <span style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b", flex: 1 }}>{item.name}</span>
        {item.level && <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "4px", background: lc.bg, color: lc.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.level}</span>}
        {item.priority && <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "4px", background: pc.bg, color: pc.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.priority}</span>}
      </div>
      <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 4px", lineHeight: "1.5" }}>{item.reason}</p>
      {item.approach && <p style={{ fontSize: "12px", color: "#185fa5", margin: 0, lineHeight: "1.5", fontStyle: "italic" }}>→ {item.approach}</p>}
    </div>
  );
}

// ─── GENERATOR TAB ────────────────────────────────────────────────────────────

function GeneratorTab() {
  const [inputMode, setInputMode] = useState("single");
  const [input, setInput] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef(null);

  const canGenerate = input.trim().length > 0 && selectedTypes.length > 0 && !loading;
  const toggleType = (id) => setSelectedTypes(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);

  const generate = async () => {
    if (!canGenerate) return;
    setLoading(true); setError(null); setResults(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json", "anthropic-dangerous-direct-browser-access": "true" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, messages: [{ role: "user", content: buildGeneratorPrompt(inputMode, input, selectedTypes) }] }) });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      setResults(JSON.parse(text.replace(/```json|```/g, "").trim()));
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const copyAll = () => {
    if (!results) return;
    navigator.clipboard.writeText(results.map((tc, i) => `#${i + 1} [${tc.type.toUpperCase()}] ${tc.title}\n` + (tc.steps ? tc.steps.map((s, j) => `  ${j + 1}. ${s}`).join("\n") + `\n  ✓ ${tc.expected}` : tc.scenario || "") + (tc.whyItMatters ? `\n  💡 ${tc.whyItMatters}` : "") + "\n").join("\n"));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const grouped = results ? selectedTypes.reduce((acc, type) => {
    const tcs = results.filter(tc => tc.type === type); if (!tcs.length) return acc;
    acc[type] = tcs.reduce((sg, tc) => { const k = tc.group || type; if (!sg[k]) sg[k] = []; sg[k].push(tc); return sg; }, {});
    return acc;
  }, {}) : {};

  const currentMode = INPUT_MODES.find(m => m.id === inputMode);

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <SectionLabel>Input Mode</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
          {INPUT_MODES.map(m => {
            const active = inputMode === m.id;
            return (<button key={m.id} onClick={() => { setInputMode(m.id); setInput(""); setResults(null); }} style={{ background: active ? "#e6f1fb" : "#ffffff", border: `${active ? "2px" : "1px"} solid ${active ? "#185fa5" : "#e2e8f0"}`, borderRadius: "8px", padding: "12px 14px", cursor: "pointer", textAlign: "left", transition: "all 0.15s", outline: "none", display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ marginTop: "1px", flexShrink: 0 }}>{MODE_ICONS[m.id](active ? "#185fa5" : "#94a3b8")}</div>
              <div><div style={{ fontSize: "13px", fontWeight: "600", color: active ? "#185fa5" : "#64748b", marginBottom: "2px" }}>{m.label}</div><div style={{ fontSize: "11px", color: active ? "#185fa5" : "#94a3b8", opacity: active ? 0.8 : 1 }}>{m.desc}</div></div>
            </button>);
          })}
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>{currentMode.label}</label>
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={currentMode.placeholder} style={{ width: "100%", minHeight: inputMode === "epic" ? "180px" : inputMode === "multiple" ? "150px" : "110px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#1e293b", fontSize: "13.5px", lineHeight: "1.7", padding: "12px 14px", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = "#185fa5"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
      </div>

      <div style={{ marginBottom: "24px" }}>
        <SectionLabel>Test Types</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          {TEST_TYPES.map(t => {
            const active = selectedTypes.includes(t.id);
            return (<button key={t.id} onClick={() => toggleType(t.id)} style={{ background: active ? t.activeColor.bg : "#ffffff", border: `${active ? "2px" : "1px"} solid ${active ? t.activeColor.border : "#e2e8f0"}`, borderRadius: "8px", padding: "12px", cursor: "pointer", textAlign: "left", transition: "all 0.15s", outline: "none" }}>
              <div style={{ marginBottom: "6px" }}>{TYPE_ICONS[t.id](active ? t.activeColor.icon : "#94a3b8")}</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: active ? t.activeColor.text : "#64748b", marginBottom: "2px" }}>{t.label}</div>
              <div style={{ fontSize: "11px", color: active ? t.activeColor.text : "#94a3b8", opacity: active ? 0.8 : 1 }}>{t.desc}</div>
            </button>);
          })}
        </div>
      </div>

      <GenerateButton onClick={generate} disabled={!canGenerate} loading={loading} label={inputMode === "epic" ? "Generate Full Test Suite →" : "Generate Test Cases →"} loadingLabel={inputMode === "epic" ? "Generating full test suite..." : "Generating test cases..."} />
      {error && <p style={{ color: "#dc2626", fontSize: "13px", textAlign: "center", marginTop: "14px" }}>{error}</p>}

      {results && (
        <div ref={resultsRef} style={{ marginTop: "36px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>{inputMode === "epic" ? "Test Suite" : "Generated Test Cases"}</h2>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>{results.length} test cases · {selectedTypes.length} type{selectedTypes.length > 1 ? "s" : ""}</p>
            </div>
            <button onClick={copyAll} style={{ background: copied ? "#f0fdf4" : "#ffffff", border: `1px solid ${copied ? "#86efac" : "#e2e8f0"}`, borderRadius: "6px", padding: "6px 12px", color: copied ? "#166534" : "#64748b", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>{copied ? "✓ Copied!" : "Copy All"}</button>
          </div>
          {selectedTypes.map(type => {
            const subGroups = grouped[type]; if (!subGroups) return null;
            const t = TEST_TYPES.find(x => x.id === type);
            const badge = BADGE_COLORS[type];
            const total = Object.values(subGroups).flat().length;
            return (
              <div key={type} style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #e2e8f0" }}>
                  {TYPE_ICONS[type](badge.color)}
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{t?.label}</span>
                  <span style={{ fontSize: "11px", background: badge.bg, color: badge.color, borderRadius: "4px", padding: "1px 7px", fontWeight: "600" }}>{total}</span>
                </div>
                {Object.entries(subGroups).map(([groupName, tcs]) => (
                  <div key={groupName} style={{ marginBottom: "16px" }}>
                    {Object.keys(subGroups).length > 1 && <p style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>{groupName}</p>}
                    {tcs.map((tc, i) => <TestCaseCard key={i} tc={tc} index={Object.values(subGroups).flat().indexOf(tc)} />)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── GAP DETECTOR TAB ─────────────────────────────────────────────────────────

function GapDetectorTab() {
  const [feature, setFeature] = useState("");
  const [existingTests, setExistingTests] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef(null);

  const canAnalyse = feature.trim().length > 0 && existingTests.trim().length > 0 && !loading;

  const analyse = async () => {
    if (!canAnalyse) return;
    setLoading(true); setError(null); setResults(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json", "anthropic-dangerous-direct-browser-access": "true" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, messages: [{ role: "user", content: buildGapPrompt(feature, existingTests) }] }) });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      setResults(JSON.parse(text.replace(/```json|```/g, "").trim()));
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const copyMissing = () => {
    if (!results?.missing) return;
    navigator.clipboard.writeText(results.missing.map((tc, i) => `#${i + 1} [MISSING] ${tc.title}\n` + tc.steps.map((s, j) => `  ${j + 1}. ${s}`).join("\n") + `\n  ✓ ${tc.expected}\n`).join("\n"));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const scoreColor = results ? results.coverageScore >= 75 ? "#166534" : results.coverageScore >= 50 ? "#92400e" : "#991b1b" : "#185fa5";

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        <div>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>Feature / User Story</label>
          <textarea value={feature} onChange={e => setFeature(e.target.value)} placeholder={`Describe the feature or paste your user story here.\n\nAs a user, I want to reset my password via email...`} style={{ width: "100%", height: "200px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#1e293b", fontSize: "13px", lineHeight: "1.7", padding: "12px 14px", resize: "none", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = "#185fa5"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
        </div>
        <div>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>Existing Tests <span style={{ color: "#94a3b8", fontWeight: "400", textTransform: "none", fontSize: "11px" }}>(one title per line)</span></label>
          <textarea value={existingTests} onChange={e => setExistingTests(e.target.value)} placeholder={`Verify login with valid credentials\nVerify login with invalid password\nVerify forgot password link is visible\nVerify password reset email is sent`} style={{ width: "100%", height: "200px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#1e293b", fontSize: "13px", lineHeight: "1.7", padding: "12px 14px", resize: "none", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = "#185fa5"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
          <p style={{ fontSize: "11px", color: "#94a3b8", margin: "6px 0 0" }}>Paste test titles from TestRail, Xray, or any plain list.</p>
        </div>
      </div>

      <GenerateButton onClick={analyse} disabled={!canAnalyse} loading={loading} label="Analyse Coverage Gaps →" loadingLabel="Analysing coverage..." />
      {error && <p style={{ color: "#dc2626", fontSize: "13px", textAlign: "center", marginTop: "14px" }}>{error}</p>}

      {results && (
        <div ref={resultsRef} style={{ marginTop: "36px" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px 20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: "28px", fontWeight: "800", color: scoreColor, lineHeight: 1 }}>{results.coverageScore}%</div>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "3px" }}>Coverage</div>
            </div>
            <div style={{ width: "1px", height: "40px", background: "#e2e8f0", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden", marginBottom: "8px" }}>
                <div style={{ height: "100%", width: `${results.coverageScore}%`, background: scoreColor, borderRadius: "4px" }} />
              </div>
              <p style={{ fontSize: "13px", color: "#475569", margin: 0, lineHeight: "1.5" }}>{results.summary}</p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
              {[{ label: "Missing", count: results.missing?.length || 0, color: "#92400e", bg: "#fef3c7" }, { label: "Weak", count: results.weak?.length || 0, color: "#991b1b", bg: "#fee2e2" }, { label: "Redundant", count: results.redundant?.length || 0, color: "#475569", bg: "#f1f5f9" }].map(s => (
                <div key={s.label} style={{ textAlign: "center", background: s.bg, padding: "8px 14px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: s.color, lineHeight: 1 }}>{s.count}</div>
                  <div style={{ fontSize: "10px", color: s.color, marginTop: "2px", fontWeight: "600" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {results.missing?.length > 0 && (
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>⚠</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Missing Test Cases</span>
                  <span style={{ fontSize: "11px", background: "#fef3c7", color: "#92400e", borderRadius: "4px", padding: "1px 7px", fontWeight: "600" }}>{results.missing.length}</span>
                </div>
                <button onClick={copyMissing} style={{ background: copied ? "#f0fdf4" : "#ffffff", border: `1px solid ${copied ? "#86efac" : "#e2e8f0"}`, borderRadius: "6px", padding: "5px 10px", color: copied ? "#166634" : "#64748b", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>{copied ? "✓ Copied!" : "Copy Missing"}</button>
              </div>
              {results.missing.map((tc, i) => <MissingTestCard key={i} tc={tc} index={i} />)}
            </div>
          )}

          {results.weak?.length > 0 && (
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #e2e8f0" }}>
                <span>↓</span>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Weak Coverage</span>
                <span style={{ fontSize: "11px", background: "#fee2e2", color: "#991b1b", borderRadius: "4px", padding: "1px 7px", fontWeight: "600" }}>{results.weak.length}</span>
              </div>
              {results.weak.map((item, i) => (
                <div key={i} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 14px", marginBottom: "8px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b", marginBottom: "4px" }}>{item.area}</div>
                  <div style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>{item.reason}</div>
                </div>
              ))}
            </div>
          )}

          {results.redundant?.length > 0 && (
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #e2e8f0" }}>
                <span>≈</span>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Redundant Tests</span>
                <span style={{ fontSize: "11px", background: "#f1f5f9", color: "#475569", borderRadius: "4px", padding: "1px 7px", fontWeight: "600" }}>{results.redundant.length}</span>
              </div>
              {results.redundant.map((item, i) => (
                <div key={i} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 14px", marginBottom: "8px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                    {item.tests?.map((t, j) => <span key={j} style={{ fontSize: "11px", background: "#f1f5f9", color: "#475569", padding: "3px 8px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>{t}</span>)}
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>{item.reason}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── RISK ASSESSMENT TAB ──────────────────────────────────────────────────────

function RiskAssessmentTab() {
  const [description, setDescription] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null);

  const canAnalyse = description.trim().length > 0 && !loading;

  const analyse = async () => {
    if (!canAnalyse) return;
    setLoading(true); setError(null); setResults(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json", "anthropic-dangerous-direct-browser-access": "true" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, messages: [{ role: "user", content: buildRiskPrompt(description) }] }) });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      setResults(JSON.parse(text.replace(/```json|```/g, "").trim()));
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const overallMeta = results ? RISK_SCORE_META[results.overallRisk] : null;
  const priorityList = results?.risks ? [...results.risks].sort((a, b) => a.testPriority - b.testPriority) : [];

  return (
    <div>
      <div style={{ marginBottom: "8px" }}>
        <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>Product / Feature Description</label>
        <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 10px" }}>Describe your product or feature in as much detail as possible — tech stack, user types, integrations, scale, known constraints. The more context, the more accurate the assessment.</p>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={`Example:\n\nWe are building a mobile payment feature for a casual mobile game targeting 10M+ users. Players can purchase in-game currency (gems) using real money via Apple Pay, Google Pay, and credit cards. Purchases range from $0.99 to $99.99. The backend uses a Node.js microservice connected to Stripe. Transactions are logged in PostgreSQL. The feature includes a receipt system, parental controls for under-18 accounts, and regional pricing for 15 countries. The game runs on iOS 14+ and Android 8+.`} style={{ width: "100%", minHeight: "220px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#1e293b", fontSize: "13.5px", lineHeight: "1.7", padding: "12px 14px", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = "#185fa5"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
        <p style={{ fontSize: "11px", color: "#94a3b8", margin: "6px 0 0" }}>Covers: Functional · Technical · Performance · Security · Integration · UX · Data · Edge Case risks</p>
      </div>
      <div style={{ marginTop: "16px" }}>
        <GenerateButton onClick={analyse} disabled={!canAnalyse} loading={loading} label="Generate Risk Assessment →" loadingLabel="Analysing risks..." />
      </div>
      {error && <p style={{ color: "#dc2626", fontSize: "13px", textAlign: "center", marginTop: "14px" }}>{error}</p>}

      {results && (
        <div ref={resultsRef} style={{ marginTop: "36px" }}>
          <div style={{ background: overallMeta.bg, border: `1px solid ${overallMeta.border}`, borderRadius: "10px", padding: "16px 20px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: "11px", color: overallMeta.color, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Overall Risk</div>
              <ScoreBadge score={results.overallRisk} />
            </div>
            <div style={{ width: "1px", height: "40px", background: overallMeta.border, flexShrink: 0 }} />
            <p style={{ fontSize: "13px", color: overallMeta.color, margin: 0, lineHeight: "1.6", flex: 1 }}>{results.summary}</p>
            <div style={{ display: "flex", gap: "8px", flexShrink: 0, flexWrap: "wrap" }}>
              {["Critical", "High", "Medium", "Low"].map(score => {
                const count = results.risks.filter(r => r.score === score).length;
                if (!count) return null;
                const m = RISK_SCORE_META[score];
                return (<div key={score} style={{ textAlign: "center", background: "rgba(255,255,255,0.7)", padding: "6px 12px", borderRadius: "8px", border: `1px solid ${m.border}` }}><div style={{ fontSize: "16px", fontWeight: "700", color: m.color, lineHeight: 1 }}>{count}</div><div style={{ fontSize: "10px", color: m.color, marginTop: "2px", fontWeight: "600" }}>{score}</div></div>);
              })}
            </div>
          </div>

          <RiskMatrix risks={results.risks} />

          <div style={{ marginBottom: "28px" }}>
            <SectionLabel>Test Priority Order</SectionLabel>
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px 16px" }}>
              {priorityList.map((risk, i) => {
                const meta = RISK_SCORE_META[risk.score];
                return (
                  <div key={risk.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: i < priorityList.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: meta.bg, border: `2px solid ${meta.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: meta.color }}>{i + 1}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>{risk.name}</span>
                      <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "8px" }}>{risk.category}</span>
                    </div>
                    <ScoreBadge score={risk.score} />
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <SectionLabel>Risk Register</SectionLabel>
            {priorityList.map((risk) => <RiskCard key={risk.id} risk={risk} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DOCUMENTATION TAB ────────────────────────────────────────────────────────

function DocumentationTab() {
  const [docMode, setDocMode] = useState("testplan");
  const [input, setInput] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null);

  const canGenerate = input.trim().length > 0 && !loading;
  const currentMode = DOC_MODES.find(m => m.id === docMode);

  const promptBuilders = { testplan: buildTestPlanPrompt, onboarding: buildOnboardingPrompt, automation: buildAutomationPrompt };

  const generate = async () => {
    if (!canGenerate) return;
    setLoading(true); setError(null); setResults(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json", "anthropic-dangerous-direct-browser-access": "true" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, messages: [{ role: "user", content: promptBuilders[docMode](input) }] }) });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      setResults({ type: docMode, data: JSON.parse(text.replace(/```json|```/g, "").trim()) });
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const scoreColor = (s) => s >= 70 ? "#166534" : s >= 40 ? "#92400e" : "#991b1b";
  const scoreBg = (s) => s >= 70 ? "#f0fdf4" : s >= 40 ? "#fef3c7" : "#fee2e2";

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <SectionLabel>Document Type</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
          {DOC_MODES.map(m => {
            const active = docMode === m.id;
            return (<button key={m.id} onClick={() => { setDocMode(m.id); setInput(""); setResults(null); }} style={{ background: active ? "#e6f1fb" : "#ffffff", border: `${active ? "2px" : "1px"} solid ${active ? "#185fa5" : "#e2e8f0"}`, borderRadius: "8px", padding: "14px", cursor: "pointer", textAlign: "left", transition: "all 0.15s", outline: "none" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: active ? "#185fa5" : "#64748b", marginBottom: "4px" }}>{m.label}</div>
              <div style={{ fontSize: "11px", color: active ? "#185fa5" : "#94a3b8", opacity: active ? 0.8 : 1 }}>{m.desc}</div>
            </button>);
          })}
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>{currentMode.label} Input</label>
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={currentMode.placeholder} style={{ width: "100%", minHeight: "180px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#1e293b", fontSize: "13.5px", lineHeight: "1.7", padding: "12px 14px", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = "#185fa5"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
      </div>

      <GenerateButton onClick={generate} disabled={!canGenerate} loading={loading} label={`Generate ${currentMode.label} →`} loadingLabel={`Generating ${currentMode.label}...`} />
      {error && <p style={{ color: "#dc2626", fontSize: "13px", textAlign: "center", marginTop: "14px" }}>{error}</p>}

      {results && (
        <div ref={resultsRef} style={{ marginTop: "36px" }}>

          {/* Test Plan */}
          {results.type === "testplan" && (
            <div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid #e2e8f0" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>{results.data.title}</h2>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>Version {results.data.version}</p>
                </div>
                <span style={{ fontSize: "11px", color: "#94a3b8", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "4px 10px", borderRadius: "6px" }}>Test Plan</span>
              </div>
              {results.data.sections?.map((s, i) => <DocSection key={i} heading={s.heading} content={s.content} />)}
            </div>
          )}

          {/* Onboarding Doc */}
          {results.type === "onboarding" && (
            <div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid #e2e8f0" }}>
                <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>{results.data.title}</h2>
                <span style={{ fontSize: "11px", color: "#94a3b8", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "4px 10px", borderRadius: "6px" }}>Onboarding Guide</span>
              </div>
              {results.data.sections?.map((s, i) => <DocSection key={i} heading={s.heading} content={s.content} />)}
            </div>
          )}

          {/* Automation Plan */}
          {results.type === "automation" && (
            <div>
              <div style={{ background: scoreBg(results.data.automationScore), border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px 20px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: scoreColor(results.data.automationScore), lineHeight: 1 }}>{results.data.automationScore}%</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "3px" }}>Automation Fit</div>
                </div>
                <div style={{ width: "1px", height: "40px", background: "#e2e8f0", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden", marginBottom: "8px" }}>
                    <div style={{ height: "100%", width: `${results.data.automationScore}%`, background: scoreColor(results.data.automationScore), borderRadius: "4px" }} />
                  </div>
                  <p style={{ fontSize: "13px", color: "#475569", margin: 0, lineHeight: "1.5" }}>{results.data.summary}</p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                  <div style={{ textAlign: "center", background: "#e6f1fb", padding: "8px 14px", borderRadius: "8px" }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "#185fa5", lineHeight: 1 }}>{results.data.automate?.length || 0}</div>
                    <div style={{ fontSize: "10px", color: "#185fa5", marginTop: "2px", fontWeight: "600" }}>Automate</div>
                  </div>
                  <div style={{ textAlign: "center", background: "#fee2e2", padding: "8px 14px", borderRadius: "8px" }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "#991b1b", lineHeight: 1 }}>{results.data.avoid?.length || 0}</div>
                    <div style={{ fontSize: "10px", color: "#991b1b", marginTop: "2px", fontWeight: "600" }}>Stay Manual</div>
                  </div>
                </div>
              </div>

              {results.data.automate?.length > 0 && (
                <div style={{ marginBottom: "28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #e2e8f0" }}>
                    <span>✓</span>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Automate These</span>
                    <span style={{ fontSize: "11px", background: "#e6f1fb", color: "#185fa5", borderRadius: "4px", padding: "1px 7px", fontWeight: "600" }}>{results.data.automate.length}</span>
                  </div>
                  {results.data.automate.map((item, i) => <AutomationCard key={i} item={item} type="automate" />)}
                </div>
              )}

              {results.data.avoid?.length > 0 && (
                <div style={{ marginBottom: "28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #e2e8f0" }}>
                    <span>✕</span>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Keep Manual</span>
                    <span style={{ fontSize: "11px", background: "#fee2e2", color: "#991b1b", borderRadius: "4px", padding: "1px 7px", fontWeight: "600" }}>{results.data.avoid.length}</span>
                  </div>
                  {results.data.avoid.map((item, i) => <AutomationCard key={i} item={item} type="avoid" />)}
                </div>
              )}

              {results.data.frameworkSuggestions?.length > 0 && (
                <div style={{ marginBottom: "28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #e2e8f0" }}>
                    <span>⚙</span>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Suggested Tooling</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                    {results.data.frameworkSuggestions.map((fs, i) => {
                      const levelColors = { E2E: { bg: "#eeedfe", color: "#534ab7" }, API: { bg: "#e6f1fb", color: "#185fa5" }, Unit: { bg: "#faeeda", color: "#854f0b" }, Integration: { bg: "#f0fdf4", color: "#166534" } };
                      const lc = levelColors[fs.level] || levelColors.E2E;
                      return (
                        <div key={i} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "14px" }}>
                          <div style={{ marginBottom: "8px" }}><span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 7px", borderRadius: "4px", background: lc.bg, color: lc.color, textTransform: "uppercase" }}>{fs.level}</span></div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                            {fs.tools?.map((t, j) => <span key={j} style={{ fontSize: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", padding: "3px 8px", borderRadius: "4px", fontWeight: "500" }}>{t}</span>)}
                          </div>
                          <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0, lineHeight: "1.5" }}>{fs.reason}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {results.data.recommendations?.length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #e2e8f0" }}>
                    <span>💡</span>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Strategy Recommendations</span>
                  </div>
                  {results.data.recommendations.map((rec, i) => (
                    <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "10px" }}>
                      <span style={{ fontSize: "12px", color: "#185fa5", fontFamily: "monospace", minWidth: "20px", fontWeight: "700", marginTop: "1px" }}>{i + 1}.</span>
                      <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6", margin: 0 }}>{rec}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function QAKickstart() {
  const [activeTab, setActiveTab] = useState("generator");

  const tabs = [
    { id: "generator", label: "Test Generator" },
    { id: "gap", label: "Gap Detector" },
    { id: "risk", label: "Risk Assessment" },
    { id: "docs", label: "Documentation" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#1e293b" }}>
      <div style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "16px 32px", display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "7px", background: "#185fa5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>QA Kickstart</h1>
          <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>by a QA, for every QA</p>
        </div>
      </div>

      <div style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "0 32px" }}>
        <div style={{ display: "flex" }}>
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "12px 20px", background: "none", border: "none", borderBottom: `2px solid ${active ? "#185fa5" : "transparent"}`, color: active ? "#185fa5" : "#64748b", fontSize: "13px", fontWeight: active ? "600" : "500", cursor: "pointer", transition: "all 0.15s", outline: "none" }}>{tab.label}</button>);
          })}
        </div>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "28px 24px" }}>
        {activeTab === "generator" && <GeneratorTab />}
        {activeTab === "gap" && <GapDetectorTab />}
        {activeTab === "risk" && <RiskAssessmentTab />}
        {activeTab === "docs" && <DocumentationTab />}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; }`}</style>
    </div>
  );
}