# Labs Platform — Project Context

## Overview

Inaki Gorostiza hosts an **education labs platform** for marketing students and practitioners. Labs are distributed across separate GitHub repositories, each with its own GitHub Pages deployment.

## Platform Philosophy

- **Independence**: Each lab is a completely separate GitHub repository
- **Specialization**: Agent-focused labs are separate; marketing labs can share repos
- **Consistency**: All labs follow the same design system and structure
- **Education First**: Labs are designed for hands-on learning
- **Open**: All labs are public and MIT-licensed

---

## All Labs (Current)

### Agent-Focused Labs (Separate Repositories)

**1. Agent Teams Marketing Lab**
- **GitHub Repo**: `https://github.com/inakigorostiza/agent-teams-marketing-lab`
- **GitHub Pages**: `https://inakigorostiza.github.io/agent-teams-marketing-lab/`
- **Purpose**: Comprehensive hands-on manual for building marketing campaigns with parallel AI specialists using Claude Code's experimental Agent Teams feature
- **Duration**: 2-4 hours
- **Tech Stack**: HTML, CSS, Claude Code, Agent Teams, tmux
- **Status**: Complete and live
- **Local Path**: `/Users/igorostiza/agent-teams-marketing-lab/`

**2. Subagents Marketing Lab**
- **GitHub Repo**: `https://github.com/inakigorostiza/subagents-marketing-lab`
- **GitHub Pages**: `https://inakigorostiza.github.io/subagents-marketing-lab/`
- **Purpose**: Quick guide for working with subagents in VS Code. Create reusable marketing specialists without needing tmux
- **Duration**: 1 hour
- **Tech Stack**: HTML, CSS, Claude Code, Subagents, VS Code integrated terminal
- **Status**: Complete and live
- **Local Path**: `/Users/igorostiza/subagents-marketing-lab/`

**3. Subagents & Agent Teams Concepts Lab**
- **GitHub Repo**: `https://github.com/inakigorostiza/subagents-agent-teams-concepts-lab`
- **GitHub Pages**: `https://inakigorostiza.github.io/subagents-agent-teams-concepts-lab/`
- **Purpose**: Class reading introducing concepts, use cases, and decision framework for choosing between subagents and agent teams
- **Duration**: 20-30 minutes
- **Tech Stack**: HTML, CSS, Responsive design
- **Status**: Complete and live
- **Local Path**: `/Users/igorostiza/subagents-agent-teams-concepts-lab/`

**4. Blocks, Workflows, and Agents Lab**
- **GitHub Repo**: `https://github.com/igorostiza-ie/blocks-workflows-agents-lab`
- **GitHub Pages**: `https://igorostiza-ie.github.io/blocks-workflows-agents-lab/`
- **Purpose**: Comprehensive guide to building effective agentic systems. Learn simple, composable patterns for production-ready agents
- **Duration**: 30-40 minutes
- **Tech Stack**: HTML, CSS, Responsive design
- **Status**: Complete and live
- **Local Path**: `/Users/igorostiza/blocks-workflows-agents-lab/`

**5. N8N Workflows Marketing Lab**
- **GitHub Repo**: `https://github.com/inakigorostiza/n8n-workflows-marketing`
- **GitHub Pages**: `https://inakigorostiza.github.io/n8n-workflows-marketing/`
- **Purpose**: Automation tutorials with n8n for marketing workflows
- **Tech Stack**: HTML, CSS, n8n, APIs
- **Status**: Complete and live

### Marketing Labs (RC Celta Repository)

**5. IE-Nergy Lab**
- **GitHub Repo**: `https://github.com/inakigorostiza/rc-celta-seat-availability-alert-platform`
- **Folder**: `/ie-nergy-lab/`
- **GitHub Pages**: `https://inakigorostiza.github.io/rc-celta-seat-availability-alert-platform/ie-nergy-lab/`
- **Purpose**: 60-minute hands-on lab for marketing students. Build a spring campaign landing page
- **Duration**: 1 hour
- **Tech Stack**: HTML, CSS, JavaScript, Claude Code, Mailchimp API, GitHub MCP
- **Status**: Complete and live
- **Local Path**: `/Users/igorostiza/labs/ie-nergy-lab/`

### Primary Project (RC Celta Repository)

**RC Celta Seat Availability Alert Platform**
- **GitHub Repo**: `https://github.com/inakigorostiza/rc-celta-seat-availability-alert-platform`
- **GitHub Pages**: `https://inakigorostiza.github.io/rc-celta-seat-availability-alert-platform/`
- **Purpose**: Full-stack application for monitoring seat availability at RC Celta de Vigo stadium
- **Tech Stack**: Node.js, Supabase, GitHub Actions, HTML/CSS/JS
- **Status**: Active primary project
- **Local Path**: `/Users/igorostiza/labs/`

