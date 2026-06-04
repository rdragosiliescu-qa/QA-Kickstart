import { useState, useRef, useEffect } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const INPUT_MODES = [
  {
    id: "single",
    label: "Single Story",
    desc: "One user story or ticket",
    placeholder: `As a user, I want to reset my password via email so that I can regain access if I forget my credentials.`,
  },
  {
    id: "multiple",
    label: "Multiple Stories",
    desc: "Several stories at once",
    placeholder: `1. As a user, I want to log in with email and password...\n2. As a user, I want to reset my password...\n3. As an admin, I want to manage user accounts...`,
  },
  {
    id: "epic",
    label: "Epic / Feature",
    desc: "Full feature test suite",
    placeholder: `Epic: User Authentication\nGoal: Allow users to securely register, log in, and manage their accounts.\n\nStories:\n- As a new user, I want to register with email...\n- As a returning user, I want to log in...\n- As a user, I want to reset my password...`,
  },
];

const DOC_MODES = [
  {
    id: "testplan",
    label: "Test Plan",
    desc: "Formal document for stakeholders",
    placeholder: `Paste your feature or epic description here.\n\nEpic: User Authentication\nGoal: Allow users to securely register, log in, and manage their accounts.\n\nStories:\n- As a new user, I want to register with email and password...\n- As a returning user, I want to log in...\n- As a user, I want to reset my password via email...`,
  },
  {
    id: "onboarding",
    label: "QA Feature Guide",
    desc: "Product-focused guide for understanding a feature",
    placeholder: `Describe the feature in detail — what it does, who uses it, how it works, and any known complexity or edge cases.\n\nExample:\nWe are building a multiplayer leaderboard for a mobile game. Players compete weekly, scores sync in real-time via WebSocket, and rewards distribute automatically at the end of each cycle. Score submissions are validated server-side. Players can only submit one score per match. Leaderboards reset every Monday at 00:00 UTC...`,
  },
  {
    id: "automation",
    label: "Automation Plan",
    desc: "What to automate, what to skip",
    placeholder: `Paste your feature description or list of test cases here.\n\nExample:\n- Verify user login with valid credentials\n- Verify password reset flow\n- Verify session expires after 30 minutes\n- Verify UI renders correctly on different screen sizes\n- Verify payment confirmation email is sent...`,
  },
];

const TEST_TYPES = [
  {
    id: "functional",
    label: "Functional",
    desc: "Happy path & core flows",
    activeColor: {
      bg: "#e6f1fb",
      border: "#185fa5",
      text: "#185fa5",
      icon: "#185fa5",
    },
  },
  {
    id: "edge",
    label: "Edge Cases",
    desc: "Boundaries & unusual inputs",
    activeColor: {
      bg: "#faeeda",
      border: "#854f0b",
      text: "#854f0b",
      icon: "#ba7517",
    },
  },
  {
    id: "negative",
    label: "Negative",
    desc: "Error states & failures",
    activeColor: {
      bg: "#fcebeb",
      border: "#a32d2d",
      text: "#a32d2d",
      icon: "#a32d2d",
    },
  },
  {
    id: "bdd",
    label: "BDD / Gherkin",
    desc: "Given / When / Then",
    activeColor: {
      bg: "#eeedfe",
      border: "#534ab7",
      text: "#534ab7",
      icon: "#534ab7",
    },
  },
];

const BADGE_COLORS = {
  functional: { bg: "#e6f1fb", color: "#185fa5" },
  edge: { bg: "#faeeda", color: "#854f0b" },
  negative: { bg: "#fcebeb", color: "#a32d2d" },
  bdd: { bg: "#eeedfe", color: "#534ab7" },
};

const RISK_SCORE_META = {
  Critical: {
    bg: "#fee2e2",
    color: "#991b1b",
    border: "#fca5a5",
    dot: "#dc2626",
  },
  High: { bg: "#fef3c7", color: "#92400e", border: "#fcd34d", dot: "#f59e0b" },
  Medium: {
    bg: "#e6f1fb",
    color: "#185fa5",
    border: "#93c5fd",
    dot: "#3b82f6",
  },
  Low: { bg: "#f0fdf4", color: "#166534", border: "#86efac", dot: "#22c55e" },
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
  functional: (c) => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  edge: (c) => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
    </svg>
  ),
  negative: (c) => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  bdd: (c) => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
};

const MODE_ICONS = {
  single: (c) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="16" x2="12" y2="16" />
    </svg>
  ),
  multiple: (c) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <rect x="7" y="7" width="14" height="14" rx="2" />
    </svg>
  ),
  epic: (c) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
};

// ─── PROJECT CONTEXT ─────────────────────────────────────────────────────────

const EMPTY_CONTEXT = { productName: "", domain: "", techStack: "", targetUsers: "", keyRisks: "" };

function loadProjectContext() {
  try { return JSON.parse(localStorage.getItem("qa_kickstart_project_context")) || EMPTY_CONTEXT; } catch { return EMPTY_CONTEXT; }
}

function saveProjectContext(ctx) {
  try { localStorage.setItem("qa_kickstart_project_context", JSON.stringify(ctx)); } catch {}
}

function buildContextBlock(ctx) {
  if (!ctx) return "";
  const lines = [];
  if (ctx.productName) lines.push(`Product: ${ctx.productName}`);
  if (ctx.domain)      lines.push(`Domain: ${ctx.domain}`);
  if (ctx.techStack)   lines.push(`Tech Stack: ${ctx.techStack}`);
  if (ctx.targetUsers) lines.push(`Target Users: ${ctx.targetUsers}`);
  if (ctx.keyRisks)    lines.push(`Key Risk Areas: ${ctx.keyRisks}`);
  if (!lines.length)   return "";
  return `PROJECT CONTEXT (use this to tailor all output to this specific product):\n${lines.join("\n")}\n\n`;
}

// ─── PROMPTS ──────────────────────────────────────────────────────────────────

function buildGeneratorPrompt(mode, input, selectedTypes, ctx) {
  const typeDescriptions = selectedTypes
    .map((t) => {
      const f = TEST_TYPES.find((x) => x.id === t);
      return f ? `${f.label} (${f.desc})` : t;
    })
    .join(", ");
  const modeInstructions = {
    single: `You are given a single user story. Generate a thorough set of test cases based on complexity — typically 3–6 per type.`,
    multiple: `You are given multiple user stories. Generate test cases for each story based on its complexity.`,
    epic: `You are given an epic or full feature description. Generate a complete, production-ready test suite covering all stories.`,
  };
  return `You are an expert QA engineer. ${modeInstructions[mode]}

${buildContextBlock(ctx)}Input:
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
- "whyItMatters": 1-2 sentences from a senior QA's perspective. Must name the SPECIFIC risk this test covers (e.g. data loss, account lockout, payment failure, security bypass) and describe a realistic production consequence if it fails — not generic statements like "ensures the feature works as expected"

STEP QUALITY RULES:
- Vary step granularity: some steps should be UI-action level ("Click the Submit button"), others data-state level ("with the email field containing 256 characters"). Do not use the same step structure repeatedly across test cases.
- Each test case must test a meaningfully distinct scenario — do not repeat the same condition with different wording.

ANTI-REPETITION: Every test case in this response must cover a different angle, boundary, or failure mode. If two cases feel similar, replace one with a scenario from a different category (data, state, permission, timing, concurrency).

Return one flat array of all test cases.`;
}

function buildGapPrompt(feature, existingTests, ctx) {
  return `You are an expert QA engineer performing a test coverage gap analysis.

${buildContextBlock(ctx)}Feature / User Story:
${feature}

Existing test cases (plain titles, one per line):
${existingTests}

Respond ONLY with a valid JSON object. No explanation, no markdown, no backticks. Raw JSON only.

The object must have:
- "summary": one sentence overall assessment — be specific about the most critical uncovered area, not a generic "coverage could be improved"
- "coverageScore": integer 0-100
- "missing": array of objects with: "title", "reason", "steps" (array), "expected", "whyItMatters"
  - "reason": name the SPECIFIC test technique or dimension that is absent — e.g. "No boundary value test for the 140-character limit", "No test for concurrent submission by the same user", "No coverage of the unauthenticated state reaching this endpoint". Never write "this scenario is not covered" without saying which scenario and why it matters.
  - "whyItMatters": name the production risk — data corruption, security bypass, user lockout, revenue loss — not generic impact
- "weak": array of objects with: "area", "reason"
  - "reason": state what the existing test DOES cover and what it specifically FAILS to test — e.g. "Tests the happy path login but does not verify the session token is invalidated on logout, leaving a window for session hijacking"
- "redundant": array of objects with: "tests" (array of titles), "reason"
  - "reason": identify the exact overlapping conditions — e.g. "Both tests submit the form with a valid email; neither adds a distinct boundary or state variation"

ANTI-REPETITION: Each missing test must cover a different gap dimension (boundary, state, permission, error, concurrency, data type). Do not list variations of the same missing scenario.`;
}

function buildRiskPrompt(description, ctx) {
  return `You are an expert QA engineer and risk analyst.

Analyse this product/feature and identify ALL relevant risks: Functional, Technical, Performance, Security, Integration, UX, Data, Edge Case.

${buildContextBlock(ctx)}Product / Feature Description:
${description}

Respond ONLY with a valid JSON object. No explanation, no markdown, no backticks. Raw JSON only.

The object must have:
- "summary": 2-3 sentence overall risk assessment — name the top 2 risk areas specific to this feature, not a generic statement about software quality
- "overallRisk": one of "Critical", "High", "Medium", "Low"
- "risks": array of risk objects each with:
  - "id": sequential number starting at 1
  - "name": short risk name (max 6 words)
  - "category": one of "Functional", "Technical", "Performance", "Security", "Integration", "UX", "Data", "Edge Case"
  - "description": 1-2 sentences describing the risk specific to this feature — reference the actual behaviour or component involved
  - "impact": "High", "Medium", or "Low"
  - "impactReason": one sentence — name the concrete business or user consequence (e.g. "Users cannot complete checkout, directly causing revenue loss" not "this would negatively affect users")
  - "likelihood": "High", "Medium", or "Low"
  - "likelihoodReason": one sentence — reference something specific from the feature description that makes this likely or unlikely, not a generic observation
  - "score": "Critical", "High", "Medium", or "Low"
  - "mitigation": array of 2-3 QA actions — each must be a concrete test scenario tied to THIS risk, not a category label. Mix test design, environment setup, and monitoring. E.g. "Simulate a dropped DB connection mid-transaction and verify the order is not partially created" not "Add integration tests". Vary the type across mitigations.
  - "testPriority": integer 1-N (1 = test first)

ANTI-REPETITION: Each risk must cover a distinct failure mode. Do not list two risks in the same category unless they are genuinely independent scenarios. If risks feel similar, merge them and add a different-category risk instead.

Sort risks by testPriority ascending.`;
}

function buildTestPlanPrompt(input, ctx) {
  return `You are an expert QA engineer writing a formal test plan document.

${buildContextBlock(ctx)}Feature / Epic:
${input}

Respond ONLY with a valid JSON object. No explanation, no markdown, no backticks. Raw JSON only.

The object must have:
- "title": test plan title
- "version": "1.0"
- "sections": array of section objects each with "heading" and "content" (use \\n for line breaks)

Include these sections: Overview, Scope, Objectives, Test Approach, Entry & Exit Criteria, Test Environment, Resources & Roles, Risks & Mitigations, Schedule, Deliverables

CONTENT RULES — every section must be grounded in the feature description provided:
- "Scope": list what IS in scope and what IS explicitly out of scope based on the feature boundaries described — do not write generic scope statements
- "Test Approach": name the specific test types relevant to this feature's complexity (e.g. if it involves real-time sync, mention concurrency and timing tests; if it involves payments, mention security and failure-state testing) — do not list every test type generically
- "Risks & Mitigations": name risks specific to this feature with concrete mitigations — not "the feature may not work as expected"
- "Entry & Exit Criteria": write criteria that are measurable and specific to this feature — e.g. "All API endpoints documented in the spec return correct status codes under load" not "all tests pass"

Do not pad sections with generic QA boilerplate. Every sentence must add information specific to this feature.`;
}

function buildOnboardingPrompt(input, ctx) {
  return `You are an expert QA engineer writing a focused product understanding guide for a new QA engineer.

Your goal: help them deeply understand how this feature works and what to watch out for when testing it.

STRICT RULES:
- Only include information that can be directly derived from the feature description provided.
- Do NOT invent team contacts, Slack channels, tools, onboarding schedules, or anything organisational.
- Do NOT reference people, roles, or processes that are not mentioned in the input.
- Every point must be grounded in the feature itself — what it does, how it behaves, what can break.

${buildContextBlock(ctx)}Feature / Epic:
${input}

Respond ONLY with a valid JSON object. No explanation, no markdown, no backticks. Raw JSON only.

The object must have:
- "title": document title (e.g. "QA Guide: [Feature Name]")
- "sections": array of section objects each with "heading" and "content" (use \\n for line breaks)

Include ONLY these sections:
1. "What This Feature Does" — plain-language explanation of the feature's purpose and core behaviour
2. "Key User Flows" — the main paths a user takes through this feature, step by step
3. "Business Rules & Constraints" — validation rules, limits, permissions, data dependencies, or logic the feature enforces
4. "What Can Go Wrong" — realistic failure modes, edge cases, and things that are easy to break based on the feature's complexity
5. "High-Risk Areas" — the parts of this feature that deserve the most testing attention and why
6. "Testing Notes" — 4-6 specific, non-obvious testing challenges for THIS feature. Each note must name a concrete scenario or state that is hard to reproduce or set up, and explain how to approach it — e.g. "To test the weekly reset behaviour, you will need to mock the UTC clock or manually trigger the cron — waiting for Monday is not viable in most test environments." Avoid generic tips like "use equivalence partitioning" or "test on multiple browsers" unless they address a specific complexity in this feature.`;
}

