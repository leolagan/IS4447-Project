# HabitFlow

A production-style habit tracking mobile app built with React Native (Expo) and Drizzle ORM for IS4447.

## Tech Stack

- **React Native** (Expo) — cross-platform mobile UI
- **Expo Router** — file-based navigation
- **Drizzle ORM + expo-sqlite** — local SQLite database
- **TypeScript**

## Features

- Create and manage habits with categories, metrics, and notes
- Log daily habit activity (completion or count-based)
- Set weekly and monthly targets with progress tracking
- View insights and charts (daily, weekly, monthly breakdowns)
- Search and filter logs by date range, category, and text
- Accessible UI with meaningful empty and error states

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the app:
   ```bash
   npx expo start
   ```

   Scan the QR code with Expo Go (iOS or Android) or run in a simulator.

## Data & Privacy

- All data is stored **locally on the device** using SQLite via Drizzle ORM (`db/habittracker.db`).
- No data is sent to any external server or third-party service.
- No API keys, tokens, or secrets are committed to this repository.
- Any `.env` files (e.g., for future API integrations) are covered by `.gitignore` and will never be committed.