---

## Lab Repository Structure

### Agent-Focused Lab (Separate Repo) Structure

Each agent-focused lab is a complete GitHub repository:

```
[lab-name]-marketing-lab/
├── .git/                          # Git repository
├── .gitignore                     # Git ignore rules
├── README.md                      # Lab overview & quick start
├── index.html                     # Main interactive guide
├── assets/                        # Images, diagrams, supporting files
│   ├── logo.svg
│   ├── diagram.png
│   └── ...
└── templates/ (optional)          # Reusable templates
    └── template-example.md
```

**Deployment**:
- GitHub Pages serves from repo root (`/`)
- Entry point: `/index.html`
- URL: `https://inakigorostiza.github.io/[lab-name]-marketing-lab/`

### Marketing Lab (Inside RC Celta Repo) Structure

Marketing labs are folders within the rc-celta repo:

```
rc-celta-seat-availability-alert-platform/
├── ie-nergy-lab/
│   ├── README.md                  # Lab overview
│   ├── index.html                 # Main interactive guide
│   ├── assets/                    # Images, diagrams, supporting files
│   └── templates/ (optional)
├── [future-marketing-labs]/
└── ... (primary project files)
```

**Deployment**:
- GitHub Pages serves from rc-celta repo root (`/`)
- Entry point: `/ie-nergy-lab/index.html`
- URL: `https://inakigorostiza.github.io/rc-celta-seat-availability-alert-platform/ie-nergy-lab/`

---

## Lab Design System (All Labs)

All labs use the same consistent design system:

### Fonts
- **Sans-serif**: Inter (Google Fonts)
- **Serif**: Instrument Serif (for headers)
- **Monospace**: SF Mono (for code)

### Colors
```css
--bg:          #FFFFFF;
--bg-soft:     #F5F5F5;
--ink:         #0A0A0A;
--ink-2:       #1F1F1F;
--ink-3:       #444444;
--ink-4:       #737373;
--ink-5:       #A3A3A3;
--accent:      #3498db;
--accent-2:    #2980b9;
--accent-soft: #E6EBF5;
--line:        #E5E5E5;
--success:     #15803D;
--warning:     #B45309;
```

### HTML Structure
- Two-column layout with sticky sidebar navigation
- Hero section with title and metadata
- Numbered sections with clear hierarchy
- Callout boxes for important content
- Tables for comparisons
- Responsive design (works on mobile, tablet, desktop)

### Reference Template
Use `agent-teams-marketing-lab/index.html` as the template for new agent-focused labs.

---

## How to Create New Labs

### For Agent-Focused Labs (Separate Repo)

1. **Create new folder**:
   ```bash
   mkdir /Users/igorostiza/[lab-name]-marketing-lab
   cd /Users/igorostiza/[lab-name]-marketing-lab
   ```

2. **Initialize git**:
   ```bash
   git init
   git config user.email "igorostiza@lin3s.com"
   git config user.name "inakigorostiza"
   ```

3. **Create lab structure**:
   ```
   [lab-name]-marketing-lab/
   ├── README.md              # Lab overview
   ├── index.html             # Main guide (use design system)
   └── assets/                # Images, diagrams
   ```

4. **Create README.md**:
   - Lab title and description
   - Prerequisites
   - Duration
   - Tech stack
   - Links to related labs

5. **Create index.html**:
   - Use same CSS variables as other labs
   - Two-column layout with sidebar navigation
   - Hero section with title
   - Numbered sections with proper IDs for anchors
   - Links to related labs at bottom
   - Responsive design

6. **Fix asset paths**:
   - Use relative paths: `./assets/image.png` (NOT `/assets/image.png`)
   - Ensures GitHub Pages serves correctly from repo root

7. **Initial commit**:
   ```bash
   git add .
   git commit -m "feat: Initial commit - [Lab Name]"
   ```

8. **Create GitHub repository**:
   ```bash
   gh repo create [lab-name]-marketing-lab --public --source=. --remote=origin --push
   ```

9. **Enable GitHub Pages**:
   ```bash
   # Via GitHub web UI: Settings → Pages → Deploy from main, /root
   # OR via API:
   curl -X POST -H "Authorization: token $(gh auth token)" \
     -H "Accept: application/vnd.github.v3+json" \
     https://api.github.com/repos/inakigorostiza/[lab-name]-marketing-lab/pages \
     -d '{"source":{"branch":"main","path":"/"}}'
   ```