function buildAutomationPrompt(input, ctx) {
  return `You are an expert QA automation strategist. Analyse this feature or test list and produce a practical automation plan.

${buildContextBlock(ctx)}Input:
${input}

Respond ONLY with a valid JSON object. No explanation, no markdown, no backticks. Raw JSON only.

The object must have:
- "summary": 2-3 sentence overview of the automation opportunity — name the specific areas of this feature that are strongest candidates and the main reason(s) some parts should stay manual
- "automationScore": integer 0-100 (how suitable for automation overall)
- "automate": array of candidates TO automate, each with: "name", "reason", "level" (E2E/API/Unit/Integration), "approach", "priority" (High/Medium/Low)
  - "reason": explain WHY this specific scenario is suitable for automation — reference its stability, frequency, or precision requirement
  - "approach": describe the specific test scenario and what assertion makes it automatable — e.g. "Submit a score via the API, then query the leaderboard endpoint and assert the player rank updated correctly". Do not name frameworks here.
- "avoid": array of candidates to KEEP MANUAL, each with: "name", "reason"
  - "reason": explain the specific characteristic that makes automation fragile or low-value here — e.g. "Layout shifts during animation make assertion timing unreliable" or "Reward calculation logic changes weekly, making hardcoded expected values a maintenance burden"
- "frameworkSuggestions": array of objects each with: "level", "tools" (array of tool names), "reason"
  - "reason": tie the tool recommendation to a specific challenge or characteristic of THIS feature — not a generic endorsement
- "recommendations": array of 3-5 strategy decisions SPECIFIC to this feature's complexity. Each must start with a tradeoff or rationale, e.g. "Avoid E2E tests for real-time sync — WebSocket timing makes them flaky; cover sync logic at the API level instead." Generic best practices (Page Object Model, run in CI, manage test data separately) must not appear unless they address a specific challenge described in the input.

ANTI-REPETITION: Each recommendation must address a distinct strategic decision. Do not rephrase the same advice in different words.`;
}

function buildJiraPrompt(description, ctx) {
  return `You are an expert Jira administrator with deep experience designing advanced dashboards, saved filters, and automation for complex software projects.

${buildContextBlock(ctx)}The user has described their project and what they want to track or achieve in Jira:

${description}

Your job is to design a tailored, non-generic Jira setup for THIS specific project. Everything you produce must be directly derived from what the user described — do not produce generic Jira advice that would apply to any project.

Focus on:
- Rich, meaningful dashboards that tell a story about the project's health at a glance
- Advanced saved filters using complex JQL (multi-condition, use of functions like currentUser(), startOfWeek(), membersOf(), ORDER BY, sub-queries where relevant)
- Automation rules that solve real problems described by the user
- Avoid obvious or beginner-level suggestions

STRICT OUTPUT LIMITS — do not exceed these or the response will be cut off:
- Maximum 2 dashboards, each with maximum 3 gadgets
- Maximum 3 saved filters
- Maximum 3 automation rules
- Maximum 3 board tips
- Keep all text fields concise — 1-2 sentences max per field

Respond ONLY with a valid JSON object. No explanation, no markdown, no backticks. Raw JSON only.

The object must have:
- "summary": 2 sentences on what this setup is designed to solve for this specific project
- "dashboards": array of MAX 2 dashboard objects, each with:
  - "name": dashboard name
  - "audience": who this dashboard is for (1 sentence)
  - "purpose": what question this dashboard answers at a glance (1 sentence)
  - "gadgets": array of MAX 3 gadget objects, each with:
    - "name": exact gadget name as it appears in Jira
    - "title": the title to give this gadget on the dashboard
    - "filter": the JQL this gadget should use
    - "config": key configuration tip (1 sentence)
    - "insight": what this gadget reveals that is specific to this project (1 sentence) — not "shows issue status"
- "filters": array of MAX 3 saved filter objects, each with:
  - "name": filter name
  - "jql": the full JQL query string
  - "explanation": breakdown of what each clause does (2-3 sentences max)
  - "purpose": what decision this filter supports (1 sentence)
  - "category": one of "Bug Tracking", "Sprint Health", "Release Readiness", "Regression", "QA Metrics", "Custom"
- "automation": array of MAX 3 automation rule objects, each with:
  - "title": rule name
  - "trigger": what triggers this rule (1 sentence)
  - "conditions": conditions that must be true (1 sentence)
  - "action": exactly what the rule does (1 sentence)
  - "benefit": the specific workflow problem this solves for THIS project (1 sentence) — not "saves time"
- "boardTips": array of MAX 3 tips — each must reference a specific Jira configuration that addresses a workflow problem derived from this project's description. E.g. "Add a 'Blocked Reason' select field and create a board swimlane filtered by it so blockers are visible before standup without needing a status change." Avoid generic advice like "use swimlanes" or "add labels".`;
}

// ─── API HELPER ───────────────────────────────────────────────────────────────

async function callClaude(prompt, maxTokens = 4000, onProgress = null) {
  let res;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true",
        "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: maxTokens,
        stream: true,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (networkErr) {
    console.error("Network error:", networkErr);
    throw new Error("Network error — check your connection and try again.");
  }

  if (res.status === 401) throw new Error("Invalid API key. Check your REACT_APP_ANTHROPIC_API_KEY.");
  if (res.status === 403) throw new Error("API key doesn't have permission to access this resource.");
  if (res.status === 404) throw new Error("API endpoint not found — the model name may be invalid.");
  if (res.status === 429) throw new Error("Rate limit hit. Wait a moment and try again.");
  if (res.status === 529 || res.status === 503) throw new Error("Anthropic API is overloaded right now. Try again in a few seconds.");
  if (!res.ok) {
    let detail = "";
    try {
      const errData = await res.json();
      detail = errData?.error?.message ? ` — ${errData.error.message}` : ` (HTTP ${res.status})`;
    } catch {}
    throw new Error(`API error${detail}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";
  let chunkCount = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
          accumulated += parsed.delta.text;
          chunkCount++;
          if (onProgress && chunkCount % 8 === 0) {
            onProgress(accumulated.length);
          }
        }
        if (parsed.type === "message_delta" && parsed.delta?.stop_reason === "max_tokens") {
          throw new Error("Response was cut off (too long). Try a shorter or more focused input.");
        }
      } catch (e) {
        if (e.message.includes("cut off")) throw e;
      }
    }
  }

  if (!accumulated) throw new Error("Empty response from API. Please try again.");

  try {
    return JSON.parse(accumulated.replace(/```json|```/g, "").trim());
  } catch (parseErr) {
    console.error("JSON parse error. Raw response:", accumulated);
    throw new Error("Couldn't parse the AI response. The output may have been malformed — try again.");
  }
}

// ─── PERSISTENCE ─────────────────────────────────────────────────────────────

function saveTab(tabId, data) {
  try { localStorage.setItem(`qa_kickstart_${tabId}`, JSON.stringify(data)); } catch {}
}
function loadTab(tabId) {
  try { const d = localStorage.getItem(`qa_kickstart_${tabId}`); return d ? JSON.parse(d) : null; } catch { return null; }
}
function clearTab(tabId) {
  try { localStorage.removeItem(`qa_kickstart_${tabId}`); } catch {}
}

// ─── EXPORT HELPERS ───────────────────────────────────────────────────────────

function downloadFile(filename, content, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function exportTestCasesCSV(testCases) {
  const rows = [["#", "Type", "Group", "Title", "Steps", "Expected", "Scenario", "Why It Matters"]];
  testCases.forEach((tc, i) => {
    rows.push([
      i + 1, tc.type, tc.group || "", tc.title,
      (tc.steps || []).join(" | "),
      tc.expected || "",
      tc.scenario || "",
      tc.whyItMatters || "",
    ]);
  });
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  downloadFile("test-cases.csv", csv, "text/csv");
}

function exportTestCasesJSON(testCases) {
  downloadFile("test-cases.json", JSON.stringify(testCases, null, 2), "application/json");
}

function exportTestCasesMD(testCases) {
  const lines = ["# Generated Test Cases\n"];
  testCases.forEach((tc, i) => {
    lines.push(`## #${i + 1} [${tc.type.toUpperCase()}] ${tc.title}`);
    if (tc.group) lines.push(`**Group:** ${tc.group}\n`);
    if (tc.steps?.length) {
      lines.push("**Steps:**");
      tc.steps.forEach((s, j) => lines.push(`${j + 1}. ${s}`));
    }
    if (tc.expected) lines.push(`\n**Expected:** ${tc.expected}`);
    if (tc.scenario) lines.push(`\`\`\`gherkin\n${tc.scenario}\n\`\`\``);
    if (tc.whyItMatters) lines.push(`\n> 💡 ${tc.whyItMatters}`);
    lines.push("");
  });
  downloadFile("test-cases.md", lines.join("\n"), "text/markdown");
}

function exportDocMD(title, sections) {
  const lines = [`# ${title}\n`];
  (sections || []).forEach(s => {
    lines.push(`## ${s.heading}\n`);
    lines.push(s.content);
    lines.push("");
  });
  downloadFile(`${title.toLowerCase().replace(/\s+/g, "-")}.md`, lines.join("\n"), "text/markdown");
}

// ─── EXPORT TOOLBAR ───────────────────────────────────────────────────────────

function ExportToolbar({ onCopy, onCSV, onJSON, onMD, copied }) {
  const btnStyle = (active) => ({
    background: active ? "#f0fdf4" : "#ffffff",
    border: `1px solid ${active ? "#86efac" : "#dde1e7"}`,
    borderRadius: "6px",
    padding: "5px 11px",
    color: active ? "#166534" : "#64748b",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.15s",
  });
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
      <button onClick={onCopy} style={btnStyle(copied)}>{copied ? "✓ Copied!" : "Copy"}</button>
      {onCSV  && <button onClick={onCSV}  style={btnStyle(false)}>⬇ CSV</button>}
      {onJSON && <button onClick={onJSON} style={btnStyle(false)}>⬇ JSON</button>}
      {onMD   && <button onClick={onMD}   style={btnStyle(false)}>⬇ Markdown</button>}
    </div>
  );
}

// ─── SHARED UI ───────────────────────────────────────────────────────────────

const LOADING_STEPS = {
  generator: [
    { at: 0,   icon: "🔍", text: "Reading your story..." },
    { at: 15,  icon: "🧠", text: "Mapping test scenarios..." },
    { at: 40,  icon: "✍️",  text: "Writing test cases..." },
    { at: 70,  icon: "💡", text: "Adding why-it-matters context..." },
    { at: 90,  icon: "✅", text: "Wrapping up..." },
  ],
  gap: [
    { at: 0,   icon: "🔍", text: "Reviewing existing coverage..." },
    { at: 20,  icon: "🧠", text: "Identifying uncovered scenarios..." },
    { at: 50,  icon: "⚠️",  text: "Flagging weak and redundant tests..." },
    { at: 80,  icon: "📊", text: "Scoring overall coverage..." },
    { at: 90,  icon: "✅", text: "Finalising analysis..." },
  ],
  risk: [
    { at: 0,   icon: "🔍", text: "Scanning feature for risk areas..." },
    { at: 20,  icon: "⚡", text: "Assessing functional risks..." },
    { at: 40,  icon: "🔒", text: "Checking security & data risks..." },
    { at: 65,  icon: "📐", text: "Scoring impact and likelihood..." },
    { at: 85,  icon: "🛡️",  text: "Building mitigation actions..." },
  ],
  docs: [
    { at: 0,   icon: "📄", text: "Analysing feature structure..." },
    { at: 25,  icon: "✍️",  text: "Drafting document sections..." },
    { at: 60,  icon: "🔎", text: "Adding feature-specific detail..." },
    { at: 85,  icon: "✅", text: "Finalising document..." },
  ],
  jira: [
    { at: 0,   icon: "🔍", text: "Understanding your project..." },
    { at: 20,  icon: "📊", text: "Designing dashboards..." },
    { at: 45,  icon: "🔎", text: "Building JQL filters..." },
    { at: 65,  icon: "⚡", text: "Creating automation rules..." },
    { at: 85,  icon: "🗂️",  text: "Adding board tips..." },
  ],
};

