GitHub Repository URL: https://github.com/leolagan/IS4447-Project.git

## App Name & Option

- **App Name:** HabitFlow
- **Assignment Option:** Option A - Habit Tracker

HabitFlow is a mobile habit tracking app that helps users build and maintain healthy habits through daily logging, streak tracking, and progress insights. The app allows users to create custom habits with categories, set targets, and monitor their progress over time.


## Setup Instructions

```bash
npm install
npx expo start
```

## Running the App



## Features

- Habit tracking with full CRUD (create, edit, delete)
- Categories with colour coding
- Daily log entries with notes
- Targets (weekly and monthly goals)
- Search and filtering on the habits screen
- Insights screen with charts and progress stats
- Light and dark mode
- CSV data export
- Local push notifications
- Streak tracking


## Technologies Used

- React Native (Expo)
- Expo Router
- SQLite (expo-sqlite)
- Drizzle ORM
- TypeScript
- Jest (testing)


## Project Structure

```
app/          → screens and navigation
components/   → reusable UI components
context/      → global state (Auth, Theme, Habits)
db/           → database schema and setup
hooks/        → custom hooks
utils/        → helper functions
__tests__/    → unit, component, and integration tests
```