10. **Test**: Verify URL is live within 1-2 minutes
    - `https://inakigorostiza.github.io/[lab-name]-marketing-lab/`

11. **Update CLAUDE.md** with new lab entry

12. **Add links** from related labs if applicable

### For Marketing Labs (RC Celta Repo)

1. **Create new folder in labs directory**:
   ```bash
   mkdir /Users/igorostiza/labs/[lab-name]-lab
   ```

2. **Create lab structure**:
   ```
   [lab-name]-lab/
   ├── README.md              # Lab overview
   ├── index.html             # Main guide (use design system)
   └── assets/                # Images, diagrams
   ```

3. **Fix asset paths**:
   - Use relative paths: `./assets/image.png` (NOT `/assets/image.png`)

4. **Commit to rc-celta repo**:
   ```bash
   cd /Users/igorostiza/labs
   git add [lab-name]-lab/
   git commit -m "feat: Add [Lab Name] marketing lab"
   git push origin main
   ```

5. **Update CLAUDE.md** with new lab entry

6. **Test**: Verify URL is live within 1-2 minutes
   - `https://inakigorostiza.github.io/rc-celta-seat-availability-alert-platform/[lab-name]-lab/`

---

## Lab Content Standards

### All Labs Must Include

- **Interactive HTML**: Use the design system CSS variables and layout pattern
- **Anchor links**: All major sections have `id` attributes for deep linking
- **README.md**: Lab overview, prerequisites, duration, tech stack
- **Responsive design**: Works on mobile (max-width: 768px), tablet, desktop
- **No authentication**: Labs are public and don't require login
- **Relative asset paths**: `./assets/` not `/assets/`
- **Links to related labs**: At bottom of page or in "Further Reading" section

### HTML Template Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>[Lab Name] — Claude Code</title>
  <meta name="description" content="[Lab description]" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
  <style>
    /* Use CSS variables from design system */
  </style>
</head>
<body>
  <div class="layout">
    <!-- Sidebar navigation -->
    <aside class="nav">...</aside>
    <!-- Main content -->
    <main>
      <!-- Hero section -->
      <div class="hero">...</div>
      <!-- Numbered sections -->
      <section class="section" id="section-id">...</section>
      <!-- Links to related labs -->
      <section class="section">...</section>
      <!-- Footer -->
      <div class="footer">...</div>
    </main>
  </div>
</body>
</html>
```

### File Naming Conventions

- **Separate repos**: `[lab-name]-marketing-lab` (all lowercase, hyphens)
- **Lab folders**: `[lab-name]-lab` (all lowercase, hyphens)
- **HTML file**: Always `index.html` (GitHub Pages entry point)
- **README**: Always `README.md`
- **Assets folder**: Always `assets/`

---

## Key Locations

| Path | Purpose |
|------|---------|
| `/Users/igorostiza/labs/` | RC Celta repo (contains IE-Nergy Lab) |
| `/Users/igorostiza/agent-teams-marketing-lab/` | Agent Teams lab repo |
| `/Users/igorostiza/subagents-marketing-lab/` | Subagents lab repo |
| `/Users/igorostiza/subagents-agent-teams-concepts-lab/` | Concepts lab repo |
| `/Users/igorostiza/labs/CLAUDE.md` | This file (platform documentation) |

---

## Deployment Checklist for New Labs

- [ ] Create lab folder with proper structure
- [ ] Create README.md with lab overview, prerequisites, duration, tech stack
- [ ] Create index.html using design system
- [ ] Use relative asset paths (./assets/)
- [ ] Include anchor links on all sections (id attributes)
- [ ] Make responsive (test on mobile)
- [ ] Add links to related labs
- [ ] Commit and push to GitHub
- [ ] Create/enable GitHub Pages
- [ ] Verify URL is live
- [ ] Test all links work
- [ ] Update CLAUDE.md with lab entry
- [ ] Add links from related labs back to new lab

---

## Future Labs Pipeline

- [ ] Supabase Lab — Database design and real-time features
- [ ] Claude API Lab — Building AI applications with Anthropic SDK
- [ ] GitHub MCP Lab — Integration patterns with GitHub's Model Context Protocol
- [ ] Advanced AI Patterns Lab — Prompt engineering, RAG, multi-agent systems

---

## Contact & Ownership

**Owner**: Inaki Gorostiza (@inakigorostiza)  
**Email**: igorostiza@lin3s.com  
**GitHub**: https://github.com/inakigorostiza  
**Website**: https://inakigorostiza.github.io/

---

**Last Updated**: April 26, 2026  
**Platform Status**: Active development — 5 labs live, continuous additions