function LoadingPanel({ tab, bytesReceived }) {
  const steps = LOADING_STEPS[tab] || LOADING_STEPS.generator;
  // Estimate progress: most responses are 3000–6000 chars of JSON
  const estimatedTotal = 5000;
  const pct = Math.min(95, Math.round((bytesReceived / estimatedTotal) * 100));

  // Find the furthest step whose threshold we've passed
  let activeStep = steps[0];
  for (const step of steps) {
    if (pct >= step.at) activeStep = step;
  }

  return (
    <div style={{
      marginTop: "28px",
      background: "#ffffff",
      border: "1px solid #e4e7ec",
      borderRadius: "12px",
      padding: "28px 24px",
      textAlign: "center",
    }}>
      {/* Animated icon */}
      <div style={{
        fontSize: "32px",
        marginBottom: "12px",
        display: "inline-block",
        animation: "pulse 1.4s ease-in-out infinite",
      }}>
        {activeStep.icon}
      </div>

      {/* Status text */}
      <p style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b", margin: "0 0 20px" }}>
        {activeStep.text}
      </p>

      {/* Progress bar */}
      <div style={{
        background: "#f4f6f8",
        borderRadius: "999px",
        height: "6px",
        overflow: "hidden",
        marginBottom: "16px",
      }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: "linear-gradient(90deg, #1d6ab5, #3b82f6)",
          borderRadius: "999px",
          transition: "width 0.4s ease",
        }} />
      </div>

      {/* Step dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
        {steps.map((step, i) => {
          const done = pct >= step.at;
          const active = step === activeStep;
          return (
            <div key={i} style={{
              width: active ? "20px" : "6px",
              height: "6px",
              borderRadius: "999px",
              background: done ? "#1d6ab5" : "#e2e8f0",
              transition: "all 0.3s ease",
            }} />
          );
        })}
      </div>

      <p style={{ fontSize: "11px", color: "#94a3b8", margin: "14px 0 0" }}>
        Streaming response — results will appear shortly
      </p>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p
      style={{
        fontSize: "13px",
        fontWeight: "600",
        color: "#475569",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: "10px",
      }}
    >
      {children}
    </p>
  );
}

function GenerateButton({ onClick, disabled, loading, label, loadingLabel }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "13px",
        borderRadius: "8px",
        background: disabled ? "#eaecef" : "#1558a0",
        border: "none",
        color: disabled ? "#94a3b8" : "#ffffff",
        fontSize: "14px",
        fontWeight: "600",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}
    >
      {loading ? (
        <>
          <span
            style={{
              width: "15px",
              height: "15px",
              border: "2px solid rgba(255,255,255,0.3)",
              borderTopColor: "white",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.8s linear infinite",
            }}
          />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}

function LevelBadge({ level, type }) {
  const colors = {
    High:
      type === "impact"
        ? { bg: "#fee2e2", color: "#991b1b" }
        : { bg: "#fef3c7", color: "#92400e" },
    Medium: { bg: "#e6f1fb", color: "#185fa5" },
    Low: { bg: "#f0fdf4", color: "#166534" },
  };
  const c = colors[level] || colors.Medium;
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: "700",
        padding: "2px 7px",
        borderRadius: "4px",
        background: c.bg,
        color: c.color,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {level}
    </span>
  );
}

function ScoreBadge({ score }) {
  const m = RISK_SCORE_META[score] || RISK_SCORE_META.Medium;
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: "700",
        padding: "3px 9px",
        borderRadius: "4px",
        background: m.bg,
        color: m.color,
        border: `1px solid ${m.border}`,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {score}
    </span>
  );
}

function WhyItMatters({ text }) {
  if (!text) return null;
  return (
    <div
      style={{
        marginTop: "10px",
        background: "#f8fafc",
        border: "1px solid #e4e7ec",
        borderLeft: "3px solid #1558a0",
        borderRadius: "6px",
        padding: "8px 12px",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          fontWeight: "700",
          color: "#185fa5",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          margin: "0 0 4px",
        }}
      >
        💡 Why it matters
      </p>
      <p
        style={{
          fontSize: "13px",
          color: "#475569",
          lineHeight: "1.6",
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}

function StepsExpanded({ tc }) {
  return (
    <>
      {tc.steps?.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "11px",
              fontWeight: "600",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              margin: "0 0 8px",
            }}
          >
            Steps
          </p>
          {tc.steps.map((s, i) => (
            <div
              key={i}
              style={{ display: "flex", gap: "10px", marginBottom: "5px" }}
            >
              <span
                style={{
                  color: "#94a3b8",
                  fontSize: "12px",
                  minWidth: "18px",
                  fontFamily: "monospace",
                }}
              >
                {i + 1}.
              </span>
              <span
                style={{
                  color: "#475569",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}
              >
                {s}
              </span>
            </div>
          ))}
        </div>
      )}
      {tc.expected && (
        <div style={{ marginBottom: "10px" }}>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "11px",
              fontWeight: "600",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              margin: "0 0 6px",
            }}
          >
            Expected Result
          </p>
          <p
            style={{
              color: "#166534",
              fontSize: "13px",
              lineHeight: "1.5",
              background: "#f0fdf4",
              padding: "8px 12px",
              borderRadius: "6px",
              borderLeft: "3px solid #86efac",
              margin: 0,
            }}
          >
            {tc.expected}
          </p>
        </div>
      )}
      {tc.scenario && (
        <pre
          style={{
            color: "#3730a3",
            fontSize: "12px",
            lineHeight: "1.8",
            background: "#eef2ff",
            padding: "12px",
            borderRadius: "6px",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            margin: "0 0 10px",
          }}
        >
          {tc.scenario}
        </pre>
      )}
      <WhyItMatters text={tc.whyItMatters} />
    </>
  );
}

function TestCaseCard({ tc, index, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const badge = BADGE_COLORS[tc.type] || BADGE_COLORS.functional;

  const startEdit = (e) => {
    e.stopPropagation();
    setDraft({ ...tc, steps: [...(tc.steps || [])] });
    setEditing(true);
    setOpen(true);
  };
  const cancelEdit = (e) => { e.stopPropagation(); setEditing(false); setDraft(null); };
  const saveEdit = (e) => {
    e.stopPropagation();
    onUpdate && onUpdate(index, draft);
    setEditing(false);
    setDraft(null);
  };
  const updateStep = (i, val) => setDraft(d => { const s = [...d.steps]; s[i] = val; return { ...d, steps: s }; });
  const addStep = () => setDraft(d => ({ ...d, steps: [...(d.steps || []), ""] }));
  const removeStep = (i) => setDraft(d => { const s = d.steps.filter((_, j) => j !== i); return { ...d, steps: s }; });

  const textareaStyle = {
    width: "100%", fontSize: "13px", lineHeight: "1.6", padding: "6px 8px",
    border: "1px solid #c8d0da", borderRadius: "6px", outline: "none",
    fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", color: "#1e293b",
  };

  return (
    <div
      onClick={() => !editing && setOpen(!open)}
      style={{
        background: open ? "#f8fafc" : "#ffffff",
        border: `1px solid ${editing ? "#1558a0" : open ? "#c8d0da" : "#e4e7ec"}`,
        borderRadius: "8px", padding: "12px 14px",
        cursor: editing ? "default" : "pointer",
        transition: "all 0.15s", marginBottom: "8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ color: "#94a3b8", fontFamily: "monospace", fontSize: "11px", minWidth: "24px" }}>
          #{String(index + 1).padStart(2, "0")}
        </span>
        <span style={{ fontSize: "10px", fontWeight: "600", padding: "2px 7px", borderRadius: "4px", background: badge.bg, color: badge.color, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
          {tc.type}
        </span>
        {editing ? (
          <input
            value={draft.title}
            onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
            onClick={e => e.stopPropagation()}
            style={{ ...textareaStyle, flex: 1, padding: "4px 8px", resize: "none" }}
          />
        ) : (
          <span style={{ color: "#1e293b", fontSize: "13px", flex: 1, fontWeight: "500" }}>{tc.title}</span>
        )}
        {!editing && (
          <button onClick={startEdit} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "#94a3b8", fontSize: "13px", lineHeight: 1 }} title="Edit">✏️</button>
        )}
        {editing ? (
          <div style={{ display: "flex", gap: "6px" }} onClick={e => e.stopPropagation()}>
            <button onClick={saveEdit} style={{ background: "#1558a0", border: "none", borderRadius: "5px", padding: "3px 10px", color: "#fff", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>Save</button>
            <button onClick={cancelEdit} style={{ background: "#f1f5f9", border: "1px solid #dde1e7", borderRadius: "5px", padding: "3px 10px", color: "#64748b", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
          </div>
        ) : (
          <span style={{ color: "#94a3b8", fontSize: "11px" }}>{open ? "▲" : "▼"}</span>
        )}
      </div>
      {open && (
        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e4e7ec" }} onClick={e => editing && e.stopPropagation()}>
          {editing ? (
            <div>
              {draft.steps?.length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <p style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>Steps</p>
                  {draft.steps.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "6px", alignItems: "flex-start" }}>
                      <span style={{ color: "#94a3b8", fontSize: "12px", minWidth: "18px", fontFamily: "monospace", paddingTop: "7px" }}>{i + 1}.</span>
                      <textarea value={s} onChange={e => updateStep(i, e.target.value)} rows={2} style={textareaStyle} />
                      <button onClick={() => removeStep(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: "14px", paddingTop: "4px", flexShrink: 0 }}>✕</button>
                    </div>
                  ))}
                  <button onClick={addStep} style={{ fontSize: "12px", color: "#1558a0", background: "none", border: "1px dashed #93c5fd", borderRadius: "5px", padding: "4px 10px", cursor: "pointer", marginTop: "2px" }}>+ Add step</button>
                </div>
              )}
              {draft.expected !== undefined && draft.expected !== null && (
                <div style={{ marginBottom: "10px" }}>
                  <p style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px" }}>Expected Result</p>
                  <textarea value={draft.expected || ""} onChange={e => setDraft(d => ({ ...d, expected: e.target.value }))} rows={2} style={textareaStyle} />
                </div>
              )}
              {draft.scenario !== undefined && draft.scenario !== null && (
                <div style={{ marginBottom: "10px" }}>
                  <p style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px" }}>Gherkin Scenario</p>
                  <textarea value={draft.scenario || ""} onChange={e => setDraft(d => ({ ...d, scenario: e.target.value }))} rows={5} style={{ ...textareaStyle, fontFamily: "monospace", fontSize: "12px" }} />
                </div>
              )}
              <div style={{ marginBottom: "6px" }}>
                <p style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px" }}>Why It Matters</p>
                <textarea value={draft.whyItMatters || ""} onChange={e => setDraft(d => ({ ...d, whyItMatters: e.target.value }))} rows={2} style={textareaStyle} />
              </div>
            </div>
          ) : (
            <StepsExpanded tc={tc} />
          )}
        </div>
      )}
    </div>
  );
}

function MissingTestCard({ tc, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: open ? "#fffbeb" : "#ffffff",
        border: `1px solid ${open ? "#fcd34d" : "#e4e7ec"}`,
        borderRadius: "8px",
        padding: "12px 14px",
        cursor: "pointer",
        transition: "all 0.15s",
        marginBottom: "8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span
          style={{
            color: "#94a3b8",
            fontFamily: "monospace",
            fontSize: "11px",
            minWidth: "24px",
          }}
        >
          #{String(index + 1).padStart(2, "0")}
        </span>
        <span
          style={{
            fontSize: "10px",
            fontWeight: "600",
            padding: "2px 7px",
            borderRadius: "4px",
            background: "#fef3c7",
            color: "#92400e",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            whiteSpace: "nowrap",
          }}
        >
          missing
        </span>
        <span
          style={{
            color: "#1e293b",
            fontSize: "13px",
            flex: 1,
            fontWeight: "500",
          }}
        >
          {tc.title}
        </span>
        <span style={{ color: "#94a3b8", fontSize: "11px" }}>
          {open ? "▲" : "▼"}
        </span>
      </div>
      {open && (
        <div
          style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid #fde68a",
          }}
        >
          <p
            style={{
              color: "#92400e",
              fontSize: "12px",
              background: "#fef3c7",
              padding: "7px 10px",
              borderRadius: "6px",
              margin: "0 0 12px",
              lineHeight: "1.5",
            }}
          >
            <strong>Why it's missing:</strong> {tc.reason}
          </p>
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
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e4e7ec",
          borderRadius: "10px",
          padding: "20px",
          overflowX: "auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "80px repeat(3, 1fr)",
            gap: "6px",
            minWidth: "500px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "#94a3b8",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                paddingBottom: "8px",
              }}
            >
              Impact →
            </span>
          </div>
          {["Low Likelihood", "Med Likelihood", "High Likelihood"].map((l) => (
            <div
              key={l}
              style={{
                textAlign: "center",
                padding: "6px",
                fontSize: "11px",
                color: "#64748b",
                fontWeight: "600",
              }}
            >
              {l}
            </div>
          ))}
          {levels.map((impact) => (
            <>
              <div
                key={`lbl-${impact}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    fontWeight: "600",
                  }}
                >
                  {impact}
                </span>
              </div>
              {["Low", "Medium", "High"].map((likelihood) => {
                const score = getRiskScore(impact, likelihood);
                const meta = RISK_SCORE_META[score];
                const cellRisks = risks.filter(
                  (r) => r.impact === impact && r.likelihood === likelihood,
                );
                return (
                  <div
                    key={`${impact}-${likelihood}`}
                    style={{
                      background: meta.bg,
                      border: `1px solid ${meta.border}`,
                      borderRadius: "8px",
                      padding: "10px",
                      minHeight: "70px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "9px",
                        color: meta.color,
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        opacity: 0.7,
                      }}
                    >
                      {score}
                    </span>
                    {cellRisks.length === 0 && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: meta.color,
                          opacity: 0.4,
                        }}
                      >
                        —
                      </span>
                    )}
                    {cellRisks.map((r) => (
                      <div
                        key={r.id}
                        style={{
                          background: "rgba(255,255,255,0.7)",
                          borderRadius: "4px",
                          padding: "3px 6px",
                          fontSize: "11px",
                          color: meta.color,
                          fontWeight: "500",
                          lineHeight: "1.3",
                        }}
                      >
                        #{r.id} {r.name}
                      </div>
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
  const catColors = {
    Functional: "#185fa5",
    Technical: "#534ab7",
    Performance: "#854f0b",
    Security: "#991b1b",
    Integration: "#166534",
    UX: "#6d28d9",
    Data: "#0e7490",
    "Edge Case": "#475569",
  };
  const catColor = catColors[risk.category] || "#475569";
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: open ? "#f8fafc" : "#ffffff",
        border: `1px solid ${open ? meta.border : "#e2e8f0"}`,
        borderLeft: `4px solid ${meta.dot}`,
        borderRadius: "8px",
        padding: "12px 14px",
        cursor: "pointer",
        transition: "all 0.15s",
        marginBottom: "8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span
          style={{
            color: "#94a3b8",
            fontFamily: "monospace",
            fontSize: "11px",
            minWidth: "20px",
          }}
        >
          #{risk.id}
        </span>
        <ScoreBadge score={risk.score} />
        <span
          style={{
            fontSize: "10px",
            fontWeight: "600",
            padding: "2px 7px",
            borderRadius: "4px",
            background: "#f4f6f8",
            color: catColor,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
          }}
        >
          {risk.category}
        </span>
        <span
          style={{
            color: "#1e293b",
            fontSize: "13px",
            flex: 1,
            fontWeight: "500",
          }}
        >
          {risk.name}
        </span>
        <span
          style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}
        >
          Priority #{risk.testPriority}
        </span>
        <span style={{ color: "#94a3b8", fontSize: "11px" }}>
          {open ? "▲" : "▼"}
        </span>
      </div>
      {open && (
        <div
          style={{
            marginTop: "14px",
            paddingTop: "14px",
            borderTop: "1px solid #e4e7ec",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: "#475569",
              lineHeight: "1.6",
              margin: "0 0 14px",
            }}
          >
            {risk.description}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "8px",
                padding: "10px 12px",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  margin: "0 0 6px",
                }}
              >
                Impact
              </p>
              <div style={{ marginBottom: "4px" }}>
                <LevelBadge level={risk.impact} type="impact" />
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  margin: 0,
                  lineHeight: "1.5",
                }}
              >
                {risk.impactReason}
              </p>
            </div>
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "8px",
                padding: "10px 12px",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  margin: "0 0 6px",
                }}
              >
                Likelihood
              </p>
              <div style={{ marginBottom: "4px" }}>
                <LevelBadge level={risk.likelihood} type="likelihood" />
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  margin: 0,
                  lineHeight: "1.5",
                }}
              >
                {risk.likelihoodReason}
              </p>
            </div>
          </div>
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: "8px",
              padding: "12px 14px",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                color: "#166534",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: "0 0 8px",
              }}
            >
              🛡 Mitigation
            </p>
            {Array.isArray(risk.mitigation) ? (
              risk.mitigation.map((m, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: "8px", marginBottom: "5px" }}
                >
                  <span
                    style={{
                      color: "#86efac",
                      fontSize: "12px",
                      minWidth: "16px",
                    }}
                  >
                    {i + 1}.
                  </span>
                  <span
                    style={{
                      color: "#166534",
                      fontSize: "13px",
                      lineHeight: "1.5",
                    }}
                  >
                    {m}
                  </span>
                </div>
              ))
            ) : (
              <p
                style={{
                  color: "#166534",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  margin: 0,
                }}
              >
                {risk.mitigation}
              </p>
            )}
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
      <h3
        style={{
          fontSize: "14px",
          fontWeight: "700",
          color: "#0f172a",
          margin: "0 0 10px",
          paddingBottom: "8px",
          borderBottom: "1px solid #e4e7ec",
        }}
      >
        {heading}
      </h3>
      <div
        style={{
          fontSize: "13px",
          color: "#475569",
          lineHeight: "1.8",
          whiteSpace: "pre-wrap",
        }}
      >
        {content}
      </div>
    </div>
  );
}

function AutomationCard({ item, type }) {
  const isAutomate = type === "automate";
  const priorityColors = {
    High: { bg: "#fee2e2", color: "#991b1b" },
    Medium: { bg: "#fef3c7", color: "#92400e" },
    Low: { bg: "#f0fdf4", color: "#166534" },
  };
  const levelColors = {
    E2E: { bg: "#eeedfe", color: "#534ab7" },
    API: { bg: "#e6f1fb", color: "#185fa5" },
    Unit: { bg: "#faeeda", color: "#854f0b" },
    Integration: { bg: "#f0fdf4", color: "#166534" },
  };
  const pc = priorityColors[item.priority] || priorityColors.Medium;
  const lc = levelColors[item.level] || levelColors.E2E;
  return (
    <div
      style={{
        background: "#ffffff",
        border: `1px solid ${isAutomate ? "#e2e8f0" : "#fee2e2"}`,
        borderLeft: `4px solid ${isAutomate ? "#185fa5" : "#dc2626"}`,
        borderRadius: "8px",
        padding: "12px 14px",
        marginBottom: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "6px",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "#1e293b",
            flex: 1,
          }}
        >
          {item.name}
        </span>
        {item.level && (
          <span
            style={{
              fontSize: "10px",
              fontWeight: "700",
              padding: "2px 7px",
              borderRadius: "4px",
              background: lc.bg,
              color: lc.color,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {item.level}
          </span>
        )}
        {item.priority && (
          <span
            style={{
              fontSize: "10px",
              fontWeight: "700",
              padding: "2px 7px",
              borderRadius: "4px",
              background: pc.bg,
              color: pc.color,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {item.priority}
          </span>
        )}
      </div>
      <p
        style={{
          fontSize: "12px",
          color: "#64748b",
          margin: "0 0 4px",
          lineHeight: "1.5",
        }}
      >
        {item.reason}
      </p>
      {item.approach && (
        <p
          style={{
            fontSize: "12px",
            color: "#185fa5",
            margin: 0,
            lineHeight: "1.5",
            fontStyle: "italic",
          }}
        >
          → {item.approach}
        </p>
      )}
    </div>
  );
}

// ─── GENERATOR TAB ────────────────────────────────────────────────────────────

function GeneratorTab({ onResults }) {
  const [inputMode, setInputMode] = useState("single");
  const [input, setInput] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bytesReceived, setBytesReceived] = useState(0);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef(null);

  const onResultsRef = useRef(onResults);

  // Load persisted state on mount
  useEffect(() => {
    const saved = loadTab("generator");
    if (saved) {
      if (saved.input) setInput(saved.input);
      if (saved.selectedTypes) setSelectedTypes(saved.selectedTypes);
      if (saved.inputMode) setInputMode(saved.inputMode);
      if (saved.results) {
        setResults(saved.results);
        onResultsRef.current && onResultsRef.current(saved.results.length);
      }
    }
  }, []);

  // Persist input fields on change
  useEffect(() => {
    const saved = loadTab("generator") || {};
    saveTab("generator", { ...saved, input, inputMode, selectedTypes });
  }, [input, inputMode, selectedTypes]);

  const updateTestCase = (index, updated) => {
    const flat = results.map((tc, i) => i === index ? updated : tc);
    setResults(flat);
    saveTab("generator", { results: flat, selectedTypes, inputMode });
  };

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const wordCountColor = wordCount === 0 ? "#94a3b8" : wordCount >= 30 ? "#166534" : "#92400e";

  const missingText = input.trim().length === 0;
  const missingType = selectedTypes.length === 0;
  const canGenerate = !missingText && !missingType && !loading;

  const disabledHint = missingText && missingType
    ? "Add a story and select at least one test type to continue"
    : missingText
    ? "Add a user story or feature description above"
    : missingType
    ? "Select at least one test type above"
    : null;

  const toggleType = (id) =>
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );

  const generate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setBytesReceived(0);
    setError(null);
    setResults(null);
    try {
      const parsed = await callClaude(buildGeneratorPrompt(inputMode, input, selectedTypes, loadProjectContext()), 4000, (n) => setBytesReceived(n));
      setResults(parsed);
      saveTab("generator", { results: parsed, selectedTypes, inputMode });
      onResults && onResults(parsed.length);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      console.error("Generator error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    if (!results) return;
    navigator.clipboard.writeText(
      results
        .map(
          (tc, i) =>
            `#${i + 1} [${tc.type.toUpperCase()}] ${tc.title}\n` +
            (tc.steps
              ? tc.steps.map((s, j) => `  ${j + 1}. ${s}`).join("\n") +
                `\n  ✓ ${tc.expected}`
              : tc.scenario || "") +
            (tc.whyItMatters ? `\n  💡 ${tc.whyItMatters}` : "") +
            "\n",
        )
        .join("\n"),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearResults = () => { setResults(null); clearTab("generator"); onResults && onResults(0); };

  const grouped = results
    ? selectedTypes.reduce((acc, type) => {
        const tcs = results.filter((tc) => tc.type === type);
        if (!tcs.length) return acc;
        acc[type] = tcs.reduce((sg, tc) => {
          const k = tc.group || type;
          if (!sg[k]) sg[k] = [];
          sg[k].push(tc);
          return sg;
        }, {});
        return acc;
      }, {})
    : {};

  const currentMode = INPUT_MODES.find((m) => m.id === inputMode);

  return (
    <div>
      {/* Tab description */}
      <div style={{ marginBottom: "22px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>Test Generator</h2>
        <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
          Paste a user story or feature — get a complete, structured set of test cases instantly.
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <SectionLabel>What are you testing?</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
          {INPUT_MODES.map((m) => {
            const active = inputMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => { setInputMode(m.id); setInput(""); setResults(null); }}
                style={{
                  background: active ? "#e6f1fb" : "#ffffff",
                  border: `${active ? "2px" : "1px"} solid ${active ? "#185fa5" : "#dde1e7"}`,
                  borderRadius: "8px",
                  padding: "12px 14px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                  outline: "none",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <div style={{ marginTop: "1px", flexShrink: 0 }}>
                  {MODE_ICONS[m.id](active ? "#185fa5" : "#94a3b8")}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: active ? "#185fa5" : "#64748b", marginBottom: "2px" }}>{m.label}</div>
                  <div style={{ fontSize: "11px", color: active ? "#185fa5" : "#94a3b8", opacity: active ? 0.8 : 1 }}>{m.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
          <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", display: "block" }}>
            {currentMode.label}
          </label>
          <span style={{ fontSize: "11px", color: wordCountColor, fontWeight: wordCount >= 30 ? "600" : "400" }}>
            {wordCount === 0 ? "0 words" : wordCount >= 30 ? `✓ ${wordCount} words` : `${wordCount} words — add more detail for better results`}
          </span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={currentMode.placeholder}
          style={{
            width: "100%",
            minHeight: inputMode === "epic" ? "180px" : inputMode === "multiple" ? "150px" : "110px",
            background: "#ffffff",
            border: "1px solid #e4e7ec",
            borderRadius: "8px",
            color: "#1e293b",
            fontSize: "13.5px",
            lineHeight: "1.7",
            padding: "12px 14px",
            resize: "vertical",
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#1558a0")}
          onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
        />
      </div>

      <div style={{ marginBottom: "24px" }}>
        <SectionLabel>Test Types</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          {TEST_TYPES.map((t) => {
            const active = selectedTypes.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggleType(t.id)}
                style={{
                  background: active ? t.activeColor.bg : "#ffffff",
                  border: `${active ? "2px" : "1px"} solid ${active ? t.activeColor.border : "#e2e8f0"}`,
                  borderRadius: "8px",
                  padding: "12px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                  outline: "none",
                }}
              >
                <div style={{ marginBottom: "6px" }}>{TYPE_ICONS[t.id](active ? t.activeColor.icon : "#94a3b8")}</div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: active ? t.activeColor.text : "#64748b", marginBottom: "2px" }}>{t.label}</div>
                <div style={{ fontSize: "11px", color: active ? t.activeColor.text : "#94a3b8", opacity: active ? 0.8 : 1 }}>{t.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <GenerateButton
        onClick={generate}
        disabled={!canGenerate}
        loading={loading}
        label={inputMode === "epic" ? "Generate Full Test Suite →" : "Generate Test Cases →"}
        loadingLabel={inputMode === "epic" ? "Generating full test suite..." : "Generating test cases..."}
      />

      {/* Disabled hint */}
      {disabledHint && !loading && (
        <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", margin: "8px 0 0" }}>
          {disabledHint}
        </p>
      )}

      {error && <p style={{ color: "#dc2626", fontSize: "13px", textAlign: "center", marginTop: "14px" }}>{error}</p>}

      {loading && <LoadingPanel tab="generator" bytesReceived={bytesReceived} />}

      {/* Empty state */}
      {!results && !loading && (
        <div style={{ marginTop: "40px", textAlign: "center", padding: "32px 24px", border: "1px dashed #d0d5dd", borderRadius: "12px", background: "#fafbfc" }}>
          <div style={{ fontSize: "28px", marginBottom: "12px" }}>✅</div>
          <p style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: "600", color: "#475569" }}>Your test cases will appear here</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "center", marginTop: "12px" }}>
            {["Pick your story type above", "Paste your user story or epic", "Select functional, edge, negative or BDD types", "Hit Generate"].map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#94a3b8" }}>
                <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#e4e7ec", fontSize: "10px", fontWeight: "700", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {results && (
        <div ref={resultsRef} style={{ marginTop: "36px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
                {inputMode === "epic" ? "Test Suite" : "Generated Test Cases"}
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                {results.length} test cases · {selectedTypes.length} type{selectedTypes.length > 1 ? "s" : ""}
                <span style={{ marginLeft: "10px", color: "#c7d0dc", fontStyle: "italic" }}>· saved</span>
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <ExportToolbar
                copied={copied}
                onCopy={copyAll}
                onCSV={() => exportTestCasesCSV(results)}
                onJSON={() => exportTestCasesJSON(results)}
                onMD={() => exportTestCasesMD(results)}
              />
              <button onClick={clearResults} style={{ background: "none", border: "1px solid #fca5a5", borderRadius: "6px", padding: "5px 10px", color: "#dc2626", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Clear</button>
            </div>
          </div>
          {selectedTypes.map((type) => {
            const subGroups = grouped[type];
            if (!subGroups) return null;
            const t = TEST_TYPES.find((x) => x.id === type);
            const badge = BADGE_COLORS[type];
            const total = Object.values(subGroups).flat().length;
            return (
              <div key={type} style={{ marginBottom: "32px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "14px",
                    paddingBottom: "10px",
                    borderBottom: "1px solid #e4e7ec",
                  }}
                >
                  {TYPE_ICONS[type](badge.color)}
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#1e293b",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {t?.label}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      background: badge.bg,
                      color: badge.color,
                      borderRadius: "4px",
                      padding: "1px 7px",
                      fontWeight: "600",
                    }}
                  >
                    {total}
                  </span>
                </div>
                {Object.entries(subGroups).map(([groupName, tcs]) => (
                  <div key={groupName} style={{ marginBottom: "16px" }}>
                    {Object.keys(subGroups).length > 1 && (
                      <p
                        style={{
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          marginBottom: "8px",
                        }}
                      >
                        {groupName}
                      </p>
                    )}
                    {tcs.map((tc, i) => {
                      const globalIndex = Object.values(subGroups).flat().indexOf(tc);
                      return (
                        <TestCaseCard
                          key={globalIndex}
                          tc={tc}
                          index={globalIndex}
                          onUpdate={updateTestCase}
                        />
                      );
                    })}
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

function GapDetectorTab({ onResults }) {
  const [feature, setFeature] = useState("");
  const [existingTests, setExistingTests] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bytesReceived, setBytesReceived] = useState(0);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef(null);

  const onResultsRef = useRef(onResults);

  useEffect(() => {
    const saved = loadTab("gap");
    if (saved) {
      if (saved.feature) setFeature(saved.feature);
      if (saved.existingTests) setExistingTests(saved.existingTests);
      if (saved.results) {
        setResults(saved.results);
        onResultsRef.current && onResultsRef.current((saved.results.missing?.length || 0) + (saved.results.weak?.length || 0));
      }
    }
  }, []);

  // Persist input fields on change
  useEffect(() => {
    const saved = loadTab("gap") || {};
    saveTab("gap", { ...saved, feature, existingTests });
  }, [feature, existingTests]);

  const featureWords = feature.trim() ? feature.trim().split(/\s+/).length : 0;
  const testLines = existingTests.trim() ? existingTests.trim().split(/\n/).filter(l => l.trim()).length : 0;
  const missingFeature = feature.trim().length === 0;
  const missingTests = existingTests.trim().length === 0;
  const canAnalyse = !missingFeature && !missingTests && !loading;

  const disabledHint = missingFeature && missingTests
    ? "Add a feature description and your existing test titles to continue"
    : missingFeature ? "Add a feature description on the left"
    : missingTests ? "Paste your existing test titles on the right"
    : null;

  const analyse = async () => {
    if (!canAnalyse) return;
    setLoading(true);
    setBytesReceived(0);
    setError(null);
    setResults(null);
    try {
      const parsed = await callClaude(buildGapPrompt(feature, existingTests, loadProjectContext()), 4000, (n) => setBytesReceived(n));
      setResults(parsed);
      saveTab("gap", { results: parsed });
      onResults && onResults((parsed.missing?.length || 0) + (parsed.weak?.length || 0));
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      console.error("Gap detector error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyMissing = () => {
    if (!results?.missing) return;
    navigator.clipboard.writeText(
      results.missing
        .map(
          (tc, i) =>
            `#${i + 1} [MISSING] ${tc.title}\n` +
            tc.steps.map((s, j) => `  ${j + 1}. ${s}`).join("\n") +
            `\n  ✓ ${tc.expected}\n`,
        )
        .join("\n"),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearResults = () => { setResults(null); clearTab("gap"); onResults && onResults(0); };

  const exportGapMD = () => {
    if (!results) return;
    const lines = ["# Gap Analysis Report\n", `**Coverage Score:** ${results.coverageScore}%\n`, `${results.summary}\n`];
    if (results.missing?.length) {
      lines.push("## Missing Test Cases\n");
      results.missing.forEach((tc, i) => {
        lines.push(`### #${i+1} ${tc.title}`);
        lines.push(`**Why missing:** ${tc.reason}\n`);
        if (tc.steps?.length) { lines.push("**Steps:**"); tc.steps.forEach((s,j) => lines.push(`${j+1}. ${s}`)); }
        if (tc.expected) lines.push(`\n**Expected:** ${tc.expected}\n`);
      });
    }
    if (results.weak?.length) {
      lines.push("## Weak Coverage\n");
      results.weak.forEach(w => lines.push(`- **${w.area}**: ${w.reason}\n`));
    }
    if (results.redundant?.length) {
      lines.push("## Redundant Tests\n");
      results.redundant.forEach(r => lines.push(`- ${r.tests?.join(", ")}: ${r.reason}\n`));
    }
    downloadFile("gap-analysis.md", lines.join("\n"), "text/markdown");
  };

  const scoreColor = results
    ? results.coverageScore >= 75
      ? "#166534"
      : results.coverageScore >= 50
        ? "#92400e"
        : "#991b1b"
    : "#185fa5";

  return (
    <div>
      {/* Tab description */}
      <div style={{ marginBottom: "22px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>Gap Detector</h2>
        <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
          Paste your existing test titles and the feature spec — get a scored coverage report with missing, weak, and redundant tests.
        </p>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}
      >
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Feature / User Story
            </label>
            <span style={{ fontSize: "11px", color: featureWords >= 20 ? "#166534" : featureWords > 0 ? "#92400e" : "#94a3b8", fontWeight: featureWords >= 20 ? "600" : "400" }}>
              {featureWords === 0 ? "0 words" : featureWords >= 20 ? `✓ ${featureWords} words` : `${featureWords} words`}
            </span>
          </div>
          <textarea
            value={feature}
            onChange={(e) => setFeature(e.target.value)}
            placeholder={`Describe the feature or paste your user story here.\n\nAs a user, I want to reset my password via email...`}
            style={{ width: "100%", height: "200px", background: "#ffffff", border: "1px solid #e4e7ec", borderRadius: "8px", color: "#1e293b", fontSize: "13px", lineHeight: "1.7", padding: "12px 14px", resize: "none", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            onFocus={(e) => (e.target.style.borderColor = "#1558a0")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Existing Tests{" "}
              <span style={{ color: "#94a3b8", fontWeight: "400", textTransform: "none", fontSize: "11px" }}>(one per line)</span>
            </label>
            <span style={{ fontSize: "11px", color: testLines >= 3 ? "#166534" : testLines > 0 ? "#92400e" : "#94a3b8", fontWeight: testLines >= 3 ? "600" : "400" }}>
              {testLines === 0 ? "0 tests" : testLines >= 3 ? `✓ ${testLines} tests` : `${testLines} test${testLines > 1 ? "s" : ""}`}
            </span>
          </div>
          <textarea
            value={existingTests}
            onChange={(e) => setExistingTests(e.target.value)}
            placeholder={`Verify login with valid credentials\nVerify login with invalid password\nVerify forgot password link is visible\nVerify password reset email is sent`}
            style={{ width: "100%", height: "200px", background: "#ffffff", border: "1px solid #e4e7ec", borderRadius: "8px", color: "#1e293b", fontSize: "13px", lineHeight: "1.7", padding: "12px 14px", resize: "none", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            onFocus={(e) => (e.target.style.borderColor = "#1558a0")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
          <p style={{ fontSize: "11px", color: "#94a3b8", margin: "6px 0 0" }}>Paste test titles from TestRail, Xray, or any plain list.</p>
        </div>
      </div>

      <GenerateButton onClick={analyse} disabled={!canAnalyse} loading={loading} label="Analyse Coverage Gaps →" loadingLabel="Analysing coverage..." />

      {disabledHint && !loading && (
        <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", margin: "8px 0 0" }}>{disabledHint}</p>
      )}

      {error && <p style={{ color: "#dc2626", fontSize: "13px", textAlign: "center", marginTop: "14px" }}>{error}</p>}

      {loading && <LoadingPanel tab="gap" bytesReceived={bytesReceived} />}

      {/* Empty state */}
      {!results && !loading && (
        <div style={{ marginTop: "40px", textAlign: "center", padding: "32px 24px", border: "1px dashed #d0d5dd", borderRadius: "12px", background: "#fafbfc" }}>
          <div style={{ fontSize: "28px", marginBottom: "12px" }}>🔍</div>
          <p style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: "600", color: "#475569" }}>Your gap analysis will appear here</p>
          <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#94a3b8" }}>You'll get a coverage score, a list of missing tests with steps, weak areas, and redundant duplicates.</p>
        </div>
      )}

      {results && (
        <div ref={resultsRef} style={{ marginTop: "36px" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <ExportToolbar copied={copied} onCopy={copyMissing} onMD={exportGapMD} />
            <button onClick={clearResults} style={{ background: "none", border: "1px solid #fca5a5", borderRadius: "6px", padding: "5px 10px", color: "#dc2626", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Clear</button>
          </div>
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e4e7ec",
              borderRadius: "10px",
              padding: "16px 20px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  color: scoreColor,
                  lineHeight: 1,
                }}
              >
                {results.coverageScore}%
              </div>
              <div
                style={{ fontSize: "11px", color: "#94a3b8", marginTop: "3px" }}
              >
                Coverage
              </div>
            </div>
            <div
              style={{
                width: "1px",
                height: "40px",
                background: "#e2e8f0",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: "8px",
                  background: "#f4f6f8",
                  borderRadius: "4px",
                  overflow: "hidden",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${results.coverageScore}%`,
                    background: scoreColor,
                    borderRadius: "4px",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#475569",
                  margin: 0,
                  lineHeight: "1.5",
                }}
              >
                {results.summary}
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
              {[
                {
                  label: "Missing",
                  count: results.missing?.length || 0,
                  color: "#92400e",
                  bg: "#fef3c7",
                },
                {
                  label: "Weak",
                  count: results.weak?.length || 0,
                  color: "#991b1b",
                  bg: "#fee2e2",
                },
                {
                  label: "Redundant",
                  count: results.redundant?.length || 0,
                  color: "#475569",
                  bg: "#f1f5f9",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    textAlign: "center",
                    background: s.bg,
                    padding: "8px 14px",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: s.color,
                      lineHeight: 1,
                    }}
                  >
                    {s.count}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: s.color,
                      marginTop: "2px",
                      fontWeight: "600",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {results.missing?.length > 0 && (
            <div style={{ marginBottom: "28px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "14px",
                  paddingBottom: "10px",
                  borderBottom: "1px solid #e4e7ec",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span>⚠</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Missing Test Cases</span>
                  <span style={{ fontSize: "11px", background: "#fef3c7", color: "#92400e", borderRadius: "4px", padding: "1px 7px", fontWeight: "600" }}>{results.missing.length}</span>
                </div>
              </div>
              {results.missing.map((tc, i) => (
                <MissingTestCard key={i} tc={tc} index={i} />
              ))}
            </div>
          )}

          {results.weak?.length > 0 && (
            <div style={{ marginBottom: "28px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "14px",
                  paddingBottom: "10px",
                  borderBottom: "1px solid #e4e7ec",
                }}
              >
                <span>↓</span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#1e293b",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Weak Coverage
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    background: "#fee2e2",
                    color: "#991b1b",
                    borderRadius: "4px",
                    padding: "1px 7px",
                    fontWeight: "600",
                  }}
                >
                  {results.weak.length}
                </span>
              </div>
              {results.weak.map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e4e7ec",
                    borderRadius: "8px",
                    padding: "12px 14px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#1e293b",
                      marginBottom: "4px",
                    }}
                  >
                    {item.area}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      lineHeight: "1.5",
                    }}
                  >
                    {item.reason}
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.redundant?.length > 0 && (
            <div style={{ marginBottom: "28px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "14px",
                  paddingBottom: "10px",
                  borderBottom: "1px solid #e4e7ec",
                }}
              >
                <span>≈</span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#1e293b",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Redundant Tests
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    background: "#f4f6f8",
                    color: "#475569",
                    borderRadius: "4px",
                    padding: "1px 7px",
                    fontWeight: "600",
                  }}
                >
                  {results.redundant.length}
                </span>
              </div>
              {results.redundant.map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e4e7ec",
                    borderRadius: "8px",
                    padding: "12px 14px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      marginBottom: "8px",
                    }}
                  >
                    {item.tests?.map((t, j) => (
                      <span
                        key={j}
                        style={{
                          fontSize: "11px",
                          background: "#f4f6f8",
                          color: "#475569",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          border: "1px solid #e4e7ec",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      lineHeight: "1.5",
                    }}
                  >
                    {item.reason}
                  </div>
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

function RiskAssessmentTab({ onResults }) {
  const [description, setDescription] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bytesReceived, setBytesReceived] = useState(0);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null);

  const onResultsRef = useRef(onResults);

  useEffect(() => {
    const saved = loadTab("risk");
    if (saved) {
      if (saved.description) setDescription(saved.description);
      if (saved.results) {
        setResults(saved.results);
        onResultsRef.current && onResultsRef.current(saved.results.risks?.length || 0);
      }
    }
  }, []);

  // Persist input on change
  useEffect(() => {
    const saved = loadTab("risk") || {};
    saveTab("risk", { ...saved, description });
  }, [description]);

  const wordCount = description.trim() ? description.trim().split(/\s+/).length : 0;
  const canAnalyse = description.trim().length > 0 && !loading;
  const disabledHint = description.trim().length === 0 ? "Describe your feature or product above to continue" : null;

  const analyse = async () => {
    if (!canAnalyse) return;
    setLoading(true);
    setBytesReceived(0);
    setError(null);
    setResults(null);
    try {
      const parsed = await callClaude(buildRiskPrompt(description, loadProjectContext()), 6000, (n) => setBytesReceived(n));
      setResults(parsed);
      saveTab("risk", { results: parsed });
      onResults && onResults(parsed.risks?.length || 0);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      console.error("Risk assessment error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const overallMeta = results ? RISK_SCORE_META[results.overallRisk] : null;
  const priorityList = results?.risks
    ? [...results.risks].sort((a, b) => a.testPriority - b.testPriority)
    : [];

  return (
    <div>
      {/* Tab description */}
      <div style={{ marginBottom: "22px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>Risk Assessment</h2>
        <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
          Describe your feature and get a prioritised risk register across Functional, Security, Performance, Integration and more.
        </p>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
          <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Product / Feature Description
          </label>
          <span style={{ fontSize: "11px", color: wordCount >= 40 ? "#166534" : wordCount > 0 ? "#92400e" : "#94a3b8", fontWeight: wordCount >= 40 ? "600" : "400" }}>
            {wordCount === 0 ? "0 words" : wordCount >= 40 ? `✓ ${wordCount} words` : `${wordCount} words — more detail = more accurate risks`}
          </span>
        </div>
        <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 10px" }}>
          Include tech stack, user types, integrations, scale, and known constraints for the most accurate assessment.
        </p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={`Example:\n\nWe are building a mobile payment feature for a casual mobile game targeting 10M+ users. Players can purchase in-game currency (gems) using real money via Apple Pay, Google Pay, and credit cards. Purchases range from $0.99 to $99.99. The backend uses a Node.js microservice connected to Stripe. Transactions are logged in PostgreSQL. The feature includes a receipt system, parental controls for under-18 accounts, and regional pricing for 15 countries. The game runs on iOS 14+ and Android 8+.`}
          style={{ width: "100%", minHeight: "220px", background: "#ffffff", border: "1px solid #e4e7ec", borderRadius: "8px", color: "#1e293b", fontSize: "13.5px", lineHeight: "1.7", padding: "12px 14px", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
          onFocus={(e) => (e.target.style.borderColor = "#1558a0")}
          onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
        />
        <p style={{ fontSize: "11px", color: "#94a3b8", margin: "6px 0 0" }}>
          Covers: Functional · Technical · Performance · Security · Integration · UX · Data · Edge Case risks
        </p>
      </div>
      <div style={{ marginTop: "16px" }}>
        <GenerateButton onClick={analyse} disabled={!canAnalyse} loading={loading} label="Generate Risk Assessment →" loadingLabel="Analysing risks..." />
      </div>

      {disabledHint && !loading && (
        <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", margin: "8px 0 0" }}>{disabledHint}</p>
      )}

      {error && <p style={{ color: "#dc2626", fontSize: "13px", textAlign: "center", marginTop: "14px" }}>{error}</p>}

      {loading && <LoadingPanel tab="risk" bytesReceived={bytesReceived} />}

      {/* Empty state */}
      {!results && !loading && (
        <div style={{ marginTop: "40px", textAlign: "center", padding: "32px 24px", border: "1px dashed #d0d5dd", borderRadius: "12px", background: "#fafbfc" }}>
          <div style={{ fontSize: "28px", marginBottom: "12px" }}>🛡️</div>
          <p style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: "600", color: "#475569" }}>Your risk register will appear here</p>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>You'll get an overall risk score, a visual risk matrix, and a prioritised list of risks with mitigation actions.</p>
        </div>
      )}

      {results && (
        <div ref={resultsRef} style={{ marginTop: "36px" }}>
          <div
            style={{
              background: overallMeta.bg,
              border: `1px solid ${overallMeta.border}`,
              borderRadius: "10px",
              padding: "16px 20px",
              marginBottom: "28px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div
                style={{
                  fontSize: "11px",
                  color: overallMeta.color,
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "4px",
                }}
              >
                Overall Risk
              </div>
              <ScoreBadge score={results.overallRisk} />
            </div>
            <div
              style={{
                width: "1px",
                height: "40px",
                background: overallMeta.border,
                flexShrink: 0,
              }}
            />
            <p
              style={{
                fontSize: "13px",
                color: overallMeta.color,
                margin: 0,
                lineHeight: "1.6",
                flex: 1,
              }}
            >
              {results.summary}
            </p>
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexShrink: 0,
                flexWrap: "wrap",
              }}
            >
              {["Critical", "High", "Medium", "Low"].map((score) => {
                const count = results.risks.filter(
                  (r) => r.score === score,
                ).length;
                if (!count) return null;
                const m = RISK_SCORE_META[score];
                return (
                  <div
                    key={score}
                    style={{
                      textAlign: "center",
                      background: "rgba(255,255,255,0.7)",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: `1px solid ${m.border}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: m.color,
                        lineHeight: 1,
                      }}
                    >
                      {count}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: m.color,
                        marginTop: "2px",
                        fontWeight: "600",
                      }}
                    >
                      {score}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <RiskMatrix risks={results.risks} />

          <div style={{ marginBottom: "28px" }}>
            <SectionLabel>Test Priority Order</SectionLabel>
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e4e7ec",
                borderRadius: "10px",
                padding: "14px 16px",
              }}
            >
              {priorityList.map((risk, i) => {
                const meta = RISK_SCORE_META[risk.score];
                return (
                  <div
                    key={risk.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "8px 0",
                      borderBottom:
                        i < priorityList.length - 1
                          ? "1px solid #f1f5f9"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: meta.bg,
                        border: `2px solid ${meta.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: meta.color,
                        }}
                      >
                        {i + 1}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "#1e293b",
                        }}
                      >
                        {risk.name}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#94a3b8",
                          marginLeft: "8px",
                        }}
                      >
                        {risk.category}
                      </span>
                    </div>
                    <ScoreBadge score={risk.score} />
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <SectionLabel>Risk Register</SectionLabel>
            {priorityList.map((risk) => (
              <RiskCard key={risk.id} risk={risk} />
            ))}
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
  const [bytesReceived, setBytesReceived] = useState(0);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const saved = loadTab("docs");
    if (saved) {
      if (saved.input) setInput(saved.input);
      if (saved.docMode) setDocMode(saved.docMode);
      if (saved.results) setResults(saved.results);
    }
  }, []);

  // Persist input fields on change
  useEffect(() => {
    const saved = loadTab("docs") || {};
    saveTab("docs", { ...saved, input, docMode });
  }, [input, docMode]);

  const canGenerate = input.trim().length > 0 && !loading;
  const currentMode = DOC_MODES.find((m) => m.id === docMode);

  const promptBuilders = {
    testplan: buildTestPlanPrompt,
    onboarding: buildOnboardingPrompt,
    automation: buildAutomationPrompt,
  };

  const generate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setBytesReceived(0);
    setError(null);
    setResults(null);
    try {
      const parsed = await callClaude(promptBuilders[docMode](input, loadProjectContext()), 4000, (n) => setBytesReceived(n));
      const r = { type: docMode, data: parsed };
      setResults(r);
      saveTab("docs", { results: r });
      setTimeout(
        () => resultsRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (err) {
      console.error("Documentation error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s) =>
    s >= 70 ? "#166534" : s >= 40 ? "#92400e" : "#991b1b";
  const scoreBg = (s) =>
    s >= 70 ? "#f0fdf4" : s >= 40 ? "#fef3c7" : "#fee2e2";

  return (
    <div>
      {/* Tab description */}
      <div style={{ marginBottom: "22px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>Documentation</h2>
        <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
          Generate formal QA documents — test plans, feature onboarding guides, and automation strategy reports.
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <SectionLabel>Document Type</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
          }}
        >
          {DOC_MODES.map((m) => {
            const active = docMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setDocMode(m.id);
                  setInput("");
                  setResults(null);
                }}
                style={{
                  background: active ? "#e6f1fb" : "#ffffff",
                  border: `${active ? "2px" : "1px"} solid ${active ? "#185fa5" : "#dde1e7"}`,
                  borderRadius: "8px",
                  padding: "14px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                  outline: "none",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: active ? "#185fa5" : "#64748b",
                    marginBottom: "4px",
                  }}
                >
                  {m.label}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: active ? "#185fa5" : "#94a3b8",
                    opacity: active ? 0.8 : 1,
                  }}
                >
                  {m.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            display: "block",
            marginBottom: "8px",
          }}
        >
          {currentMode.label} Input
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={currentMode.placeholder}
          style={{
            width: "100%",
            minHeight: "180px",
            background: "#ffffff",
            border: "1px solid #e4e7ec",
            borderRadius: "8px",
            color: "#1e293b",
            fontSize: "13.5px",
            lineHeight: "1.7",
            padding: "12px 14px",
            resize: "vertical",
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#1558a0")}
          onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
        />
      </div>

      <GenerateButton
        onClick={generate}
        disabled={!canGenerate}
        loading={loading}
        label={`Generate ${currentMode.label} →`}
        loadingLabel={`Generating ${currentMode.label}...`}
      />
      {!canGenerate && !loading && (
        <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", margin: "8px 0 0" }}>
          Add your feature or epic description above to continue
        </p>
      )}
      {error && (
        <p style={{ color: "#dc2626", fontSize: "13px", textAlign: "center", marginTop: "14px" }}>{error}</p>
      )}

      {loading && <LoadingPanel tab="docs" bytesReceived={bytesReceived} />}

      {/* Empty state */}
      {!results && !loading && (
        <div style={{ marginTop: "40px", textAlign: "center", padding: "32px 24px", border: "1px dashed #d0d5dd", borderRadius: "12px", background: "#fafbfc" }}>
          <div style={{ fontSize: "28px", marginBottom: "12px" }}>📄</div>
          <p style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: "600", color: "#475569" }}>Your document will appear here</p>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>Choose a document type, describe your feature, and get a structured, ready-to-share QA document.</p>
        </div>
      )}

      {results && (
        <div ref={resultsRef} style={{ marginTop: "36px" }}>
          {/* Test Plan */}
          {results.type === "testplan" && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e4e7ec",
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>{results.data.title}</h2>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>Version {results.data.version}</p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button onClick={() => exportDocMD(results.data.title, results.data.sections)} style={{ background: "#ffffff", border: "1px solid #dde1e7", borderRadius: "6px", padding: "5px 11px", color: "#64748b", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>⬇ Markdown</button>
                  <button onClick={() => { setResults(null); clearTab("docs"); }} style={{ background: "none", border: "1px solid #fca5a5", borderRadius: "6px", padding: "5px 10px", color: "#dc2626", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Clear</button>
                  <span style={{ fontSize: "11px", color: "#94a3b8", background: "#f8fafc", border: "1px solid #e4e7ec", padding: "4px 10px", borderRadius: "6px" }}>Test Plan</span>
                </div>
              </div>
              {results.data.sections?.map((s, i) => (
                <DocSection key={i} heading={s.heading} content={s.content} />
              ))}
            </div>
          )}

          {/* Onboarding Doc */}
          {results.type === "onboarding" && (
            <div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid #e4e7ec", flexWrap: "wrap", gap: "10px" }}>
                <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>{results.data.title}</h2>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button onClick={() => exportDocMD(results.data.title, results.data.sections)} style={{ background: "#ffffff", border: "1px solid #dde1e7", borderRadius: "6px", padding: "5px 11px", color: "#64748b", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>⬇ Markdown</button>
                  <button onClick={() => { setResults(null); clearTab("docs"); }} style={{ background: "none", border: "1px solid #fca5a5", borderRadius: "6px", padding: "5px 10px", color: "#dc2626", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Clear</button>
                  <span style={{ fontSize: "11px", color: "#94a3b8", background: "#f8fafc", border: "1px solid #e4e7ec", padding: "4px 10px", borderRadius: "6px" }}>QA Feature Guide</span>
                </div>
              </div>
              {results.data.sections?.map((s, i) => (
                <DocSection key={i} heading={s.heading} content={s.content} />
              ))}
            </div>
          )}

          {/* Automation Plan */}
          {results.type === "automation" && (
            <div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginBottom: "14px" }}>
                <button onClick={() => { const sections = [{heading:"Summary",content:results.data.summary},{heading:"Automate",content:(results.data.automate||[]).map(i=>`${i.name} (${i.level}, ${i.priority})\n${i.reason}\n→ ${i.approach||""}`).join("\n\n")},{heading:"Keep Manual",content:(results.data.avoid||[]).map(i=>`${i.name}\n${i.reason}`).join("\n\n")}]; exportDocMD("Automation Plan", sections); }} style={{ background: "#ffffff", border: "1px solid #dde1e7", borderRadius: "6px", padding: "5px 11px", color: "#64748b", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>⬇ Markdown</button>
                <button onClick={() => { setResults(null); clearTab("docs"); }} style={{ background: "none", border: "1px solid #fca5a5", borderRadius: "6px", padding: "5px 10px", color: "#dc2626", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Clear</button>
              </div>
              <div
                style={{
                  background: scoreBg(results.data.automationScore),
                  border: "1px solid #e4e7ec",
                  borderRadius: "10px",
                  padding: "16px 20px",
                  marginBottom: "28px",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "800",
                      color: scoreColor(results.data.automationScore),
                      lineHeight: 1,
                    }}
                  >
                    {results.data.automationScore}%
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      marginTop: "3px",
                    }}
                  >
                    Automation Fit
                  </div>
                </div>
                <div
                  style={{
                    width: "1px",
                    height: "40px",
                    background: "#e2e8f0",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      height: "8px",
                      background: "#f4f6f8",
                      borderRadius: "4px",
                      overflow: "hidden",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${results.data.automationScore}%`,
                        background: scoreColor(results.data.automationScore),
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#475569",
                      margin: 0,
                      lineHeight: "1.5",
                    }}
                  >
                    {results.data.summary}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                  <div
                    style={{
                      textAlign: "center",
                      background: "#e6f1fb",
                      padding: "8px 14px",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#185fa5",
                        lineHeight: 1,
                      }}
                    >
                      {results.data.automate?.length || 0}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#185fa5",
                        marginTop: "2px",
                        fontWeight: "600",
                      }}
                    >
                      Automate
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      background: "#fee2e2",
                      padding: "8px 14px",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#991b1b",
                        lineHeight: 1,
                      }}
                    >
                      {results.data.avoid?.length || 0}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#991b1b",
                        marginTop: "2px",
                        fontWeight: "600",
                      }}
                    >
                      Stay Manual
                    </div>
                  </div>
                </div>
              </div>

              {results.data.automate?.length > 0 && (
                <div style={{ marginBottom: "28px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "14px",
                      paddingBottom: "10px",
                      borderBottom: "1px solid #e4e7ec",
                    }}
                  >
                    <span>✓</span>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#1e293b",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Automate These
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        background: "#e6f1fb",
                        color: "#185fa5",
                        borderRadius: "4px",
                        padding: "1px 7px",
                        fontWeight: "600",
                      }}
                    >
                      {results.data.automate.length}
                    </span>
                  </div>
                  {results.data.automate.map((item, i) => (
                    <AutomationCard key={i} item={item} type="automate" />
                  ))}
                </div>
              )}

              {results.data.avoid?.length > 0 && (
                <div style={{ marginBottom: "28px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "14px",
                      paddingBottom: "10px",
                      borderBottom: "1px solid #e4e7ec",
                    }}
                  >
                    <span>✕</span>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#1e293b",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Keep Manual
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        background: "#fee2e2",
                        color: "#991b1b",
                        borderRadius: "4px",
                        padding: "1px 7px",
                        fontWeight: "600",
                      }}
                    >
                      {results.data.avoid.length}
                    </span>
                  </div>
                  {results.data.avoid.map((item, i) => (
                    <AutomationCard key={i} item={item} type="avoid" />
                  ))}
                </div>
              )}

              {results.data.frameworkSuggestions?.length > 0 && (
                <div style={{ marginBottom: "28px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "14px",
                      paddingBottom: "10px",
                      borderBottom: "1px solid #e4e7ec",
                    }}
                  >
                    <span>⚙</span>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#1e293b",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Suggested Tooling
                    </span>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "10px",
                    }}
                  >
                    {results.data.frameworkSuggestions.map((fs, i) => {
                      const levelColors = {
                        E2E: { bg: "#eeedfe", color: "#534ab7" },
                        API: { bg: "#e6f1fb", color: "#185fa5" },
                        Unit: { bg: "#faeeda", color: "#854f0b" },
                        Integration: { bg: "#f0fdf4", color: "#166534" },
                      };
                      const lc = levelColors[fs.level] || levelColors.E2E;
                      return (
                        <div
                          key={i}
                          style={{
                            background: "#ffffff",
                            border: "1px solid #e4e7ec",
                            borderRadius: "8px",
                            padding: "14px",
                          }}
                        >
                          <div style={{ marginBottom: "8px" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "700",
                                padding: "2px 7px",
                                borderRadius: "4px",
                                background: lc.bg,
                                color: lc.color,
                                textTransform: "uppercase",
                              }}
                            >
                              {fs.level}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "6px",
                              marginBottom: "8px",
                            }}
                          >
                            {fs.tools?.map((t, j) => (
                              <span
                                key={j}
                                style={{
                                  fontSize: "12px",
                                  background: "#f8fafc",
                                  border: "1px solid #e4e7ec",
                                  color: "#475569",
                                  padding: "3px 8px",
                                  borderRadius: "4px",
                                  fontWeight: "500",
                                }}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#94a3b8",
                              margin: 0,
                              lineHeight: "1.5",
                            }}
                          >
                            {fs.reason}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {results.data.recommendations?.length > 0 && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "14px",
                      paddingBottom: "10px",
                      borderBottom: "1px solid #e4e7ec",
                    }}
                  >
                    <span>💡</span>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#1e293b",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Strategy Recommendations
                    </span>
                  </div>
                  {results.data.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: "12px",
                        marginBottom: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#185fa5",
                          fontFamily: "monospace",
                          minWidth: "20px",
                          fontWeight: "700",
                          marginTop: "1px",
                        }}
                      >
                        {i + 1}.
                      </span>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#475569",
                          lineHeight: "1.6",
                          margin: 0,
                        }}
                      >
                        {rec}
                      </p>
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

// ─── JIRA TAB ─────────────────────────────────────────────────────────────────

function JqlCard({ item, index }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const categoryColors = {
    "Bug Tracking":      { bg: "#fcebeb", color: "#a32d2d" },
    "Sprint Health":     { bg: "#e6f1fb", color: "#185fa5" },
    "Release Readiness": { bg: "#eeedfe", color: "#534ab7" },
    "Team Workload":     { bg: "#faeeda", color: "#854f0b" },
    "QA Metrics":        { bg: "#f0fdf4", color: "#166534" },
    "Custom":            { bg: "#f1f5f9", color: "#475569" },
    "Regression":        { bg: "#faeeda", color: "#854f0b" },
  };
  const cc = categoryColors[item.category] || categoryColors["Custom"];

  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.jql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => setOpen(!open)}
      style={{ background: open ? "#f8fafc" : "#ffffff", border: `1px solid ${open ? "#c8d0da" : "#e4e7ec"}`, borderRadius: "8px", padding: "12px 14px", cursor: "pointer", transition: "all 0.15s", marginBottom: "8px" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ color: "#94a3b8", fontFamily: "monospace", fontSize: "11px", minWidth: "24px" }}>
          #{String(index + 1).padStart(2, "0")}
        </span>
        <span style={{ fontSize: "10px", fontWeight: "600", padding: "2px 7px", borderRadius: "4px", background: cc.bg, color: cc.color, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
          {item.category}
        </span>
        <span style={{ color: "#1e293b", fontSize: "13px", flex: 1, fontWeight: "500" }}>{item.name || item.title}</span>
        <button onClick={copy} style={{ fontSize: "11px", color: copied ? "#166534" : "#64748b", background: copied ? "#f0fdf4" : "#f8fafc", border: `1px solid ${copied ? "#86efac" : "#dde1e7"}`, borderRadius: "4px", padding: "3px 8px", cursor: "pointer", whiteSpace: "nowrap", fontWeight: "600" }}>
          {copied ? "✓ Copied" : "Copy JQL"}
        </button>
        <span style={{ color: "#94a3b8", fontSize: "11px" }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e4e7ec" }}>
          <div style={{ marginBottom: "12px" }}>
            <p style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>JQL Query</p>
            <pre style={{ background: "#0f172a", color: "#7dd3fc", fontSize: "12px", padding: "10px 14px", borderRadius: "6px", fontFamily: "monospace", whiteSpace: "pre-wrap", margin: 0, lineHeight: "1.6" }}>
              {item.jql}
            </pre>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <p style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>How it works</p>
            <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6", margin: 0 }}>{item.explanation}</p>
          </div>
          <div style={{ background: "#f8fafc", border: "1px solid #e4e7ec", borderLeft: "3px solid #1558a0", borderRadius: "6px", padding: "8px 12px" }}>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#185fa5", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 4px" }}>💡 Purpose</p>
            <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5", margin: 0 }}>{item.purpose}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function GadgetCard({ g }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!g.filter) return;
    navigator.clipboard.writeText(g.filter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e4e7ec", borderRadius: "8px", padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
        <div>
          <p style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", margin: "0 0 2px" }}>{g.title || g.name}</p>
          <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0, fontStyle: "italic" }}>{g.name}</p>
        </div>
        {g.filter && (
          <button onClick={copy} style={{ fontSize: "11px", color: copied ? "#166534" : "#64748b", background: copied ? "#f0fdf4" : "#f8fafc", border: `1px solid ${copied ? "#86efac" : "#dde1e7"}`, borderRadius: "4px", padding: "3px 8px", cursor: "pointer", whiteSpace: "nowrap", fontWeight: "600", flexShrink: 0 }}>
            {copied ? "✓" : "Copy JQL"}
          </button>
        )}
      </div>
      {g.filter && (
        <pre style={{ background: "#0f172a", color: "#7dd3fc", fontSize: "11px", padding: "6px 10px", borderRadius: "4px", fontFamily: "monospace", whiteSpace: "pre-wrap", margin: "8px 0", lineHeight: "1.5" }}>{g.filter}</pre>
      )}
      {g.insight && <p style={{ fontSize: "11px", color: "#185fa5", margin: "0 0 4px", lineHeight: "1.4", fontStyle: "italic" }}>💡 {g.insight}</p>}
      <p style={{ fontSize: "11px", color: "#64748b", margin: 0, lineHeight: "1.4" }}>⚙ {g.config}</p>
    </div>
  );
}

function AutomationRuleCard({ rule, index }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyRule = (e) => {
    e.stopPropagation();
    const text = [
      `Rule: ${rule.title}`,
      `Trigger: ${rule.trigger}`,
      rule.conditions ? `Conditions: ${rule.conditions}` : null,
      `Action: ${rule.action}`,
      `Benefit: ${rule.benefit}`,
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => setOpen(!open)}
      style={{ background: open ? "#f8fafc" : "#ffffff", border: `1px solid ${open ? "#c8d0da" : "#e4e7ec"}`, borderLeft: "4px solid #534ab7", borderRadius: "8px", padding: "12px 14px", cursor: "pointer", transition: "all 0.15s", marginBottom: "8px" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ color: "#94a3b8", fontFamily: "monospace", fontSize: "11px", minWidth: "24px" }}>
          #{String(index + 1).padStart(2, "0")}
        </span>
        <span style={{ color: "#1e293b", fontSize: "13px", flex: 1, fontWeight: "500" }}>{rule.title}</span>
        <button onClick={copyRule} style={{ fontSize: "11px", color: copied ? "#166534" : "#64748b", background: copied ? "#f0fdf4" : "#f8fafc", border: `1px solid ${copied ? "#86efac" : "#dde1e7"}`, borderRadius: "4px", padding: "3px 8px", cursor: "pointer", whiteSpace: "nowrap", fontWeight: "600" }}>
          {copied ? "✓ Copied" : "Copy Rule"}
        </button>
        <span style={{ color: "#94a3b8", fontSize: "11px" }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e4e7ec" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <div style={{ background: "#fef3c7", borderRadius: "8px", padding: "10px 12px" }}>
              <p style={{ fontSize: "11px", color: "#92400e", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>⚡ Trigger</p>
              <p style={{ fontSize: "13px", color: "#92400e", margin: 0, lineHeight: "1.5" }}>{rule.trigger}</p>
            </div>
            <div style={{ background: "#e6f1fb", borderRadius: "8px", padding: "10px 12px" }}>
              <p style={{ fontSize: "11px", color: "#185fa5", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>→ Action</p>
              <p style={{ fontSize: "13px", color: "#185fa5", margin: 0, lineHeight: "1.5" }}>{rule.action}</p>
            </div>
          </div>
          {rule.conditions && (
            <div style={{ marginBottom: "10px", background: "#f8fafc", border: "1px solid #e4e7ec", borderRadius: "6px", padding: "8px 12px" }}>
              <p style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 4px" }}>⚙ Conditions</p>
              <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5", margin: 0 }}>{rule.conditions}</p>
            </div>
          )}
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "6px", padding: "8px 12px" }}>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#166534", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>✓ Benefit</p>
            <p style={{ fontSize: "13px", color: "#166534", lineHeight: "1.5", margin: 0 }}>{rule.benefit}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function JiraTab() {
  const [description, setDescription] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bytesReceived, setBytesReceived] = useState(0);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const saved = loadTab("jira");
    if (saved) {
      if (saved.description) setDescription(saved.description);
      if (saved.results) setResults(saved.results);
    }
  }, []);

  // Persist input on change
  useEffect(() => {
    const saved = loadTab("jira") || {};
    saveTab("jira", { ...saved, description });
  }, [description]);

  const canGenerate = description.trim().length > 0 && !loading;

  const generate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setBytesReceived(0);
    setError(null);
    setResults(null);
    try {
      const parsed = await callClaude(buildJiraPrompt(description, loadProjectContext()), 8000, (n) => setBytesReceived(n));
      setResults(parsed);
      saveTab("jira", { results: parsed });
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      console.error("Jira tab error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportJiraMD = () => {
    if (!results) return;
    const lines = ["# Jira Strategy\n", `${results.summary}\n`];
    if (results.dashboards?.length) {
      lines.push("## Dashboards\n");
      results.dashboards.forEach(d => {
        lines.push(`### ${d.name}`);
        lines.push(`**Audience:** ${d.audience}`);
        lines.push(`**Purpose:** ${d.purpose}\n`);
        d.gadgets?.forEach(g => {
          lines.push(`#### ${g.title || g.name} _(${g.name})_`);
          if (g.filter) lines.push(`\`\`\`jql\n${g.filter}\n\`\`\``);
          if (g.insight) lines.push(`💡 ${g.insight}`);
          lines.push(`⚙ ${g.config}\n`);
        });
      });
    }
    if (results.filters?.length) {
      lines.push("## Saved Filters\n");
      results.filters.forEach(f => {
        lines.push(`### ${f.name || f.title} — ${f.category}`);
        lines.push(`\`\`\`jql\n${f.jql}\n\`\`\``);
        lines.push(`${f.explanation}\n`);
        lines.push(`**Purpose:** ${f.purpose}\n`);
      });
    }
    if (results.automation?.length) {
      lines.push("## Automation Rules\n");
      results.automation.forEach(r => {
        lines.push(`### ${r.title}`);
        lines.push(`- **Trigger:** ${r.trigger}`);
        if (r.conditions) lines.push(`- **Conditions:** ${r.conditions}`);
        lines.push(`- **Action:** ${r.action}`);
        lines.push(`- **Benefit:** ${r.benefit}\n`);
      });
    }
    if (results.boardTips?.length) {
      lines.push("## Board Configuration Tips\n");
      results.boardTips.forEach((t, i) => lines.push(`${i + 1}. ${t}\n`));
    }
    downloadFile("jira-strategy.md", lines.join("\n"), "text/markdown");
  };

  const clearResults = () => { setResults(null); clearTab("jira"); };

  return (
    <div>
      <div style={{ marginBottom: "22px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>Jira & JQL</h2>
        <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
          Describe your team and project — get custom dashboards, saved JQL filters, automation rules, and board tips.
        </p>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>
          Describe Your Team & Goals
        </label>
        <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 10px" }}>
          Describe your team structure, project type, and what you want to track or improve in Jira. The more context you give, the more targeted the output.
        </p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={`What to include:\n\n- What the project is (mobile game, SaaS platform, e-commerce)\n- What you want to track or have visibility on (release readiness, regression health, bug escape rate)\n- Current pain points (hard to filter bugs by version, no dashboard for test cycle progress)\n- Sprint or release cycle info if relevant\n- Any tools you integrate with (Slack, Confluence, CI pipeline)\n- Whether you use Scrum or Kanban, team-managed or company-managed Jira\n\nExample:\nWe are building a multiplayer mobile game. We run 2-week sprints and release to stores every 6 weeks. We need dashboards that show regression test status per build, which critical bugs are blocking release, and how test coverage maps to new features in the sprint. We struggle to see at a glance whether we are safe to release. We use Slack and have a Jenkins CI pipeline.`}
          style={{ width: "100%", minHeight: "220px", background: "#ffffff", border: "1px solid #e4e7ec", borderRadius: "8px", color: "#1e293b", fontSize: "13.5px", lineHeight: "1.7", padding: "12px 14px", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
          onFocus={(e) => (e.target.style.borderColor = "#1558a0")}
          onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
        />
      </div>

      <div style={{ marginTop: "16px" }}>
        <GenerateButton onClick={generate} disabled={!canGenerate} loading={loading} label="Generate Jira Strategy →" loadingLabel="Building your Jira strategy..." />
      </div>

      {!canGenerate && !loading && (
        <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", margin: "8px 0 0" }}>
          Describe your team and project above to continue
        </p>
      )}

      {error && <p style={{ color: "#dc2626", fontSize: "13px", textAlign: "center", marginTop: "14px" }}>{error}</p>}
      {loading && <LoadingPanel tab="jira" bytesReceived={bytesReceived} />}

      {!results && !loading && (
        <div style={{ marginTop: "40px", textAlign: "center", padding: "32px 24px", border: "1px dashed #d0d5dd", borderRadius: "12px", background: "#fafbfc" }}>
          <div style={{ fontSize: "28px", marginBottom: "12px" }}>📊</div>
          <p style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: "600", color: "#475569" }}>Your Jira strategy will appear here</p>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>You'll get dashboard layouts, ready-to-use JQL filters with copy buttons, automation rules, and board configuration tips tailored to your project.</p>
        </div>
      )}

      {results && (
        <div ref={resultsRef} style={{ marginTop: "36px" }}>

          {/* Results header */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={exportJiraMD} style={{ background: "#ffffff", border: "1px solid #dde1e7", borderRadius: "6px", padding: "5px 11px", color: "#64748b", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>⬇ Markdown</button>
            <button onClick={clearResults} style={{ background: "none", border: "1px solid #fca5a5", borderRadius: "6px", padding: "5px 10px", color: "#dc2626", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Clear</button>
          </div>

          {/* Summary */}
          <div style={{ background: "#e6f1fb", border: "1px solid #93c5fd", borderRadius: "10px", padding: "14px 18px", marginBottom: "28px" }}>
            <p style={{ fontSize: "13px", color: "#185fa5", lineHeight: "1.6", margin: 0 }}>{results.summary}</p>
          </div>

          {/* Dashboards */}
          {results.dashboards?.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #e4e7ec" }}>
                <span style={{ fontSize: "16px" }}>📊</span>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Dashboards</span>
                <span style={{ fontSize: "11px", background: "#e6f1fb", color: "#185fa5", borderRadius: "4px", padding: "1px 7px", fontWeight: "600" }}>{results.dashboards.length}</span>
              </div>
              {results.dashboards.map((dash, di) => (
                <div key={di} style={{ marginBottom: "24px", border: "1px solid #e4e7ec", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ background: "#f8fafc", borderBottom: "1px solid #e4e7ec", padding: "12px 16px" }}>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", margin: "0 0 2px" }}>{dash.name}</p>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 4px" }}>👤 {dash.audience}</p>
                    <p style={{ fontSize: "12px", color: "#475569", margin: 0, lineHeight: "1.5" }}>{dash.purpose}</p>
                  </div>
                  <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                    {dash.gadgets?.map((g, gi) => <GadgetCard key={gi} g={g} />)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Saved Filters */}
          {results.filters?.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #e4e7ec" }}>
                <span style={{ fontSize: "16px" }}>🔍</span>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Saved Filters</span>
                <span style={{ fontSize: "11px", background: "#e6f1fb", color: "#185fa5", borderRadius: "4px", padding: "1px 7px", fontWeight: "600" }}>{results.filters.length}</span>
                <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "4px" }}>click any filter to expand</span>
              </div>
              {results.filters.map((item, i) => <JqlCard key={i} item={item} index={i} />)}
            </div>
          )}

          {/* Automation Rules */}
          {results.automation?.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #e4e7ec" }}>
                <span style={{ fontSize: "16px" }}>⚡</span>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Automation Rules</span>
                <span style={{ fontSize: "11px", background: "#eeedfe", color: "#534ab7", borderRadius: "4px", padding: "1px 7px", fontWeight: "600" }}>{results.automation.length}</span>
              </div>
              {results.automation.map((rule, i) => <AutomationRuleCard key={i} rule={rule} index={i} />)}
            </div>
          )}

          {/* Board Tips */}
          {results.boardTips?.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #e4e7ec" }}>
                <span style={{ fontSize: "16px" }}>🗂</span>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Board Configuration Tips</span>
              </div>
              {results.boardTips.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "12px", color: "#185fa5", fontFamily: "monospace", minWidth: "20px", fontWeight: "700", marginTop: "2px" }}>{i + 1}.</span>
                  <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6", margin: 0 }}>{tip}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

const TAB_META = [
  {
    id: "generator",
    label: "Test Generator",
    tooltip: "Generate functional, edge, negative & BDD test cases from a user story",
    icon: (color) => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    id: "gap",
    label: "Gap Detector",
    tooltip: "Paste existing tests to find what's missing, weak, or redundant",
    icon: (color) => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    id: "risk",
    label: "Risk Assessment",
    tooltip: "Analyse impact & likelihood across 8 risk categories",
    icon: (color) => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    id: "docs",
    label: "Documentation",
    tooltip: "Generate test plans, feature guides & automation strategies",
    icon: (color) => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
  },
  {
    id: "jira",
    label: "Jira & JQL",
    tooltip: "Get dashboards, saved filters & automation rules for your project",
    icon: (color) => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
  },
];

function Tab({ tab, active, onClick, resultCount }) {
  const [hovered, setHovered] = useState(false);
  const iconColor = active ? "#1558a0" : hovered ? "#1e293b" : "#64748b";

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          padding: "9px 16px",
          background: active ? "#ffffff" : hovered ? "#d8dde5" : "#e2e6ec",
          border: active ? "1px solid #d0d5dd" : "1px solid #c4cad4",
          borderBottom: active ? "1px solid #ffffff" : "1px solid #c4cad4",
          borderRadius: "8px 8px 0 0",
          color: active ? "#1558a0" : hovered ? "#1e293b" : "#475569",
          fontSize: "13px",
          fontWeight: active ? "600" : "500",
          cursor: "pointer",
          transition: "all 0.15s",
          outline: "none",
          marginBottom: active ? "-1px" : "0",
          position: "relative",
          zIndex: active ? 1 : 0,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          whiteSpace: "nowrap",
        }}
      >
        {tab.icon(iconColor)}
        {tab.label}
        {resultCount > 0 && (
          <span style={{
            fontSize: "10px",
            fontWeight: "700",
            padding: "1px 6px",
            borderRadius: "99px",
            background: active ? "#1558a0" : "#64748b",
            color: "#ffffff",
            lineHeight: "16px",
            minWidth: "18px",
            textAlign: "center",
          }}>
            {resultCount}
          </span>
        )}
      </button>

      {/* Tooltip */}
      {hovered && !active && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 10px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#1e293b",
          color: "#f8fafc",
          fontSize: "11px",
          lineHeight: "1.5",
          padding: "6px 10px",
          borderRadius: "6px",
          whiteSpace: "normal",
          zIndex: 100,
          pointerEvents: "none",
          width: "200px",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}>
          {tab.tooltip}
          <div style={{
            position: "absolute",
            top: "-4px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "8px",
            height: "8px",
            background: "#1e293b",
            borderRadius: "1px",
            rotate: "45deg",
          }} />
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS MODAL ──────────────────────────────────────────────────────────

function SettingsModal({ onClose }) {
  const [ctx, setCtx] = useState(loadProjectContext);
  const [saved, setSaved] = useState(false);

  const field = (key, label, placeholder, rows = 1) => (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "5px" }}>
        {label}
      </label>
      {rows === 1 ? (
        <input
          value={ctx[key]}
          onChange={e => setCtx(p => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder}
          style={{
            width: "100%", padding: "8px 10px", border: "1px solid #dde1e7",
            borderRadius: "7px", fontSize: "13px", color: "#1e293b",
            background: "#fafbfc", outline: "none", boxSizing: "border-box",
          }}
        />
      ) : (
        <textarea
          value={ctx[key]}
          onChange={e => setCtx(p => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder}
          rows={rows}
          style={{
            width: "100%", padding: "8px 10px", border: "1px solid #dde1e7",
            borderRadius: "7px", fontSize: "13px", color: "#1e293b",
            background: "#fafbfc", outline: "none", resize: "vertical",
            boxSizing: "border-box", fontFamily: "inherit", lineHeight: "1.5",
          }}
        />
      )}
    </div>
  );

  const handleSave = () => {
    saveProjectContext(ctx);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleClear = () => {
    setCtx(EMPTY_CONTEXT);
    saveProjectContext(EMPTY_CONTEXT);
  };

  const hasContent = Object.values(ctx).some(v => v.trim().length > 0);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
        zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#ffffff", borderRadius: "14px", width: "100%", maxWidth: "480px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden",
        }}
      >
        {/* Modal header */}
        <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>Project Context</h2>
            <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#94a3b8" }}>
              Saved once — applied silently to every generation
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px", lineHeight: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Fields */}
        <div style={{ padding: "20px 22px" }}>
          {field("productName", "Product Name", "e.g. Payments Portal, Mobile Banking App")}
          {field("domain", "Domain", "e.g. Fintech, Gaming, E-commerce, Telecoms, SaaS")}
          {field("techStack", "Tech Stack", "e.g. React Native, Node.js, PostgreSQL, AWS", 2)}
          {field("targetUsers", "Target Users", "e.g. SME business owners, non-technical, Southeast Asia")}
          {field("keyRisks", "Key Risk Areas", "e.g. Payments, KYC, Real-time sync, Authentication", 2)}

          <p style={{ margin: "0 0 16px", fontSize: "11px", color: "#94a3b8", fontStyle: "italic" }}>
            Leave blank any fields that don't apply. Context is optional — all tabs work without it.
          </p>

          {/* Actions */}
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            {hasContent && (
              <button
                onClick={handleClear}
                style={{
                  padding: "8px 14px", borderRadius: "7px", border: "1px solid #dde1e7",
                  background: "#ffffff", color: "#64748b", fontSize: "13px",
                  fontWeight: "600", cursor: "pointer",
                }}
              >
                Clear
              </button>
            )}
            <button
              onClick={handleSave}
              style={{
                padding: "8px 20px", borderRadius: "7px", border: "none",
                background: saved ? "#166534" : "#1558a0", color: "#ffffff",
                fontSize: "13px", fontWeight: "600", cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              {saved ? "✓ Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QAKickstart() {
  const [activeTab, setActiveTab] = useState("generator");
  const [tabResults, setTabResults] = useState({});
  const [showSettings, setShowSettings] = useState(false);

  const setTabResultCount = (tabId, count) => {
    setTabResults(prev => ({ ...prev, [tabId]: count }));
  };

  const hasContext = Object.values(loadProjectContext()).some(v => v.trim().length > 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ebeef2",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        color: "#1e293b",
      }}
    >
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {/* Header */}
      <div style={{ background: "#ebeef2", padding: "20px 32px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "9px",
              background: "#1558a0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(21,88,160,0.35)",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>QA Kickstart</h1>
            <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>by a QA, for every QA</p>
          </div>
          {/* Project Context button */}
          <button
            onClick={() => setShowSettings(true)}
            style={{
              background: hasContext ? "#e6f1fb" : "#ffffff",
              border: `1px solid ${hasContext ? "#93c5fd" : "#dde1e7"}`,
              borderRadius: "8px",
              height: "34px",
              padding: "0 12px 0 9px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={hasContext ? "#185fa5" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            <span style={{ fontSize: "12px", fontWeight: "600", color: hasContext ? "#185fa5" : "#64748b", whiteSpace: "nowrap" }}>
              {hasContext ? "Project set" : "Set project context"}
            </span>
            {hasContext && (
              <div style={{
                position: "absolute", top: "-3px", right: "-3px",
                width: "8px", height: "8px", borderRadius: "50%",
                background: "#1558a0", border: "1.5px solid #ebeef2",
              }} />
            )}
          </button>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: "4px", alignItems: "flex-end", overflowX: "auto" }}>
          {TAB_META.map((tab) => (
            <Tab
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              resultCount={tabResults[tab.id] || 0}
            />
          ))}
        </div>
      </div>

      {/* Content panel */}
      <div style={{ background: "#ffffff", borderTop: "1px solid #d0d5dd" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "28px 24px" }}>
          {activeTab === "generator" && <GeneratorTab onResults={(n) => setTabResultCount("generator", n)} />}
          {activeTab === "gap" && <GapDetectorTab onResults={(n) => setTabResultCount("gap", n)} />}
          {activeTab === "risk" && <RiskAssessmentTab onResults={(n) => setTabResultCount("risk", n)} />}
          {activeTab === "docs" && <DocumentationTab />}
          {activeTab === "jira" && <JiraTab />}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.75; } } * { box-sizing: border-box; }`}</style>
    </div>
  );
}