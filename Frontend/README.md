# NTUGuessr Frontend

Frontend codebase for **NTUGuessr**, a location-guessing game built with React and Vite.

---

## 📌 Project Overview

**NTUGuessr** is an interactive game where players guess locations within NTU based on images.  
Key features include:

- Seamless integration with a backend powered by FastAPI.
- Real-time location submissions via the Telegram Bot API.
- Modern, responsive UI built with React and Vite.
- Admin panel for content moderation and game management.

This repository contains only the **frontend** code. The backend must be set up and running for the application to work.

---

## ⚙️ Backend Configuration

1. Create a `.env` file in fronend directory.
2. Add the following environment variable, replacing with your backend URL:

```bash
VITE_BACKEND_URL=your_fastAPI_backend_url
```

---

## 🛠️ Setting up the React App

1. Install dependencies:

```bash
npm install
```

2. Fix vulnerabilities (if any):

```bash
npm audit fix
```

3. Run the development server:

```bash
npm run dev
```

The app will start in development mode. Open the provided local URL in your browser to view it.

---

## 📄 Notes

1. Ensure the backend is running and accessible at the VITE_BACKEND_URL specified.

2. This project uses Vite for fast builds and hot module replacement.
