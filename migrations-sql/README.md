# Migrations SQL - Admin Delivery Management

## Como Rodar as Migrations

### Opção 1: Usando psql (Recomendado)

```bash
# 1. Conectar ao banco
psql -h caboose.proxy.rlwy.net -p 17780 -U postgres -d railway

# 2. Rodar as migrations (dentro do psql)
\i 01-add-gps-fields-to-addresses.sql
\i 02-create-delivery-settings-table.sql

# 3. Verificar se funcionou
\d addresses
SELECT * FROM delivery_settings;

# 4. Sair
\q
```

### Opção 2: Usando o script automático

```bash
cd ecommerce-api/migrations-sql

# Definir a senha do banco (se necessário)
export DB_PASSWORD=sua_senha_aqui

# Rodar o script
./run-migrations.sh
```

### Opção 3: Rodar diretamente via comando

```bash
# Migration 1
psql -h caboose.proxy.rlwy.net -p 17780 -U postgres -d railway -f 01-add-gps-fields-to-addresses.sql

# Migration 2
psql -h caboose.proxy.rlwy.net -p 17780 -U postgres -d railway -f 02-create-delivery-settings-table.sql
```

## Verificar se as Migrations Rodaram

```sql
-- Verificar colunas GPS na tabela addresses
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'addresses' 
  AND column_name IN ('latitude', 'longitude', 'radius_km', 'is_zone');

-- Verificar tabela delivery_settings
SELECT * FROM delivery_settings ORDER BY key;
```

## Resultado Esperado

Após rodar as migrations, você deve ter:

1. **Tabela addresses** com 4 novas colunas:
   - `latitude` (decimal)
   - `longitude` (decimal)
   - `radius_km` (integer)
   - `is_zone` (boolean)

2. **Tabela delivery_settings** criada com 6 registros:
   - `delivery.default_fee` = 1000
   - `delivery.extra_km_fee` = 100
   - `delivery.default_radius_km` = 5
   - `delivery.base_location_lat` = -8.9167
   - `delivery.base_location_lng` = 13.1833
   - `delivery.min_order_for_free_delivery` = 0
