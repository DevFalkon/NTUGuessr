from pydantic import BaseModel

# File that Defining all request models
# Player Login Request Model
class LoginRequest(BaseModel):
    username: str
    password: str

class GuessRequest(BaseModel):
    session_id: str
    lat: float
    lng: float

class SessionRequest(BaseModel):
    session_id: str

class UsernameRequest(BaseModel):
    username: str

class SignupData(BaseModel):
    username: str
    password: str
    clan: str

class DifficultyData(BaseModel):
    session_id: str
    difficulty: str