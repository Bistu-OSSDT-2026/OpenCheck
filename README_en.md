<div align="center">

<img src="public/favicon.svg" alt="OpenCheck Logo" width="120" />

# OpenCheck

### Open-source project health checker (frontend-only MVP)

[![Version](https://img.shields.io/github/v/release/Bistu-OSSDT-2026/OpenCheck?style=flat-square&color=blue)](https://github.com/Bistu-OSSDT-2026/OpenCheck/releases)
[![License](https://img.shields.io/badge/license-GPL--3.0-green?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Web-lightgrey?style=flat-square)](#local-run)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)

**OpenCheck** is a small course-practice project for checking open-source repository readiness. Enter a public GitHub repository URL, and OpenCheck checks README quality, license, run instructions, project structure, collaboration files, automation setup, then generates a score, improvement suggestions, and a copyable Markdown report.

[**Local Run**](#local-run) · [**Features**](#features) · [**Screenshots**](#screenshots) · [**Contributing**](CONTRIBUTING.md)

[中文](README.md) | **English**

</div>

## Why OpenCheck?

| | | | |
|:---:|:---:|:---:|:---:|
| **Project Check** | **Report Output** | **Open-source Workflow** | **Optional AI** |
| Check open-source readiness from a GitHub repository URL. | Generate scores, suggestions, and a copyable Markdown report. | Keep traceable evidence through Issues, branches, PRs, and merges. | Bring your own compatible API key; AI only adds suggestions and never changes rule-based scores. |

<div align="center">

![OpenCheck Home](screenshots/home.png)

</div>

## Local Run

### Prerequisites

- Node.js 18 or later
- npm 9 or later
- A modern browser such as Chrome, Edge, or Firefox

### Install and Start

```bash
npm ci
npm run dev
```

After the dev server starts, open the local URL shown in the terminal. It is usually:

```text
http://127.0.0.1:5173/
```

Windows users can also double-click:

```text
start-opencheck.bat
```

The launcher runs `npm ci` when `node_modules` is missing and tries to keep the app on `http://127.0.0.1:5173/`, so browser-local Token, AI configuration, and history records remain available across runs.

### Build Check

```bash
npm run build
```

If the build finishes without errors, the frontend-only MVP can be packaged successfully.

## Getting Started

1. Open the OpenCheck home page.
2. Enter a public GitHub repository address, for example `Bistu-OSSDT-2026/OpenCheck`.
3. Click **Start Check** to view the repository score, check details, and suggestions.
4. Click **View Report** to copy or download the Markdown check report.
5. If GitHub API rate limits are reached, configure your own GitHub Token on the **Token Config** page.
6. If AI-assisted suggestions are needed, configure an OpenAI-compatible endpoint on the same page.

## Features

### GitHub Repository Check

- Supports `https://github.com/owner/repo`, `github.com/owner/repo`, and `owner/repo`.
- Reads public repository metadata, root files, and README content.
- Checks README, LICENSE, `.gitignore`, CONTRIBUTING, CHANGELOG, dependency files, and GitHub Actions.
- Outputs a 0-100 score, level label, matched evidence, and deduction reasons.

### README Content Analysis

- Checks run instructions, tech stack, project structure, deployment/release notes, screenshots/demo, and usage instructions.
- Provides actionable suggestions for missing or incomplete sections.
- Shows the reason behind each check result so the team can locate issues quickly.

### Reports and History

- Generates a copyable and downloadable Markdown report.
- Saves check history in browser `localStorage`.
- Shows score changes and check-item changes when the same repository is checked again.

### GitHub Token and AI Assistance

- GitHub Token is optional and only improves GitHub API rate limits.
- AI assistance is disabled by default; without configuration, OpenCheck uses the default rule-based scoring system.
- Supports OpenAI-compatible APIs, such as user-configured DeepSeek or Doubao/Volcengine Ark services.
- The project does not bundle, host, or upload any API key; user keys stay in the current browser only.
- AI output is shown only as supplementary suggestions and does not change the default score; failed AI requests fall back automatically.

### Course Collaboration Evidence

- Use GitHub Issues to split tasks.
- Use one dedicated branch for each Issue.
- Submit contributions through Pull Requests.
- Add `Closes #issue-number` in the PR description so the Issue closes automatically after merge.
- Keep Issues, PRs, merges, CI, screenshots, and verification output as collaboration evidence.

## Team Workflow

| Stage | Practice |
|---|---|
| Issue | Split tasks in GitHub Issues with clear goals, scope, and acceptance criteria |
| Branch | Develop each Issue on a dedicated branch, for example `docs/issue-16-readme` |
| Change | Modify code or docs around the Issue and run local checks |
| Pull Request | Open a PR and include `Closes #issue-number` in the description |
| Review | Review and test changes before merge |
| Merge | Merge the PR; the linked Issue closes automatically |
| Evidence | Keep Issue, PR, Review/merge, commit, CI, and Release records as evidence |

> Issues do not have to be created only by the person doing the task. A maintainer may create and assign them, or members may create their own. The important part is that each task has a clear Issue, branch, PR, and merge record.

## Team Roles

| Role | Layer | Owned Pages | Main Responsibilities |
|---|---|---|---|
| R1 | Data fetching layer | None (pure functions) | URL parsing, GitHub API, Token storage, mock data |
| R2 | Analysis engine layer | None (pure logic) | File checks, README heuristics, scoring, suggestions, report string generation |
| R3 | Scaffold / routing + shared components | None (infrastructure) | Project scaffold, route constants, shared components, result cache |
| R4 | Main flow pages + integration | Home page, result page | Repository input, main check flow, result rendering, error states |
| R5 | Report / history / Token pages + history storage | Report page, history page, Token config page | Markdown report display, history records, Token config, localStorage utilities |

Roles may collaborate across boundaries, but every shared contract should keep one clear owner: R1 owns GitHub data and Token storage, R2 owns `AnalysisResult` and report content, R3 owns routing/components/result cache, and R5 owns history storage. Any shared field, type, or `localStorage` key change should be synchronized with related members first.

## Tech Stack

| Layer | Technology |
|------|------|
| Frontend | React 18 + TypeScript |
| Build tool | Vite 5 |
| Routing | React Router |
| Markdown rendering | React Markdown + remark-gfm |
| Icons | lucide-react |
| Storage | Browser localStorage |
| Delivery | Frontend-only static web app |

## Project Structure

```text
OpenCheck/
├─ public/                 # Static assets such as favicon
├─ screenshots/            # README screenshots
├─ src/
│  ├─ api/                 # GitHub API, repository URL parsing, Token / AI config storage
│  ├─ components/          # Shared UI components
│  ├─ engine/              # Check rules, scoring, suggestions, report generation, AI assistance
│  ├─ pages/               # Home, result, report, history, config pages
│  ├─ router/              # Route constants
│  ├─ store/               # Result cache and history records
│  ├─ styles/              # Global styles
│  ├─ types/               # Shared cross-module types
│  └─ utils/               # General utilities
├─ docs/                   # PRD, role plan, contracts, collaboration docs
├─ start-opencheck.bat     # Windows local launcher
└─ package.json            # Scripts and dependencies
```

## Screenshots

**Home** - enter a repository URL or use demo examples to start checking.
![OpenCheck Home](screenshots/home.png)

**Result** - view repository metadata, score, check details, and suggestions.
![Result Page](screenshots/result.png)

**Token / AI Config** - optionally configure GitHub Token and OpenAI-compatible AI settings.
![Token and AI Config Page](screenshots/token-ai-config.png)

**Report** - generate a copyable and downloadable Markdown report.
![Report Page](screenshots/report.png)

**Mobile Home** - keep the main check flow usable on small screens.
![Mobile Home](screenshots/mobile-home.png)

## Current Scope

`v0.1.0 MVP` is a source-code and static-frontend release, not a desktop installer.

- Supports public GitHub repositories only.
- Does not include a backend database, account system, or cloud sync.
- Does not fully support GitLab, Gitee, or private repositories yet.
- Does not support batch checking multiple repositories yet.
- Check results are based on heuristics and cannot replace human review.
- AI-assisted suggestions depend on user-provided third-party model endpoints.

## Related Docs

- [Product Requirements Document](docs/PRD_OpenCheck.md)
- [Team Work Division and Plan](docs/WORK_DIVISION.md)
- [Interface Contracts](docs/CONTRACTS.md)
- [AI Agent Collaboration Guide](docs/AI_AGENT_GUIDE.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Acceptance Report](ACCEPTANCE_REPORT.md)

## License

This project is open-sourced under the [GNU General Public License v3.0](LICENSE).

---

<div align="center">

**If OpenCheck helps your open-source project checkup, consider giving the project a Star.**

</div>
