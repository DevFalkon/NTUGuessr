# NTUGuessr Telegram Bot

Telegram bot for **NTUGuessr**, enabling users to submit images and locations directly via Telegram, integrated with the backend and Supabase storage.

---

## 📌 Project Overview

This bot connects to Telegram’s API to interact with players, allowing them to upload images along with geolocation data for the NTUGuessr game. It handles:

- Receiving user submissions via Telegram messages.
- Uploading images and location data to Supabase storage.
- Communicating with the backend for game state updates.
- Providing user feedback and basic commands.

---

## ⚙️ Environment Configuration

Create a `.env` file in the bot directory with the following variables:

```bash
  BOT_API=your_telegram_bot_api_key
  SUPABASE_URL=your_supabase_url
  SERVICE_KEY=your_supabase_service_key
```

Replace placeholders with your actual credentials.

---

## 🛠️ Setup Instructions

1. Create and activate a Python virtual environment (recommended):

```bash
  python -m venv venv
  source venv/bin/activate      # Linux / macOS
  venv\Scripts\activate         # Windows
```

2. Install dependencies:

```bash
  pip install -r requirements.txt
```

3. Run the bot:

```bash
  python main.py
```

The bot will connect to Telegram and start listening for user messages.

---

## 📄 Notes

Make sure your bot token is kept secret and never committed to public repos.

The bot depends on a working Supabase project for storage and database access.

This component works alongside the NTUGuessr backend and frontend for a complete game experience.
