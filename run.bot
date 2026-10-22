@echo off
if not exist venv (
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate
)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload