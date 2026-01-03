# Pre-commit Hooks Setup Guide

This document explains how to set up and use pre-commit hooks for the DEPO Financial Dashboard project.

## What Are Pre-commit Hooks?

Pre-commit hooks automatically check your code before each commit to ensure:
- Code quality and consistency
- No security vulnerabilities
- Proper formatting
- Tests pass
- No sensitive data is committed

## Installation

### 1. Install pre-commit

```bash
pip install pre-commit
```

### 2. Install the git hooks

From the project root directory:

```bash
cd C:\Users\cagda\OneDrive\Desktop\Calismalar\Depo
pre-commit install
```

This will install the hooks defined in `.pre-commit-config.yaml`.

### 3. (Optional) Install commit-msg hook

```bash
pre-commit install --hook-type commit-msg
```

## What Gets Checked

### General Checks
- ✅ Trailing whitespace removal
- ✅ End-of-file fixing
- ✅ YAML/JSON/TOML validation
- ✅ Large file detection (>1MB)
- ✅ Merge conflict markers
- ✅ Private key detection
- ✅ Line ending normalization

### Python/Backend Checks
- ✅ **Black** - Code formatting (100 char line length)
- ✅ **isort** - Import sorting
- ✅ **flake8** - Linting and style guide enforcement
- ✅ **bandit** - Security vulnerability scanning
- ✅ **mypy** - Type checking
- ✅ **pytest** - Run all backend tests
- ✅ Custom: No hardcoded credentials
- ✅ Custom: API error handling verification

### TypeScript/Frontend Checks
- ✅ **ESLint** - TypeScript/React linting
- ✅ **Prettier** - Code formatting
- ✅ **TypeScript Compiler** - Type checking (tsc --noEmit)
- ✅ Custom: No console.log in production code
- ✅ Custom: No debugger statements

### Docker Checks
- ✅ **Hadolint** - Dockerfile linting

### Documentation
- ✅ **Markdownlint** - Markdown formatting

### Security
- ✅ **detect-secrets** - Scan for accidentally committed secrets

## Usage

### Automatic (Recommended)

Once installed, hooks run automatically when you commit:

```bash
git add .
git commit -m "Your commit message"
```

The hooks will run and either:
- ✅ **Pass** - Your commit proceeds
- ❌ **Fail** - Fix the issues and try again

### Manual Run

Run all hooks on all files:

```bash
pre-commit run --all-files
```

Run specific hook:

```bash
pre-commit run black --all-files
pre-commit run eslint --all-files
```

Run on specific files:

```bash
pre-commit run --files app/main.py
```

### Skip Hooks (Emergency Only)

To skip hooks (not recommended):

```bash
git commit --no-verify -m "Emergency fix"
```

## Common Issues and Fixes

### Issue 1: Black/Prettier Formatting Changes

**Problem:** Black or Prettier reformats your code

**Solution:** This is expected! The formatters ensure consistent style.
```bash
# Files are automatically fixed
git add .
git commit -m "Your message"
```

### Issue 2: TypeScript Errors

**Problem:** `tsc --noEmit` fails with type errors

**Solution:** Fix the TypeScript errors in your code
```bash
cd frontend
npx tsc --noEmit  # See all errors
# Fix the errors
```

### Issue 3: Tests Failing

**Problem:** pytest fails

**Solution:** Fix your tests or code
```bash
cd backend
python -m pytest tests/ -v  # See detailed output
# Fix failing tests
```

### Issue 4: ESLint Errors

**Problem:** ESLint finds linting issues

**Solution:** Most issues auto-fix, others need manual fixes
```bash
cd frontend
npx eslint src --fix  # Auto-fix what's possible
# Manually fix remaining issues
```

### Issue 5: Flake8 Warnings

**Problem:** flake8 complains about code style

**Solution:** Fix the issues or add exceptions
```python
# Ignore specific line
import something  # noqa: F401

# Ignore entire file (not recommended)
# flake8: noqa
```

### Issue 6: Secrets Detected

**Problem:** detect-secrets finds potential secrets

**Solution:**
1. If false positive, update `.secrets.baseline`:
   ```bash
   detect-secrets scan > .secrets.baseline
   ```
2. If real secret, remove it and use environment variables

## Configuration

### Adjust Python Line Length

Edit `.pre-commit-config.yaml`:

```yaml
- repo: https://github.com/psf/black
  hooks:
    - id: black
      args: ['--line-length=120']  # Change from 100 to 120
```

### Disable Specific Hooks

Comment out in `.pre-commit-config.yaml`:

```yaml
# - repo: https://github.com/igorshubovych/markdownlint-cli
#   hooks:
#     - id: markdownlint
```

### Add Custom Hooks

Add to `local` repo section in `.pre-commit-config.yaml`:

```yaml
- repo: local
  hooks:
    - id: your-custom-hook
      name: Your Custom Check
      entry: bash -c 'your-command-here'
      language: system
      files: \.py$
```

## Pre-commit Commands Cheat Sheet

```bash
# Install hooks
pre-commit install

# Run all hooks on all files
pre-commit run --all-files

# Run all hooks on staged files
pre-commit run

# Run specific hook
pre-commit run black

# Update hooks to latest versions
pre-commit autoupdate

# Uninstall hooks
pre-commit uninstall

# Show hook info
pre-commit run --help

# Skip hooks for one commit (emergency only)
git commit --no-verify
```

## CI/CD Integration

The same hooks can run in your CI/CD pipeline:

```yaml
# .github/workflows/pre-commit.yml
name: Pre-commit

on: [push, pull_request]

jobs:
  pre-commit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - uses: pre-commit/action@v3.0.0
```

## Best Practices

1. **Run before committing large changes:**
   ```bash
   pre-commit run --all-files
   ```

2. **Update hooks regularly:**
   ```bash
   pre-commit autoupdate
   ```

3. **Don't skip hooks** unless absolutely necessary

4. **Fix issues immediately** rather than accumulating them

5. **Keep hooks fast** - If a hook takes too long, consider making it optional or moving to CI

## Project-Specific Hooks

### Backend API Error Handling Check

Ensures all FastAPI routes have try-except blocks:

```python
@router.get("/endpoint")
async def my_endpoint():
    try:
        # Your code
        return {"status": "success"}
    except Exception as e:
        # Proper error handling
        raise HTTPException(status_code=500, detail=str(e))
```

### No Console.log Check

Prevents console.log in production frontend code:

```typescript
// ❌ Will fail pre-commit
console.log("Debug info");

// ✅ Use proper logging or remove for production
// console.log("Debug info");  // Commented out
```

### No Hardcoded Credentials

Prevents committing secrets:

```python
# ❌ Will fail
API_KEY = "sk-1234567890abcdef"

# ✅ Use environment variables
API_KEY = os.getenv("API_KEY")
```

## Troubleshooting

### Hooks not running

```bash
# Reinstall
pre-commit uninstall
pre-commit install
```

### Cache issues

```bash
# Clear cache
pre-commit clean
pre-commit run --all-files
```

### Python version issues

```bash
# Specify Python version
pre-commit run --all-files --hook-stage manual --python python3.11
```

## Resources

- [Pre-commit Documentation](https://pre-commit.com/)
- [Black Documentation](https://black.readthedocs.io/)
- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)

## Summary

Pre-commit hooks help maintain code quality automatically. They:
- ✅ Catch issues before they reach the repository
- ✅ Enforce consistent code style
- ✅ Prevent security vulnerabilities
- ✅ Save time in code review
- ✅ Keep the codebase clean

**Setup once, benefit forever!**
