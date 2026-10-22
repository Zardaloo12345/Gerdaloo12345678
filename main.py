"""
گردآلو - Gerdaloo AI Backend
FastAPI + Ollama + Streaming + Memory
"""

import json
import os
from pathlib import Path
from typing import List, Optional

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

# ===== تنظیمات =====
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3")
MEMORY_FILE = Path(__file__).parent / "memory.json"
MAX_HISTORY = 20

# ===== اپ =====
app = FastAPI(
    title="Gerdaloo AI Backend",
    description="بک‌اند گردآلو — دستیار هوشمند سایت زردآلو",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== مدل‌های داده =====
class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    session_id: str = Field(default="default", max_length=64)
    stream: bool = True


class ChatResponse(BaseModel):
    reply: str
    session_id: str


class HistoryResponse(BaseModel):
    session_id: str
    messages: List[ChatMessage]
    facts: List[str]


# ===== مدیریت حافظه =====
def load_memory() -> dict:
    if MEMORY_FILE.exists():
        try:
            with open(MEMORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {}
    return {}


def save_memory(memory: dict) -> None:
    try:
        with open(MEMORY_FILE, "w", encoding="utf-8") as f:
            json.dump(memory, f, ensure_ascii=False, indent=2)
    except IOError as e:
        print(f"خطا در ذخیره حافظه: {e}")


def get_session(memory: dict, session_id: str) -> dict:
    if session_id not in memory:
        memory[session_id] = {"history": [], "facts": []}
    return memory[session_id]


# ===== پایگاه دانش محلی =====
SITE_KNOWLEDGE = {
    "زردآلو چیه": "سایت زردآلو یک بازار آنلاین برای خرید و فروش کالاست. شعارش «با زردآلو خرید راحته!» است و توسط عرفان ریاحی ساخته شده. 🍑",
    "سازنده": "سازنده و مالک سایت زردآلو، عرفان ریاحی است. 🧑🏻‍💻",
    "آدرس": "آدرس سایت: https://zardaloo12345.github.io/zardaloo.online.shop/ 🌍",
    "پروفایل": "برای استفاده از زردآلو، اول باید پروفایل خودت را بسازی: نام، شماره تماس و شماره زردآلو. 👤",
    "بازار": "بخش «بازار زردآلو» محل خرید و فروش کالاست. 🛒",
}


def find_local_answer(text: str) -> Optional[str]:
    for key, value in SITE_KNOWLEDGE.items():
        if key in text:
            return value
    return None


# ===== ارتباط با Ollama =====
async def call_ollama_stream(message: str, history: List[dict], facts: List[str]):
    memory_context = ""
    if facts:
        memory_context = f"\nچیزهایی که درباره کاربر می‌دانی: {'، '.join(facts)}"

    system_prompt = (
        "تو گردآلو هستی، دستیار هوشمند و مهربان سایت زردآلو. "
        "پاسخ‌ها را به فارسی و با Markdown بنویس. "
        f"درباره سایت زردآلو اطلاعات کامل داری.{memory_context}"
    )

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history[-MAX_HISTORY:])
    messages.append({"role": "user", "content": message})

    payload = {"model": OLLAMA_MODEL, "messages": messages, "stream": True}

    async def generate():
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream("POST", f"{OLLAMA_URL}/api/chat", json=payload) as response:
                    if response.status_code != 200:
                        yield f"data: {json.dumps({'error': 'Ollama error'})}\n\n"
                        return
                    async for line in response.aiter_lines():
                        if not line.strip():
                            continue
                        try:
                            data = json.loads(line)
                            if "message" in data and "content" in data["message"]:
                                chunk = data["message"]["content"]
                                yield f"data: {json.dumps({'chunk': chunk}, ensure_ascii=False)}\n\n"
                            if data.get("done"):
                                yield f"data: {json.dumps({'done': True})}\n\n"
                                break
                        except json.JSONDecodeError:
                            continue
        except httpx.ConnectError:
            yield f"data: {json.dumps({'error': 'Ollama در دسترس نیست.'}, ensure_ascii=False)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


async def call_ollama_sync(message: str, history: List[dict], facts: List[str]) -> str:
    memory_context = ""
    if facts:
        memory_context = f"\nچیزهایی که درباره کاربر می‌دانی: {'، '.join(facts)}"

    messages = [
        {"role": "system", "content": f"تو گردآلو هستی، دستیار هوشمند سایت زردآلو.{memory_context}"},
        *history[-MAX_HISTORY:],
        {"role": "user", "content": message},
    ]

    payload = {"model": OLLAMA_MODEL, "messages": messages, "stream": False}

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(f"{OLLAMA_URL}/api/chat", json=payload)
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="خطا در ارتباط با Ollama")
        data = response.json()
        return data.get("message", {}).get("content", "")


# ===== Endpoints =====
@app.get("/")
async def root():
    return {
        "name": "Gerdaloo AI Backend",
        "version": "1.0.0",
        "status": "running",
        "model": OLLAMA_MODEL,
        "ollama_url": OLLAMA_URL,
    }


@app.get("/health")
async def health():
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_URL}/api/tags")
            if response.status_code == 200:
                models = response.json().get("models", [])
                return {"status": "healthy", "ollama": "connected", "models": [m.get("name") for m in models]}
    except Exception as e:
        return {"status": "unhealthy", "ollama": "disconnected", "error": str(e)}
    return {"status": "unknown"}


@app.post("/chat")
async def chat(request: ChatRequest):
    memory = load_memory()
    session = get_session(memory, request.session_id)

    local_answer = find_local_answer(request.message)
    if local_answer:
        session["history"].append({"role": "user", "content": request.message})
        session["history"].append({"role": "assistant", "content": local_answer})
        save_memory(memory)
        return ChatResponse(reply=local_answer, session_id=request.session_id)

    if request.stream:
        return await call_ollama_stream(request.message, session["history"], session["facts"])
    else:
        reply = await call_ollama_sync(request.message, session["history"], session["facts"])
        session["history"].append({"role": "user", "content": request.message})
        session["history"].append({"role": "assistant", "content": reply})
        save_memory(memory)
        return ChatResponse(reply=reply, session_id=request.session_id)


@app.get("/history/{session_id}")
async def get_history(session_id: str):
    memory = load_memory()
    session = get_session(memory, session_id)
    return HistoryResponse(
        session_id=session_id,
        messages=[ChatMessage(**m) for m in session["history"]],
        facts=session["facts"],
    )


@app.delete("/history/{session_id}")
async def clear_history(session_id: str):
    memory = load_memory()
    if session_id in memory:
        memory[session_id] = {"history": [], "facts": []}
        save_memory(memory)
    return {"status": "cleared", "session_id": session_id}


@app.post("/memory/{session_id}")
async def add_fact(session_id: str, fact: str):
    memory = load_memory()
    session = get_session(memory, session_id)
    if fact not in session["facts"]:
        session["facts"].append(fact)
        save_memory(memory)
    return {"status": "saved", "facts": session["facts"]}


@app.get("/models")
async def list_models():
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{OLLAMA_URL}/api/tags")
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
    raise HTTPException(status_code=502, detail="خطا در دریافت مدل‌ها")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)