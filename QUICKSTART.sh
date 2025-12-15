#!/bin/bash

# PyPole - Quick Start Script
# Este script configura e inicia o projeto PyPole

set -e

echo "🏎️  PyPole F1 Analytics - Quick Start"
echo "======================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar pré-requisitos
echo "📋 Verificando pré-requisitos..."

if ! command_exists docker; then
    echo -e "${RED}❌ Docker não está instalado${NC}"
    echo "Por favor, instale Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose não está instalado${NC}"
    echo "Por favor, instale Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker e Docker Compose encontrados${NC}"
echo ""

# Escolha do método de setup
echo "Escolha o método de setup:"
echo "1) Docker Compose (Recomendado - mais fácil)"
echo "2) Desenvolvimento Local (Requer Python e Node.js)"
echo ""
read -p "Digite sua escolha (1 ou 2): " choice

if [ "$choice" == "1" ]; then
    echo ""
    echo "🐳 Iniciando com Docker Compose..."
    echo ""
    
    # Configurar arquivos .env se não existirem
    if [ ! -f backend/.env ]; then
        echo "📝 Criando backend/.env..."
        cp backend/.env.example backend/.env 2>/dev/null || echo "Aviso: backend/.env.example não encontrado"
    fi
    
    if [ ! -f frontend/.env.local ]; then
        echo "📝 Criando frontend/.env.local..."
        cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)
EOF
    fi
    
    echo ""
    echo "🚀 Iniciando containers Docker..."
    docker-compose up -d
    
    echo ""
    echo "⏳ Aguardando serviços iniciarem..."
    sleep 10
    
    echo ""
    echo -e "${GREEN}✅ Aplicação iniciada com sucesso!${NC}"
    echo ""
    echo "🌐 Acesse:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:8000"
    echo "   API Docs:  http://localhost:8000/docs"
    echo ""
    echo "📋 Para ver logs:"
    echo "   docker-compose logs -f"
    echo ""
    echo "🛑 Para parar:"
    echo "   docker-compose down"
    echo ""
    
elif [ "$choice" == "2" ]; then
    echo ""
    echo "🔧 Setup de Desenvolvimento Local..."
    echo ""
    
    # Verificar Python
    if ! command_exists python3; then
        echo -e "${RED}❌ Python 3 não está instalado${NC}"
        exit 1
    fi
    
    # Verificar Node.js
    if ! command_exists node; then
        echo -e "${RED}❌ Node.js não está instalado${NC}"
        exit 1
    fi
    
    # Verificar Poetry
    if ! command_exists poetry; then
        echo -e "${YELLOW}⚠️  Poetry não encontrado. Instalando...${NC}"
        curl -sSL https://install.python-poetry.org | python3 -
    fi
    
    # Setup Backend
    echo "🐍 Configurando Backend..."
    cd backend
    
    if [ ! -f .env ]; then
        cp .env.example .env
    fi
    
    poetry install
    
    echo "Starting PostgreSQL and Redis..."
    docker-compose up -d postgres redis
    
    sleep 5
    
    echo "Running database migrations..."
    poetry run alembic upgrade head
    
    echo "Starting backend server..."
    poetry run uvicorn app.main:app --reload &
    BACKEND_PID=$!
    
    cd ..
    
    # Setup Frontend
    echo ""
    echo "⚛️  Configurando Frontend..."
    cd frontend
    
    if [ ! -f .env.local ]; then
        cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)
EOF
    fi
    
    npm install
    
    echo "Starting frontend server..."
    npm run dev &
    FRONTEND_PID=$!
    
    cd ..
    
    echo ""
    echo -e "${GREEN}✅ Aplicação iniciada com sucesso!${NC}"
    echo ""
    echo "🌐 Acesse:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:8000"
    echo "   API Docs:  http://localhost:8000/docs"
    echo ""
    echo "🛑 Para parar, pressione Ctrl+C"
    echo ""
    
    # Esperar pelos processos
    wait $BACKEND_PID $FRONTEND_PID
    
else
    echo -e "${RED}❌ Escolha inválida${NC}"
    exit 1
fi

