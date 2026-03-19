# Koach — Session Starter

Read this before every polish session. Then read `POLISH_PLAN.md`.

## Start of Session Checklist

```bash
# 1. Confirm you're in the right directory
pwd  # should be: .../Tactik/tactic-board

# 2. Check git status — no uncommitted leftover work
git status
git log --oneline -5

# 3. Start dev server
npm run dev

# 4. Open browser plugin → navigate to http://localhost:5173
# 5. Check CLAUDE.md → "Current Status" to find next task
# 6. Open POLISH_PLAN.md → jump to that task
```

## End of Session Checklist

```bash
# 1. Commit all work
git add -A
git commit -m "polish: [brief description of what was done]"

# 2. Update CLAUDE.md → Current Status section:
#    - Last completed task: [task ID and name]
#    - Next task: [next task ID and name]
#    - Known issues: [anything that needs attention]

# 3. Run build to catch TypeScript errors
npm run build
# Fix any errors before ending session
```

## Task Priority If Time Is Limited

If you only have 30 minutes, do these in order:
1. **M1** — Mobile toolbar overflow (biggest UX break)
2. **M2** — Touch drag activation (core mobile interaction)
3. **A2** — Arrow delete button (major mobile UX gap)
4. **O1-O5** — Orientation toggle (desktop improvement)

Everything else is polish on top of a working product.

## Known Constraints

- **Never refactor store logic while fixing UI** — keep changes isolated
- **Test on mobile simulation after every change** — regressions happen fast
- **Commit after each task** — don't batch multiple tasks into one commit
- **Don't change `SerializableState`** — URL shares from existing users will break
- **Pitch viewBox is `0 0 680 1050` (portrait) and `0 0 1050 680` (landscape)** — never change these values
