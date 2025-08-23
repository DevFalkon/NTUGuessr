def write_env_file(path, env_variables):
    with open(path, 'w') as f:
        for key, val in env_variables.items():
            f.write(f"{key}={val}\n")

def main():
    print("Setup NTUGuessr .env files")

    supabase_url = input("Enter Supabase URL: ").strip()
    supabase_service_key = input("Enter Supabase Service Key: ").strip()
    telegram_bot_api = input("Enter Telegram Bot API Key: ").strip()

    insta_acc_name = input("Enter Instagram account display taxt: ").strip()
    insta_acc_url = input("Enter isntagram account URL: https://www.instagram.com/").strip()

    # Frontend .env
    backend_ready = False
    while not backend_ready:
        check = input("Do you have your backend URL [y/n]: ").strip().lower()
        if check == 'y':
            backend_ready = True
            break
        elif check == 'n':
            break
        else:
            print("Please enter 'y' or 'n' only.")
    
    frontend_env = {
        "VITE_BACKEND_URL": "Enter_Backend_URL",
        "VITE_INSTA_URL":insta_acc_url,
        "VITE_INSTA_TEXT":insta_acc_name,
    }

    if backend_ready:
        frontend_env["VITE_BACKEND_URL"] = input("Enter Backend URL for frontend (e.g. http://localhost:8000): ").strip()
    else:
        print("Remember to enter the backend url in Frontend/.env later!")

    write_env_file("Frontend/.env", frontend_env)

    # Backend .env
    backend_env = {
        "SUPABASE_URL": supabase_url,
        "SERVICE_KEY": supabase_service_key,
        "BOT_API": telegram_bot_api,
        "MAX_TIME": 300,
        "POINTS_MULTIPLIER": 1.5,
    }
    write_env_file("Backend/.env", backend_env)

    print("\nAll .env files created successfully!")

if __name__ == "__main__":
    main()
