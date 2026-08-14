# Lista de Tareas — Sistema de Horas Extra GAD Sucúa

Este archivo contiene el desglose de tareas necesarias para construir el sistema. Los agentes de IA marcarán las casillas a medida que completen el desarrollo.

## Fase 1: Configuración de la Base de Datos (MySQL)
- [x] **Tarea 1.1:** Crear script SQL para inicializar el esquema de base de datos.
  - [x] Crear la tabla `usuarios` para roles (`admin`, `autorizador`, `operador`).
  - [x] Crear la tabla `funcionarios` (cédula, nombres, tipo, rmu, estado).
  - [x] Crear la tabla `registro_horas_extra` con campos para `rmu_historico`, estado del registro, horas calculadas y auditoría de autorización.
- [x] **Tarea 1.2:** Insertar datos de prueba iniciales (un usuario de cada rol, y un funcionario de tipo 'guardia' y otro de tipo 'limpieza').

## Fase 2: Desarrollo del Servidor (Node.js + Express)
- [x] **Tarea 2.1:** Configurar el proyecto de Node.js instalando dependencias (`express`, `mysql2`, `dotenv`, `cors`, `bcryptjs`, `jsonwebtoken`).
- [x] **Tarea 2.2:** Crear la conexión con la base de datos MySQL y la configuración del archivo `.env`.
- [x] **Tarea 2.3:** Implementar el endpoint de Autenticación (`POST /api/auth/login`) con hashing de contraseña.
- [x] **Tarea 2.4:** Implementar el CRUD de Funcionarios (`/api/funcionarios`):
  - [x] Validación estricta del formato de cédula ecuatoriana (algoritmo del dígito verificador).
- [x] **Tarea 2.5:** Implementar lógica de cálculo de horas extra LOSEP en backend:
  - [x] Crear controlador `POST /api/horas-extra` que:
    - [x] Calcule la hora ordinaria (`RMU / 240`).
    - [x] Calcule las horas entre el rango de inicio y fin.
    - [x] Aplique recargo del 25% (suplementaria) o 100% (extraordinaria).
    - [x] Aplique recargo del 25% si cae en horario nocturno (19:00 - 06:00) y lo sume a los otros recargos si procede.
    - [x] Congele el RMU del funcionario (`rmu_historico`) en el registro.
  - [x] Validar límites de la LOSEP (máximo 4 horas suplementarias al día, máximo 12 semanales).
- [x] **Tarea 2.6:** Implementar flujo de aprobación (`PUT /api/horas-extra/:id/estado`) que permita cambiar a 'autorizado' o 'rechazado' (bloquear cambios futuros una vez autorizado).

## Fase 3: Frontend y Configuración de Tailwind (React.js)
- [x] **Tarea 3.1:** Configurar la paleta de colores oficiales de Sucúa en `tailwind.config.js` (`sucua-green`, `sucua-yellow`, `sucua-white`, `sucua-gray`).
- [x] **Tarea 3.2:** Configurar enrutamiento básico (`react-router-dom`) y servicios de consumo API (Axios).
- [x] **Tarea 3.3:** Crear componentes de UI reutilizables y accesibles:
  - [x] Botones con área táctil mínima de `44x44px`.
  - [x] Notificaciones en pantalla (Toasts) accesibles y claras.
  - [x] Badges visuales de estado con texto explícito e íconos representativos (no depender solo del color).

## Fase 4: Vistas y Formularios del Frontend
- [x] **Tarea 4.1:** Desarrollar la pantalla de Login y protección de rutas según el rol.
- [x] **Tarea 4.2:** Desarrollar la pantalla de Administración de Funcionarios (Formulario adaptable y accesible).
- [x] **Tarea 4.3:** Desarrollar la pantalla de Registro de Horas Extra:
  - [x] Implementar el visualizador dinámico de cálculo en vivo (Glassmorphism con gradiente animado) al cambiar horas de inicio/fin en el formulario.
- [x] **Tarea 4.4:** Desarrollar la pantalla de Aprobación de Horas (exclusiva para el rol autorizador).

## Fase 5: Reportes y Bloques de Firma
- [x] **Tarea 5.1:** Crear la página de Reportes Mensuales con filtros por mes/año y vistas consolidadas.
- [x] **Tarea 5.2:** Implementar la exportación del reporte consolidado en PDF con estilo limpio y profesional.
  - [x] Diseñar el pie de página con los tres bloques de firmas: "Elaborado por", "Revisado por" y "Autorizado por".

## Fase 6: Pruebas y Validación
- [ ] **Tarea 6.1:** Crear pruebas unitarias con Vitest para verificar la matemática exacta de las fórmulas (valores con recargo ordinario, nocturno y combinados).
- [ ] **Tarea 6.2:** Probar la adaptabilidad responsive en pantallas de tablets y móviles simulando el flujo completo de registro y autorización.
