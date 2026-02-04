# 🏗️ ARQUITECTURA DEL SISTEMA - MORFIKA

## 📐 DIAGRAMA GENERAL

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET PÚBLICO                          │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴────────┐
                    │                │
            ┌───────▼────────┐  ┌────▼──────────┐
            │   MORFIKA.COM  │  │ INSTAGRAM API │
            │  (React + Vite)│  │  (@dmorfika)  │
            └────┬───────────┘  └────┬──────────┘
                 │                   │
                 │                   │
        ┌────────▼───────────────────▼────┐
        │    SUPABASE (PostgreSQL)        │
        │  ☁️ Base de Datos en la Nube    │
        ├────────────────────────────────┤
        │ • products (Productos)         │
        │ • raffles (Rifas)              │
        │ • raffle_numbers (Números)     │
        │ • giveaways (Sorteos)          │
        │ • config (Configuración)       │
        └────────────────────────────────┘
```

---

## 🔄 FLUJO DE DATOS

### Flujo 1: Admin crea un Producto

```
Admin en /admin/dashboard
    ↓
Llena formulario (nombre, precio, etc)
    ↓
Click "Guardar"
    ↓
addProduct() en data.ts
    ↓
supabase.from('products').insert()
    ↓
✅ Guardado en SUPABASE
    ↓
Toast: "Producto guardado"
    ↓
Se recarga la lista
    ↓
✅ Visible inmediatamente en /sorteos
```

### Flujo 2: Visitante ve Productos

```
Visitante abre /sorteos
    ↓
loadData() = getRaffles() + getGiveaways() + getInstagramFollowers()
    ↓
3 queries en paralelo a Supabase
    ↓
1. Obtiene todas las rifas
2. Obtiene todos los sorteos
3. Obtiene followers de Instagram
    ↓
Datos se llenan en la UI
    ↓
✅ Página cargada
    ↓
Visitante ve: rifas, números disponibles, sorteos con progreso
```

### Flujo 3: Actualizar Followers de Instagram

```
Admin abre /admin/dashboard
    ↓
useEffect() llama a loadInstagramFollowers()
    ↓
getInstagramFollowers() en instagram.ts
    ↓
¿Está configurado Instagram API?
    ├─ SÍ:
    │   ↓
    │   Llama a Meta Graph API
    │   ↓
    │   Obtiene followers reales
    │   ↓
    │   Actualiza cache en config tabla
    │   ↓
    │   Retorna followers
    │
    └─ NO:
        ↓
        Lee último valor de config.last_followers_count
        ↓
        Retorna ese valor
    ↓
setInstagramFollowers(followers)
    ↓
✅ Se muestra en:
   - Header del admin
   - Página /sorteos
   - Modal de sorteo
```

---

## 📦 ESTRUCTURA DE COMPONENTES

```
src/
├── lib/
│   ├── data.ts              ← CRUD operations (async)
│   │   ├── getProducts()
│   │   ├── addProduct()
│   │   ├── updateProduct()
│   │   ├── deleteProduct()
│   │   ├── getRaffles()
│   │   ├── updateRaffleNumber()
│   │   ├── getGiveaways()
│   │   ├── addGiveaway()
│   │   ├── login() / checkAuth() / logout()
│   │   └── ...
│   │
│   ├── supabase.ts          ← Cliente de Supabase
│   │   └── export const supabase = createClient(...)
│   │
│   ├── auth.ts              ← Autenticación admin
│   │   ├── login(password)
│   │   ├── checkAuth()
│   │   └── logout()
│   │
│   ├── instagram.ts         ← API de Instagram
│   │   ├── getInstagramFollowers()
│   │   ├── getCachedFollowers()
│   │   ├── updateFollowersCache()
│   │   └── getInstagramData()
│   │
│   └── utils.ts             ← Funciones de utilidad
│
├── pages/
│   ├── AdminLogin.tsx       ← Pantalla de login
│   │   ├── [useEffect] Revisa autenticación
│   │   ├── handleSubmit() → login(password)
│   │   └── redirige a /admin/dashboard
│   │
│   ├── AdminDashboard.tsx   ← Panel de control
│   │   ├── [useEffect] loadData() → Promise.all
│   │   ├── [useState] products, raffles, giveaways
│   │   ├── [Tabs] Products | Raffles | Giveaways
│   │   ├── saveProduct() → addProduct() o updateProduct()
│   │   ├── deleteProduct()
│   │   ├── saveRaffle() → addRaffle() + addRaffleNumbers()
│   │   ├── toggleRaffleNumber() → updateRaffleNumber()
│   │   └── [Header] Muestra followers de Instagram
│   │
│   ├── Sorteos.tsx          ← Página pública
│   │   ├── [useEffect] loadData() → Promise.all
│   │   ├── getInstagramFollowers()
│   │   ├── Sección Giveaways
│   │   ├── Sección Raffles
│   │   └── [Modals] RaffleModal + GiveawayModal
│   │
│   └── ...
│
├── components/
│   ├── GiveawayModal.tsx    ← Modal de sorteos
│   │   ├── Recibe: giveaway + instagramFollowers
│   │   ├── Muestra progreso con followers reales
│   │   └── Calcula: isReady = followers >= target
│   │
│   ├── RaffleModal.tsx      ← Modal de rifas
│   │   └── Muestra números disponibles
│   │
│   └── ...
│
└── assets/
    └── ...
