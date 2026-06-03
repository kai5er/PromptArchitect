# JSON Prompt Architect

A premium single-page web app for composing structured JSON prompt payloads for AI image generation. Built entirely with Claude Code — no prior coding experience required.

**Live app → [kai5er.github.io/PromptArchitect](https://kai5er.github.io/PromptArchitect)**

---

## What It Does

AI image models like Midjourney, DALL·E, and Stable Diffusion respond well to highly structured, detailed prompts. This tool lets you compose those prompts visually through a form — and outputs a clean, validated JSON payload in real time.

**Features:**
- **Form-to-JSON engine** — fill in scene, subjects, style, lighting, mood, camera settings and watch the JSON build live in the sidebar
- **Dynamic subjects** — add, edit, and remove an unlimited number of characters or objects, each with their own type, description, pose, position, and expression
- **Color palette & effects** — tag-chip inputs for word-based color palettes and visual effects arrays
- **Camera rig config** — angle, distance, lens, and focus as a nested JSON object
- **Instant randomizer** — one click generates a complete, coherent cinematic prompt from curated semantic pools
- **JSON import** — paste any existing prompt JSON, it validates and hydrates the form automatically
- **Copy & Export** — copy to clipboard or download as a `.json` file

---

## What I Did

This project was built as an experiment in using **Claude Code** — an AI coding agent — to go from idea to deployed web app without writing code manually.

### The process:

**1. Wrote a brief**
I described the app in plain English — what it should do, what the data structure should look like, and how it should be organized. I included the TypeScript interfaces I wanted and the file structure I had in mind.

**2. Claude Code planned it**
Before writing a single file, Claude Code generated a full implementation plan — every file to create, every function to write, every decision to make. I reviewed and approved it.

**3. Claude Code built it**
In one pass it generated the entire app: `App.tsx`, `index.css`, `vite.config.ts`, `tsconfig`, `package.json`, and the GitHub Actions deploy workflow. Around 500 lines of production-ready TypeScript and CSS.

**4. Deployed to GitHub Pages**
The repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys the app to GitHub Pages on every push to `main`. Free, permanent hosting with zero server configuration.

**5. Iterated on the design**
After the initial build I described what I wanted visually — "make it look nice" — and Claude Code redesigned the entire UI: deep-space colour palette, Outfit typography, GSAP scroll animations, glassmorphic header, and a premium card system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Animations | GSAP |
| Fonts | Outfit + JetBrains Mono |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |

---

## Key Concepts (For Students)

If you're looking through this codebase to learn, here are the most interesting parts:

- **`src/App.tsx`** — everything lives here: TypeScript interfaces, state management with `useState`, serialization with `useCallback`, GSAP animations with `useEffect`, and all UI components
- **`cleanData()`** — a callback that strips internal React IDs from subjects before serialization, so the exported JSON is clean
- **Chip input component** — a reusable controlled input that converts typed words into removable tag chips
- **Randomizer pools** — large `const` arrays at the top of `App.tsx` that feed the random prompt generator
- **`.github/workflows/deploy.yml`** — the GitHub Actions workflow that handles building and deploying automatically

---

## Built With

[Claude Code](https://claude.ai/code) — AI coding agent by Anthropic
