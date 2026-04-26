# Labs Platform — Project Context

## Overview

This is a **multi-lab platform** hosted by Inaki Gorostiza. Each lab is an independent, educational resource for learning specific skills or technologies. Labs are stored as separate GitHub repositories and deployed to GitHub Pages.

## Platform Philosophy

- **Centralized**: Multiple labs are hosted in the same GitHub repo for unified management
- **Consistency**: All labs follow the same URL pattern and GitHub Pages structure for easy discovery
- **Education First**: Labs are designed for hands-on learning, not production systems
- **Open**: All labs are public and MIT-licensed (or similar)

## Existing Labs

### Primary Project Repo: RC Celta de Vigo
**GitHub Repo**: `https://github.com/inakigorostiza/rc-celta-seat-availability-alert-platform`  
**Purpose**: Full-stack application for monitoring and alerting seat availability at RC Celta de Vigo stadium  
**Tech Stack**: Node.js, Supabase, GitHub Actions, HTML/CSS/JS  
**GitHub Pages**: `https://inakigorostiza.github.io/rc-celta-seat-availability-alert-platform/`  
**Status**: Active - primary project only (no labs in this repo)

---

## Independent Lab Repositories

Each lab is a completely separate GitHub repository with its own codebase, documentation, and GitHub Pages deployment.

### 1. Agent Teams Marketing Lab
**GitHub Repo**: `https://github.com/inakigorostiza/agent-teams-marketing-lab`  
**Purpose**: A comprehensive manual for building marketing campaigns with parallel AI specialists using Claude Code's experimental Agent Teams feature  
**Tech Stack**: HTML, CSS, Claude Code, Agent Teams  
**GitHub Pages**: `https://inakigorostiza.github.io/agent-teams-marketing-lab/`  
**Status**: Ready for deployment (separate repo)

### 2. Subagents & Agent Teams Concepts Lab
**GitHub Repo**: `https://github.com/inakigorostiza/subagents-agent-teams-concepts-lab`  
**Purpose**: Class reading introducing concepts, use cases, and decision framework for choosing between subagents and agent teams  
**Tech Stack**: HTML, CSS, Responsive design  
**GitHub Pages**: `https://inakigorostiza.github.io/subagents-agent-teams-concepts-lab/`  
**Status**: Ready for deployment (separate repo)

### 3. IE-Nergy Lab
**GitHub Repo**: `https://github.com/inakigorostiza/ie-nergy-lab`  
**Purpose**: A 60-minute hands-on lab for marketing students. Build a spring campaign landing page using Claude Code, Mailchimp API, and GitHub MCP.  
**Tech Stack**: HTML, CSS, JavaScript, Claude Code, Mailchimp API, GitHub MCP  
**GitHub Pages**: `https://inakigorostiza.github.io/ie-nergy-lab/`  
**Status**: Complete and live (separate repo)

## Repository Structure

Each lab repo follows this pattern:

```
agent-teams-marketing-lab/
├── .git/                          # Git repository
├── .gitignore                     # Git ignore rules
├── README.md                      # Lab overview
├── [lab-name].html                # Main interactive guide
├── templates/                     # Reusable templates
│   ├── README.md
│   ├── [template-1].md
│   ├── [template-2].md
│   └── ...
├── docs/                          # Jekyll documentation (optional)
│   ├── _config.yml
│   ├── index.md
│   └── ...
└── [supporting-files]/            # Starter kits, examples, etc.
```

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

Each lab is created as a **completely separate GitHub repository**:

1. **Create new folder locally**: `/Users/igorostiza/[lab-name]-lab/`
2. **Initialize git**: `cd [lab-name]-lab && git init`
3. **Create structure**:
   - `README.md` — Lab overview
   - `index.html` — Main interactive guide (matching style system)
   - `/assets/` — Images, diagrams, supporting files
   - `/templates/` — Reusable templates (optional)
4. **Push to GitHub**:
   - Create new repo: `github.com/inakigorostiza/[lab-name]-lab`
   - Add remote: `git remote add origin https://github.com/inakigorostiza/[lab-name]-lab.git`
   - Push: `git push -u origin main`
5. **Enable GitHub Pages**:
   - Settings → Pages
   - Source: Deploy from `main` branch, `/root` folder
   - URL: `https://inakigorostiza.github.io/[lab-name]-lab/`
6. **Update CLAUDE.md** with new lab entry
7. **Test**: Verify GitHub Pages URL is live within 1-2 minutes

## RC Celta Repository (This Repo)

**GitHub Repo**: `https://github.com/inakigorostiza/rc-celta-seat-availability-alert-platform`  
**Purpose**: Primary project for Celta stadium seat availability application  
**Key files**:
- `CLAUDE.md` — Project context (this file)
- `manual.html` — Platform documentation
- `index.html` — Landing page
- `README.md` — Project overview

**Important**: This repo contains ONLY the Celta project. All educational labs are **completely separate repositories** with their own GitHub pages, codebases, and deployment pipelines.

## Key Files & Locations

| File | Purpose |
|------|---------|
| `/Users/igorostiza/labs/CLAUDE.md` | Project context (this file) |
| `/Users/igorostiza/labs/manual.html` | Platform manual & navigation |
| `/Users/igorostiza/labs/README.md` | Project overview |
| `/Users/igorostiza/agent-teams-marketing-lab/` | Agent Teams Marketing Lab repo |
| `/Users/igorostiza/subagents-agent-teams-concepts-lab/` | Subagents & Agent Teams Concepts Lab repo |
| `/Users/igorostiza/ie-nergy-lab/` | IE-Nergy Lab repo |

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
