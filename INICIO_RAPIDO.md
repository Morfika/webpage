# ⚡ INICIO RÁPIDO - MORFIKA + SUPABASE

## 3 PASOS PARA EMPEZAR

### 1️⃣ CREAR SUPABASE (5 minutos)

```
1. Ve a https://supabase.com
2. Crea cuenta y nuevo proyecto
3. En Settings > API, copia:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY (anon, NO service)
4. En SQL Editor, pega el código de SUPABASE_CONFIG.md
5. ¡Listo!
```

### 2️⃣ CONFIGURAR .env.local

```
Abre .env.local en la raíz del proyecto:

VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-aqui
VITE_ADMIN_PASSWORD=#morfika202519185311
```

### 3️⃣ PROBAR

```bash
npm run dev
# Abre http://localhost:5173/admin
# Contraseña: #morfika202519185311
```

---

## 🎯 USO PRINCIPAL

### Panel Admin (`/admin/dashboard`)
- ➕ Crear productos, rifas, sorteos
- ✏️ Editar cualquier cosa
- 🗑️ Eliminar
- 👀 Ver followers de Instagram en tiempo real

### Página Pública (`/sorteos`)
- 📱 Ver rifas con números disponibles
- 🎉 Ver sorteos con progreso de seguidores
- 🔄 Todo se actualiza en tiempo real

---

## 📱 INSTAGRAM (Opcional)

Para followers automáticos en `@dmorfika`:

```
1. Ve a https://developers.facebook.com/
2. Crea app y configura Instagram Graph API
3. Genera token con: instagram_business_content_read
4. Agrega a .env.local:

VITE_INSTAGRAM_ACCESS_TOKEN=token-aqui
VITE_INSTAGRAM_BUSINESS_ACCOUNT_ID=id-aqui
```

Si NO haces esto, el sistema usa un cache local (también funciona).

---

## 🔐 CONTRASEÑA

Cambiar contraseña en `.env.local`:

```
VITE_ADMIN_PASSWORD=tu-nueva-contraseña
```

---

## 📞 ERRORES COMUNES

### "Can't connect to Supabase"
→ Revisa URL y clave en `.env.local`

### "Contraseña incorrecta"
→ Verifica `VITE_ADMIN_PASSWORD`

### Instagram followers no se actualiza
→ Es normal si no configuraste API. Actualiza manualmente en admin.

---

## 📚 DOCUMENTOS

- **GUIA_COMPLETA.md** ← Lee esto primero
- **SUPABASE_CONFIG.md** ← Configuración técnica
- **RESUMEN_CAMBIOS.md** ← Qué cambió

---

## ✅ CHECKLIST

- [ ] Crear proyecto Supabase
- [ ] Ejecutar SQL
- [ ] Llenar `.env.local`
- [ ] Probar login
- [ ] Agregar un producto
- [ ] Ver en página pública
- [ ] (Opcional) Configurar Instagram

---

¡Eso es todo! 🚀

Si tienes dudas, revisa **GUIA_COMPLETA.md**
