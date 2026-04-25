---
layout: default
title: Getting Started
---

# Getting Started

Step-by-step setup guide to run your first Agent Team campaign.

## Prerequisites

Before you start, verify you have:

```bash
# Check Claude Code version (need 2.1.32+)
claude --version

# Check Node.js (need 18+)
node --version

# Check tmux (any recent version)
tmux -V
```

If you're missing any of these, head to the [Full Manual](manual.md) Part 2 for installation instructions.

**Important**: Use a system terminal (Terminal.app on macOS, iTerm2, or Linux terminal). Do NOT use VS Code's integrated terminal—split-pane mode won't work there.

---

## Setup (15 minutes)

### Step 1: Create a project folder

```bash
mkdir ~/Documents/ienergy-launch
cd ~/Documents/ienergy-launch
```

### Step 2: Create the brief file

Download the [IE-Nergy Brief](https://raw.githubusercontent.com/igorostiza/labs/main/agent-teams-marketing-lab/templates/ienergy-brief-template.md) and save it as `brief.md` in your project folder.

Or paste this into your terminal:

```bash
cat > brief.md << 'EOF'
# IE-Nergy Launch Brief

## Product
IE-Nergy is a new energy drink for clean, sustained focus — for
studying, deep work, and creative output. A deliberate counterpoint to
the loud, hyper-masculine energy drink category (Red Bull, Monster, Bang).

## Formulation
- 150mg natural caffeine (green tea + guarana)
- L-theanine for sustained focus without jitters
- B-vitamins
- Zero sugar, 15 calories
- Flavors: Yuzu Citrus, Wild Berry, Matcha Mint

## Pricing & distribution
€2.50 per 250ml can. Launching in Madrid and Barcelona first
(universities, specialty grocery, co-working spaces). Pan-European
expansion by year-end.

## Target audience
University students and young professionals (18-30) who study or work
long hours and want clean energy without the crash, the sugar, or the
bro-coded branding of legacy energy drinks. Health-conscious but not
wellness-obsessed. Spend time on TikTok, Instagram, and Spotify.

## Differentiator
Calm focus, not aggressive stimulation. Designed for the moments when
you need to think clearly — not when you want to feel hyped.

## Launch goal
100,000 cans sold across Madrid and Barcelona in first 90 days.
Build a brand foundation that will scale across Europe.

## Channels available
TikTok, Instagram, Spotify audio ads, university campus activations,
partnerships with co-working spaces and specialty cafés.
EOF
```

### Step 3: Start a tmux session

```bash
tmux new -s marketing
```

You should see a colored status bar at the bottom. If you get "duplicate session," run:

```bash
tmux kill-session -t marketing
tmux new -s marketing
```

### Step 4: Launch Claude Code with Agent Teams enabled

Still in tmux, run:

```bash
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 claude
```

This enables the experimental Agent Teams feature just for this session.

### Step 5: Verify the feature is active

Inside Claude Code, type:

```
Check whether CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS is set.
```

Claude should confirm it's set to 1. If not, exit and re-run the command above.

---

## Spawn Your Team (5 minutes)

Copy and paste this into Claude Code:

```
Read brief.md, then create an agent team with 3 teammates in tmux 
split-pane mode to develop the IE-Nergy launch campaign. Spawn them 
now with these specific roles:

TEAMMATE 1 — STRATEGIST
You are a senior brand strategist with 10+ years launching consumer
challenger brands in crowded categories. You think in terms of
category positioning, jobs-to-be-done, and defensible differentiation
— not features. You are skeptical of generic positioning like
"premium" or "natural" and push for sharp, ownable angles. You have a
strong point of view on what NOT to say. Ground every recommendation
in audience insight.
Deliverable: strategy.md containing (1) a one-sentence positioning
statement, (2) the top 3 messages we will lead with, (3) recommended
channel mix with reasoning, (4) what we will NOT say or claim and why.

TEAMMATE 2 — COPYWRITER
You are a direct-response copywriter who has written launch campaigns
for digitally-native consumer brands aimed at Gen Z and young
Millennials. You write in a conversational, specific voice — never
corporate, never brand-speak. You write differently for Instagram vs
TikTok vs email vs search. You hate buzzwords like "elevate,"
"unlock your potential," "fuel your journey."
Deliverable: copy.md containing (1) one Instagram caption (max 125
words), (2) one TikTok script for a 30-second video (with shot
direction and on-screen text cues), (3) one email — subject line plus
first paragraph, (4) one Google Search ad — headline (30 chars) plus
description (90 chars). Wait for the Strategist's positioning before
drafting.

TEAMMATE 3 — RESEARCHER
You are a competitive intelligence analyst with a marketing
background. You investigate not just what competitors say, but what
they don't say — looking for whitespace and positioning gaps. You
report findings as actionable insight, not feature comparisons.
Deliverable: research.md containing (1) a short profile of 3 direct
competitors (Red Bull, Monster, and one challenger of your choice
such as Celsius, Tenzing, or Yfood), (2) what each one's core
positioning is in one sentence, (3) the 2-3 positioning gaps IE-Nergy
could credibly own.

WORKFLOW:
1. The Researcher works first and shares findings with the team.
2. The Strategist uses the research to develop positioning.
3. The Copywriter waits for positioning, then drafts creative
   anchored to it.
4. You (the lead) wait for all three before producing
   campaign-summary.md, which ties everything together with your
   recommendation on what to launch with.

Have teammates message each other directly when they need input.
```

---

## Watch Your Team Work (30-45 minutes)

As soon as you hit Enter, Claude will spawn your three teammates. Your tmux window will split into multiple panes — one for the lead, one for each teammate.

### Navigating panes

```bash
# Move between panes
Ctrl+B then arrow keys

# Zoom into one pane to read full output
Ctrl+B then z

# Zoom back out
Ctrl+B then z (again)
```

### What's happening

- **Lead pane** (top left): Coordinates the work, tracks the task list
- **Strategist pane**: Developing positioning and messaging
- **Copywriter pane**: Writing creative for different channels
- **Researcher pane**: Analyzing competitors and finding gaps

The teammates work in parallel. Click into any pane and type to send that teammate a message. They can also message each other directly.

### Common steering moves

If you see a teammate getting stuck:

**To the Strategist:**
```
Focus on what makes IE-Nergy defensibly different from Red Bull. 
What positioning would Red Bull *never* claim?
```

**To the Copywriter:**
```
The TikTok script doesn't sound like a TikTok — it reads like a TV spot 
with shorter sentences. Rewrite it as if explaining to a friend.
```

**To the Researcher:**
```
Also look at Celsius and Tenzing — they're the nearest competitors 
in the "functional energy" space.
```

**To the Lead:**
```
Wait for your teammates to finish. Let them message each other 
when they need input. You synthesize after.
```

---

## Review the Deliverables (30 minutes)

When your team finishes, you should have 4 files:

1. **research.md** — Competitor analysis and positioning gaps
2. **strategy.md** — Positioning statement, key messages, channel mix, guardrails
3. **copy.md** — Instagram, TikTok, email, and search ad copy
4. **campaign-summary.md** — The lead's synthesis and recommendation

Open these in your editor and critique them like a marketer would.

**Use the [Critique Checklist](templates.md#critique-checklist)** to evaluate:
- Does the positioning feel different from Red Bull/Monster?
- Does the copy sound like peer recommendation or brand marketing?
- Did the researcher find real gaps or just list features?
- Does the lead make a clear recommendation?

Spend 15-20 minutes reading critically. This is where you develop judgment.

---

## Clean Up

When you're done reviewing:

Inside Claude Code:
```
Clean up the team.
/exit
```

In tmux:
```
Ctrl+B then d  (detach from session)
```

To kill the session completely (optional):
```bash
tmux kill-session -t marketing
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "duplicate session: marketing" | `tmux kill-session -t marketing` then retry |
| Teammates don't appear in split panes | Make sure you're inside tmux (`echo $TMUX` should print something) and the feature flag is set |
| Env var not set | Re-run: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 claude` |
| Panes exist but no activity | They may have spawned in in-process mode. Press Shift+Down to cycle. |
| Teammates overwriting the same file | Make sure each teammate has a single deliverable (Strategist → strategy.md, Copywriter → copy.md, etc.) |

For more troubleshooting, see [Part 5](manual.md#part-5--troubleshooting-guide) of the full manual.

---

## What's Next?

After you've run IE-Nergy:

1. **Critique deeply** — Use the checklist. What's strong? What would you push back on?
2. **Try a second campaign** — Adapt the [IE-Nergy Brief](templates.md#ienergy-brief-template) for your own product
3. **Experiment with roles** — Use the [Team Roles Template](templates.md#team-roles-template) to customize your team
4. **Try advanced patterns** — Read [Part 7](manual.md#part-7--going-further-marketing-specific-patterns) of the manual for persona panels, pre-mortems, and competitive war rooms

---

## Estimated Timeline

| Phase | Time |
|-------|------|
| Setup & tmux session | 15 min |
| Team spawn & work | 30-45 min |
| Review & critique | 30 min |
| Cleanup | 5 min |
| **Total** | **~2 hours** |

Add another 1-2 hours if you iterate, refine, or try additional patterns.

---

## Got Stuck?

- **Quick answers**: Check the [Quick Reference Card](templates.md#quick-reference-card)
- **Detailed troubleshooting**: See [Part 5 of the Manual](manual.md#part-5--troubleshooting-guide)
- **How to critique**: Use the [Critique Checklist](templates.md#critique-checklist)

Good luck! 🚀
