# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for Hangar Eight (ハンガーエイト), a multi-purpose facility in Kamogawa, Chiba, Japan. The site showcases eight different services including a cafe/restaurant, event venue, campsite, and automotive club facilities.

## Architecture

**Static Website Structure:**
- `index.html` - Main homepage with complete site content
- `css/` - Stylesheets
  - `base.css` - Base styles, typography, CSS variables
  - `top.css` - Homepage-specific styles
- `js/` - JavaScript functionality
  - `main.js` - Core site functionality (smooth scroll, animations, calendar, menu)
  - `map.js` - 3D Mapbox map with markers and controls
  - `instagram.js` - Instagram feed client (calls external API)
- `img/` - Image assets including logos, backgrounds, service photos
- `css/icons/` - SVG icon assets
- `vercel.json` - Vercel deployment config (security headers, caching)

**Key Technologies:**
- Pure HTML/CSS/JavaScript (no build process)
- FullCalendar for Google Calendar integration
- Mapbox GL JS for 3D interactive maps with terrain
- Smooth scrolling and fade-in animations

**External Integrations:**
- Google Calendar API for event scheduling (public API key)
- Mapbox for 3D satellite maps (public `pk.*` token)
- **Instagram feed via `instagram-gallery.vercel.app`** — shared API service (see below)
- Google Analytics tracking (G-1C2XR5ELPJ)

## Deployment

**Hosting:** Vercel
- Production URL: https://www.hangar-eight.jp (also `hangar-eight.jp` redirects to www)
- Vercel alias: https://hangar-eight-sigma.vercel.app
- Nameservers: `ns1.vercel-dns.com`, `ns2.vercel-dns.com` (delegated from registrar)
- GitHub repo: https://github.com/halloweenjack/hangar-eight
- Auto-deploys on push to `main`

**Previous hosting:** heteml (legacy, no longer active after DNS switch)

## Instagram Feed Architecture

Instagram posts are fetched via a **shared proxy service** at `instagram-gallery.vercel.app` (separate Vercel project, same GitHub account). This is the same service used by sifo.jp.

- Endpoint: `https://instagram-gallery.vercel.app/api/instagram?account=hangar_eight`
- Image URLs are converted to **WebP via wsrv.nl** for bandwidth savings
- Client limits results to 6 items (API returns up to 20)
- Access token rotation is **automatic** via monthly Vercel Cron (handled by instagram-gallery)
- This project does **not** store Instagram credentials

## Development Workflow

**No Build Process:** Pure static site. Files served directly.

**No Package Management:** All frontend dependencies via CDN. `package.json` exists only as a marker file.

**Local Development:** Open `index.html` in a browser or serve via any static file server.

**Deployment:** `git push origin main` → Vercel auto-deploys.

## Code Structure

**Main JavaScript (main.js):**
- `initializeSmoothScroll()` - Page navigation with smooth scrolling
- `initializeVisibilityHandlers()` - Fade-in animations on scroll
- `initializeHeroFadeIn()` / `initializeHeaderFadeIn()` - Initial fade-in
- `initializeToTopButton()` / `initializeBlink()` - Scroll indicators
- FullCalendar + Google Calendar integration
- Mobile menu (hamburger) handlers
- Scroll-based header style switch (`.scrolled` class)

**Map Features (map.js):**
- 3D terrain visualization with Mapbox satellite imagery
- Dual markers for facility locations (Hangar Eight + Studio Kougai/SiFo)
- Automatic rotation animation
- Interactive controls (rotation toggle, reset, style toggle)

**Instagram Feed (instagram.js):**
- `InstagramFeed` class fetches from external proxy
- XSS-safe rendering with `escapeHtml()`
- Fallback to local service images if API fails

**Styling Approach:**
- CSS custom properties for consistent theming
- Responsive design with clamp() for fluid typography
- Japanese web font integration (Noto Serif JP)
- Fade-in and slide-in animation classes (triggered via scroll position)

## API Keys and Configuration

All embedded keys are **public-facing** (designed for client-side use):
- **Google Calendar API key** (main.js) - public key, read-only calendar
- **Mapbox access token** (map.js) - `pk.*` public token
- **No Instagram secrets** - handled server-side by `instagram-gallery.vercel.app`

The Instagram `client_secret` issue from the original codebase has been resolved — the file containing it was removed and the secret was rotated in Meta Developer Console.
