# Working with AI Agent Teams in Claude Code
### A Hands-On Manual for Marketing Students

## Introduction

Marketing campaigns are rarely a one-person job. A good campaign needs a strategist thinking about positioning, a copywriter crafting the message, a researcher checking the competition, and an analyst making sense of the numbers. Now imagine you could spin up that whole team on demand — and have them work in parallel on the same brief.

That's what Agent Teams in Claude Code lets you do. It's an experimental feature where multiple Claude instances work together on the same project, each in its own context window, each able to talk to the others.

One session takes on the role of team lead: it coordinates the work, assigns tasks to specialists, and synthesizes their findings into a single deliverable. The other sessions are teammates: independent Claude instances that pick up tasks, communicate directly with each other, and report back through a shared task list.

This is different from subagents — Claude's other parallel-work feature. Subagents only report back to the main session and can't talk to each other. Agent Teams can. That makes Agent Teams the right tool when you need specialists to debate ideas, share findings, or build on each other's work.

### When to use Agent Teams in marketing work

Agent Teams shine when work can be genuinely parallelized:

- Campaign brainstorming — different teammates explore different angles, audiences, or channels in parallel
- Competitive analysis — each teammate investigates a different competitor, then they compare notes
- Content production — one teammate writes long-form, another writes social posts, another drafts email copy, all from the same brief
- Persona-driven critique — different teammates evaluate the same campaign through the lens of different target audiences
- Cross-channel campaign development — separate teammates own the messaging for each channel (web, email, social, paid ads)

They're not a good fit for sequential tasks (e.g., draft → edit → polish — that's one Claude session, not three). They also struggle when teammates need to edit the same document at the same time. Use them where the work genuinely splits.

### Compare with subagents

Both Agent Teams and subagents let you parallelize work, but they operate differently. Choose based on whether your workers need to talk to each other.

Subagents only report results back to the main agent and never talk to each other. In Agent Teams, teammates share a task list, claim work, and communicate directly with each other.

|                  | Subagents                                       | Agent Teams                                       |
|------------------|-------------------------------------------------|---------------------------------------------------|
| **Context**      | Own context window; results return to the caller | Own context window; fully independent             |
| **Communication**| Report results back to the main agent only      | Teammates message each other directly             |
| **Coordination** | Main agent manages all work                     | Shared task list with self-coordination           |
| **Best for**     | Focused tasks where only the result matters     | Complex work requiring discussion and collaboration |
| **Token cost**   | Lower: results summarized back to main context  | Higher: each teammate is a separate Claude instance |

Use subagents when you need quick, focused workers that report back. Use Agent Teams when teammates need to share findings, challenge each other, and coordinate on their own.

For the IE-Nergy exercise, Agent Teams is the right choice: the strategist's positioning needs to inform the copywriter's tone, and the researcher's competitive findings need to shape the strategist's recommendations. The teammates have to talk to each other. If you only needed three independent first-draft taglines with no interdependence, subagents would be cheaper and faster.

### Display modes

Agent Teams support two ways of showing teammates on screen:

- In-process mode — all teammates run inside a single terminal window. You cycle between them with Shift+Down and type to message whichever teammate you've cycled to. This works in any terminal with no extra setup.
- Split-pane mode — each teammate appears in its own visual pane, side by side. You can click into any pane to interact with that teammate directly. This requires either tmux or iTerm2 with the it2 CLI installed.

For learning, split-pane mode is much more intuitive — you can literally watch your strategist, copywriter, and researcher working at once. That's what this manual will set up.

IMPORTANT: Split-pane mode does not work inside VS Code's integrated terminal, Windows Terminal, or Ghostty. You must use a system terminal (Terminal.app, iTerm2) or a Linux terminal that supports tmux.

For the full reference: https://code.claude.com/docs/en/agent-teams


## Part 1 — Prerequisites

Before starting, make sure you have:

- Claude Code 2.1.32 or later (check with: claude --version)
- Node.js 18 or later (check with: node --version)
- tmux, any recent version (check with: tmux -V)
- Operating system: macOS or Linux (Windows users: use WSL2)


## Part 2 — Installation

