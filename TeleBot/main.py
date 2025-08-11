from telegram import Update, KeyboardButton, ReplyKeyboardMarkup
from telegram.ext import ApplicationBuilder, MessageHandler, CommandHandler, filters, ContextTypes
from dotenv import load_dotenv
import os
from PIL import Image
from supabase_handler import get_locs, upload_locs, upload_image
import random


# Load the .env file
load_dotenv()

# Access the variables
bot_token = os.getenv("BOT_API")

PHOTO_DIR = "./need_approval"
os.makedirs(PHOTO_DIR, exist_ok=True)

tracker_dict = {}

# Start command
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Hi! Send me a photo and I’ll ask for your location.")

# When photo is received
async def handle_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.message.photo:
        await update.message.reply_text("No photo received.")
        return

    # Get the highest resolution photo
    photo = update.message.photo[-1]
    file = await context.bot.get_file(photo.file_id)

    user = update.effective_user
    user_id = user.id

    # Define a unique filename
    cur_names = get_locs()
    print(cur_names)
    name = None
    while not name:
        name = str(random.randrange(1000,10000))
        if name not in cur_names:
            print(name)

    tracker_dict[user_id] = [name, (None, None)]

    filename = f"{name}.jpg"
    file_path = os.path.join(PHOTO_DIR, filename)

    # Download photo to disk
    await file.download_to_drive(file_path)

    # Resize to 500x500 (ignore aspect ratio)
    with Image.open(file_path) as img:
        img_resized = img.resize((500, 500))
        img_resized.save(file_path)


    # Send keyboard to request location
    location_button = KeyboardButton("Send Location", request_location=True)
    reply_markup = ReplyKeyboardMarkup([[location_button]], resize_keyboard=True, one_time_keyboard=True)

    await update.message.reply_text(
        "Photo recieved, please share your location so we can process it accurately.",
        reply_markup=reply_markup
    )

# When location is received
async def handle_location(update: Update, context: ContextTypes.DEFAULT_TYPE):
    latitude = update.message.location.latitude
    longitude = update.message.location.longitude

    user = update.effective_user
    user_id = user.id

    tracker_dict[user_id] = [tracker_dict[user_id][0], (latitude, longitude)]

    res = upload_locs(tracker_dict[user_id][0], latitude, longitude)
    upload_image(tracker_dict[user_id][0]+".jpg")
    print(res)

    await update.message.reply_text("📍 Got your location!\n🖼️ Your image is being reviewed 👀")

# Run the bot
def run_bot():
    app = ApplicationBuilder().token(bot_token).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.PHOTO, handle_photo))
    app.add_handler(MessageHandler(filters.LOCATION, handle_location))

    print("Telegram bot is running...")
    app.run_polling()

run_bot()