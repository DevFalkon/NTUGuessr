import time
import random
from components.supabase_handler import get_locs
import os
from dotenv import load_dotenv

load_dotenv()

MAX_TIME = int(os.getenv("MAX_TIME"))

class UserSession:
  def __init__(self, session_id, username):
    self.id= session_id
    self.username = username

    self.remaining_ind = [i for i in get_locs()]
    random.shuffle(self.remaining_ind)
    self.cur_img = None

    self.score = 0

    self.start_time = -1
    self.rem_time = MAX_TIME

    self.is_active = False
    self.mode = 1
  
  def resetToDefault(self):
    self.remaining_ind = [i for i in get_locs()]
    random.shuffle(self.remaining_ind)
    self.score = 0
    self.start_time = -1
    self.rem_time = MAX_TIME
    self.cur_img = None
    self.mode = 1

  def updateTime(self):
    if self.start_time == -1:
      self.start_time = time.time()
    else:
      if self.rem_time > 0 and len(self.remaining_ind) > 0:
        self.rem_time -= int(time.time()-self.start_time)
        self.start_time = time.time()
      if self.rem_time < 0:
        self.rem_time = 0
        self.is_active = False

  def printData(self):
    print(f"{self.id}: {self.username}, {len(self.remaining_ind)}, {self.rem_time}, {self.is_active}")
