-- Add business_settings table for admin to edit business profile

CREATE TABLE IF NOT EXISTS public.business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL DEFAULT 'SP Fresh Chicken Delivery',
    tagline TEXT DEFAULT 'Premium Quality Halal Chicken',
    description TEXT DEFAULT '',
    phone TEXT DEFAULT '0126273691/0129092013',
    email TEXT DEFAULT 'spfamilyventures.com',
    address TEXT DEFAULT 'Shah Alam Selangor',
    whatsapp TEXT DEFAULT '+60129092013',
    
    -- Operating hours
    operating_hours JSONB DEFAULT '{
        "monday": "8:00 AM - 6:00 PM",
        "tuesday": "8:00 AM - 6:00 PM",
        "wednesday": "8:00 AM - 6:00 PM",
        "thursday": "8:00 AM - 6:00 PM",
        "friday": "8:00 AM - 6:00 PM",
        "saturday": "8:00 AM - 6:00 PM",
        "sunday": "8:00 AM - 6:00 PM"
    }'::jsonb,
    
    -- Social media
    facebook_url TEXT,
    instagram_url TEXT,
    
    -- Images
    logo_url TEXT,
    banner_image_url TEXT,
    
    -- Metadata
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Insert default settings
INSERT INTO public.business_settings (id, business_name, tagline, description)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'SP Fresh Chicken Delivery',
    'Premium Quality Halal Chicken Since 2013',
    'Serving restaurants, markets, and households across Klang Valley with fresh, halal-certified chicken delivered daily.'
)
ON CONFLICT (id) DO UPDATE SET
    description = EXCLUDED.description,
    business_name = EXCLUDED.business_name,
    tagline = EXCLUDED.tagline;

-- Enable RLS
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings
DROP POLICY IF EXISTS "Anyone can read business settings" ON public.business_settings;
CREATE POLICY "Anyone can read business settings"
ON public.business_settings FOR SELECT
TO public
USING (true);

-- Only admins can update settings
DROP POLICY IF EXISTS "Only admins can update business settings" ON public.business_settings;
CREATE POLICY "Only admins can update business settings"
ON public.business_settings FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_business_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_business_settings_timestamp ON public.business_settings;
CREATE TRIGGER update_business_settings_timestamp
BEFORE UPDATE ON public.business_settings
FOR EACH ROW
EXECUTE FUNCTION update_business_settings_timestamp();
