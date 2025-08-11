# NTUGuessr

**NTUGuessr 2025** – Entire codebase for a location-guessing game built with a full-stack architecture, including frontend, backend, Telegram bot, and an admin panel.

---

## 📌 Project Overview

NTUGuessr is an interactive game where players guess locations based on images and clues.  
The system consists of:

- **Frontend** – Player-facing React/Vite application.
- **Backend** – FastAPI service handling API requests and database operations.
- **Telegram Bot** – Allows players to submit images and geolocation data via Telegram.
- **Admin Panel** – Web interface for managing game data directly in Supabase.
- **Supabase** – Cloud-based PostgreSQL database and file storage.

---

## 🗂️ Repository Structure

## Repository Structure

```plaintext
NTUGuessr/
├── frontend/               # React + Vite main user interface
│   ├── src/                # Frontend source code
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.js      # Vite configuration
│   └── .env
│
├── backend/                # FastAPI server
│   ├── requirements.txt    # Backend dependencies
│   ├── main.py             # FastAPI entry point
│   └── .env
│
├── telegram-bot/           # Telegram bot integration
│   ├── main.py             # Bot entry point
│   ├── requirements.txt    # Bot dependencies
│   └── .env
│
├── admin-panel/            # Next.js admin interface (no auth yet)
│   ├── pages/              # Page components
│   ├── public/             # Static assets
│   ├── package.json        # Admin panel dependencies
│   └── .env.local
│
│
├── .gitignore              # Root-level ignore rules
├── README.md               # Root project readme
└── LICENSE                 # Project license
```

---

## 🛠️ Setup Steps

### 1. Create Supabase Account and Setup

- Create a Supabase project at [supabase.com](https://supabase.com).
- Note down your project credentials:
  - `SUPABASE_URL`
  - `ANON_KEY`

---

### 2. Create Required Tables

Run the following SQL commands in your Supabase SQL editor to create the necessary tables:

```sql
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  username TEXT NULL,
  password TEXT NULL,
  clan TEXT NULL,
  high_score NUMERIC NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

CREATE TABLE public.need_approval (
  filename TEXT NOT NULL,
  lat DOUBLE PRECISION NULL,
  lng DOUBLE PRECISION NULL,
  CONSTRAINT need_approval_pkey PRIMARY KEY (filename)
) TABLESPACE pg_default;

CREATE TABLE public.locs (
  filename TEXT NOT NULL,
  lat DOUBLE PRECISION NULL,
  lng DOUBLE PRECISION NULL,
  CONSTRAINT locs_pkey PRIMARY KEY (filename)
) TABLESPACE pg_default;
```

### 3. Create Public Storage Bucket

Create a public storage bucket named locs in your Supabase dashboard:

1. Navigate to Storage.

2. Click Create new bucket.

3. Enter locs as the bucket name.

4. Enable Public access.

5. Save the bucket.

This bucket will store approved game images accessible by the frontend and bot. 4. Proceed with Component Setups

### 4. After Supabase is configured, follow setup instructions for each part of the project:

1.  [Backend/README.md](Backend/README.md)

2.  [Frontend/README.md](Frontend/README.md)

3.  [TeleBot/README.md](TeleBot/README.md)

4.  [Admin_Panel/README.md](Admin_Panel/README.md)
    - ⚠ **Note:** Currently no authentication is implemented — the panel interacts directly with Supabase without going through the backend. Future updates will include backend integration and admin role permissions.

---

## 🖥️ Architecture Overview

```mermaid

graph TD

    subgraph Frontend
        F[React + Vite App]
    end

    subgraph Backend
        B[FastAPI API Server]
    end

    subgraph Bot
        T[Telegram Bot]
    end

    subgraph Admin
        A[Next.js Admin Panel]
    end

    subgraph Database
        S["Supabase (PostgreSQL + Storage)"]
    end

    F --> B
    B --> S
    T --> S
    A --> S
```

---

## 🚀 Future Plans

1. Backend integration for the Admin Panel.

2. Role-based authentication and access control.

3. Deployment using Docker and CI/CD pipelines.

4. Additional game features and UI improvements.
