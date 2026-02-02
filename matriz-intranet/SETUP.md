# Guía Completa de Configuración - MATRIZ Intranet

## Estado Actual

La aplicación ahora tiene **persistencia local** usando localStorage del navegador. Esto significa que los datos se guardan automáticamente y persisten aunque cierres el navegador. Sin embargo, cada usuario/navegador tendrá sus propios datos independientes.

---

## Paso 1: Desplegar en Vercel (Gratis)

### Opción A: Desde GitHub (Recomendada)

1. **Crea una cuenta en GitHub** (si no tienes): [github.com](https://github.com)

2. **Sube el proyecto a GitHub:**
   - Crea un nuevo repositorio (botón verde "New")
   - Nombre: `matriz-intranet`
   - Privado o público (tu elección)
   - Sube todos los archivos de esta carpeta

3. **Conecta con Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Crea cuenta usando "Continue with GitHub"
   - Click en "Add New" → "Project"
   - Selecciona tu repositorio `matriz-intranet`
   - Vercel detectará automáticamente la configuración
   - Click en "Deploy"

4. **¡Listo!** En ~2 minutos tendrás tu intranet en: `tu-proyecto.vercel.app`

---

## Paso 2: Comprar un Dominio Personalizado

### Opciones de Proveedores (precios aprox. anuales):

| Proveedor | Dominio .cl | Dominio .com | Sitio |
|-----------|-------------|--------------|-------|
| NIC Chile | $12.000 CLP | N/A | [nic.cl](https://nic.cl) |
| Namecheap | N/A | ~$10 USD | [namecheap.com](https://namecheap.com) |
| Google Domains | ~$12 USD | ~$12 USD | [domains.google](https://domains.google) |
| GoDaddy | Variable | ~$15 USD | [godaddy.com](https://godaddy.com) |

### Recomendación para Chile:
- **Dominio .cl**: Compra en [nic.cl](https://nic.cl) (oficial de Chile)
- **Dominio .com**: Compra en Namecheap (mejor precio)

### Proceso de compra (ejemplo con Namecheap):

1. Ve a [namecheap.com](https://namecheap.com)
2. Busca el dominio que quieres (ej: `matrizarquitectura.com`)
3. Agrégalo al carrito y paga
4. Recibirás un email de confirmación

---

## Paso 3: Conectar Dominio a Vercel

1. **En Vercel:**
   - Ve a tu proyecto → Settings → Domains
   - Escribe tu dominio (ej: `matrizarquitectura.com`)
   - Click "Add"

2. **Vercel te mostrará los DNS records necesarios**, algo como:
   ```
   Tipo: A
   Nombre: @
   Valor: 76.76.21.21

   Tipo: CNAME
   Nombre: www
   Valor: cname.vercel-dns.com
   ```

3. **En tu proveedor de dominio:**
   - Ve a la configuración DNS de tu dominio
   - Agrega los registros que Vercel te indicó
   - Guarda los cambios

4. **Espera propagación:** Puede tomar 1-48 horas (usualmente menos de 1 hora)

5. **¡Listo!** Tu intranet estará en `https://tudominio.com`

---

## Paso 4 (Opcional): Configurar Firebase para Datos en la Nube

Si quieres que todos los usuarios compartan los mismos datos (en lugar de datos locales por navegador), necesitas Firebase.

### 4.1 Crear Proyecto Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Click "Crear un proyecto"
3. Nombre: `matriz-intranet`
4. Desactiva Google Analytics (no es necesario)
5. Click "Crear proyecto"

### 4.2 Configurar Firestore Database

1. En el panel izquierdo, click "Firestore Database"
2. Click "Crear base de datos"
3. Selecciona "Empezar en modo de producción"
4. Selecciona ubicación: `southamerica-east1` (São Paulo, más cercano a Chile)
5. Click "Habilitar"

### 4.3 Configurar Reglas de Seguridad

1. En Firestore → Reglas, reemplaza todo con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden leer/escribir
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

2. Click "Publicar"

### 4.4 Configurar Authentication

1. En el panel izquierdo, click "Authentication"
2. Click "Comenzar"
3. En "Proveedores de acceso", habilita "Correo electrónico/contraseña"
4. Click "Guardar"

### 4.5 Crear los Usuarios

En Authentication → Users, click "Agregar usuario" para cada uno:

| Email | Contraseña |
|-------|------------|
| sebastianvizcarra@gmail.com | admin123 |
| cristobal@matriz.cl | crios123 |
| dominique@matriz.cl | dthompson123 |

### 4.6 Obtener Credenciales

1. Ve a Configuración del proyecto (icono de engranaje)
2. Scroll hasta "Tus apps" → Click icono web `</>`
3. Nombre: `matriz-intranet-web`
4. Click "Registrar app"
5. Copia el objeto `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "matriz-intranet.firebaseapp.com",
  projectId: "matriz-intranet",
  storageBucket: "matriz-intranet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 4.7 Actualizar el Proyecto

1. Edita `src/firebase.js` con tus credenciales:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUÍ",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
```

2. Sube los cambios a GitHub
3. Vercel desplegará automáticamente la nueva versión

---

## Costos Estimados

| Servicio | Costo |
|----------|-------|
| Vercel (hosting) | **Gratis** (plan Hobby) |
| Firebase (base de datos) | **Gratis** hasta 50K lecturas/día |
| Dominio .com | ~$10-15 USD/año |
| Dominio .cl | ~$12.000 CLP/año |

**Total aproximado:** $10-15 USD/año (solo el dominio)

---

## Resumen de Pasos

1. ✅ **Subir a GitHub** → Crea repositorio y sube archivos
2. ✅ **Desplegar en Vercel** → Conecta GitHub, deploy automático
3. ✅ **Comprar dominio** → NIC.cl o Namecheap
4. ✅ **Conectar dominio** → Configura DNS en proveedor
5. ⭐ **Firebase (opcional)** → Solo si necesitas datos compartidos

---

## Soporte

Si tienes problemas:
- **Vercel:** [vercel.com/docs](https://vercel.com/docs)
- **Firebase:** [firebase.google.com/docs](https://firebase.google.com/docs)
- **NIC Chile:** soporte@nic.cl

---

## Credenciales de Acceso

| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| Seba | sebastianvizcarra@gmail.com | admin123 | Admin |
| Cristóbal | cristobal@matriz.cl | crios123 | Colaborador |
| Dominique | dominique@matriz.cl | dthompson123 | Colaborador |
