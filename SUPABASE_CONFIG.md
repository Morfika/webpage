# 📋 CONFIGURACIÓN SUPABASE - MORFIKA

## 🚀 PASOS DE CONFIGURACIÓN

### 1. CREAR PROYECTO EN SUPABASE
- Ve a https://supabase.com
- Crea una cuenta (o inicia sesión)
- Crea un nuevo proyecto
- Toma nota de:
  - **VITE_SUPABASE_URL**: URL del proyecto
  - **VITE_SUPABASE_ANON_KEY**: Clave anónima

### 2. EJECUTAR SQL PARA CREAR TABLAS
En el SQL Editor de Supabase, copia y ejecuta este código:

```sql
-- 1. PRODUCTOS
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description TEXT,
  price INTEGER,
  image VARCHAR,
  category VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. RIFAS/SORTEOS
CREATE TABLE raffles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  description TEXT,
  image VARCHAR,
  price INTEGER,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. NÚMEROS DE RIFA
CREATE TABLE raffle_numbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raffle_id UUID REFERENCES raffles(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  sold BOOLEAN DEFAULT FALSE,
  buyer_name VARCHAR,
  buyer_phone VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. SORTEOS/GIVEAWAYS
CREATE TABLE giveaways (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  description TEXT,
  image VARCHAR,
  instagram_required BOOLEAN DEFAULT FALSE,
  current_followers INTEGER DEFAULT 0,
  target_followers INTEGER,
  end_date TIMESTAMP,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. CONFIGURACIÓN
CREATE TABLE config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instagram_username VARCHAR DEFAULT '@dmorfika',
  last_followers_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO config (instagram_username, last_followers_count) VALUES ('@dmorfika', 0);
```

### 3. CONFIGURAR VARIABLES DE ENTORNO
Edita el archivo `.env.local` con tus credenciales:

```env
# SUPABASE CONFIGURATION
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui

# INSTAGRAM API (Opcional, para obtener followers en tiempo real)
VITE_INSTAGRAM_ACCESS_TOKEN=tu-token-aqui
VITE_INSTAGRAM_BUSINESS_ACCOUNT_ID=tu-account-id-aqui

# ADMIN PASSWORD
VITE_ADMIN_PASSWORD=#morfika202519185311
```

---

## 📱 OBTENER TOKEN DE INSTAGRAM (Opcional)

Si quieres que **@dmorfika** se actualice automáticamente con los followers reales:

### Opción 1: Meta Business API (Recomendado)
1. Ve a https://developers.facebook.com/
2. Crea una app o usa una existente
3. Configura Instagram Graph API
4. Obtén un token de acceso con permisos `instagram_business_content_read`
5. Obtén el ID de tu cuenta de negocio

### Opción 2: Sin API (Manual)
Si no tienes token, el sistema usará un cache local. Puedes actualizar manualmente el número de followers en el panel de admin.

---

## 🔐 SEGURIDAD - ROW LEVEL SECURITY (RLS)

Para que solo tú puedas modificar datos, activa RLS en Supabase:

1. En cada tabla (products, raffles, raffle_numbers, giveaways)
2. Habilita RLS
3. Crea políticas que solo permitan leer públicamente, pero solo el admin puede escribir

**Política de lectura pública:**
```sql
CREATE POLICY "Enable read access for all users" ON products
FOR SELECT USING (true);
```

**Política de escritura solo admin:**
```sql
CREATE POLICY "Enable write access for authenticated users" ON products
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

---

## 🧪 PROBAR LA CONEXIÓN

1. Inicia el servidor: `npm run dev`
2. Ve a http://localhost:5173/admin
3. Login con contraseña: `#morfika202519185311`
4. Deberías ver el panel de admin conectado a Supabase

---

## 📊 ESTRUCTURA DE DATOS

### Products (Productos)
```json
{
  "id": "uuid",
  "name": "Llavero Personalizado",
  "description": "Descripción del producto",
  "price": 15000,
  "image": "https://...",
  "category": "Accesorios"
}
```

### Raffles (Rifas)
```json
{
  "id": "uuid",
  "title": "Baby Groot",
  "description": "Figura 20cm",
  "image": "https://...",
  "price": 5000,
  "end_date": "2025-03-01",
  "numbers": [...] // Generado automáticamente (100 números)
}
```

### Raffle Numbers
```json
{
  "raffle_id": "uuid",
  "number": 1,
  "sold": false,
  "buyer_name": "Juan Pérez",
  "buyer_phone": "+5799999999"
}
```

### Giveaways (Sorteos)
```json
{
  "id": "uuid",
  "title": "Sorteo Dragon Ball",
  "description": "Participa...",
  "image": "https://...",
  "instagram_required": true,
  "current_followers": 850,
  "target_followers": 1000,
  "end_date": "2025-02-28",
  "active": true
}
```

---

## 🔄 FUNCIONES DISPONIBLES

### En `src/lib/data.ts`:

**Productos:**
- `getProducts()` - Obtener todos
- `addProduct(product)` - Agregar nuevo
- `updateProduct(id, updates)` - Editar
- `deleteProduct(id)` - Eliminar

**Rifas:**
- `getRaffles()` - Obtener todas
- `addRaffle(raffle)` - Crear nueva
- `updateRaffle(id, updates)` - Editar
- `deleteRaffle(id)` - Eliminar
- `updateRaffleNumber(raffleId, number, sold, buyerName, buyerPhone)` - Marcar número
- `addRaffleNumbers(raffleId, count)` - Agregar X números

**Sorteos:**
- `getGiveaways()` - Obtener todos
- `addGiveaway(giveaway)` - Crear nuevo
- `updateGiveaway(id, updates)` - Editar
- `deleteGiveaway(id)` - Eliminar

**Instagram:**
- `getInstagramFollowers()` - Obtener followers (con cache)

**Auth:**
- `login(password)` - Autenticar
- `checkAuth()` - Verificar si está logueado
- `logout()` - Cerrar sesión

---

## ❓ PREGUNTAS FRECUENTES

**P: ¿Cuánto cuesta Supabase?**
R: El plan gratuito es más que suficiente. Incluye:
- 500MB storage
- 2GB bandwidth/mes
- API unlimited
- Basta para miles de operaciones

**P: ¿Qué pasa sin Instagram API?**
R: El sistema mantiene un cache local de followers. Lo puedes actualizar manualmente en el admin.

**P: ¿Cómo cambio la contraseña del admin?**
R: Edita `VITE_ADMIN_PASSWORD` en `.env.local` o en `src/lib/auth.ts`

**P: ¿Puedo tener múltiples usuarios admin?**
R: Actualmente es un único usuario. Para múltiples usuarios, necesitarías usar Supabase Auth (más complejo).

---

## 📞 SOPORTE

Si tienes problemas con la integración:
1. Verifica que las credenciales de Supabase sean correctas
2. Abre la consola del navegador (F12) para ver errores
3. Revisa los logs en Supabase Dashboard > Logs

¡Listo para usar! 🚀
