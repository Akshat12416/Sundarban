# SIH 2025 - Blue Carbon / Waste-to-Value Platform

This repository contains the micro-frontend portals for the SIH 2025 Blue Carbon / CarbonVault project.

## Portals & Services

The platform consists of 4 active applications that work together:

| Portal | Directory | Default Port | Description |
| :--- | :--- | :---: | :--- |
| **Landing Page** | [`landing-page/`](./landing-page) | `3000` | Public-facing website, hero animations, interactive showcase, and login selector. |
| **Admin Portal** | [`admin-portal/`](./admin-portal) | `5173` | Verifies submitted projects, handles approval/rejection, and oversees plantation tracking. |
| **Contributor Portal** | [`contributor-portal/`](./contributor-portal) | `5174` | Used by contributors to submit projects with photos and location, and track project status. |
| **Buyer Portal** | [`buyer-portal/`](./buyer-portal) | `5175` | Marketplace for corporate buyers to view approved projects, filter, and purchase credits. |

---

## Quick Start

To run all portals concurrently, open separate terminal windows for each:

```bash
# 1. Landing Page (Port 3000)
cd landing-page && npm run dev

# 2. Admin Portal (Port 5173)
cd admin-portal && npm run dev

# 3. Contributor Portal (Port 5174)
cd contributor-portal && npm run dev

# 4. Buyer Portal (Port 5175)
cd buyer-portal && npm run dev
```

---

## Configuration & Environment Variables

All portals share the Firebase Realtime Database (`carbonvault-c2f6a`).

To customize Firebase credentials per environment, copy `.env.example` to `.env` in the respective portal:

```bash
cp admin-portal/.env.example admin-portal/.env
cp contributor-portal/.env.example contributor-portal/.env
cp buyer-portal/.env.example buyer-portal/.env
```

If `.env` is omitted, the applications fallback to the built-in development credentials automatically.

---

## Cleaned Legacy Folders

The following legacy directories were scrapped and removed:
- `forestGumps-SIH-main`: Early design export template (scrapped and migrated into `landing-page`).
- `marketplace-portal`: Deprecated standalone portal (split into `buyer-portal` and `landing-page`).
