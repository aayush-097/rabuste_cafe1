# Troubleshooting Render Deployment

## Issue: "Root directory does not exist"

If Render says the root directory doesn't exist, check the following:

### 1. Verify Files Are Committed to Git

Render only sees files that are committed to your Git repository. Make sure all files are committed:

```bash
# Check if files are committed
git status

# If you see untracked or uncommitted files, add and commit them:
git add rabuste_cafe1/cafe-bot/
git commit -m "Add cafe-bot service files"
git push
```

### 2. Verify the Exact Path

The root directory path is case-sensitive and must match exactly:

**Correct**: `rabuste_cafe1/cafe-bot`  
**Incorrect**: 
- `rabste_cafe1/cafe-bot` (missing 'u')
- `Rabuste_Cafe1/cafe-bot` (wrong case)
- `cafe-bot` (missing parent directory)

### 3. Check Your Repository Root

The path in Render is relative to your **Git repository root**, not your local file system.

To find your repo root:
```bash
git rev-parse --show-toplevel
```

Then verify the path from that root:
```
your-repo-root/
└── rabuste_cafe1/
    └── cafe-bot/    ← This is what Render needs
```

### 4. Verify in Render Dashboard

1. Go to your Render service settings
2. Check the "Root Directory" field
3. It should be exactly: `rabuste_cafe1/cafe-bot`
4. No leading slash, no trailing slash

### 5. Check Branch

Make sure Render is deploying from the correct branch (usually `main` or `master`), and that branch has the `cafe-bot` directory.

### 6. Verify Files Exist in Repository

You can verify files are in your repo by checking on GitHub/GitLab:
- Navigate to: `rabuste_cafe1/cafe-bot/main.py`
- If you can see this file, the directory exists in your repo
- If you can't see it, the files aren't committed

### Common Mistakes

1. **Typo in path**: `rabste_cafe1` instead of `rabuste_cafe1`
2. **Wrong repository root**: Using path from wrong directory level
3. **Uncommitted files**: Files exist locally but not in Git
4. **Wrong branch**: Files are on a different branch than Render is deploying

### Quick Fix Checklist

- [ ] All files are committed: `git status` shows clean
- [ ] Files are pushed: `git push` completed successfully
- [ ] Path is correct: `rabuste_cafe1/cafe-bot` (exact spelling)
- [ ] No typos: Check for `rabuste` (with 'u'), not `rabste`
- [ ] Branch matches: Render is deploying from the branch with your files
- [ ] Case sensitive: `cafe-bot` not `Cafe-Bot` or `CAFE-BOT`
