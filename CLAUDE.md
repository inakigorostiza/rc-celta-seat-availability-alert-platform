# Labs Platform — Project Context

## Overview

This is a **multi-lab platform** hosted by Inaki Gorostiza. Each lab is an independent, educational resource for learning specific skills or technologies. Labs are stored as separate GitHub repositories and deployed to GitHub Pages.

## Platform Philosophy

- **Centralized**: Multiple labs are hosted in the same GitHub repo for unified management
- **Consistency**: All labs follow the same URL pattern and GitHub Pages structure for easy discovery
- **Education First**: Labs are designed for hands-on learning, not production systems
- **Open**: All labs are public and MIT-licensed (or similar)

## Existing Labs

### Platform Repo: RC Celta de Vigo
**GitHub Repo**: `https://github.com/inakigorostiza/rc-celta-seat-availability-alert-platform`  
**Primary Project**: A full-stack application for monitoring and alerting seat availability at RC Celta de Vigo stadium  
**Tech Stack**: Node.js, Supabase, GitHub Actions, HTML/CSS/JS  
**GitHub Pages**: `https://inakigorostiza.github.io/rc-celta-seat-availability-alert-platform/`  
**Status**: Active - holds main project + educational labs

#### Labs in this repo:

**1. Agent Teams Marketing Lab** (NEW)
- **URL**: `https://inakigorostiza.github.io/rc-celta-seat-availability-alert-platform/agent-teams-marketing-lab.html`
- **Purpose**: A comprehensive manual for building marketing campaigns with parallel AI specialists using Claude Code's experimental Agent Teams feature
- **Tech**: HTML, Markdown, Claude Code, Agent Teams
- **Status**: Ready for deployment

**2. N8N Workflows Lab** (Planned)
- **URL**: `https://inakigorostiza.github.io/rc-celta-seat-availability-alert-platform/n8n-workflows/`
- **Purpose**: Automation tutorials with n8n
- **Status**: Research phase

### Separate Labs Repository:

**IE-Nergy Lab**
**GitHub Repo**: `https://github.com/inakigorostiza/ie-nergy-lab`  
**Purpose**: A 60-minute hands-on lab for marketing students. Build a spring campaign landing page using Claude Code, Mailchimp API, and GitHub MCP.  
**Tech Stack**: HTML, CSS, JavaScript, Claude Code, Mailchimp API, GitHub MCP  
**GitHub Pages**: `https://inakigorostiza.github.io/ie-nergy-lab/ie-nergy-lab.html`  
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

## Adding a New Lab to the Platform

When adding a new lab to the rc-celta repo:

1. **Create lab folder**: `/[lab-name]/` in repo root
2. **Structure**: Create [lab-name].html, templates/, README.md in the lab folder
3. **HTML**: Design the interactive guide to match existing labs (use style from agent-teams-marketing-lab.html or ie-nergy-lab.html as template)
4. **GitHub Pages**: Already enabled on repo (serves from main branch root)
5. **URL**: Auto-available at `https://inakigorostiza.github.io/rc-celta-seat-availability-alert-platform/[lab-name].html`
6. **Document**: Update CLAUDE.md with lab details
7. **Test**: Verify GitHub Pages URL is live within 1-2 minutes

## Labs Platform (This Repo)

**GitHub Repo**: `https://github.com/inakigorostiza/rc-celta-seat-availability-alert-platform`  
**Purpose**: Primary project (Celta stadium seat availability), also serves as document hub  
**Files in /labs directory**:
- `manual.html` — Main platform documentation
- `index.html` — Landing page / index
- `README.md` — Project overview
- `CLAUDE.md` — This file (project context for Claude)

**Note**: This repo contains the Celta project + documentation. New labs are **separate repos**.

## Key Files & Locations

| File | Purpose |
|------|---------|
| `/Users/igorostiza/labs/CLAUDE.md` | Project context (this file) |
| `/Users/igorostiza/labs/manual.html` | Platform manual & navigation |
| `/Users/igorostiza/labs/README.md` | Project overview |
| `/Users/igorostiza/labs/n8n/avisame-workflow.json` | N8N workflow example |
| `/Users/igorostiza/labs/supabase/schema.sql` | Shared Supabase schema |
| `/tmp/agent-teams-marketing-lab/` | Agent Teams lab (ready to push as new repo) |

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
