# Labs Platform — Project Context

## Overview

This is a **multi-lab education platform** hosted in a single GitHub repository. Each lab is an independent, self-contained folder with its own documentation, assets, and interactive guides. All labs are deployed to GitHub Pages from the same repo root.

## Platform Philosophy

- **Unified Repository**: All labs in one GitHub repo for easier maintenance
- **Independent Folders**: Each lab is completely self-contained within its own folder
- **Consistency**: All labs follow the same design system and URL pattern
- **Education First**: Labs are designed for hands-on learning, not production
- **Open**: All labs are public and MIT-licensed

## Existing Labs

## GitHub Repository

**GitHub Repo**: `https://github.com/inakigorostiza/rc-celta-seat-availability-alert-platform`  
**Purpose**: Education labs platform — hosts multiple independent labs in one repository  
**GitHub Pages**: `https://inakigorostiza.github.io/rc-celta-seat-availability-alert-platform/`  
**Status**: Active — all labs served from this single repo

---

## Labs in This Repository

All labs are independent folders within the same GitHub repository, each with its own documentation and assets.

### 1. Agent Teams Marketing Lab
**Folder**: `/agent-teams-marketing-lab/`  
**URL**: `https://inakigorostiza.github.io/rc-celta-seat-availability-alert-platform/agent-teams-marketing-lab/`  
**Purpose**: Comprehensive manual for building marketing campaigns with parallel AI specialists using Claude Code's experimental Agent Teams feature  
**Tech Stack**: HTML, CSS, Claude Code, Agent Teams  
**Status**: Complete and live

### 2. Subagents & Agent Teams Concepts Lab
**Folder**: `/subagents-agent-teams-concepts-lab/`  
**URL**: `https://inakigorostiza.github.io/rc-celta-seat-availability-alert-platform/subagents-agent-teams-concepts-lab/`  
**Purpose**: Class reading introducing concepts, use cases, and decision framework for choosing between subagents and agent teams  
**Tech Stack**: HTML, CSS, Responsive design  
**Status**: Complete and live

### 3. IE-Nergy Lab
**Folder**: `/ie-nergy-lab/`  
**URL**: `https://inakigorostiza.github.io/rc-celta-seat-availability-alert-platform/ie-nergy-lab/`  
**Purpose**: 60-minute hands-on lab for marketing students. Build a spring campaign landing page using Claude Code, Mailchimp API, and GitHub MCP  
**Tech Stack**: HTML, CSS, JavaScript, Claude Code, Mailchimp API, GitHub MCP  
**Status**: Complete and live

## Repository Structure

The main repository contains independent lab folders:

```
rc-celta-seat-availability-alert-platform/
├── README.md                           # Main index & overview
├── CLAUDE.md                           # This file (project context)
├── 
├── agent-teams-marketing-lab/
│   ├── index.html                     # Main interactive guide
│   ├── README.md                      # Lab overview
│   ├── assets/                        # Images, diagrams, supporting files
│   │   ├── subagents.png
│   │   └── ...
│   └── templates/                     # Reusable templates (optional)
│
├── subagents-agent-teams-concepts-lab/
│   ├── index.html                     # Main interactive guide
│   ├── README.md                      # Lab overview
│   └── assets/
│
├── ie-nergy-lab/
│   ├── index.html                     # Main interactive guide
│   ├── README.md                      # Lab overview
│   └── assets/
│
└── [future-labs]/                     # Additional labs follow same pattern
```

Each lab folder is **completely independent** — it has its own:
- HTML guide file (`index.html`)
- Documentation (`README.md`)
- Assets folder for images and supporting files

## GitHub Pages Setup

Each lab repo has GitHub Pages enabled:

**Settings → Pages**
- Source: Deploy from a branch
- Branch: `main`
- Folder: `/root` (serves HTML files from repo root)

**Result**: `https://inakigorostiza.github.io/[repo-name]/[file].html`

## Lab URL Patterns

All labs follow a consistent URL structure:

```
https://inakigorostiza.github.io/[lab-repo]/[lab-name].html
https://inakigorostiza.github.io/[lab-repo]/[lab-name].html#section-id
```

Examples:
- `https://inakigorostiza.github.io/ie-nergy-lab/ie-nergy-lab.html#step-2`
- `https://inakigorostiza.github.io/agent-teams-marketing-lab/agent-teams-marketing-lab.html#part4`

## Creating a New Lab

All labs are created as **independent folders within the main repository**:

