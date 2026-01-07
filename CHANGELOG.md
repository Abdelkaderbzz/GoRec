# Changelog

All notable changes to GoRec will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2026-01-07

### Added

- User profile page with account management
- OAuth callback handling for third-party authentication
- Additional npm scripts for linting and type checking

### Changed

- Improved project structure documentation
- Enhanced CI/CD workflows

### Fixed

- Minor bug fixes and stability improvements

---

## [0.2.0] - 2026-01-07

### Added

- Comprehensive security audit script
- Client-side rate limiting for uploads
- XSS protection utilities
- Security headers via Netlify configuration
- Content Security Policy implementation
- GitHub Actions CI/CD workflows (ci.yml, deploy-staging.yml, release.yml)
- Issue templates and PR templates

### Changed

- Disabled source maps in production builds
- Enhanced file validation for uploads

### Security

- Fixed RLS policies to prevent unauthorized data access
- Secured storage bucket to prevent anonymous listing
- Added input sanitization for all user inputs

---

## [0.1.1] - 2026-01-07

### Changed

- Replaced vidify video player with native HTML5 video player
- Updated CSP to support Feeduser widget and Umami analytics
- Improved video player controls with seek, volume, and fullscreen

### Fixed

- Fixed React useRef error caused by duplicate React instances
- Fixed audio device type mismatch in AudioSettings component
- Fixed CSP blocking third-party scripts and images

### Removed

- Removed vidify dependency
- Removed react-player dependency

---

## [0.1.0] - 2026-01-07

### Added

- Initial release of GoRec
- Screen recording with browser APIs
- Webcam overlay support
- Audio recording (microphone + system)
- Cloud storage via Supabase
- Share recordings with public links
- User authentication
- Recording history
- Multi-language support (English, Arabic)
- Dark/Light theme
- Mobile responsive design

### Security

- Row Level Security on all database tables
- Secure file storage with user isolation
- JWT-based authentication

---

## Version History

| Version | Date       | Highlights                         |
| ------- | ---------- | ---------------------------------- |
| 0.2.1   | 2026-01-07 | Profile page, OAuth improvements   |
| 0.2.0   | 2026-01-07 | Security enhancements, CI/CD setup |
| 0.1.1   | 2026-01-07 | Native video player, bug fixes     |
| 0.1.0   | 2026-01-07 | Initial release                    |

---

## Upcoming

### v0.2.0 (Planned)

- [ ] Screen annotations during recording
- [ ] Video trimming and editing
- [ ] Custom recording quality settings
- [ ] Keyboard shortcuts

### v0.3.0 (Planned)

- [ ] Team workspaces
- [ ] Recording analytics
- [ ] Embed code generation
- [ ] API access

### v1.0.0 (Target)

- [ ] Stable API
- [ ] Full documentation
- [ ] 99.9% uptime SLA
- [ ] Enterprise features
