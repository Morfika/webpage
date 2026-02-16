-- 1. Tabla de Impresoras
CREATE TABLE IF NOT EXISTS public.printers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    consumo_wh NUMERIC NOT NULL DEFAULT 0,
    costo_kwh NUMERIC NOT NULL DEFAULT 0,
    costo_minuto NUMERIC NOT NULL DEFAULT 0
);

-- 2. Tabla de Cotizaciones (Cabecera)
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_name TEXT NOT NULL
);

-- 3. Tabla de Items de Cotización (Piezas individuales)
CREATE TABLE IF NOT EXISTS public.quotation_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE NOT NULL,
    printer_id UUID REFERENCES public.printers(id) ON DELETE SET NULL, 
    
    -- Detalles básicos
    name TEXT NOT NULL,
    image_url TEXT, -- URL de la imagen en el bucket morfika-images
    
    -- Parámetros de Input para cálculos
    material TEXT NOT NULL,
    costo_1kg NUMERIC NOT NULL DEFAULT 0,
    consumo_gramos NUMERIC NOT NULL DEFAULT 0,
    tiempo_minutos NUMERIC NOT NULL DEFAULT 0,
    
    -- Parámetros de Postprocesado
    primer_costo_200ml NUMERIC NOT NULL DEFAULT 0,
    consumo_primer_gramos NUMERIC NOT NULL DEFAULT 0,
    costo_lijado_pintura NUMERIC NOT NULL DEFAULT 0,
    tiempo_postprocesado NUMERIC NOT NULL DEFAULT 0,
    costo_hora_postprocesado NUMERIC NOT NULL DEFAULT 0
);

-- 4. Habilitar RLS (Seguridad)
ALTER TABLE public.printers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas de acceso (Permitir todo a usuarios autenticados/anon por ahora para facilitar el admin)
-- Puedes restringir esto más si lo deseas solo a autenticados cambiando 'anon' por 'authenticated'
CREATE POLICY "Acceso total a impresoras" ON public.printers 
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acceso total a cotizaciones" ON public.quotations 
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acceso total a items" ON public.quotation_items 
FOR ALL USING (true) WITH CHECK (true);
