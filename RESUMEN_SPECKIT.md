# Resumen de Uso de Spec Kit

**Spec Kit** (creado por GitHub) es una herramienta diseñada para el **Desarrollo Guiado por Especificaciones (Spec-Driven Development)** usando agentes de Inteligencia Artificial.

En lugar de saltar directamente a escribir código, Spec Kit te permite definir primero las reglas de negocio, la arquitectura y las tareas. Luego, tu agente de IA utilizará estos documentos para escribir el código de manera más precisa y estructurada.

---

## 💻 1. Comandos de la Interfaz de Línea de Comandos (Specify CLI)

El CLI de `specify` se ejecuta directamente en la terminal de tu sistema operativo para configurar, gestionar e inicializar proyectos:

- **`specify init <nombre-proyecto> --integration <nombre>`**
  Inicializa un nuevo proyecto estructurado de Spec Kit. Crea la carpeta del proyecto y la subcarpeta `.specify` con los archivos de configuración y memorias correspondientes.
  *Ejemplo:* `specify init mi-app --integration copilot`

- **`specify self check`**
  Comprueba de forma segura (modo lectura) si existe una versión más reciente de `specify-cli` publicada en PyPI o GitHub.

- **`specify self upgrade`**
  Actualiza en el acto tu instalación local de `specify-cli` a la última versión estable (detecta si se instaló con `uv tool` o `pipx`).

- **`specify self upgrade --dry-run`**
  Muestra una vista previa de lo que ejecutaría el comando de actualización, sin descargar ni modificar ningún archivo.

- **`specify self upgrade --tag <vX.Y.Z>`**
  Fuerza la instalación o actualización de una versión o etiqueta específica de Spec Kit (ej: `v0.12.11`).

---

## 🤖 2. Comandos del Agente de IA (Slash Commands)

Estos comandos se escriben dentro del chat del agente de programación (ej. Antigravity o Copilot) para guiar el desarrollo de software paso a paso:

### Flujo Principal de Desarrollo:
1. **`/speckit.constitution`**
   Crea o actualiza las directrices, leyes y convenciones de código generales del proyecto (ej: idioma del código, reglas de testing, restricciones de arquitectura).
   *Ejemplo:* `/speckit.constitution Define reglas para React + Tailwind en español con testing Vitest.`

2. **`/speckit.specify`**
   Define **qué** se va a construir y **por qué** (los requisitos desde el punto de vista del usuario), sin discutir código ni bases de datos.
   *Ejemplo:* `/speckit.specify Quiero una pantalla para registrar las horas extra con cálculo automático.`

3. **`/speckit.plan`**
   Establece **cómo** se implementará técnicamente la especificación (el stack tecnológico, el diseño de la base de datos, algoritmos clave).
   *Ejemplo:* `/speckit.plan Usaremos React, Node.js y MySQL. Definir tablas para funcionarios y registros.`

4. **`/speckit.tasks`**
   Lee la especificación y el plan de implementación para dividirlos en una lista ordenada de tareas pequeñas en `tasks.md`.
   *Ejemplo:* `/speckit.tasks`

5. **`/speckit.implement`** (o `/speckit.implement <fase>`)
   Comienza a escribir el código fuente real del proyecto. Sigue la lista de tareas y marca las casillas completadas a medida que escribe los archivos.
   *Ejemplo:* `/speckit.implement fase 1`

### Comandos de Utilidad Adicionales:
- **`/speckit.analyze`**
  Realiza un análisis no destructivo para verificar la coherencia y calidad de los documentos generados. Detecta si hay contradicciones entre la especificación, el plan técnico y las tareas.
  *Ejemplo:* `/speckit.analyze`

- **`/speckit.revise`**
  Permite realizar modificaciones o inyectar nuevos requerimientos sobre las especificaciones o planes técnicos ya existentes, actualizando toda la documentación en cascada.
  *Ejemplo:* `/speckit.revise Agrega un botón para exportar reportes mensuales a Excel.`
