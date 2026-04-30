-- Migration: Create delivery_settings table
-- Date: 2026-04-30

-- Create table if not exists
CREATE TABLE IF NOT EXISTS delivery_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_delivery_settings_key ON delivery_settings(key);

-- Insert default values (only if table is empty)
INSERT INTO delivery_settings (key, value, type, description)
SELECT * FROM (VALUES
    ('delivery.default_fee', '1000', 'number', 'Taxa de entrega padrão quando não há zonas configuradas (em Kz)'),
    ('delivery.extra_km_fee', '100', 'number', 'Taxa adicional por km quando fora da zona de cobertura (em Kz por km)'),
    ('delivery.default_radius_km', '5', 'number', 'Raio padrão de cobertura quando zona não tem raio definido (em km)'),
    ('delivery.base_location_lat', '-8.9167', 'number', 'Latitude da localização base (Luanda Sul - Talatona)'),
    ('delivery.base_location_lng', '13.1833', 'number', 'Longitude da localização base (Luanda Sul - Talatona)'),
    ('delivery.min_order_for_free_delivery', '0', 'number', 'Valor mínimo do pedido para entrega grátis (0 = desabilitado, em Kz)')
) AS v(key, value, type, description)
WHERE NOT EXISTS (SELECT 1 FROM delivery_settings LIMIT 1);

-- Verify data was inserted
SELECT * FROM delivery_settings ORDER BY key;
