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

# Session storage (can be upgraded to DB later)
sessions = {}

load_dotenv()

POINTS_MULTIPLIER = float(os.getenv("POINTS_MULTIPLIER"))


# Define your periodic task
async def periodic_task():
    while True:
        for session in sessions.values():
            session.printData()
        await asyncio.sleep(5)   


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Loading images and coordinates...")
    app.state.image_data = get_locs()
    task = asyncio.create_task(periodic_task())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("Background task cancelled")
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)

# Allow frontend CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_credentials=True,
    allow_headers=["*"]
)

# Player Login Model
class LoginRequest(BaseModel):
    username: str
    password: str


@app.post("/login")
async def login(request: LoginRequest):
    print(request.username, request.password)

    session_id = cred_check(request.username, request.password)

    if cred_check(request.username, request.password):
        #session_id = str(uuid.uuid4())
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



@app.post("/logout")
async def logout(requst: SessionRequest):
    try:
        # Save current game state
        sessions.pop(requst.session_id)
    except KeyError:
        print("Logged out")

    return {"done": True}


@app.post("/guess")
async def guess(request: GuessRequest):
    session = sessions[request.session_id]
    print(request.session_id, request.lat, request.lng)
    actual_lat, actual_lng = app.state.image_data[session.cur_img]

    session.cur_img = None

    dist, points = calc_points((request.lat, request.lng), (actual_lat, actual_lng))

    if session.mode == 2:
        points *= POINTS_MULTIPLIER
    session.score += points

    print(f"User scored {points} points!")

    return {
        "lat": actual_lat,
        "lng": actual_lng,
        "score": session.score,
        "dist": dist,
    }


@app.post("/next_image") 
def next_image(requst: SessionRequest):
    session_id = requst.session_id
    if session_id not in sessions:
        raise HTTPException(status_code=401, detail="Invalid session ID")

    session = sessions[session_id]
    session.updateTime()           
    if session.cur_img == None:
        if len(session.remaining_ind) > 0:
            session.cur_img = session.remaining_ind.pop()
        else:
            return {
                "url":None,
                "remTime":0
            }
    url = get_public_url(session.cur_img+'.jpg')

    return {
        "url": url,
        "remTime": int(session.rem_time)
    }

def get_score(session_id):
    score = sessions[session_id].score
    return get_final_score(score, sessions[session_id].username)


@app.post("/final_score")
async def final_score(request: SessionRequest):
    score, rank, h_score = get_score(request.session_id)
    return {
        "score":score,
        "rank":rank,
        "h_score":h_score,
    }

@app.post("/leaderboard")
def get_leaderboard():
    player_data = get_ranking()

    # Aggregate scores by clan
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

@app.api_route("/ping", methods=["GET", "HEAD"])
def ping():
    return {"status": "alive"}


class SignupData(BaseModel):
    session_id: str
    difficulty: str

@app.post("/set_difficulty")
async def set_difficulty(request: SignupData):
    if request.session_id not in sessions:
        raise HTTPException(status_code=400, detail="Invalid session")
    
    else:
        if request.difficulty == "easy":
            pass
        else:
            sessions[request.session_id].mode = 2
    
    return {"status": 1}
        