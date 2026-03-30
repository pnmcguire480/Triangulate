# Knowledge Graph / Research Tools — Brainstorm
> Date: 2026-03-25
> Triggered by: Patrick's "Charlie Day conspiracy board" insight

## The Core Insight

Triangulate's data IS a knowledge graph. Stories = nodes. Sources = nodes. Claims = edges.
The best tools for exploring knowledge graphs are NotebookLM and Obsidian.
The Charlie Day meme is the UX metaphor — red strings connecting pushpins. Except every string has a convergence score.

## Four Interlocking Features (All Journalist Pro)

### 1. The Connection Map (In-App)
- Force-directed canvas: stories (sized by convergence) + sources (colored by bias) + claims (edges)
- Red strings = contested. Green strings = converged.
- A journalist sees: tariff story connects to subsidy story via 3 shared claims → both connect to climate story via government data
- Not reading individual stories — seeing the WEB of verified facts across a beat
- Implementation: D3.js or vis.js force-directed graph

### 2. NotebookLM Export
- "Research Pack" — ZIP of structured Markdown files with YAML frontmatter
- Upload to NotebookLM → cross-document Q&A, audio briefings, pattern detection
- Killer use case: "Generate an audio summary of today's highest-convergence stories"
- Another: upload a month of packs → "How has coverage of [topic] changed?"

### 3. Obsidian Vault Export
- Stories, claims, sources as interconnected Markdown notes with [[wiki-links]]
- Obsidian graph view = the conspiracy board
- Incremental: "Add to existing vault" merges without duplicating
- Over months: personal verified-fact database that grows with every export
- Journalist can search: "What has Source X gotten right?" or "Every claim about Y that was confirmed"

### 4. The Data Base (Persistent Research Workspace)
- Every story viewed, claim bookmarked, source tracked → logged + searchable
- Personal intelligence archive that grows with every session
- Timeline view, graph view, full-text search, research stats
- Exportable to NotebookLM or Obsidian at any time
- THE Journalist Pro killer feature: the longer you subscribe, the more valuable your archive

## Why This Matters

The free tier shows you where enemies agree TODAY.
Premium lets you filter, search, and analyze.
Journalist Pro lets you BUILD A PERSONAL TRUTH ARCHIVE OVER TIME.

The Data Base is not a feature you rent — it's an investment you build.
That's why $14.99/month feels obvious to a working journalist.

## Implementation Notes

- NotebookLM + Obsidian exports are just new format options in the existing Export system (Chunk 6)
- The Connection Map uses D3 force-directed layout — can reuse the existing bias/region color tokens
- The Data Base needs new Prisma models: ResearchLog, ResearchNote
- The Research page (/research) is a new route with timeline + graph views
- All Phase 5A — post-launch but architecturally prepared by the launch roadmap
