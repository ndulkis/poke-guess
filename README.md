# PokeGuess

A Pokemon guessing game built with React, Vite, and Tailwind CSS for CPSC 349.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd PokeGuess
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local dev server with hot reload |
| `npm run build` | Build for production (output in `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Tech Stack

- [React 19](https://react.dev/)
- [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [React Router v7](https://reactrouter.com/)

## Project Structure

```
src/
  components/   # Reusable UI components
  pages/        # Route-level page components
  services/     # API calls and external data fetching
  context/      # React context providers
  utils/        # Helper functions
```
