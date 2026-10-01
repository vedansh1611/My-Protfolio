# PRD — Vedanshkumar Gothi Portfolio

## Original problem statement
Build a production-quality personal portfolio website for a multi-disciplinary creative (Vedanshkumar Gothi).
- Tech: React + Tailwind + Framer Motion (Lenis smooth scroll).
- Design: Dark editorial look (#0A0A0B background, off-white text, lime accent #C6FF3D, glass cards). Oversized typography, custom cursor, responsive.
- Pages: Home, /work (filterable grid), /work/:slug (case study template), Contact form saving to backend.
- Features: WebGL/canvas smoke-fog shader background, simple CMS via JSON/DB for projects.

## User personas
- Recruiters / hiring managers evaluating Vedansh for UI/UX and motion roles.
- Potential freelance clients (brands, studios) who want to start a project enquiry.
- Creative peers browsing selected work and experiments.

## Architecture
- Frontend: React 19 + react-router-dom 7, framer-motion 11 (scroll reveals, masked hero reveal, parallax, custom cursor, intro loader), Lenis 1.3 smooth scroll, custom CSS (src/App.css), Space Grotesk + Instrument Serif + JetBrains Mono.
- Backend: FastAPI (server.py) + Motor (async MongoDB). API prefix /api.
- Data: projects in src/data/projects.js (JSON CMS-style); contact submissions in MongoDB `contact_submissions`.

## Core requirements (static)
1. Home page with kinetic hero (masked line-by-line name reveal, smoke-fog canvas, orbit, parallax).
2. /work filterable project grid.
3. /work/:slug case study template (hero media, role, tools, status, process, gallery, next project, optional video link).
4. Contact form persisting to backend, honeypot spam protection, NO rate limiting (user request).
5. Bottom floating pill navigation + floating "Start a project" shortcut.
6. Dark editorial contact section (green full-bleed version replaced per user request).
7. Custom cursor, scroll progress bar, intro loader, slow editorial marquee, grain overlay.
8. SVG favicon mark (lime asterisk on dark) matching wordmark motif.

## Implemented
- 2026-07-01 (this session): Fixed blocking lint errors (unused `Request` param in server.py; pointerX/pointerY scope bug in SmokeCanvas — pointer tracking moved to window listener so smoke actually follows the cursor).
- 2026-07-01: Full award-polish pass — Lenis, custom cursor, intro loader, masked hero reveal, scroll progress, global grain, redesigned dark contact section with glass form, floating pill nav + contact float styled (CSS was missing), serif italic accents (Instrument Serif), SVG favicon, page title/meta, pill buttons, project image clipped-frame + spotlight hover, process rows numbered, seamless duplicated marquee, mobile hero clipping fixed (375px).
- Earlier sessions: scaffolding, backend API + MongoDB, routing, project data, resume link, honeypot protection, rate limiter removed.

## Verified
- POST /api/contact: 3 consecutive 200s (no rate limit); honeypot-filled submission → 400.
- UI end-to-end: filled and submitted contact form in browser, success message shown, document confirmed in MongoDB.
- Screenshots at 1366/768/375 for home, /work, filter interaction, /work/:slug, contact section.

## Backlog
- P1: Replace placeholder project media with real work (user supplies).
- P1: Add real video_url entries to projects to activate the case-study film block.
- P2: Optional CMS admin to edit projects JSON via DB instead of code.
- P2: Email notification on new contact enquiry (Resend integration).

## Test credentials
- None required — no authentication in this app. See /app/memory/test_credentials.md.
