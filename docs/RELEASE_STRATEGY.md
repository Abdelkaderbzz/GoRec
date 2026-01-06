# GoRec Release Strategy

## Professional Release Management for Production Applications

---

## 🎯 Release Philosophy

**Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH`

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes, major UI overhauls
- **MINOR** (1.0.0 → 1.1.0): New features, backwards compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, security patches

---

## 🌳 Branch Strategy (GitFlow Simplified)

```
main (production)
  ↑
  └── develop (staging/integration)
        ↑
        ├── feature/screen-annotation
        ├── feature/cloud-sync
        ├── fix/upload-timeout
        └── hotfix/security-patch
```

### Branch Rules:

| Branch      | Purpose                   | Deploys To                  | Protection                      |
| ----------- | ------------------------- | --------------------------- | ------------------------------- |
| `main`      | Production releases       | Production (gorec.app)      | Require PR, 1 approval, CI pass |
| `develop`   | Integration & staging     | Staging (staging.gorec.app) | Require PR, CI pass             |
| `feature/*` | New features              | Preview (PR previews)       | None                            |
| `fix/*`     | Bug fixes                 | Preview                     | None                            |
| `hotfix/*`  | Critical production fixes | Fast-track to main          | 1 approval                      |

---

## 📦 Release Types

### 1. Regular Release (Weekly/Bi-weekly)

```
feature/* → develop → main
```

- Accumulate features in `develop`
- Test on staging environment
- Create release PR to `main`
- Tag with version (v1.2.0)

### 2. Hotfix Release (As needed)

```
hotfix/* → main (and back-merge to develop)
```

- Critical security or breaking bugs only
- Fast-track approval process
- Immediate deployment

### 3. Beta/Preview Release

```
develop → beta tag (v1.3.0-beta.1)
```

- For testing new features with select users
- Deploy to beta.gorec.app

---

## 🔄 Release Workflow

### Phase 1: Development (Continuous)

```bash
# Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# Work on feature...
git commit -m "feat: add screen annotation"

# Push and create PR to develop
git push origin feature/new-feature
gh pr create --base develop
```

### Phase 2: Staging (Pre-release)

```bash
# After PR merged to develop
# Automatic deployment to staging.gorec.app
# QA testing period: 2-3 days minimum
```

### Phase 3: Release Preparation

```bash
# Create release branch (optional for larger releases)
git checkout develop
git checkout -b release/v1.2.0

# Update version
npm version minor -m "chore: bump version to %s"

# Update CHANGELOG.md
# Final testing

# Merge to main
gh pr create --base main --title "Release v1.2.0"
```

### Phase 4: Production Release

```bash
# After PR approved and merged
git checkout main
git pull origin main

# Tag the release
git tag -a v1.2.0 -m "Release v1.2.0: Screen annotations, bug fixes"
git push origin v1.2.0

# Create GitHub Release
gh release create v1.2.0 --title "v1.2.0" --notes-file RELEASE_NOTES.md
```

### Phase 5: Post-release

```bash
# Back-merge main to develop
git checkout develop
git merge main
git push origin develop
```

---

## 🏷️ Version Numbering Guide

### Current: v0.x.x (Pre-release/Beta)

You're building towards v1.0.0. Use:

- `v0.1.0` - Initial working version
- `v0.2.0` - Major feature additions
- `v0.2.1` - Bug fixes

### Production: v1.x.x+

After stable release:

- `v1.0.0` - First stable release
- `v1.1.0` - New feature (annotations)
- `v1.1.1` - Bug fix
- `v2.0.0` - Major redesign or breaking API

### Pre-release Tags

- `v1.2.0-alpha.1` - Early testing
- `v1.2.0-beta.1` - Feature complete, testing
- `v1.2.0-rc.1` - Release candidate

---

## 📋 Release Checklist

### Before Release

- [ ] All tests passing
- [ ] Security audit passing (`node supabase/security-audit.js`)
- [ ] No critical bugs in issue tracker
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Documentation updated
- [ ] Database migrations reviewed
- [ ] Environment variables documented

### During Release

- [ ] PR approved by at least 1 reviewer
- [ ] CI/CD pipeline green
- [ ] Staging environment tested
- [ ] Release notes prepared

### After Release

- [ ] Production deployment verified
- [ ] Smoke tests passing
- [ ] Monitoring dashboards checked
- [ ] Team notified
- [ ] Social media announcement (major releases)
- [ ] Back-merge to develop

---

## 🚀 Deployment Environments

| Environment | URL               | Branch      | Auto-deploy |
| ----------- | ----------------- | ----------- | ----------- |
| Development | localhost:8080    | any         | Manual      |
| Preview     | pr-123.gorec.app  | PR branches | On PR       |
| Staging     | staging.gorec.app | develop     | On merge    |
| Production  | gorec.app         | main        | On tag      |

---

## 📊 Release Metrics to Track

1. **Deployment Frequency**: How often you release
2. **Lead Time**: PR open → Production
3. **Change Failure Rate**: % of releases causing issues
4. **Mean Time to Recovery**: Time to fix production issues

---

## 🗓️ Suggested Release Schedule

### For GoRec (Early Stage):

| Cadence   | Type  | Description                              |
| --------- | ----- | ---------------------------------------- |
| Weekly    | Patch | Bug fixes, small improvements            |
| Bi-weekly | Minor | New features                             |
| Quarterly | Major | Big features, potential breaking changes |

### Release Day: **Tuesday/Wednesday**

- Avoid Friday releases (no weekend debugging)
- Avoid Monday (post-weekend issues)

---

## 📝 Commit Convention

Use [Conventional Commits](https://conventionalcommits.org/):

```
feat: add screen recording annotations
fix: resolve upload timeout on large files
docs: update API documentation
style: format code with prettier
refactor: extract video processing logic
perf: optimize video compression
test: add unit tests for recorder
chore: update dependencies
security: patch XSS vulnerability
```

### Commit Message Format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Example:

```
feat(recorder): add picture-in-picture webcam overlay

- Implement draggable webcam preview
- Add size options (small, medium, large)
- Support corner positioning

Closes #42
```

---

## 🔧 Tooling Recommendations

### Automated Releases

- **semantic-release**: Auto version bump based on commits
- **release-please**: Google's release automation
- **changesets**: For monorepo-friendly releases

### Changelog Generation

- **conventional-changelog**: From commit history
- **auto-changelog**: Simple changelog generator

### Version Management

- `npm version patch/minor/major`
- **standard-version**: Automated versioning + changelog
