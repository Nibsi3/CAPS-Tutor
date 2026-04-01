# CAPS Tutor

![caps tutor preview](https://opengraph.githubassets.com/1/Nibsi3/caps-tutor)

AI-assisted learning platform aligned to the South African CAPS curriculum, with student flows, admin tooling, and Appwrite-backed services.

## What it does
- Subject discovery and guided learning flows across multiple curriculum areas.
- Practice and progress features through dashboard routes.
- Admin surfaces for content and paper-processing workflows.
- Public-facing pages for onboarding, syllabus, blog, and support content.

## Stack
- Next.js + React + TypeScript
- Tailwind CSS + Radix UI component system
- Appwrite SDKs (`appwrite`, `node-appwrite`) for backend integration
- Utility scripts for question generation, presets, logging, and environment automation

## Local development
```bash
npm install
npm run dev
```

Default dev port is `9002`.

Useful scripts:
```bash
npm run typecheck
npm run build
npm run logs:appwrite
```

## Repository structure
- `src/app/` application routes (`dashboard`, `admin`, `all-subjects`, auth flows)
- `src/components/` shared UI and feature components
- `scripts/` operational and data scripts
- `docs/` project documentation

## Practical next improvements
- Add e2e tests for core student journeys (onboarding -> practice -> progress).
- Publish deployment architecture notes (env matrix + release flow).
- Add route-level performance budgets for dashboard screens.
