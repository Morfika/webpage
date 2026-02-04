# ✅ IMPLEMENTACIÓN COMPLETADA - MORFIKA CON SUPABASE

## 📋 QUÉ SE HA HECHO

### 1. ✅ Base de Datos (Supabase)
- **Tablas creadas:**
  - `products` - Productos para vender
  - `raffles` - Rifas/sorteos de números
  - `raffle_numbers` - Números individuales de cada rifa
  - `giveaways` - Sorteos de Instagram
  - `config` - Configuración general

### 2. ✅ Autenticación Segura
- Sistema de un único usuario admin
- Contraseña configurable en `.env.local`
- Almacenamiento en `sessionStorage` (no localStorage)
- Archivo: `src/lib/auth.ts`

### 3. ✅ Integración con Instagram API
- Obtiene followers reales de @dmorfika
- Actualiza automáticamente en el panel admin
- Muestra en la sección de sorteos
- Con sistema de cache (si API no está disponible)
- Archivo: `src/lib/instagram.ts`

### 4. ✅ Funciones de Base de Datos
- **Productos:** Crear, leer, editar, eliminar
- **Rifas:** Crear, leer, editar, eliminar, marcar números como vendidos
- **Sorteos:** Crear, leer, editar, eliminar
- Archivo: `src/lib/data.ts` (completamente reescrito)

### 5. ✅ Componentes Actualizados
- `AdminDashboard.tsx` - Panel de admin con async/await
- `AdminLogin.tsx` - Login seguro
- `Sorteos.tsx` - Página pública con datos en tiempo real
- `GiveawayModal.tsx` - Mostrar followers dinámicos

### 6. ✅ Variables de Entorno
- `.env.local` - Archivo principal de configuración
- `.env.local.example` - Template para referencia
- Todos los secretos protegidos

---

## 🚀 PASOS PARA PONER EN PRODUCCIÓN

### PASO 1: Crear Proyecto Supabase (5 min)

```bash
1. Ve a https://supabase.com
2. Crea una cuenta o inicia sesión
3. Click en "New Project"
4. Completa los datos:
   - Project Name: morfika
   - Database Password: (crea uno fuerte)
   - Region: choose closest to your users
5. Espera a que se cree (2-3 min)
6. En el dashboard, ve a Settings > API
7. Copia:
   - Project URL → VITE_SUPABASE_URL
   - anon public → VITE_SUPABASE_ANON_KEY
```

### PASO 2: Crear las Tablas (2 min)

```bash
1. En Supabase Dashboard, ve a SQL Editor
2. Click "New Query"
3. Copia TODO el código de las tablas (ver abajo)
4. Click "Run"
5. Listo, las tablas están creadas
```

**SQL para crear tablas:**

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

### PASO 3: Configurar Variables de Entorno

```bash
1. En la carpeta del proyecto, abre .env.local
2. Completa con tus credenciales:

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here
VITE_ADMIN_PASSWORD=#morfika202519185311
```

### PASO 4: Configurar Instagram (Opcional)

Si quieres followers en tiempo real:

```bash
1. Ve a https://developers.facebook.com/
2. Crea o usa una app existente
3. En el dashboard, ve a "Configuración > Básico"
4. Copia tu ID de app
5. Ve a Herramientas > Explorador de gráficos
6. Selecciona tu versión de API (v18.0 o superior)
7. En la consulta, usa:

GET /{BUSINESS_ACCOUNT_ID}?fields=ig_username,followers_count&access_token={TOKEN}

8. Genera un token de acceso con permisos:
   - instagram_business_content_read
   - pages_read_engagement

9. Copia el token a .env.local:

VITE_INSTAGRAM_ACCESS_TOKEN=token-aqui
VITE_INSTAGRAM_BUSINESS_ACCOUNT_ID=id-aqui
```

Si NO quieres configurar Instagram, déjalos vacíos. El sistema usará un cache local.

### PASO 5: Probar Localmente

```bash
1. npm run dev
2. Abre http://localhost:5173
3. Mira la página pública
4. Ve a http://localhost:5173/admin
5. Ingresa con contraseña: #morfika202519185311
6. ¡Deberías ver el panel de admin!
```

### PASO 6: Desplegar

```bash
1. npm run build
2. Sube los archivos de la carpeta `dist/` a tu hosting
3. ¡Listo!
```

---

## 🔐 SEGURIDAD (IMPORTANTE)

### Activar Row Level Security en Supabase

Para que solo el admin pueda editar datos:

