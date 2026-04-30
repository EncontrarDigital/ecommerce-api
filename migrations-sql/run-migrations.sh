#!/bin/bash

# Script para rodar migrations SQL no banco de dados PostgreSQL
# Data: 2026-04-30

echo "🚀 Rodando migrations para Admin Delivery Management..."
echo ""

# Configurações do banco (ajuste se necessário)
DB_HOST="caboose.proxy.rlwy.net"
DB_PORT="17780"
DB_USER="postgres"
DB_NAME="railway"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📊 Conectando ao banco de dados...${NC}"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo ""

# Verificar se psql está instalado
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ Erro: psql não está instalado${NC}"
    echo "Instale o PostgreSQL client:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

# Rodar primeira migration
echo -e "${YELLOW}📝 Migration 1: Adicionando campos GPS na tabela addresses...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f 01-add-gps-fields-to-addresses.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migration 1 executada com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao executar Migration 1${NC}"
    exit 1
fi

echo ""

# Rodar segunda migration
echo -e "${YELLOW}📝 Migration 2: Criando tabela delivery_settings...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f 02-create-delivery-settings-table.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migration 2 executada com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao executar Migration 2${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Todas as migrations foram executadas com sucesso!${NC}"
echo ""
echo "Próximos passos:"
echo "1. Iniciar backend: cd ../.. && npm run start:dev"
echo "2. Testar endpoints: curl http://localhost:3000/delivery-settings"
echo "3. Iniciar frontend: cd ../../ecommerce-platform-angular-admin-panel-master && npm start"