### 2.1 Install Node.js (if needed)

Claude Code runs on Node.js. Install it from https://nodejs.org (LTS version is fine).

Verify:
   node --version

### 2.2 Install Claude Code

Open your system terminal and run:
   npm install -g @anthropic-ai/claude-code

Verify:
   claude --version

You should see version 2.1.32 or later.

### 2.3 Install tmux

On macOS:
   brew install tmux

(Requires Homebrew. If you don't have it, install from https://brew.sh.)

On Linux (Debian/Ubuntu):
   sudo apt update && sudo apt install tmux

On Linux (Fedora/RHEL):
   sudo dnf install tmux

Verify:
   tmux -V

### 2.4 Run a sanity check

Launch Claude Code:
   claude

Then type:
   /doctor

If you see "Multiple installations found," you have more than one copy of Claude Code on your system. Ask your instructor to help clean it up before continuing.

Exit Claude Code with /exit.


## Part 3 — Tmux quick reference

Tmux uses a prefix key before every command — by default that's Ctrl+B. You press it, release, then press the next key.

- Ctrl+B then arrow keys — move between panes
- Ctrl+B then z — zoom into one pane (toggle)
- Ctrl+B then d — detach from session (keeps running)
- tmux ls — list active sessions
- tmux attach -t <name> — reattach to a session
- tmux kill-session -t <name> — kill a session


## Part 4 — The Exercise: Build a Campaign with an AI Marketing Team

You'll spawn a team of three Claude teammates to develop a launch campaign for a fictional product. Each teammate plays a different marketing role, and you'll watch them work in parallel.

### The brief

You're launching **IE-Nergy**, a new energy drink positioned for university students and young professionals who need clean, sustained focus — for studying, deep work, and creative output, not for partying or extreme sports. It's a deliberate counterpoint to the loud, hyper-masculine codes of the traditional energy drink category (Red Bull, Monster, Bang).

Key product facts: 150mg natural caffeine from green tea and guarana, L-theanine for sustained focus without jitters, B-vitamins, no sugar, only 15 calories. Available in three flavors: Yuzu Citrus, Wild Berry, Matcha Mint. Priced at €2.50/can. Launching in Spain first (Madrid and Barcelona), expanding to other European cities by year-end. You have six weeks until launch.

### Meet your team

Before you spawn the agents, here's who they are. Treat these like role briefings you'd give to real freelancers — the more specific the persona, the better the work.

**The Strategist** — A senior brand strategist with 10+ years launching consumer challenger brands in crowded categories. Thinks in terms of category positioning, jobs-to-be-done, and defensible differentiation. Skeptical of generic claims like "premium" or "natural" — pushes for sharp, ownable angles. Has a strong point of view on what NOT to say. Grounds every recommendation in audience insight.

**The Copywriter** — A direct-response copywriter who's written launch campaigns for digitally-native consumer brands aimed at Gen Z and young Millennials. Writes in a conversational, specific voice — never corporate, never "brand-speak." Knows the difference between Instagram, TikTok, email, and search ad copy and refuses to write the same line for all four. Hates buzzwords ("elevate," "unlock your potential," "fuel your journey").

**The Researcher** — A competitive intelligence analyst with a marketing background. Investigates not just what competitors say, but what they *don't* say — looking for whitespace and positioning gaps. Reports findings as actionable insight, not feature comparison tables. Comfortable making confident judgments from limited data.

### Step 1 — Open a system terminal

Open Terminal.app (macOS), iTerm2, or your Linux terminal. Do not use VS Code's integrated terminal.

### Step 2 — Start a tmux session

   tmux new -s marketing

You'll know it worked when you see a colored status bar at the bottom of your terminal.

If you get "duplicate session: marketing", an old session is still alive. Either reattach with tmux attach -t marketing, or remove it with tmux kill-session -t marketing.

### Step 3 — Create a project folder

Make a fresh folder so the team has a workspace to save deliverables:

   mkdir ~/Documents/ienergy-launch
   cd ~/Documents/ienergy-launch

### Step 4 — Create a brief file

Before launching the team, create a simple brief file so each teammate has shared context. In your terminal:

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

### Step 5 — Launch Claude Code with the feature flag enabled

Agent Teams are experimental and disabled by default. Enable them inline:

   CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 claude

This activates Agent Teams just for this session.

### Step 6 — Verify the feature is active

Once Claude Code is running, ask:

   Check whether CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS is set in your environment.

Claude should confirm it's set to 1. If not, exit (/exit) and relaunch with the inline command.

### Step 7 — Spawn your marketing team

Paste this prompt into Claude Code:

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

Watch your terminal: as Claude spawns each teammate, tmux will split into multiple panes automatically. This is the moment of payoff.

### Step 8 — Interact with the team

While the team works:

- Click into a pane (or use Ctrl+B then arrow keys) to inspect what each teammate is doing
- Zoom into one pane with Ctrl+B then z to read the full output, press again to zoom out
- Send a teammate extra direction by clicking into their pane and typing — for example, ask the copywriter to make the TikTok script feel more like a peer recommendation than an ad, or ask the researcher to also look at adjacent categories like nootropic drinks
- Watch the lead's pane — it tracks the shared task list and synthesizes findings as teammates report

### Step 9 — Steer the team if needed

A few things you may notice and how to handle them:

- The lead starts writing copy itself instead of waiting for the copywriter teammate → tell it: "Wait for your teammates to complete their tasks before proceeding."
- The copywriter writes generic copy → click into their pane: "Push harder on the anti-bro positioning. The voice should feel like a smart friend, not a brand. Avoid words like 'fuel,' 'crush,' 'unleash.'"
- The researcher misses an important competitor → "Also include Celsius and Yfood in your analysis — they're the most relevant challenger brands."
- You want to add a specialist mid-stream → "Spawn an additional teammate as a campus marketing planner to draft a 30-day activation plan for Madrid and Barcelona universities."

### Step 10 — Review the deliverables

When the team finishes, you should have:

- research.md — competitor breakdown and positioning gaps
- strategy.md — positioning statement, key messages, channel mix, and explicit "what not to say"
- copy.md — launch creative across Instagram, TikTok, email, and search
- campaign-summary.md — the lead's synthesis

Open these in your editor and review them. Critique the output as a marketer would — what's strong, what's generic, what would you push back on? This is the most valuable part of the exercise. AI teams produce a strong first draft, but they're not a substitute for marketing judgment.

Specific things to look for:
- Does the positioning actually feel different from Red Bull/Monster, or did the strategist drift toward generic "premium energy" language?
- Does the TikTok script sound like a TikTok script or like a TV ad with shorter sentences?
- Did the researcher find real positioning gaps, or just list features?
- Does the lead's summary make a clear recommendation, or does it hedge?

### Step 11 — Clean up the team

When you're done:

   Clean up the team.

This shuts down the teammates and removes the shared task list. Always run cleanup through the lead — never from a teammate's pane.

### Step 12 — Exit Claude Code and tmux

Type /exit inside Claude Code. Then detach from tmux:
   Ctrl+B then d

To kill the tmux session entirely:
   tmux kill-session -t marketing


## Part 5 — Troubleshooting Guide

### "duplicate session: marketing"
A previous tmux session is still alive. Reattach with tmux attach -t marketing or remove it with tmux kill-session -t marketing.

### Panes don't appear when the team spawns
Three things to check, in order:

1. Are you inside tmux? Run echo $TMUX. If it prints nothing, you're not — exit Claude Code, run tmux new -s marketing, and relaunch.
2. Is the feature flag set? When Claude says "experimental agent teams mode isn't enabled", it means the env var didn't load. Make sure you launched with CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 claude.
3. Did Claude actually spawn a team? If your prompt was vague, Claude may have just done the work itself. Re-prompt explicitly: "Spawn 3 teammates now."

### "permission denied" when editing .zshrc
Your shell config is owned by root. Fix with:
   sudo chown $(whoami):staff ~/.zshrc

For class purposes, just stick with the inline CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 claude command — no .zshrc editing required.

### "Multiple installations found"
You have Claude Code installed two ways. Ask your instructor for help cleaning it up.

### Teammates exist but no panes are visible
They may have spawned in in-process mode. Press Shift+Down to cycle through them. If you see them this way, tmux mode didn't activate — exit and relaunch from inside tmux.

### Orphaned tmux session after cleanup
Run tmux ls and tmux kill-session -t <name> for any leftovers.


## Part 6 — Best Practices for Marketing Teams

Once you're comfortable with the basics:

**Brief like you'd brief a real team.** Your spawn prompt is the creative brief. Vague briefs get vague work — from humans and from AI alike. Spell out audience, tone, channels, deliverables, success criteria, and what to avoid.

**Define the role, not just the task.** "Write Instagram copy" is a task. "You are a Gen Z direct-response copywriter who writes like a smart friend, hates buzzwords, and writes specifically for Instagram" is a role. Roles produce sharper, less generic work.

**Specify the deliverable format precisely.** Word counts, character limits, structure. Without this, agents produce different shapes of output that don't combine well. With it, you get something you can actually compare and assemble.

**Tell the team what NOT to do.** Constraints sharpen output. "Don't use the words 'unleash,' 'fuel,' or 'crush'" is more useful than "use a fresh tone." This applies to positioning too — knowing what you're rejecting clarifies what you're claiming.

**Keep teams between 3 and 5 teammates.** Three is often the sweet spot for marketing work: strategist + creative + researcher covers most campaigns. Add a fourth (analyst, paid media planner) only when you genuinely need that lens.

**Use the debate pattern for tough positioning calls.** Spawn 3 teammates each defending a different positioning angle, then have them argue. The position that survives the debate is usually stronger than one written by a single agent.

**Critique the output. Always.** AI teams produce confident-sounding work that often needs sharpening. The most valuable skill you'll build is reading AI-generated marketing work like an editor — spotting the generic phrases, the missed audience nuance, the unsupported claims.

**Avoid having two teammates write the same deliverable.** They'll overwrite each other's files. Make each teammate own a different artifact.

**Clean up between teams.** A lead can only manage one team at a time. Always run "Clean up the team" before starting a new campaign.


## Part 7 — Going Further: Marketing-Specific Patterns

Once you've run the IE-Nergy exercise, try these:

**Persona panel.** Spawn 4 teammates each playing a different target persona (e.g., "first-year university student in Madrid," "25-year-old junior consultant working long hours," "graduate student writing a thesis," "young creative freelancer"). Show them the same campaign concept and ask each one to react in character. Surfaces audience misalignment fast.

**Pre-mortem.** Spawn 3 teammates as devil's advocates. Brief them on the planned IE-Nergy launch and ask each to find the strongest reason it might fail (e.g., "the anti-bro positioning is too narrow," "Red Bull will out-spend us 100:1," "students won't pay €2.50 for a can"). Powerful for sanity-checking before launch.

**Competitive war room.** Spawn one teammate per major competitor. Each one stays "in character" as that competitor's marketing team and tries to anticipate how they'd respond to IE-Nergy's launch. The lead synthesizes a competitive response strategy.

**Channel adaptation.** Spawn one teammate per channel (TikTok, Instagram, Spotify audio, campus activations). Hand them the same core message and have each adapt it natively for their channel — checking with each other to keep the campaign coherent.

**Brand voice audit.** Spawn 3 teammates each interpreting the IE-Nergy voice differently ("calm and confident," "witty and irreverent," "warm and encouraging"). Have them each rewrite the same piece of copy. Compare to clarify what the brand voice actually is.


## Quick Reference Card

Start a session:
   tmux new -s marketing
   cd ~/your/campaign-folder
   CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 claude

Spawn a team (in Claude Code):
   Create an agent team with 3 teammates in tmux split-pane mode...

Move between panes:
   Ctrl+B then arrow keys      Move between panes
   Ctrl+B then z               Zoom in/out of a pane
   Shift+Down                  Cycle teammates (in-process mode)

Wrap up:
   Clean up the team             (in Claude Code)
   /exit                         (in Claude Code)
   Ctrl+B then d                 (detach from tmux)
   tmux kill-session -t marketing (remove the session)


Happy launching!
