# 🖼 duplicate-image-detector

![image duplicate-image-detector](./public/did.png)

## ⭐ Visão Geral

Esta aplicação foi criada 100% por IA, utilizando [lovable.dev](https://lovable.dev) e Cursor AI. Seu objetivo é identificar e remover imagens duplicadas, facilitando o gerenciamento e upload de imagens para meu site [Mundo Colorir Desenhos](https://mundocolorirdesenhos.com.br/).

## 👟 Como Rodar a Aplicação:

```sh
# Passo 1: Instale as dependências
npm install

# Passo 2: Inicie o servidor de desenvolvimento
npm run dev
```

#### Requisitos mínimos:

- Node.js & npm instalados

## 📒 Tecnologias Utilizadas

Este projeto foi desenvolvido utilizando:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Python backend (FastAPI)

We ship a simple FastAPI server that exposes the duplicate image detector implemented in Python.

Requirements are in `script/requirements.txt`.

Steps:

1. Create a virtualenv and install dependencies:

```bash
cd script
python -m venv .venv
. .venv/Scripts/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Run the server:

```bash
uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

3. Start the Vite dev server (in another terminal) and open the Python UI at `/python`:

```bash
bun dev  # or npm run dev
```

You can configure the API base via `VITE_PY_API` env var if needed.
