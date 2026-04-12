# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for Hangar Eight (ハンガーエイト), a multi-purpose facility in Kamogawa, Chiba, Japan. The site showcases eight different services including a cafe/restaurant, event venue, campsite, and automotive club facilities.

## Architecture

**Static Website Structure:**
- `index.html` - Main homepage with complete site content
- `index2.html` - Alternative/backup page
- `css/` - Stylesheets with modular structure
  - `base.css` - Base styles, typography, CSS variables
  - `top.css` - Homepage-specific styles  
  - `style.css` - Currently empty
- `js/` - JavaScript functionality
  - `main.js` - Core site functionality, animations, calendar integration
  - `map.js` - 3D Mapbox map with markers and controls
  - `config.js` - Calendar configuration (alternative setup)
- `img/` - Image assets including logos, backgrounds, service photos
- `css/icons/` - SVG icon assets

**Key Technologies:**
- Pure HTML/CSS/JavaScript (no build process)
- FullCalendar for Google Calendar integration
- Mapbox GL JS for 3D interactive maps
- Instafeed for Instagram integration
- Smooth scrolling and fade-in animations

**External Integrations:**
- Google Calendar API for event scheduling
- Mapbox for 3D satellite maps with terrain
- Instagram API for photo feeds
- Google Analytics tracking

## Development Workflow

**No Build Process:** This is a static site with no compilation or build steps. Files are served directly.

**No Package Management:** All dependencies are loaded via CDN links in the HTML.

**Local Development:** Simply open `index.html` in a browser or serve via any static file server.

**Deployment:** Upload files directly to web server.

## Code Structure

**Main JavaScript Functions (main.js):**
- `initializeSmoothScroll()` - Page navigation with smooth scrolling
- `initializeVisibilityHandlers()` - Fade-in animations on scroll
- Calendar integration with Google Calendar API
- Instagram feed integration with custom template
- Mobile menu functionality

**Map Features (map.js):**
- 3D terrain visualization with Mapbox
- Dual markers for facility locations
- Automatic rotation animation
- Interactive controls (rotation toggle, reset, style toggle)
- Popup information for each location

**Styling Approach:**
- CSS custom properties for consistent theming
- Responsive design with clamp() for fluid typography
- Japanese web font integration (Noto Serif JP)
- Fade-in and slide-in animation classes

## API Keys and Configuration

**Google Calendar:** API key and calendar ID are embedded in main.js for public calendar display.

**Mapbox:** Access token in map.js for map rendering.

**Instagram:** Access token in main.js for feed integration.

Note: All API keys are public-facing for client-side functionality.