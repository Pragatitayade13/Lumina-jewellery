# Lumina Jewels - Premium Jewellery Management System

This repository contains the restructured Lumina Jewels project, separated into three distinct components for modular development and deployment.

## Project Structure

- **`/frontend`** (React + Vite)
  - Front-end user interface and administrative dashboard.
  - Deployed on **Vercel**.
- **`/backend`** (Node.js + Express)
  - Back-end REST APIs for products, orders, auth, notifications, and gold rates.
  - Deployed on **Render**.
- **`/database`** (Firebase Rules & Indexes)
  - Security rules and indexes configuration for Firestore and Cloud Storage.
  - Deployed via **Firebase CLI**.

## Quick Start (Development)

First, install dependencies in both packages:
```bash
npm run install:all
```

Then start the local development servers for both front-end and back-end concurrently:
```bash
npm run dev
```

## Available Scripts (Root)

- `npm run install:all`: Installs dependencies for frontend and backend.
- `npm run dev`: Runs frontend (port 5179) and backend (port 5000) concurrently.
- `npm run dev:frontend`: Runs only the frontend Vite development server.
- `npm run dev:backend`: Runs only the backend Express server.
- `npm run build`: Builds the frontend production bundle.
