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

## Design system (current)
- LIGHT editorial theme (user-requested redesign 2026-07-01): bg #FBFBFD, ink #0D0D12, muted #6E6E7A, accents cyan #0ED2DA → violet #5F29C7 gradient.
- Hero background: white top fading into cyan→violet gradient at bottom, faint vertical grid lines (56px) masked to fade by 70% — based on user's reference pattern.
- Typography: Sora (headings/body), Instrument Serif italic with gradient text for accents, JetBrains Mono for labels.
- Gradient pill buttons, white glass floating nav + contact float, gradient scroll progress, cyan/violet custom cursor, light loader, SVG favicon (gradient asterisk on light tile).
- Hero name: "Vedansh Gothi." (renamed from Vedanshkumar Gothi per user).

## Implemented
- 2026-07-01 (later): Full light-theme re-skin to cyan #0ED2DA / violet #5F29C7 per user's pattern reference; hero pattern background; hero renamed to "Vedansh Gothi"; typography moved from Space Grotesk to Sora; gradient favicon; all components re-colored (nav, floating dock, buttons, filters, forms, footer, cursor, loader). Smoke canvas removed in favor of the pattern hero.
- 2026-07-01 (earlier): Fixed blocking lint errors (unused `Request` param in server.py; pointerX/pointerY scope bug in SmokeCanvas). Award-polish pass — Lenis, custom cursor, intro loader, masked hero reveal, scroll progress, grain, floating pill nav + contact float, process rows numbered, seamless duplicated marquee.
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
