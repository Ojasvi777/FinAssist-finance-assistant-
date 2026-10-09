import os
import json
import uuid
import datetime
import bcrypt
import jwt
import time
import re
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from pydantic import BaseModel
from typing import List, Optional

from rag_pipeline import answer_question, _gen
from backend.repositories import get_repository

app = FastAPI(title="AmEx FinAssist Backend")
repo = get_repository()

# Rate Limiting Middleware
class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int = 200, window: int = 60):
        super().__init__(app)
        self.limit = limit
        self.window = window
        self.requests = {}

    async def dispatch(self, request, call_next):
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        
        # Clean old timestamps
        if client_ip in self.requests:
            self.requests[client_ip] = [t for t in self.requests[client_ip] if now - t < self.window]
        else:
            self.requests[client_ip] = []
            
        if len(self.requests[client_ip]) >= self.limit:
            return Response("Rate limit exceeded. Too many requests. Please try again later.", status_code=429)
            
        self.requests[client_ip].append(now)
        return await call_next(request)

# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

app.add_middleware(RateLimitMiddleware, limit=200, window=60)
app.add_middleware(SecurityHeadersMiddleware)

# Strict CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def sanitize_text(text: str) -> str:
    if not text:
        return ""
    # Strip HTML tags
    clean = re.sub(r'<[^>]*>', '', text)
    return clean.strip()

SECRET_KEY = "super-secret-key-finassist-amex"
ALGORITHM = "HS256"

# Helper password cryptography
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

# Helper jwt cryptography
def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization credentials missing")
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid session token")
        return user_id
    except Exception:
        raise HTTPException(status_code=401, detail="Session expired or invalid token")

@app.on_event("startup")
async def startup_event():
    await repo.init_db()

# Request Pydantic Schemas
class UserRegister(BaseModel):
    email: str
    password: str
    name: Optional[str] = "Demo User"

class UserLogin(BaseModel):
    email: str
    password: str

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    is_pinned: Optional[bool] = None

class MessageInput(BaseModel):
    text: str

class ExpenseCreate(BaseModel):
    description: str
    amount: float
    category: str
    date: str
    payment_method: str

class SettingUpdate(BaseModel):
    theme: Optional[str] = None
    default_card_id: Optional[str] = None
    notifications_enabled: Optional[bool] = None

class TextLog(BaseModel):
    text: str

# ----------------- AUTH ENDPOINTS -----------------
@app.post("/auth/register")
async def register(payload: UserRegister):
    sanitized_email = sanitize_text(payload.email).lower()
    sanitized_name = sanitize_text(payload.name)
    
    # Validation Checks
    if not re.match(r"[^@]+@[^@]+\.[^@]+", sanitized_email):
        raise HTTPException(status_code=400, detail="Invalid email address format")
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
    if len(sanitized_name) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters long")

    existing = await repo.user_get_by_email(sanitized_email)
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    hashed_pw = hash_password(payload.password)
    user = await repo.user_register(
        email=sanitized_email,
        password_hash=hashed_pw,
        name=sanitized_name,
        avatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
    )

    token = create_access_token({"user_id": user["id"]})
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "name": user["name"]}}

@app.post("/auth/login")
async def login(payload: UserLogin):
    sanitized_email = sanitize_text(payload.email).lower()
    
    user = await repo.user_get_by_email(sanitized_email)
    if not user or not verify_password(payload.password, user["passwordHash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password credentials")

    token = create_access_token({"user_id": user["id"]})
    return {
        "token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user["name"], "avatar": user["avatar"]}
    }

@app.get("/auth/me")
async def get_me(user_id: str = Depends(get_current_user)):
    user = await repo.user_get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ----------------- CONVERSATIONS ENDPOINTS -----------------
@app.get("/conversations")
async def get_conversations(user_id: str = Depends(get_current_user)):
    return await repo.conversation_get_all(user_id)

@app.post("/conversations")
async def create_conversation(user_id: str = Depends(get_current_user)):
    return await repo.conversation_create(user_id, "New Chat Session")

@app.patch("/conversations/{conv_id}")
async def update_conversation(conv_id: str, payload: ConversationUpdate, user_id: str = Depends(get_current_user)):
    success = await repo.conversation_update(
        conv_id=conv_id,
        user_id=user_id,
        title=payload.title,
        is_pinned=payload.is_pinned
    )
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"status": "success"}

@app.delete("/conversations/{conv_id}")
async def delete_conversation(conv_id: str, user_id: str = Depends(get_current_user)):
    success = await repo.conversation_delete(conv_id=conv_id, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"status": "success", "deleted_id": conv_id}

@app.get("/conversations/{conv_id}/messages")
async def get_messages(conv_id: str, user_id: str = Depends(get_current_user)):
    # Check ownership
    convs = await repo.conversation_get_all(user_id)
    if not any(c["id"] == conv_id for c in convs):
        raise HTTPException(status_code=404, detail="Conversation not found")
    return await repo.messages_get_all(conv_id)

