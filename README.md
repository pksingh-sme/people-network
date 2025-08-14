# People Network Application

This repository contains a full-stack application for visualizing and managing a network of people. The project is divided into two main parts:

- **backend/**: Node.js server with a SQLite database for storing people and their relationships.
- **frontend/**: React application for visualizing the network and interacting with the backend.

## Features
- Visualize people and their connections as a network graph
- Add, edit, and remove people and relationships
- Export the network graph as an image or PDF
- Persistent data storage using SQLite

## Project Structure
```
backend/
  db.ts           # Database setup and queries
  network.db      # SQLite database file
  server.js       # Express server
  types.ts        # Type definitions
frontend/
  src/            # React source code
    components/   # React components (e.g., NetworkGraph)
    App.jsx       # Main app component
  public/         # Static assets
  index.html      # Main HTML file
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm (v8 or higher)

### Backend Setup
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3001` by default.

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173` (or as indicated in the terminal).

## Usage
- Open the frontend URL in your browser.
- Use the UI to add, edit, or remove people and relationships.
- Export the network graph as an image or PDF using the provided buttons.

## Technologies Used
- **Backend:** Node.js, Express, SQLite
- **Frontend:** React, Vite, vis-network, jspdf, html2canvas

## License
This project is licensed under the MIT License.
