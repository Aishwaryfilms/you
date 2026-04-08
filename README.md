# You eSports Website

A single-page React + Vite website for You eSports with:

- Hero, About, Roster, Creators, Merch, and Reach Out sections
- Built-in admin overlay for editing roster/creator content in the UI
- Background contact form delivery to `youesportsmail@gmail.com`

## Tech Stack

- React 18
- Vite 5
- Plain CSS embedded in `src/App.jsx`

## Requirements

- Node.js 18+
- npm 9+

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open:

http://localhost:5173

## Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build production bundle
npm run preview  # Preview production build locally
```

## Contact Form

The Reach Out form sends without opening the user's mail app.

Current destination inbox is configured in `src/App.jsx`:


- `CONTACT_EMAIL = "youesportsmail@gmail.com"`

Fields sent by the form:

- `subject`
- `name`
- `email`
- `phone`
- `department`
- `message`

## Project Structure

```text
youesports/
|- index.html
|- package.json
|- vite.config.js
|- src/
|  |- main.jsx
|  |- App.jsx
|- README.md
```

## Customization Guide

Main editable areas inside `src/App.jsx`:

- `SOCIAL_LINKS` for social buttons
- `depts` for Reach Out departments
- `rosterData` for team rosters
- `creatorsInitial` for creator cards
- `ADMIN_PASS` for admin panel password (currently hardcoded)

## Build and Deploy

Create production build:

```bash
npm run build
```

Deploy the generated `dist/` folder to:

- Vercel
- Netlify
- Any static hosting provider

## Troubleshooting

- If form submits but no email arrives, check spam/junk and confirm the destination address in `src/App.jsx`.

## Notes

- This project is currently front-end only.
- Admin authentication is client-side and not secure for production access control.
