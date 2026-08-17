# Sistema de Horas Extra — GAD Municipal Cantón Sucúa — Especificación de Requerimientos

## 1. Introducción y Propósito
El objetivo es construir un sistema web responsivo (optimizado para Escritorio y Tablets) para la gestión, cálculo automatizado, autorización y reporte de horas extras del **GAD Municipal del Cantón Sucúa**. El sistema se centrará estrictamente en el personal de **Guardias** (Seguridad) y **Limpieza** (Aseo), asegurando el estricto cumplimiento de la Ley Orgánica del Servicio Público (LOSEP) y el Código del Trabajo de Ecuador.

---

## 2. Requerimientos Funcionales (Historias de Usuario)

### Módulo 1: Gestión de Funcionarios
Como **Administrador**, quiero poder gestionar (Crear, Leer, Actualizar, Activar/Desactivar) el personal del GAD.
- **Datos obligatorios por funcionario**:
  - Nombres y Apellidos completos.
  - Cédula de Identidad (Con validación de formato ecuatoriano de 10 dígitos).
  - Tipo de Funcionario: Selección obligatoria entre **Guardia** o **Limpieza**.
  - Remuneración Mensual Unificada (RMU): Valor numérico decimal individual.
  - Estado: Activo / Inactivo.
- **Regla**: No se pueden registrar horas extra para funcionarios inactivos.

### Módulo 2: Registro e Ingreso de Horas Extra
Como **Administrador/Operador**, quiero registrar las horas extra trabajadas por un funcionario.
- **Campos del Registro**:
  - Selección de Funcionario: Buscador interactivo en tiempo real que permita buscar y filtrar tanto por nombre y apellidos como por número de cédula de 10 dígitos.
  - Fecha del trabajo ejecutado.
  - Hora de Inicio y Hora de Fin (formato de 24 horas).
  - Tipo de Hora Extra:
    - **Suplementaria** (Días laborables, después de la jornada ordinaria hasta las 24:00).
    - **Extraordinaria** (Sábados, domingos, feriados o días de descanso obligatorio).
- **Cálculo Automático**: El sistema debe calcular en tiempo real el valor a pagar aplicando las fórmulas legales del GAD Sucúa:
  - Valor Hora Ordinaria = RMU / 240
  - Recargo por Suplementaria (Factor x1.25)
  - Recargo por Extraordinaria (Factor x2.00)
  - Recargo Nocturno automático (Factor +25% adicional si el horario cae en el rango 19:00 - 06:00, sumándose a otros recargos si corresponde).
- **Inmutabilidad del Salario**: Al guardar el registro, se congela el RMU actual del funcionario en dicho registro para evitar recalcular con históricos si su salario cambia en el futuro.
- **Estado Inicial**: Todo registro nuevo entra con estado "Pendiente de Autorización".

### Módulo 3: Validaciones y Restricciones LOSEP
Como **Sistema**, debo validar las restricciones legales antes de guardar un registro:
- Las horas suplementarias no pueden exceder 4 horas diarias.
- Las horas suplementarias no pueden exceder 12 horas semanales.
- Si se superan estos límites, el sistema debe alertar visualmente y solicitar confirmación especial o denegar el registro (según políticas de control del GAD).

### Módulo 4: Flujo de Autorización
Como **Autorizador / Jefe de Recursos Humanos**, quiero aprobar o rechazar las horas extras pendientes.
- Los registros se listan clasificados por estado: "Pendientes", "Autorizados", "Rechazados".
- Al autorizar un registro, éste se vuelve **inmutable** (no editable ni eliminable).
- Para corregir un error en un registro ya autorizado, se debe usar una acción de "Anulación" que genera una contrapartida para fines de auditoría.

### Módulo 5: Reportes y Exportación
Como **Administrador/Recursos Humanos**, quiero generar resúmenes del mes.
- **Reporte Individual**: Resumen mensual de un funcionario (Detalle de fechas, horas trabajadas, tipo de recargos aplicados y total acumulado).
- **Reporte Consolidado**: Resumen total del GAD para el mes (Lista de funcionarios con el total a pagar y total de horas extras por tipo).
- **Exportación**: Botón para descargar el reporte en formato CSV/Excel o PDF para adjuntar a la nómina de pagos. **Nota**: El reporte PDF generado debe incluir de forma obligatoria los casilleros de firmas de responsabilidad ("Elaborado por", "Revisado por", "Autorizado por").

### Módulo 6: Dashboard Interactivo
Como **Administrador / Autorizador / Operador**, quiero visualizar un panel de control interactivo al iniciar sesión para analizar rápidamente el estado del sistema.
- **Filtros Dinámicos**:
  - Filtro por tipo de funcionario: "Todos", "Guardias", "Limpieza".
  - Filtro por rango de fecha: "Todo", "Este mes", "Mes anterior", "Últimos 30 días".
  - Filtro por estado del registro: "Todos", "Pendientes", "Autorizados", "Rechazados".
- **Visualización de Métricas Clave**:
  - Cantidad de funcionarios activos.
  - Horas extras con autorización pendiente.
  - Registros aprobados totales.
  - Presupuesto o monto económico total aprobado.
  - Todas las métricas deben reaccionar inmediatamente a los filtros activos.
- **Gráficos SVG Interactivos**:
  - **Gráfico de Dona (Distribución de Horas/Costos)**: Representación visual del tipo de horas extras y recargos aplicados (Suplementarias Diurnas/Nocturnas, Extraordinarias Diurnas/Nocturnas). Al pasar el ratón (hover) sobre cada segmento, se debe mostrar un tooltip con el total monetario, de horas y su porcentaje relativo.
  - **Gráfico de Barras (Tendencia de Horas)**: Histograma del volumen de horas registradas a lo largo de los meses o días del rango actual, con tooltips interactivos en cada barra.
- **Análisis y Drill-Down por Funcionario**:
  - Lista interactiva "Top 5 Funcionarios" ordenados por horas extra acumuladas.
  - Al hacer clic en un funcionario de este top, se debe aplicar un filtro rápido (drill-down) que aísle toda la información del dashboard para dicho funcionario.
- **Lista de Actividades Recientes**:
  - Una tabla simplificada con los últimos registros que coincidan con los filtros aplicados para agilizar la revisión rápida.

---

## 3. Requerimientos No Funcionales

- **Interfaz y Usabilidad**: Interfaz moderna, limpia, de carga rápida y responsiva, optimizada para tablets y laptops de oficina.
- **Seguridad**: Autenticación de usuario para restringir el acceso al personal no autorizado del GAD.
- **Persistencia**: Almacenamiento local (como SQLite o IndexedDB en el navegador para versiones demo) que garantice que los datos no se pierdan al recargar.
- **Idioma**: La interfaz del sistema estará en español.
