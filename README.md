# Nasa Space Explorer

## Overview

NASA Space Explorer is a full-stack web application that allows users to explore space-related data and imagery from NASA's APIs. Users can view the Astronomy Picture of the Day (APOD), search for Mars rover photos, and discover Near Earth Objects (NEOs) approaching our planet. The project consists of a React + TypeScript frontend and an Express.js backend that proxies requests to NASA's APIs.

---

## Features

- **Astronomy Picture of the Day (APOD):** View NASA's daily featured image or video with explanations and download high-resolution images.
- **Mars Rover Gallery:** Search and browse photos taken by NASA's Mars rovers (Curiosity, Opportunity, Spirit) by Martian sol, Earth date, and camera.
- **Near Earth Objects (NEO):** Track asteroids and comets approaching Earth in the next 7 days, with statistics and danger levels.
- **Responsive UI:** Modern, space-themed design with smooth navigation and mobile support.
- **Error Handling:** User-friendly error messages and notifications for API issues or rate limits.

---

## Live Demo

Try the app here: [https://nasa-space-explorer-hazel.vercel.app/](https://nasa-space-explorer-hazel.vercel.app/)

---

## Technologies Used

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Express.js, Node.js
- Testing: Jest, Vitest
- Deployment: Vercel

---

## Project Structure

```
Nasa_Space_Explorer/
├── backend/         # Express.js backend
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── __tests__/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/        # React + TypeScript + Vite frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env
└── README.md
```

---

## Deployment

Both the frontend and backend are deployed on [Vercel](https://vercel.com/).

- Live link: [https://nasa-space-explorer-hazel.vercel.app/](https://nasa-space-explorer-hazel.vercel.app/)

You can use the app directly via the live demo link above.  
If you want to run the project locally, follow the setup instructions below.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

---

## Setup Instructions

### 1. Clone the Repository

```sh
git clone https://github.com/your-username/Nasa_Space_Explorer.git
cd Nasa_Space_Explorer
```

### 2. NASA API Key

You need a [NASA API key](https://api.nasa.gov/) (free, instant registration).

---

### 3. Backend Setup

```sh
cd backend
cp .env.example .env
# Edit .env and set your NASA_API_KEY and PORT
npm install
```

**.env example:**

```
NASA_API_KEY=your_nasa_api_key_here
PORT=5000
```

#### Start the Backend Server

```sh
npm run dev
```

- The backend will run on the port specified in `.env` (default: 5000).

---

### 4. Frontend Setup

```sh
cd ../frontend
cp .env.example .env
# Edit .env and set VITE_BACKEND_URL to your backend server (e.g., http://localhost:5000)
npm install
```

**.env example:**

```
VITE_BACKEND_URL=http://localhost:5000
```

#### Start the Frontend Development Server

```sh
npm run dev
```

- The frontend will run on [http://localhost:5173](http://localhost:5173) by default.

---

## Usage

1. Open [http://localhost:5173](http://localhost:5173) in your browser or open live link [https://nasa-space-explorer-hazel.vercel.app/](https://nasa-space-explorer-hazel.vercel.app/).
2. Use the navigation bar to explore:
   - **Picture of the Day:** View and download NASA's APOD.
   - **Mars Rover Photos:** Search for Mars rover images by sol, Earth date, and camera.
   - **Near Earth Objects:** See asteroids/comets approaching Earth in the next 7 days.

---

## Running Tests

### Backend

```sh
cd backend
npm test
```

### Frontend

```sh
cd frontend
npm run test
```

---

## Environment Variables

### Backend (`backend/.env`)

- `NASA_API_KEY` – Your NASA API key (required)
- `PORT` – Port for the backend server (default: 5000)

### Frontend (`frontend/.env`)

- `VITE_BACKEND_URL` – URL of the backend server (e.g., `http://localhost:5000` or your deployed backend URL)

---

## Image Attribution

- **shuttle.png** icon  
  <a href="https://www.flaticon.com/free-icons/launch" title="launch icons">Launch icons created by Freepik - Flaticon</a>

---

## License

This project is for educational and demonstration purposes. NASA data is public domain, but please review NASA's [API Terms of Use](https://api.nasa.gov/).

---

## Troubleshooting

- If you see API errors or rate limits, ensure your NASA API key is correct and not over quota.
- Make sure both backend and frontend `.env` files are set up and servers are running.
- For CORS issues, check that the backend `PORT` and frontend `VITE_BACKEND_URL` match.

---
