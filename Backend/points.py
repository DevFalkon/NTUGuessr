from math import radians, sin, cos, sqrt, atan2
import math

def haversine(lat1, lng1, lat2, lng2):
    R = 6371  # Earth radius in kilometers

    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)

    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c  # Distance in km

def distance_to_points(distance_km):
  max_points = 1000
  decay_rate = 6  # higher = sharper drop
  points = int(max_points * math.exp(-decay_rate * distance_km))
  return points


def calc_points(actual, guess):
  dist = haversine(*actual, *guess)
  score = distance_to_points(dist)
  return dist, score