```

---

## 🗄️ BASE DE DATOS

### Tabla: products
```
id (UUID)           → Identificador único
name (VARCHAR)      → "Llavero Personalizado"
description (TEXT)  → Descripción detallada
price (INTEGER)     → 15000 (en pesos)
image (VARCHAR)     → URL a imagen
category (VARCHAR)  → "Accesorios"
created_at (TIMESTAMP) → Fecha automática
```

### Tabla: raffles
```
id (UUID)
title (VARCHAR)     → "Baby Groot"
description (TEXT)
image (VARCHAR)
price (INTEGER)     → 5000 por número
end_date (TIMESTAMP)
created_at (TIMESTAMP)
```

### Tabla: raffle_numbers
```
id (UUID)
raffle_id (UUID) → FOREIGN KEY raffles(id)
number (INTEGER) → 1, 2, 3, ..., 100
sold (BOOLEAN)   → true/false
buyer_name (VARCHAR) → "Juan Pérez"
buyer_phone (VARCHAR) → "+5799999999"
created_at (TIMESTAMP)
```

### Tabla: giveaways
```
id (UUID)
title (VARCHAR)
description (TEXT)
image (VARCHAR)
instagram_required (BOOLEAN)
current_followers (INTEGER) → Follower count
target_followers (INTEGER)  → Meta
end_date (TIMESTAMP)
active (BOOLEAN)
created_at (TIMESTAMP)
```

### Tabla: config
```
id (UUID)
instagram_username (VARCHAR) → "@dmorfika"
last_followers_count (INTEGER) → Cache
last_updated (TIMESTAMP)
```

---

## 🔐 FLUJO DE SEGURIDAD

```
┌──────────────────┐
│   Visitante      │
│   anónimo        │
└────────┬─────────┘
         │
         ├─→ GET /sorteos
         │       ↓
         │   [PUBLIC READ]
         │   Ver rifas/sorteos
         │
         └─→ POST /admin/login
                 │
              ✓ Password correct?
                 │
                 ├─ SÍ:
                 │  ├─ sessionStorage.morfika_auth = true
                 │  ├─ sessionStorage.morfika_token = token
                 │  └─ Redirige a /admin/dashboard
                 │
                 └─ NO:
                    └─ Toast error
                       
┌──────────────────┐
│   Admin          │
│   (logueado)     │
└────────┬─────────┘
         │
         ├─→ [checkAuth()]
         │   Verifica sessionStorage
         │   ├─ true → Acceso ✓
         │   └─ false → Redirige a /admin
         │
         ├─→ GET /admin/dashboard
         │   ├─ getProducts()
         │   ├─ getRaffles()
         │   ├─ getGiveaways()
         │   └─ getInstagramFollowers()
         │
         ├─→ POST /products
         │   └─ addProduct(data)
         │
         ├─→ PUT /products/:id
         │   └─ updateProduct(id, data)
         │
         ├─→ DELETE /products/:id
         │   └─ deleteProduct(id)
         │
         └─→ POST /logout
             └─ sessionStorage clear
