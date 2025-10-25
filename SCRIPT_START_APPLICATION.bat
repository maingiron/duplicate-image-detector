@echo off
title Iniciando ambiente...

echo ---> Subindo frontend...
start /b npm run dev

echo ---> Subindo backend...
cd script
call .venv\Scripts\activate
uvicorn server:app --reload --host 127.0.0.1 --port 8000
