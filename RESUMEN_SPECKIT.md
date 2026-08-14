# Resumen de Uso de Spec Kit

**Spec Kit** (creado por GitHub) es una herramienta diseñada para el **Desarrollo Guiado por Especificaciones (Spec-Driven Development)** usando agentes de Inteligencia Artificial.

En lugar de saltar directamente a escribir código, Spec Kit te permite definir primero las reglas de negocio, la arquitectura y las tareas. Luego, tu agente de IA utilizará estos documentos para escribir el código de manera más precisa y estructurada.

## 🚀 Flujo de Trabajo Principal

El uso de Spec Kit se divide en 5 pasos clave. Debes ejecutar estos comandos en el chat de tu agente de IA (como Antigravity o GitHub Copilot) en orden:

### 1. Definir los Principios (`/speckit.constitution`)
Establece las "leyes" del proyecto: convenciones de código, reglas de testing, arquitectura general y restricciones.
**Ejemplo:**
> `/speckit.constitution Crea reglas para un proyecto en React usando TailwindCSS. Todo el código debe estar en español y tener pruebas unitarias.`

### 2. Crear la Especificación (`/speckit.specify`)
Describe **qué** vas a construir y **por qué** (desde la perspectiva del usuario), sin entrar en detalles técnicos todavía.
**Ejemplo:**
> `/speckit.specify Quiero construir una página de inicio de sesión donde los usuarios puedan entrar con correo y contraseña o usando su cuenta de Google. Debe incluir un enlace de 'olvidé mi contraseña'.`

### 3. Planificar la Implementación (`/speckit.plan`)
Define **cómo** se va a construir técnicamente lo que especificaste en el paso anterior. Aquí defines el stack tecnológico y la estructura de datos.
**Ejemplo:**
> `/speckit.plan Utilizaremos Firebase para la autenticación. El estado se manejará con React Context. Los estilos usarán componentes de Tailwind predefinidos.`

### 4. Generar Tareas (`/speckit.tasks`)
El agente leerá la especificación y el plan para dividir el trabajo en una lista detallada de tareas pequeñas y manejables (creará un archivo `tasks.md`).
**Ejemplo:**
> `/speckit.tasks`

### 5. Implementar el Código (`/speckit.implement`)
El agente de IA comenzará a escribir el código real, guiándose estrictamente por el plan y marcando las tareas como completadas a medida que avanza.
**Ejemplo:**
> `/speckit.implement`

---

## 🛠️ Comandos de Utilidad Adicionales

- **`/speckit.analyze`**: Revisa si hay inconsistencias entre lo que definiste en la especificación, el plan y las tareas. Útil si has hecho cambios manuales.
- **`/speckit.revise`**: Permite hacer modificaciones o agregar nuevas características a una especificación o plan que ya existe, actualizando los documentos de manera inteligente.

## 💡 Mejores Prácticas

- **Sé específico en el paso 2 (`specify`) y 3 (`plan`)**: Cuantos más detalles le des a la IA sobre cómo quieres las cosas, menos errores cometerá en la implementación.
- **Revisa los archivos generados**: Spec Kit creará archivos markdown (`spec.md`, `plan.md`, `tasks.md`, `constitution.md`). Puedes abrirlos y editarlos manualmente antes de pedirle a la IA que genere el código.
