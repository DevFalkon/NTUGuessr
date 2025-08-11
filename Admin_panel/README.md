# NTUGuessr Admin Panel

A web-based dashboard for managing NTUGuessr content, built with **Next.js** and **Supabase**.

---

## 📌 Project Overview

The Admin Panel allows administrators to directly manage the NTUGuessr database via Supabase.  
Current features include:

- Uploading and managing game content.

> ⚠ **Note:**
>
> - **No authentication is implemented yet** — anyone with access to the panel can modify the database.
> - The panel is **not integrated with the FastAPI backend**; it interacts with Supabase directly.
> - Future plans include:
>   - Authentication and admin permission management via the backend.
>   - Integration into the main frontend for a unified admin experience.
>   - Role-based access controls in the database.

---

## ⚙️ Environment Configuration

1. Create a `.env.local` file in the `Admin_panel` directory.
2. Add the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace placeholders with your actual Supabase credentials.

---

## 🛠️ Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. The Admin Panel will be available locally at:

```bash
http://localhost:3000
```

---

## 📄 Notes

Keep your Supabase keys secure — do not commit `.env.local` to version control.

As there’s no authentication yet, use this panel in a secure environment only.

This tool is intended for development and internal use until authentication and backend integration are added.
