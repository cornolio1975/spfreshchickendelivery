-- Add price_variants JSONB column to products table if it doesn't exist
DO $$ 
    BEGIN
        BEGIN
            ALTER TABLE public.products ADD COLUMN price_variants jsonb DEFAULT '[]'::jsonb;
        EXCEPTION
            WHEN duplicate_column THEN null;
        END;
    END;
$$;
