# MATRIZ Intranet

Sistema de gestión de proyectos para arquitectura e ingeniería.

## Características

- Dashboard de proyectos con seguimiento de entregables
- Registro de horas por colaborador
- Control de avance con Carta Gantt
- Estados de Pago (EDP) - Solo Admin
- Sistema de login con roles (Admin / Colaborador)
- **Persistencia automática** de datos en el navegador

## Despliegue Rápido en Vercel

1. **Sube a GitHub:** Crea repositorio y sube estos archivos
2. **Conecta Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - "Add New Project" → Importa tu repositorio
   - Click "Deploy"
3. **¡Listo!** Tu intranet estará en `tu-proyecto.vercel.app`

## Guía Completa

Para instrucciones detalladas sobre:
- Configurar dominio personalizado
- Configurar Firebase (datos en la nube)
- Costos y proveedores recomendados

👉 **Lee [SETUP.md](./SETUP.md)**

## Usuarios por Defecto

| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| Seba | sebastianvizcarra@gmail.com | admin123 | Admin |
| Cristóbal | cristobal@matriz.cl | crios123 | Colaborador |
| Dominique | dominique@matriz.cl | dthompson123 | Colaborador |

## Permisos por Rol

| Función | Admin | Colaborador |
|---------|-------|-------------|
| Ver proyectos | ✅ | ✅ |
| Registrar horas | ✅ | ✅ (solo propias) |
| Editar proyectos | ✅ | ❌ (solo ver) |
| Configuración | ✅ | ❌ |
| Estados de Pago | ✅ | ❌ |

## Desarrollo Local

```bash
npm install
npm run dev
```

## Tecnologías

- React 18
- Vite
- Tailwind CSS
- Lucide React (iconos)
- localStorage (persistencia)
