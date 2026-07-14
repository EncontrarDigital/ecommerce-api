-- Migration: Create category_photos table
-- Description: Adds support for category images following the same Supabase storage pattern as product photos
-- Date: 2026-07-14

-- Create category_photos table
CREATE TABLE IF NOT EXISTS category_photos (
    id SERIAL PRIMARY KEY,
    path VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "thumbnailPath" VARCHAR(255) NOT NULL,
    "placeholderBase64" TEXT,
    "categoryId" INTEGER NOT NULL,
    CONSTRAINT fk_category_photos_category 
        FOREIGN KEY ("categoryId") 
        REFERENCES categories(id) 
        ON DELETE CASCADE
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_category_photos_categoryId ON category_photos("categoryId");

-- Add comments for documentation
COMMENT ON TABLE category_photos IS 'Stores category images in Supabase storage following the same pattern as product photos';
COMMENT ON COLUMN category_photos.path IS 'Full path in Supabase storage bucket (e.g., uploads/timestamp-name.jpg)';
COMMENT ON COLUMN category_photos."mimeType" IS 'MIME type of the image (e.g., image/jpeg)';
COMMENT ON COLUMN category_photos."thumbnailPath" IS 'Path to thumbnail version in Supabase storage';
COMMENT ON COLUMN category_photos."placeholderBase64" IS 'Base64 encoded placeholder for progressive loading';
