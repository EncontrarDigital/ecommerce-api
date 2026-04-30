-- Migration: Add GPS fields to addresses table
-- Date: 2026-04-30

-- Add latitude column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'addresses' AND column_name = 'latitude'
    ) THEN
        ALTER TABLE addresses ADD COLUMN latitude DECIMAL(10, 8) NULL;
        COMMENT ON COLUMN addresses.latitude IS 'Latitude da zona de entrega';
    END IF;
END $$;

-- Add longitude column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'addresses' AND column_name = 'longitude'
    ) THEN
        ALTER TABLE addresses ADD COLUMN longitude DECIMAL(11, 8) NULL;
        COMMENT ON COLUMN addresses.longitude IS 'Longitude da zona de entrega';
    END IF;
END $$;

-- Add radius_km column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'addresses' AND column_name = 'radius_km'
    ) THEN
        ALTER TABLE addresses ADD COLUMN radius_km INT DEFAULT 5;
        COMMENT ON COLUMN addresses.radius_km IS 'Raio de cobertura em km';
    END IF;
END $$;

-- Add is_zone column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'addresses' AND column_name = 'is_zone'
    ) THEN
        ALTER TABLE addresses ADD COLUMN is_zone BOOLEAN DEFAULT false;
        COMMENT ON COLUMN addresses.is_zone IS 'Se é uma zona de entrega com coordenadas';
    END IF;
END $$;

-- Verify columns were added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'addresses' 
  AND column_name IN ('latitude', 'longitude', 'radius_km', 'is_zone')
ORDER BY column_name;
