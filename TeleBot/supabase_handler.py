import os
from dotenv import load_dotenv
from supabase import create_client
import supabase

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SERVICE_KEY = os.getenv("SERVICE_KEY")

supabase_ser = create_client(SUPABASE_URL, SERVICE_KEY)

def get_locs():
  res = supabase_ser.table("locs").select("*").execute()
  res2 = supabase_ser.table("need_approval").select("*").execute()

  data = {}
  for row in res.data:
    data[row["filename"]] = (float(row["lat"]), float(row["lng"]))

  for row in res2.data:
    data[row["filename"]] = (float(row["lat"]), float(row["lng"]))

  return data

def upload_image(filename):
  with open(f"./need_approval/{filename}", "rb") as f:
    res = supabase_ser.storage.from_("locs").upload(f"not_approved/{filename}", f, file_options={"content-type": "image/jpeg"})
    print(res)

  os.remove(f"./need_approval/{filename}")


def upload_locs(name, lat, lng):
  result = supabase_ser.table("need_approval").insert({
        "filename": name,
        "lat": lat,
        "lng": lng,
    }).execute()
  
  return result