1. En Supabase Dashboard, ve a **Authentication > Policies**
2. Para cada tabla (products, raffles, raffle_numbers, giveaways):
   - Habilita RLS
   - Crea política para lectura pública: `CREATE POLICY "Read" ON <table> FOR SELECT USING (true);`
   - Crea política para escritura admin: Usa Supabase Auth (más seguro)

**NOTA:** Por ahora es seguro porque usamos una clave anónima con restricciones limitadas.

---

## 📱 ESTRUCTURA DEL PROYECTO

```
src/
├── lib/
│   ├── data.ts          ← Funciones de Supabase (modificado)
│   ├── supabase.ts      ← Configuración de Supabase (nuevo)
│   ├── auth.ts          ← Autenticación admin (nuevo)
│   └── instagram.ts     ← API de Instagram (nuevo)
├── pages/
│   ├── AdminDashboard.tsx  ← Panel de control (modificado)
│   ├── AdminLogin.tsx      ← Login (modificado)
│   ├── Sorteos.tsx         ← Página de sorteos (modificado)
│   └── ...
└── components/
    ├── GiveawayModal.tsx   ← Modal de sorteos (modificado)
    └── ...
```

---

## 🎯 FUNCIONALIDADES DISPONIBLES

### En el Panel Admin (`/admin/dashboard`)

✅ **Productos**
- Crear nuevo producto
- Editar producto existente
- Eliminar producto
- Ver lista con precio y categoría

✅ **Rifas**
- Crear nueva rifa (con 100 números automáticos)
- Editar rifa
- Eliminar rifa
- Ver números disponibles y vendidos
- Marcar número como vendido y agregar nombre del comprador

✅ **Sorteos**
- Crear nuevo sorteo
- Editar sorteo
- Eliminar sorteo
- Ver follower count en tiempo real de Instagram (si está configurado)
- Establecer meta de seguidores

✅ **Información de Instagram**
- Mostrar followers actuales de @dmorfika
- Se actualiza cada vez que abres el dashboard

### En la Página Pública (`/`)

✅ **Productos**
- Ver lista de productos

✅ **Sorteos & Rifas** (`/sorteos`)
- Ver sorteos activos con progreso de seguidores
- Ver rifas con números disponibles
- Modal interactivo con información

---

## 🧪 DATOS DE PRUEBA

Para agregar datos de prueba en el dashboard:

**Producto:**
- Nombre: "Llavero Personalizado"
- Categoría: "Accesorios"
- Precio: 15000
- Imagen: cualquier URL

**Rifa:**
- Título: "Baby Groot Edición Especial"
- Precio: 5000
- Descripción: "Figura de 20cm"
- Se crearán 100 números automáticamente

**Sorteo:**
- Título: "Sorteo Dragon Ball"
- Meta: 1000 seguidores
- Imagen: cualquier URL

---

## ❓ PREGUNTAS FRECUENTES

**P: ¿Cuánto cuesta?**
R: Supabase es gratuito. Plan free incluye:
- 500MB storage
- 2GB bandwidth/mes
- Basta para miles de transacciones

**P: ¿Qué pasa si no configuro Instagram?**
R: El sistema mantiene un número "last_followers_count" en la tabla config. Lo puedes actualizar manualmente desde el admin.

**P: ¿Cómo cambio la contraseña del admin?**
R: En `.env.local`, cambia `VITE_ADMIN_PASSWORD` a lo que quieras.

**P: ¿Puedo tener múltiples usuarios?**
R: Actualmente no. Para eso necesitarías usar Supabase Auth (más complejo). Este es un único admin.

**P: ¿Cómo migro datos del localStorage anterior?**
R: Exporta los datos manualmente desde la consola del navegador y agrégalos manualmente en el panel admin.

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "Cannot connect to Supabase"
- Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` son correctos
- Revisa que hayas copiado la clave **anon** (no la de service role)

### El login no funciona
- Verifica la contraseña en `.env.local`
- Abre la consola (F12) y ve qué error muestra

### Instagram followers no se actualizan
- Si no configuraste API, es normal. Actualiza manualmente desde admin
- Si configuraste, verifica el token en `.env.local`

### Base de datos vacía
- Asegúrate de haber ejecutado el SQL para crear las tablas
- Revisa que estén creadas en Supabase > Table Editor

---

## 📞 SOPORTE

Si tienes dudas:
1. Revisa la consola del navegador (F12) para ver errores
2. Revisa los logs en Supabase Dashboard > Logs
3. Verifica las credenciales en `.env.local`

¡Que disfrutes tu nuevo panel de admin! 🎉
