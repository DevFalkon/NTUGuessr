from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import asyncio
from session import UserSession
from storage import get_public_url, checkUserName
from storage import get_locs, get_final_score, get_ranking, cred_check, create_acc
from points import calc_points
import bcrypt
import os
from dotenv import load_dotenv
from logs_handler import logger

# Session storage (can be upgraded to DB later)
sessions = {}

load_dotenv()

POINTS_MULTIPLIER = float(os.getenv("POINTS_MULTIPLIER"))


# Periodic task
async def periodic_task():
    while True:
        for session in sessions.values():
            session.printData()
        await asyncio.sleep(5)   


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Loading images and coordinates from database")
    app.state.image_data = get_locs()

    # Integrate telegram bot

    # create periodic task
    task = asyncio.create_task(periodic_task())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("Background task cancelled")
    print("Shutting down...")

# Inititialise FastAPI app
app = FastAPI(lifespan=lifespan,title="NTUGuessr")

# Allow frontend CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_credentials=True,
    allow_headers=["*"]
)

# Player Login Request Model
class LoginRequest(BaseModel):
    username: str
    password: str

# User login endpoint
@app.post("/login")
async def login(request: LoginRequest):
    # Logs
    logger.info(f"[USER LOGIN]: {request.username} | {request.password}")

    session_id = cred_check(request.username, request.password)

    if session_id:
        # if cred_check returns !None, create new user session
        # This needs to be changed to use JWT tokens
        sessions[session_id] = UserSession(session_id, request.username)
        return {"session_id": session_id, 'login': True}
    
    return {'session_id': False, 'login': False}

class SessionRequest(BaseModel):
    session_id: str

class GuessRequest(BaseModel):
    session_id: str
    lat: float
    lng: float


@app.post("/game_state")
async def game_state(request: SessionRequest):
    sessions[request.session_id].updateTime()
    print(f"game state: {sessions[request.session_id].is_active}")
    return {"isActive": sessions[request.session_id].is_active}


@app.post("/new_game")
async def new_game(request: SessionRequest):
    app.state.image_data = get_locs()
    sessions[request.session_id].resetToDefault()

    return {"done": True}

@app.post("/rest")
async def reset(request: SessionRequest):
    session_id = request.session_id
    session = sessions[session_id]
    if session_id in sessions and len(session.remaining_ind) > 0:
        score = session.score
        # Save the score

    sessions[session_id].resetToDefault()

    return {"done": True}


# Handle user logout
@app.post("/logout")
async def logout(requst: SessionRequest):
    try:
        # Save current game state -> Need to implement

        # Delte user session info from memory
        # Needs to be changed
        sessions.pop(requst.session_id)
    except KeyError:
        print("Logged out")

    return {"done": True}


# Hangle user guess
@app.post("/guess")
async def guess(request: GuessRequest):
    # Get user session info -> Needs to be integrated with db later
    session = sessions[request.session_id]

    # Get the actual latitude and longitude info from the database
    actual_lat, actual_lng = app.state.image_data[session.cur_img]
    
    # Set current image to None
    # /next_image only updates if cur_img == None
    session.cur_img = None

    # Calculate the distance and points
    dist, points = calc_points((request.lat, request.lng), (actual_lat, actual_lng))

    # If game mode == Difficult : points *= POINTS_MULTIPLIER (1.5 default)
    if session.mode == 2:
        points *= POINTS_MULTIPLIER
    session.score += int(points)

    return {
        "lat": actual_lat,
        "lng": actual_lng,
        "score": session.score,
        "dist": dist,
    }


@app.post("/next_image") 
def next_image(requst: SessionRequest):
    # Check if user session exists
    session_id = requst.session_id
    if session_id not in sessions:
        raise HTTPException(status_code=401, detail="Invalid session ID")

    session = sessions[session_id]

    # Update remainig time on the backend
    session.updateTime()    

    # Only update the image after user has guessed/ this is the first image
    # Prevents triggering incase of page reload       
    if session.cur_img == None:
        # Check if there are any new images
        if len(session.remaining_ind) > 0:
            session.cur_img = session.remaining_ind.pop()
        else:
            # End game if user has gone through all images
            return {
                "url":None,
                "remTime":0
            }
    url = get_public_url(session.cur_img+'.jpg')

    return {
        "url": url,
        "remTime": int(session.rem_time)
    }


@app.post("/final_score")
async def final_score(request: SessionRequest):
    session_id = request.session_id
    score = sessions[session_id].score
    score, rank, h_score = get_final_score(score, sessions[session_id].username)
    return {
        "score":score,
        "rank":rank,
        "h_score":h_score,
    }

@app.post("/leaderboard")
def get_leaderboard():
    player_data = get_ranking()

    # Aggregate scores by clan -> need to change to json config
    # JSON config to be used to select group while signing up
    clan_scores = {}
    for player in player_data:
        clan = player["clan"]
        score = player["high_score"]
        if clan:
            clan_scores[clan] = clan_scores.get(clan, 0) + score

    # Convert to list of dicts and sort by score
    clan_rankings = sorted(
        [{"clan": c, "score": s} for c, s in clan_scores.items()],
        key=lambda x: x["score"],
        reverse=True
    )

    return {
        "players": player_data,
        "clans": clan_rankings
    }

class UsernameRequest(BaseModel):
    username: str

# Endpoint to check if username is unique
@app.post("/check-username")
async def check_username(data: UsernameRequest):
    response = checkUserName(data.username)
    if response.data:
        return {"exists": True}
    return {"exists": False}

class SignupData(BaseModel):
    username: str
    password: str
    clan: str

# Endpoint to create new user
@app.post("/signup")
async def signup(data: SignupData):

    # Hash the password
    password_hash = bcrypt.hashpw(data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    result = create_acc(data.username, password_hash, data.clan)
    print(result)
    if not result.data:
        raise HTTPException(status_code=500, detail="Database error")

    return {"message": "User created successfully"}
    

@app.post("/get_remaining_time")
async def get_remaining_time(request: SessionRequest):
    if request.session_id not in sessions:
        raise HTTPException(status_code=400, detail="Invalid session")

    sessions[request.session_id].updateTime()

    return {"remTime": int(sessions[request.session_id].rem_time)}

# Endpoint to check API status
# Can be used with services such as UptimeRobot to keep track of uptime
@app.api_route("/ping", methods=["GET", "HEAD"])
def ping():
    return {"status": "alive"}


@app.api_route("/",methods=["GET", "HEAD"] )
def default():
    return {"status": "alive"}


class SignupData(BaseModel):
    session_id: str
    difficulty: str

@app.post("/set_difficulty")
async def set_difficulty(request: SignupData):
    if request.session_id not in sessions:
        raise HTTPException(status_code=400, detail="Invalid session")
    
    else:
        logger.info(f"[DIFFICULTY]: {request.difficulty}")
        if request.difficulty == "easy":
            pass
        else:
            sessions[request.session_id].mode = 2
    
    return {"status": 1}
        