```

---

## 🌐 VARIABLES DE ENTORNO

```env
# Credenciales de Supabase (REQUERIDO)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Instagram API (OPCIONAL)
VITE_INSTAGRAM_ACCESS_TOKEN=EABsbCS...
VITE_INSTAGRAM_BUSINESS_ACCOUNT_ID=17841406338310158

# Contraseña Admin
VITE_ADMIN_PASSWORD=#morfika202519185311
```

---

## 🔄 CICLO DE VIDA DE UN COMPONENTE

### AdminDashboard.tsx

```
1. MONTAJE
   ├─ useEffect() corre UNA VEZ
   │  ├─ checkAuth()
   │  │  └─ Si no está logueado → redirige a /admin
   │  │
   │  └─ loadData()
   │     ├─ Promise.all([
   │     │  ├─ getProducts()    → SELECT * FROM products
   │     │  ├─ getRaffles()     → SELECT * FROM raffles
   │     │  └─ getGiveaways()   → SELECT * FROM giveaways
   │     │])
   │     └─ setProducts(), setRaffles(), setGiveaways()
   │
   ├─ loadInstagramFollowers()
   │  ├─ getInstagramFollowers()
   │  │  ├─ Si API está configurada:
   │  │  │  └─ fetch Meta API
   │  │  │     ├─ updateFollowersCache()
   │  │  │     └─ return followers
   │  │  └─ Si no:
   │  │     └─ getCachedFollowers()
   │  │
   │  └─ setInstagramFollowers(number)
   │
   └─ [UI renderiza]

2. INTERACCIÓN
   ├─ Click "Nuevo Producto"
   │  └─ setEditingProduct({id: "", ...})
   │     └─ [Modal se abre]
   │
   ├─ Completa formulario
   │  └─ setEditingProduct({...updatedData})
   │
   ├─ Click "Guardar"
   │  └─ saveProduct(product)
   │     ├─ Si product.id existe:
   │     │  └─ updateProduct(id, product)
   │     │     ├─ await supabase.from('products').update()
   │     │     └─ return updated data
   │     │
   │     └─ Si no:
   │        └─ addProduct(product)
   │           ├─ await supabase.from('products').insert()
   │           └─ return new data
   │
   │  └─ loadData() [recarga todo]
   │  └─ setEditingProduct(null) [cierra modal]
   │  └─ toast({ title: "Producto guardado" })
   │
   └─ [UI actualiza]

3. DESMONTAJE
   └─ Limpiar listeners, cancelar requests, etc
```

---

## ✨ DIFERENCIAS CLAVE: ANTES vs DESPUÉS

### ANTES (localStorage)
```
User input
   ↓
localStorage.setItem('morfika_products', JSON.stringify(data))
   ↓
⚠️ Solo en ESE navegador
⚠️ Se pierde si limpia cache
⚠️ Sin sincronización
⚠️ Sin backups
⚠️ Sin seguridad real
```

### DESPUÉS (Supabase)
```
User input
   ↓
supabase.from('products').insert(data)
   ↓
✅ Guardado en servidor (permanente)
✅ Accesible desde cualquier navegador
✅ Sincronización en tiempo real
✅ Backups automáticos
✅ Seguridad con RLS
✅ Escalable a millones de registros
```

---

## 🎯 RESUMEN TÉCNICO

| Aspecto | Antes | Después |
|---------|-------|---------|
| Base de datos | localStorage (5MB max) | Supabase PostgreSQL (500MB free) |
| Sincronización | Manual/inexistente | Automática |
| Seguridad | Ninguna | Contraseña + UUIDs |
| Escalabilidad | ~1000 registros | Millones |
| Backups | No | Automáticos |
| API | REST manual | Supabase API automática |
| Tiempo de carga | Instantáneo (local) | ~100ms (con CDN) |

---

**¡Ahora entiendes cómo funciona MORFIKA!** 🎉
