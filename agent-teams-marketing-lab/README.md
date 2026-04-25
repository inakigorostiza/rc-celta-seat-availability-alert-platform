# Agent Teams Marketing Lab
## A Hands-On Guide to Building Campaigns with AI Teammates

This lab teaches you how to use **Agent Teams** — an experimental feature in Claude Code — to build marketing campaigns with parallel AI specialists.

### What you'll learn

- How to structure a marketing brief for AI teams
- How to define distinct specialist roles (Strategist, Copywriter, Researcher)
- How to spawn and manage multiple Claude instances working on the same project
- How to evaluate and critique AI-generated marketing work
- Advanced patterns: persona panels, pre-mortems, competitive war rooms, and more

### The core exercise

You'll spawn three teammates to build a launch campaign for **IE-Nergy**, a fictional energy drink:
- A **Strategist** develops positioning and messaging
- A **Copywriter** crafts channel-specific creative (Instagram, TikTok, email, search)
- A **Researcher** analyzes competitors and uncovers positioning gaps

The team works in parallel. You watch them coordinate, challenge each other's ideas, and produce a complete campaign brief.

### Structure of this lab

- **MANUAL.md** — Full step-by-step guide, from installation to teardown
- **templates/** — Ready-to-use briefs and role templates for different campaigns
- **examples/** — Sample deliverables from past IE-Nergy runs
- **assets/** — Checklists, reference cards, and troubleshooting guides

### Before you start

Requirements:
- Claude Code 2.1.32+ (`claude --version`)
- Node.js 18+ (`node --version`)
- tmux (`tmux -V`)
- A system terminal (not VS Code's integrated terminal)

### Quick start

1. Read **MANUAL.md** entirely first — don't skip the theory in Part 1
2. Work through Part 2 (installation) and Part 3 (tmux basics)
3. Start with the IE-Nergy exercise in Part 4
4. After you've shipped one campaign, try the patterns in Part 7

### After the exercise

The goal isn't just to generate copy — it's to **develop your judgment**. After your team finishes, spend 15 minutes reading the deliverables critically. What's actually strong? What's generic? What would you push back on in a real review? That critique is where the real learning happens.

### Common questions

**Q: Can I run this on Windows?**  
A: Yes, but use WSL2 (Windows Subsystem for Linux). The tmux split-pane display won't work in native Windows Terminal.

**Q: What if I don't have tmux?**  
A: The team will spawn in in-process mode instead, where you cycle between teammates with Shift+Down. It works, but split-pane mode is much better for learning.

**Q: How much does this cost?**  
A: Each teammate is a separate Claude instance, so running a 3-person team costs 3× a single session. Typical campaign runs about $3-5 USD depending on the complexity and how much you refine the output.

**Q: Can I use Agent Teams for my real marketing work?**  
A: Absolutely. Start with IE-Nergy to learn the patterns, then apply them to your own briefs. The framework (strong roles, clear deliverables, async coordination) works for any campaign.

**Q: My team keeps conflicting on the same file.**  
A: Assign each teammate a single deliverable. Don't have two people writing copy.md — one does Instagram, one does TikTok, one does email.

### Support

If you get stuck:
1. Check the **Troubleshooting Guide** in Part 5 of MANUAL.md
2. Run `claude /doctor` to diagnose your installation
3. Verify the env var is set: `echo $CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`

---

**Let's build something.** Start with MANUAL.md and pick a quiet afternoon. You'll learn more from watching three AI agents coordinate than from reading about it.
