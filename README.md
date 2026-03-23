# GROFAST

A fast-growing eCommerce platform featuring a robust React frontend and an Express/Node.js backend.

## Project Structure

This project has been set up as a monorepo:
- `/frontend` - Built with React, Vite, TypeScript, TailwindCSS, and shadcn/ui.
- `/backend` - Built with Express, Node.js, and MongoDB.

## Getting Started

1. **Install Dependencies**
   You can install dependencies for both the frontend and backend directly from the root by running:
   ```bash
   npm run install:all
   ```
   *(Alternatively, navigate to each directory and run `npm install`)*

2. **Run Development Servers**
   
   **Frontend:**
   ```bash
   npm run dev:frontend
   ```

   **Backend:**
   ```bash
   npm run dev:backend
   ```

## Scripts Setup

This project contains root-level scripts in the `package.json` to make running things easier. Make sure your `.env` files are configured in the `backend/` directory before starting the backend server!
