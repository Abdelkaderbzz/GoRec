# Contributing to GoRec

Thank you for your interest in contributing to GoRec! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please:

- Be respectful and constructive in discussions
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+
- Git
- A code editor (VS Code recommended)

### Setup

1. **Fork the repository**

   Click the "Fork" button on GitHub

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/screen-recorder.git
   cd screen-recorder
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/Abdelkaderbzz/screen-recorder.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names:

- `feature/add-video-trimming` - New features
- `fix/recording-stops-unexpectedly` - Bug fixes
- `docs/update-api-reference` - Documentation
- `refactor/simplify-media-hooks` - Code refactoring
- `chore/update-dependencies` - Maintenance tasks

### Running the Dev Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm run preview  # Preview the build
```

### Linting

```bash
npm run lint
```

## Coding Standards

### TypeScript

- Use strict TypeScript (`"strict": true`)
- Prefer explicit types over `any`
- Use interfaces for object shapes
- Export types from their source files

```typescript
// ✅ Good
interface RecordingOptions {
  includeAudio: boolean;
  quality: 'low' | 'medium' | 'high';
}

function startRecording(options: RecordingOptions): Promise<void> {
  // ...
}

// ❌ Bad
function startRecording(options: any) {
  // ...
}
```

### React

- Use functional components with hooks
- Follow the Rules of Hooks
- Use meaningful component and prop names
- Keep components focused and small

```tsx
// ✅ Good
interface RecordButtonProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
}

function RecordButton({ isRecording, onStart, onStop }: RecordButtonProps) {
  return (
    <button onClick={isRecording ? onStop : onStart}>
      {isRecording ? 'Stop' : 'Start'}
    </button>
  );
}

// ❌ Bad
function Button(props: any) {
  return <button {...props} />;
}
```

### File Organization

```
src/
├── components/
│   └── ComponentName/
│       ├── ComponentName.tsx    # Main component
│       ├── ComponentName.test.tsx  # Tests
│       └── index.ts             # Re-export
├── hooks/
│   └── useHookName.ts
└── utils/
    └── utilityName.ts
```

### Styling

- Use Tailwind CSS utilities
- Follow mobile-first approach
- Use CSS custom properties for theming
- Keep styles co-located with components

```tsx
// ✅ Good
<button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
  Click me
</button>

// ❌ Avoid inline styles
<button style={{ padding: '8px 16px', backgroundColor: 'blue' }}>
  Click me
</button>
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type       | Description                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | New feature                                             |
| `fix`      | Bug fix                                                 |
| `docs`     | Documentation only                                      |
| `style`    | Code style (formatting, etc.)                           |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Performance improvement                                 |
| `test`     | Adding or updating tests                                |
| `chore`    | Build process or auxiliary tool changes                 |

### Examples

```bash
# Feature
git commit -m "feat(recorder): add pause/resume functionality"

# Bug fix
git commit -m "fix(upload): handle network timeout errors"

# Documentation
git commit -m "docs(api): add useMediaRecorder examples"

# Breaking change
git commit -m "feat(api)!: change recording options interface

BREAKING CHANGE: RecordingOptions now requires 'quality' field"
```

## Pull Request Process

### Before Submitting

1. **Update your branch**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run checks**

   ```bash
   npm run lint
   npm run build
   ```

3. **Test your changes**
   - Test in Chrome, Firefox, and Safari
   - Test on different screen sizes
   - Test with different recording scenarios

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?

Describe testing done

## Screenshots (if applicable)

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
- [ ] I have updated the documentation accordingly
```

### Review Process

1. Create PR against `main` branch
2. Request review from maintainers
3. Address feedback and make changes
4. Once approved, maintainer will merge

## Testing

### Running Tests

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage  # With coverage
```

### Writing Tests

```typescript
import { renderHook, act } from '@testing-library/react';
import { useTimer } from './useTimer';

describe('useTimer', () => {
  it('should start at zero', () => {
    const { result } = renderHook(() => useTimer());
    expect(result.current.seconds).toBe(0);
  });

  it('should increment when started', async () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });

    // Wait for timer
    await new Promise((r) => setTimeout(r, 1100));

    expect(result.current.seconds).toBeGreaterThan(0);
  });
});
```

## Documentation

### When to Update Docs

- Adding new features
- Changing public APIs
- Fixing documentation bugs
- Adding examples

### Documentation Files

| File                   | Purpose                          |
| ---------------------- | -------------------------------- |
| `README.md`            | Project overview and quick start |
| `docs/SETUP.md`        | Detailed setup guide             |
| `docs/ARCHITECTURE.md` | Technical architecture           |
| `docs/API.md`          | API reference                    |
| `docs/CONTRIBUTING.md` | This file                        |

### Code Comments

Use JSDoc for public APIs:

````typescript
/**
 * Starts screen capture with the specified options.
 *
 * @param options - Display media options
 * @returns Promise that resolves when capture starts
 * @throws {Error} If user denies permission
 *
 * @example
 * ```typescript
 * await startCapture({ video: true, audio: true });
 * ```
 */
async function startCapture(options: DisplayMediaOptions): Promise<void> {
  // ...
}
````

## Questions?

- Open a [GitHub Issue](https://github.com/Abdelkaderbzz/screen-recorder/issues)
- Start a [Discussion](https://github.com/Abdelkaderbzz/screen-recorder/discussions)

Thank you for contributing! 🎉
