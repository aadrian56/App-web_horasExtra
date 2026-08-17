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
  - [x] Implementar buscador interactivo de funcionario por nombre y por número de cédula en tiempo real.
- [x] **Tarea 4.4:** Desarrollar la pantalla de Aprobación de Horas (exclusiva para el rol autorizador).
- [x] **Tarea 4.5:** Implementar la detección automática de jornada (feriados/fines de semana) al elegir la fecha.


## Fase 5: Reportes y Bloques de Firma
- [x] **Tarea 5.1:** Crear la página de Reportes Mensuales con filtros por mes/año y vistas consolidadas.
- [x] **Tarea 5.2:** Implementar la exportación del reporte consolidado en PDF con estilo limpio y profesional.
  - [x] Diseñar el pie de página con los tres bloques de firmas: "Elaborado por", "Revisado por" y "Autorizado por".
- [x] **Tarea 5.3:** Implementar el Reporte Individual por Funcionario con desglose de días, horas y firmas.


## Fase 6: Pruebas y Validación
- [x] **Tarea 6.1:** Crear pruebas unitarias con Vitest para verificar la matemática exacta de las fórmulas (valores con recargo ordinario, nocturno y combinados).
- [x] **Tarea 6.2:** Probar la adaptabilidad responsive en pantallas de tablets y móviles simulando el flujo completo de registro y autorización.

## Fase 7: Dashboards Interactivos
- [x] **Tarea 7.1:** Diseñar y agregar los controles de filtros dinámicos (fecha, tipo de funcionario, estado del registro).
- [x] **Tarea 7.2:** Implementar la lógica reactiva en frontend para recalcular métricas agregadas al cambiar los filtros.
- [x] **Tarea 7.3:** Implementar el gráfico de dona SVG interactivo para la distribución de tipos de hora.
- [x] **Tarea 7.4:** Implementar el gráfico de barras SVG interactivo para la tendencia temporal.
- [x] **Tarea 7.5:** Implementar el ranking Top 5 de funcionarios con barra de progreso y drill-down interactivo.
- [x] **Tarea 7.6:** Integrar la tabla de últimas actividades y aplicar los efectos y estilos visuales premium.

## Fase 8: Módulo de Calendario de Feriados (Dinámico)
- [x] **Tarea 8.1:** Crear la tabla `feriados` en la base de datos MySQL e insertar datos semilla de feriados comunes en `seed_db.js`.
- [x] **Tarea 8.2:** Implementar endpoints CRUD de feriados (`GET /api/feriados`, `POST /api/feriados`, `DELETE /api/feriados/:id`) en `server.js`.
- [x] **Tarea 8.3:** Modificar `POST /api/horas-extra` para verificar si la fecha del registro coincide con un feriado en la base de datos o fin de semana, forzando y validando que el tipo de jornada sea "extraordinaria".
- [x] **Tarea 8.4:** Desarrollar la vista `Feriados.tsx` en el frontend para permitir al Administrador visualizar, agregar y eliminar feriados de forma dinámica.
- [x] **Tarea 8.5:** Modificar la vista `RegistroHoras.tsx` para obtener los feriados desde el backend y autocompletar de forma restrictiva la jornada a "Extraordinaria" si la fecha coincide con un feriado o fin de semana.
- [x] **Tarea 8.6:** Registrar la ruta `/feriados` en `App.tsx` y enlazarla en el menú lateral de `Layout.tsx`.

## Fase 9: Feriados Recurrentes (Anuales)
- [x] **Tarea 9.1:** Añadir la columna `recurrente` a la tabla `feriados` en la base de datos MySQL, actualizando `init.sql`, `database.js` y `seed_db.js`.
- [x] **Tarea 9.2:** Configurar feriados fijos semilla (Año Nuevo, Batalla de Pichincha, Cantonización de Sucúa, Navidad) como recurrentes (`recurrente = 1`) en `seed_db.js`.
- [x] **Tarea 9.3:** Modificar `POST /api/feriados` para recibir y guardar la propiedad `recurrente` (booleano).
- [x] **Tarea 9.4:** Modificar la consulta en `POST /api/horas-extra` para verificar feriados recurrentes comparando mes y día, independientemente del año.
- [x] **Tarea 9.5:** Modificar `Feriados.tsx` para agregar la opción "¿Se repite todos los años?" en el formulario y visualizar badges identificativos en la lista.
- [x] **Tarea 9.6:** Modificar `RegistroHoras.tsx` para que `checkEsFeriadoODescanso` valide feriados recurrentes omitiendo el año en la comparación.

## Fase 10: Restricción de Fecha Futura
- [x] **Tarea 10.1:** Modificar la ruta `POST /api/horas-extra` en `server.js` para validar que la fecha recibida no sea superior a la fecha actual del servidor.
- [x] **Tarea 10.2:** Actualizar el input de fecha en `RegistroHoras.tsx` para configurar el atributo `max` dinámicamente y validar el envío del lado del cliente.

## Fase 11: Módulo de Gestión de Administrativos (Firmas)
- [x] **Tarea 11.1:** Crear la tabla `administrativos` en `init.sql`, agregando las columnas `id`, `nombres_apellidos`, `cargo` (enum) y `activo` (booleano).
- [x] **Tarea 11.2:** Configurar la base de datos simulada en `database.js` definiendo `mockAdministrativos` y sus handlers de query CRUD correspondientes.
- [x] **Tarea 11.3:** Agregar la lógica de creación de la tabla y la inserción de registros iniciales activos de ejemplo en `seed_db.js`.
- [x] **Tarea 11.4:** Desarrollar los endpoints CRUD (`GET`, `POST`, `PUT`, `DELETE` sobre `/api/administrativos`) en `server.js` asegurando que solo haya un registro activo por cargo en simultáneo.
- [x] **Tarea 11.5:** Crear la pantalla frontend `Administrativos.tsx` para la administración del personal administrativo y el control de firmas.
- [x] **Tarea 11.6:** Registrar el componente en `App.tsx` y añadir la ruta con ícono de firmas en el menú lateral de `Layout.tsx`.









