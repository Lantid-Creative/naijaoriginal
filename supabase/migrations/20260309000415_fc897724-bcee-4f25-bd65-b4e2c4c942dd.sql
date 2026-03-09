-- Create product_collections table
CREATE TABLE public.product_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  pidgin_tagline TEXT,
  type TEXT NOT NULL CHECK (type IN ('seasonal', 'gift', 'special')),
  icon TEXT,
  banner_image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product_collection_items junction table
CREATE TABLE public.product_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.product_collections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(collection_id, product_id)
);

-- Enable RLS
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_collection_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_collections
CREATE POLICY "Anyone can view active collections"
ON public.product_collections
FOR SELECT
USING (is_active = true OR is_admin());

CREATE POLICY "Admins can manage collections"
ON public.product_collections
FOR ALL
USING (is_admin());

-- RLS Policies for product_collection_items
CREATE POLICY "Anyone can view collection items"
ON public.product_collection_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.product_collections
    WHERE id = product_collection_items.collection_id
    AND is_active = true
  )
  OR is_admin()
);

CREATE POLICY "Admins can manage collection items"
ON public.product_collection_items
FOR ALL
USING (is_admin());

-- Add updated_at trigger for product_collections
CREATE TRIGGER update_product_collections_updated_at
BEFORE UPDATE ON public.product_collections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create index for better performance
CREATE INDEX idx_collection_items_collection ON public.product_collection_items(collection_id);
CREATE INDEX idx_collection_items_product ON public.product_collection_items(product_id);
CREATE INDEX idx_collections_type ON public.product_collections(type);
CREATE INDEX idx_collections_slug ON public.product_collections(slug);