@app.post("/conversations/{conv_id}/messages")
async def send_msg(conv_id: str, payload: MessageInput, user_id: str = Depends(get_current_user)):
    # Verify Ownership
    convs = await repo.conversation_get_all(user_id)
    active_conv = next((c for c in convs if c["id"] == conv_id), None)
    if not active_conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Get past chat messages to build conversational memory
    history_rows = await repo.messages_get_all(conv_id)
    chat_history = []
    for i in range(0, len(history_rows) - 1, 2):
        if i + 1 < len(history_rows):
            chat_history.append({
                "question": history_rows[i]["text"],
                "answer": history_rows[i+1]["text"]
            })

    # Save User message
    user_message = await repo.message_create(
        conv_id=conv_id,
        text=payload.text,
        sender="user"
    )

    # Call RAG Pipeline
    answer, sources = answer_question(payload.text, chat_history)

    # Save AI message
    assistant_message = await repo.message_create(
        conv_id=conv_id,
        text=answer,
        sender="assistant",
        sources=sources
    )

    # Generate dynamic conversation title if it was default
    if active_conv["title"] == "New Chat Session":
        words = payload.text.split(" ")
        title = " ".join(words[:4]) + "..." if len(words) > 4 else payload.text
        await repo.conversation_update(conv_id=conv_id, user_id=user_id, title=title)

    return {
        "user_message": user_message,
        "assistant_message": assistant_message
    }

# ----------------- EXPENSE ENDPOINTS -----------------
@app.get("/api/expenses")
async def get_expenses(user_id: str = Depends(get_current_user)):
    return await repo.expense_get_all(user_id)

@app.post("/api/expenses")
async def add_expense(expense: ExpenseCreate, user_id: str = Depends(get_current_user)):
    return await repo.expense_create(
        user_id=user_id,
        description=expense.description,
        amount=expense.amount,
        category=expense.category,
        date=expense.date,
        payment_method=expense.payment_method
    )

@app.delete("/api/expenses/{expense_id}")
async def delete_expense(expense_id: str, user_id: str = Depends(get_current_user)):
    success = await repo.expense_delete(expense_id=expense_id, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"status": "success", "deleted_id": expense_id}

@app.post("/api/expenses/ai-parse")
def ai_parse_expense(payload: TextLog):
    prompt = f"""You are a smart financial transaction parser. Extract the transaction details from the sentence.
Only return a JSON object with keys:
"amount" (float),
"description" (string, capitalized brand/merchant name),
"category" (string, MUST be one of: Food, Travel, Utilities, Entertainment, Shopping, Others),
"payment_method" (string, e.g. Amex Platinum, Amex Gold, Cash, Visa, MasterCard, default to Cash if not mentioned),
"date" (string, YYYY-MM-DD, default to today's date "2026-07-16" if not mentioned).

Sentence: "{payload.text}"

JSON:"""
    try:
        response_text = _gen(prompt)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        return json.loads(response_text)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse text: {str(e)}")

# ----------------- CREDIT CARDS ENDPOINTS -----------------
@app.get("/cards")
async def get_cards(user_id: str = Depends(get_current_user)):
    return await repo.credit_card_get_all(user_id)

@app.get("/cards/rewards")
async def get_rewards_profile(user_id: str = Depends(get_current_user)):
    return await repo.rewards_get_profile(user_id)

# ----------------- SETTINGS ENDPOINTS -----------------
@app.get("/profile/settings")
async def get_settings(user_id: str = Depends(get_current_user)):
    return await repo.settings_get(user_id)

@app.patch("/profile/settings")
async def update_settings(payload: SettingUpdate, user_id: str = Depends(get_current_user)):
    await repo.settings_update(
        user_id=user_id,
        theme=payload.theme,
        default_card_id=payload.default_card_id,
        notifications_enabled=payload.notifications_enabled
    )
    return {"status": "success"}

# ----------------- ANALYTICS ENDPOINTS -----------------
@app.get("/history/analytics")
async def get_analytics(user_id: str = Depends(get_current_user)):
    return await repo.analytics_get(user_id)

# ----------------- SOURCES ENDPOINTS -----------------
@app.get("/sources/optimizer")
def get_sources_status():
    return {
        "vectorDbStatus": "active",
        "vectorSearchIndex": "faiss.index",
        "dimensionSize": 384,
        "loadedDocumentsCount": 15,
        "provider": "Facebook AI Similarity Search (FAISS)",
        "ragArchitecture": "Bayesian Retrieval-Augmented Generation (Bayesian RAG)",
        "bayesianSampling": "Monte Carlo Dropout (N=10)",
        "uncertaintyQuantification": "Epistemic & Conjugate Beta Posterior Update"
    }

@app.get("/health")
def health():
    return {"status": "ok"}