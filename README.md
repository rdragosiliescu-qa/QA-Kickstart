# QA Kickstart

An AI-powered tool built for fun — and to help QAs think better, not just work faster.

There are already tools that generate test cases. This goes a bit further.

---

## The Idea

Every generated test case includes a **"Why it matters"** — a plain English explanation of what risk it covers and what breaks in production if you skip it. The kind of insight you'd normally only get from experience.

The goal isn't to replace QA thinking. It's to build it.

---

## What It Does

### Test Generator
Paste a user story, multiple stories, or a full epic. Select your test types and get fully written test cases with steps, expected results, and a "Why it matters" for each one.

- Single story, multiple stories, or epic/feature mode
- Functional, Edge Case, Negative, and BDD/Gherkin output
- AI decides how many test cases are needed based on complexity
- Edit individual test cases inline
- Export to CSV, JSON, or Markdown

### Gap Detector
Paste your feature description and your existing test case titles. The tool analyses your coverage and returns:

- A coverage score (0–100)
- Missing test cases — fully written with steps and expected results
- Weak areas — tests that exist but need more depth
- Redundant tests — duplicates worth consolidating
- Export the full report to Markdown

### Risk Assessment
Paste your product or feature description. Get back:

- A visual 3×3 impact/likelihood matrix with risks plotted
- A prioritised test order (what to test first)
- A full risk register across Functional, Technical, Performance, Security, Integration, UX, Data, and Edge Case categories
- Concrete mitigation actions for each risk

### Documentation
Generate three types of QA documents from a feature description:

- **Test Plan** — formal document covering scope, approach, entry/exit criteria, resources, schedule, and risks
- **QA Feature Guide** — practical guide helping a new QA understand what the feature does, key flows, business rules, and what to watch out for
- **Automation Plan** — what to automate, what to keep manual, and suggested tooling by level (E2E, API, Unit, Integration)

### Jira & JQL
Describe your team and project. Get back:

- Custom Jira dashboards with gadget configurations tailored to your project
- Saved JQL filters with explanations and copy-to-clipboard
- Automation rules with trigger, condition, and action defined
- Board configuration tips specific to your workflow

---

## Persistence

All tab inputs and results are saved automatically to localStorage. Switching tabs or refreshing won't lose your work — everything is restored exactly as you left it.

---

## Tech Stack

- React (Create React App)
- Anthropic Claude API (`claude-sonnet-4-5`)
- Plain CSS-in-JS, no UI library

---

## Running Locally

```bash
# Clone the repo
git clone https://github.com/rdragosiliescu-qa/QA-Kickstart
cd QA-Kickstart

# Install dependencies
npm install

# Add your Anthropic API key
# Create a .env file in the root:
echo "REACT_APP_ANTHROPIC_API_KEY=your-key-here" > .env

# Start the app
npm start
```

Get an API key at [console.anthropic.com](https://console.anthropic.com).

> **Note:** The API is called directly from the browser. Your key stays local — it's never sent anywhere except Anthropic's API.

---

## Using a Different Model

The app is built on Claude but can be adapted to any OpenAI-compatible API. Two things to change in `src/qa-kickstart.jsx`:

**1. The API endpoint and headers** — find the `callClaude` function and replace the fetch call:

```js
// Current (Anthropic)
res = await fetch("https://api.anthropic.com/v1/messages", {
  headers: {
    "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true",
  },
  body: JSON.stringify({ model: "claude-sonnet-4-5", ... })
});

// Example replacement (OpenAI)
res = await fetch("https://api.openai.com/v1/chat/completions", {
  headers: {
    "Authorization": `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
  },
  body: JSON.stringify({ model: "gpt-4o", messages: [{ role: "user", content: prompt }], ... })
});
```

**2. The response parsing** — the shape of the response differs per provider. Anthropic returns `data.content[0].text`; OpenAI returns `data.choices[0].message.content`. Update the parsing at the end of `callClaude` to match your provider.

Everything else — prompts, UI, results rendering — stays the same.

---

## Status

🚧 Work in progress — still testing and improving.

Features planned:
- [ ] More domain-specific modes (gaming, e-commerce, mobile)
- [ ] Cross-tab context (e.g. feed Generator output into Gap Detector automatically)
- [ ] Shareable session links

---

## Contributing

This is a personal project built for the QA community. Feedback, ideas, and PRs are welcome.

If you're a QA and something doesn't feel right about the output — that's the most valuable feedback there is.

---

## License

MIT — free to use, share, and build on.
