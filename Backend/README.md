# NTUGuessr Backend

Backend codebase for **NTUGuessr**, a location-guessing game powered by FastAPI.

---

## 📌 Project Overview

The backend for **NTUGuessr** handles all server-side logic, data storage, and API endpoints used by the frontend.  
Key features include:

- RESTful API built with **FastAPI**.
- **PostgreSQL** database hosted on Supabase for persistent storage.
- Image file storage and retrieval integrated with Supabase Storage.

---

## ⚙️ Environment Configuration

1. Create a `.env` file in the project root.
2. Add the required environment variables:

```bash
SUPABASE_URL=your_supabase_database_url
SERVICE_KEY=your_supabase_service_key
MAX_TIME=300
POINTS_MULTIPLIER=1.5
```

Note: These variables are required for database access, storage operations and game configuration.

---

## 🛠️ Setting up the Backend

1. Create and activate a virtual environment (optional but recommended):

```bash
    python -m venv venv
    source venv/bin/activate # Linux / macOS
    venv\Scripts\activate # Windows
```

2. Install dependencies:

```bash
    pip install -r requirements.txt
```

3. Run the backend server:

```bash
    uvicorn main:app --reload
```

4. The API will be available at (if run locally):

```bash
    http://localhost:8000
```

Add this to the frontend `.env`

---

## 📄 Notes

1. Ensure Supabase are configured before running the backend.

2. The backend must be running for the frontend to function properly.

3. This project uses FastAPI for high-performance APIs and Supabase for database + file storage.
