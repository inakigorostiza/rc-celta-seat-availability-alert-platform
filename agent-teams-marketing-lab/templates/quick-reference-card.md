# Agent Teams Quick Reference Card

## Startup

```bash
# Open system terminal (not VS Code)
tmux new -s marketing

# Create workspace
mkdir ~/Documents/ienergy-launch
cd ~/Documents/ienergy-launch

# Enable Agent Teams
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 claude
```

## Inside Claude Code

Verify feature is enabled:
```
Check whether CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS is set in your environment.
```

Spawn the team:
```
Read brief.md, then create an agent team with 3 teammates in tmux split-pane mode...
```

## Tmux Navigation

| Command | What it does |
|---------|------------|
| Ctrl+B → arrow keys | Move between panes |
| Ctrl+B → z | Zoom in/out of one pane |
| Ctrl+B → d | Detach (keep team running) |
| Shift+Down | Cycle teammates (if not in split-pane) |

System commands (from terminal, not tmux):
```
tmux ls                    # List active sessions
tmux attach -t marketing   # Reconnect to session
tmux kill-session -t marketing  # Stop everything
```

## Steering the Team

Click into any pane and type to send that teammate a message:

**To the Strategist:**
```
Focus on what makes IE-Nergy defensibly different from Red Bull and Monster. 
What's one positioning angle that Red Bull would *never* claim?
```

**To the Copywriter:**
```
The TikTok script doesn't sound like a TikTok — it reads like a TV spot 
with shorter sentences. Rewrite it as if you're explaining this to a friend.
```

**To the Researcher:**
```
Also analyze Celsius and Tenzing — they're the nearest competitors in 
the "functional energy" space, not just mainstream energy drinks.
```

**To the Lead:**
```
Wait for your teammates to finish before synthesizing. Let them message 
each other directly when they need input.
```

## Expected Deliverables

After the team finishes, you should have:

- **research.md** — Competitor profiles, positioning, gaps
- **strategy.md** — Positioning statement, 3 key messages, channel mix, what NOT to say
- **copy.md** — Instagram caption, TikTok script, email (subject + opening), Google Search ad
- **campaign-summary.md** — Lead's synthesis and recommendation

## Review Checklist

After deliverables are done, check:

- [ ] Does the positioning actually feel different from competitors?
- [ ] Does the tone match the audience (conversational, peer-to-peer)?
- [ ] Is the copy format appropriate for each channel?
- [ ] Did the researcher find real gaps or just list features?
- [ ] Does the lead make a clear recommendation?
- [ ] Are there any buzzwords or generic phrases to cut?

## Cleanup

```
# Inside Claude Code
Clean up the team.
/exit

# In terminal
Ctrl+B then d  (to detach)
tmux kill-session -t marketing  (to remove)
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "duplicate session" | `tmux kill-session -t marketing` then try again |
| No split panes appear | Check `echo $TMUX` and `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` |
| Panes visible but teammates not working | They may be in in-process mode; use Shift+Down to cycle |
| One teammate writing over another's files | Assign each teammate a single deliverable file |
| Generic copy output | Give the copywriter specific constraints ("no buzzwords like 'fuel'") |

## Tips

**What good briefing looks like:**
- Specific role definitions with personality ("irreverent Gen Z copywriter")
- Exact deliverable formats (word counts, structure)
- What NOT to do ("don't use corporate speak")
- Workflow order (Researcher → Strategist → Copywriter)

**What to avoid:**
- Vague instructions ("make it punchy")
- Asking two teammates to write the same file
- Letting the lead write the copy instead of waiting for the copywriter
- Not reviewing the output with critical eyes

**Advanced patterns to try later:**
- Persona panel (4 teammates each playing a customer, critiquing the campaign)
- Pre-mortem (3 devil's advocates finding reasons the campaign might fail)
- Competitive war room (one teammate per competitor)
- Brand voice audit (same copy rewritten in 3 different tones)

---

Print this card. Put it next to your monitor while you run your first campaign.
