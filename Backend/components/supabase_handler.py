from supabase import create_client
from dotenv import load_dotenv
import bcrypt, os

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SERVICE_KEY = os.getenv("SERVICE_KEY")
PHOTO_DIR = "./temp"

supabase_ser = create_client(SUPABASE_URL, SERVICE_KEY)

# Get public URL for image, given file name
def get_public_url(file_name):
  res = supabase_ser.storage.from_("locs").get_public_url(f"image/{file_name}")
  return res

# check if username exists in the db
def checkUserName(username):
  return supabase_ser.table("users").select("username").eq("username", username).execute()

# Crete new user entry
def create_acc(username, pass_hash, clan):
  result = supabase_ser.table("users").insert({
        "username": username,
        "clan": clan,
        "password": pass_hash,
    }).execute()
  
  return result

# Authenticate user for login
def cred_check(username, password):
    res = supabase_ser.table("users").select("*").eq("username", username).execute()
    user = res.data[0] if res.data else None
    print(user)
    # Step 2: Check password hash
    if user and bcrypt.checkpw(password.encode(), user['password'].encode()):
        return user['id']
    else:
        return None

def get_user_group(username):
  res = supabase_ser.table("users").select("group").eq("username", username).execute().data
  print(f"{username}: {res[0]}")
  return res[0]

def get_ranking():
  # users in the 'admin' group can't play the game
  rankings = supabase_ser.table("users").select("username", "clan", "high_score").neq("group", "admin").order("high_score", desc=True).execute()
  return rankings.data


# Returns {image_filename: (lat, lng)}
def get_locs():
  res = supabase_ser.table("locs").select("*").execute()
  data = {}
  for row in res.data:
    data[row["filename"]] = (float(row["lat"]), float(row["lng"]))
  return data

# Returns final score, rank and high score of the user
# Rank is based on highscore and not current score
def get_final_score(cur_score, username):
  # Fetch user data
  res = supabase_ser.table("users").select("*").eq("username", username).execute()
  
  if res.data:
    user = res.data[0]
    cur_high_score = user.get("high_score", 0)
    
    if cur_score > cur_high_score:
      # Update high score
      cur_high_score = cur_score
      supabase_ser.table("users").update({"high_score": cur_score}).eq("username", username).execute()

    all_users = get_ranking()
    
    # Find the user's rank
    rank = next((i + 1 for i, u in enumerate(all_users) if u["username"] == username), None)

    return [cur_score, rank, cur_high_score]
  
  return [cur_score, 0, 0]

# --- Functions for the tele bot ---

def get_all_locs():
  # Get all entries from locs table
  res = supabase_ser.table("locs").select("*").execute()
  # Get all entries from need_approval table
  res2 = supabase_ser.table("need_approval").select("*").execute()

  data = {}
  for row in res.data:
    data[row["filename"]] = (float(row["lat"]), float(row["lng"]))

  for row in res2.data:
    data[row["filename"]] = (float(row["lat"]), float(row["lng"]))

  return data

# Upload the image from telegram to supabase bucket
def upload_image(filename):
  with open(f"./{PHOTO_DIR}/{filename}", "rb") as f:
    res = supabase_ser.storage.from_("locs").upload(f"not_approved/{filename}", f, file_options={"content-type": "image/jpeg"})
    print(res)

  os.remove(f"./{PHOTO_DIR}/{filename}")

# Upload user location to supabase
def upload_locs(name, lat, lng):
  result = supabase_ser.table("need_approval").insert({
        "filename": name,
        "lat": lat,
        "lng": lng,
    }).execute()
  
  return result

# ----- END -----


# --- Admin functions ---
def need_approval():
  result = supabase_ser.table("need_approval").select().execute()
  return result.data

def not_approved_url(file_name):
  res = supabase_ser.storage.from_("locs").get_public_url(f"not_approved/{file_name}.jpg")
  return res

def approve_image(file_name, lat, lng):
  # Create a new row in locs table
  try:
    resp = supabase_ser.table("locs").insert([
            {"filename": file_name, "lat": lat, "lng": lng}
          ]).execute()
    print(resp)
  except Exception as e:
    print(f"Exception while updating database: {e}")
    return

  # Move image from ./not_approved to ./image
  try:
    supabase_ser.storage.from_("locs").move(f"not_approved/{file_name}.jpg", f"image/{file_name}.jpg")
  except Exception as e:
    print(f"Exception while moving image: {e}")
    return
  
  # Delete record from need_approval table
  try:
    supabase_ser.table("need_approval").delete().eq('filename', file_name);
  except Exception as e:
    print(f"Exception while deleting row: {e}")
    return
  
  return True

def reject_image(file_name):
  try:
    resp = supabase_ser.table("need_approval").delete().eq("filename", file_name).execute()
  except Exception as e:
    print(f"Exception while deleting row: {e}")

  try:
    resp = supabase_ser.storage.from_("locs").remove([f"not_approved/{file_name}.jpg",])
  except Exception as e:
    print(f"Exception while deleting image: {e}")
    return

  return True

# ----- END -----


# DO NOT USE
# DEPRICIATED -> Does not update locations
def upload_images():
  #response = supabase_ser.storage.create_bucket(id='locs', name="locs", options={"public":True, "file_size_limit":"3MB", "allowed_mime_types":['image/*']})
  #print(response)
  curr_img = supabase_ser.storage.from_("locs").list("image")
  curr_img_names = [i['name'] for i in curr_img]

  for file_name in os.listdir("./img"):
    if file_name not in curr_img_names:
      with open(f"./img/{file_name}", "rb") as f:
        res = supabase_ser.storage.from_("locs").upload(f"image/{file_name}", f, file_options={"content-type": "image/jpeg"})
        print(res)