1. **Create new lab folder**: `/Users/igorostiza/labs/[lab-name]-lab/`
2. **Create lab structure**:
   ```
   [lab-name]-lab/
   ├── index.html          # Main interactive guide (use existing style system)
   ├── README.md           # Lab overview and quick start
   ├── assets/             # Images, diagrams, supporting files
   │   ├── logo.png
   │   └── diagram.svg
   └── templates/          # Reusable templates (optional)
   ```
3. **Match the design system**:
   - Use the same CSS variables and typography as existing labs
   - Reference `agent-teams-marketing-lab/index.html` for HTML structure
   - Ensure responsive design (works on mobile, tablet, desktop)
4. **Commit to main repo**:
   ```bash
   git add [lab-name]-lab/
   git commit -m "feat: Add [Lab Name] lab"
   git push origin main
   ```
5. **Update CLAUDE.md**:
   - Add lab entry to "Labs in This Repository" section
   - Include folder path, URL, purpose, tech stack, status
6. **Test**: Verify GitHub Pages URL is live within 1-2 minutes
   - URL pattern: `https://inakigorostiza.github.io/rc-celta-seat-availability-alert-platform/[lab-name]-lab/`

## Main Repository Structure

**GitHub Repo**: `https://github.com/inakigorostiza/rc-celta-seat-availability-alert-platform`  
**Purpose**: Education labs platform — centralized repository for all labs  
**Key files in repo root**:
- `CLAUDE.md` — Project context (this file)
- `README.md` — Labs index and overview
- `manual.html` — Platform documentation (optional)

**Lab folders**:
- `/agent-teams-marketing-lab/` — Agent Teams workshop
- `/subagents-agent-teams-concepts-lab/` — Concepts & decision framework
- `/ie-nergy-lab/` — Hands-on marketing lab
- `[future-labs]/` — Additional labs follow same pattern

**Important**: All labs are independent folders within this single repository. Each lab has its own `index.html`, `README.md`, and `assets/` folder. Labs do not affect each other — you can work on any lab independently.

## Key Files & Locations

| Path | Purpose |
|------|---------|
| `/Users/igorostiza/labs/CLAUDE.md` | Project context (this file) |
| `/Users/igorostiza/labs/README.md` | Labs index & overview |
| `/Users/igorostiza/labs/agent-teams-marketing-lab/` | Agent Teams Marketing Lab folder |
| `/Users/igorostiza/labs/agent-teams-marketing-lab/index.html` | Agent Teams lab main guide |
| `/Users/igorostiza/labs/subagents-agent-teams-concepts-lab/` | Concepts Lab folder |
| `/Users/igorostiza/labs/subagents-agent-teams-concepts-lab/index.html` | Concepts lab main guide |
| `/Users/igorostiza/labs/ie-nergy-lab/` | IE-Nergy Lab folder |
| `/Users/igorostiza/labs/ie-nergy-lab/index.html` | IE-Nergy lab main guide |

## Development Notes

### For Claude Code Sessions
- Always read CLAUDE.md first to understand the platform structure
- Each lab is independent — changes in one lab don't affect others
- The rc-celta repo is the **primary project** and should not be mixed with other labs
- New labs should be created as separate GitHub repos

### Deployment Workflow
1. Create lab files locally
2. Initialize git repo: `git init`
3. Create GitHub repo with matching name
4. Push: `git remote add origin [URL] && git push -u origin main`
5. Enable GitHub Pages in Settings
6. Verify live within 1-2 minutes
7. Document in CLAUDE.md

### Lab Content Standards
- **Interactive HTML**: Use consistent styling (reference ie-nergy-lab.html)
- **Anchor links**: All major sections have `id` attributes for deep linking
- **Markdown templates**: Provide reusable templates in `/templates` folder
- **Responsive design**: Works on mobile, tablet, desktop
- **No authentication**: Labs are public and don't require login

## Future Labs Pipeline

- [ ] N8N Workflows Lab — Automation tutorials with n8n
- [ ] Supabase Lab — Database design and real-time features
- [ ] Claude API Lab — Building AI applications with Anthropic SDK
- [ ] GitHub MCP Lab — Integration patterns with GitHub's Model Context Protocol

## Contact & Ownership

**Owner**: Inaki Gorostiza (@inakigorostiza)  
**Email**: igorostiza@lin3s.com  
**GitHub**: https://github.com/inakigorostiza  

---

**Last Updated**: April 25, 2026  
**Platform Status**: Active development — new labs being added regularly
