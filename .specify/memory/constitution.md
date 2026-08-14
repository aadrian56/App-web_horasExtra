<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Modified sections: Marco Legal (added verified example calculation)
- Added sections: Ejemplo de Cálculo Verificado, Nota sobre Tecnologías
- Removed sections: none
- Follow-up TODOs: none
-->

# Sistema de Horas Extra — GAD Municipal Cantón Sucúa — Constitución

## Core Principles

### I. Cumplimiento Legal Obligatorio

Toda lógica de cálculo de horas extra DEBE cumplir con la legislación ecuatoriana vigente:

- **LOSEP** (Ley Orgánica del Servicio Público) y su Reglamento General para servidores públicos
- **Código del Trabajo** (Arts. 47, 49, 55) como referencia complementaria
- La fórmula base es: **Valor Hora Ordinaria = RMU / 240**
- Los recargos según tipo de hora son:

| Tipo de Hora | Definición | Recargo | Factor |
|---|---|---|---|
| **Suplementaria** | Después de la jornada ordinaria (hasta 24:00), días laborables | 25% | × 1.25 |
| **Extraordinaria** | Sábados, domingos, feriados o días de descanso obligatorio | 100% | × 2.00 |
| **Nocturna** | Dentro de jornada entre 19:00 – 06:00 | 25% | × 1.25 |

- Si una hora es simultáneamente nocturna y suplementaria/extraordinaria, los recargos se suman (ej: suplementaria nocturna = × 1.50)
- Las horas suplementarias NO pueden exceder 4 al día ni 12 a la semana
- Los servidores de Nivel Jerárquico Superior NO tienen derecho al pago de horas extra
- Todo pago de horas extra DEBE contar con autorización previa de la autoridad nominadora y disponibilidad presupuestaria

### II. Tipos de Funcionarios y Datos Precisos

El sistema DEBE gestionar exactamente dos tipos de funcionarios:

- **Guardias**: personal de seguridad y vigilancia del GAD Municipal
- **Limpieza**: personal de aseo y mantenimiento del GAD Municipal

Cada funcionario DEBE tener registrado:
- Nombres y apellidos completos
- Cédula de identidad (validación de formato ecuatoriano)
- Tipo de funcionario (guardia o limpieza)
- Remuneración Mensual Unificada (RMU) individual — el salario varía por funcionario
- Estado activo/inactivo

### III. Integridad de Cálculos y Auditoría

- Todo cálculo monetario DEBE usar precisión de dos decimales (centavos)
- El sistema DEBE almacenar el RMU vigente al momento del registro de cada hora extra (no recalcular retroactivamente si el salario cambia)
- Cada registro de hora extra DEBE contener: funcionario, fecha, hora inicio, hora fin, tipo de hora, valor calculado, y estado de autorización
- El sistema DEBE generar reportes mensuales por funcionario y consolidados
- Todos los registros son inmutables una vez autorizados; las correcciones se realizan mediante registros de anulación

### IV. Simplicidad y Usabilidad Prioritaria

- La interfaz DEBE ser intuitiva para personal administrativo sin conocimientos técnicos avanzados
- Diseño responsive que funcione en escritorio y tablets
- Flujos de trabajo mínimos: registrar → calcular automáticamente → autorizar → reportar
- No se implementarán funcionalidades especulativas (principio YAGNI)
- Stack tecnológico simple y ligero (las decisiones tecnológicas detalladas se definen en la fase de planificación `/speckit.plan`, no en esta constitución)
- El principio rector es: preferir soluciones simples y directas sobre frameworks pesados

### V. Seguridad y Privacidad de Datos

- Los datos de los funcionarios (RMU, cédula) son información sensible y DEBEN protegerse
- El acceso al sistema DEBE requerir autenticación
- Los datos DEBEN almacenarse de forma segura (base de datos local o persistencia adecuada)
- No se exponen datos salariales individuales en reportes consolidados públicos
- Validación en frontend y backend para prevenir datos inconsistentes

## Marco Legal y Fórmulas de Cálculo

Este proyecto implementa las fórmulas de pago de horas extra conforme a la normativa ecuatoriana
para servidores públicos:

```
Valor Hora Ordinaria = RMU / 240

Hora Suplementaria   = Valor Hora Ordinaria × 1.25  (recargo 25%)
Hora Extraordinaria  = Valor Hora Ordinaria × 2.00  (recargo 100%)
Hora Nocturna        = Valor Hora Ordinaria × 1.25  (recargo 25%)

Combinaciones:
  Suplementaria + Nocturna    = Valor Hora Ordinaria × 1.50
  Extraordinaria + Nocturna   = Valor Hora Ordinaria × 2.25

Factor rápido por hora extraordinaria = 2/240 = 0.8333% del RMU
```

### Ejemplo de Cálculo Verificado

Caso real proporcionado por el GAD:

```
Funcionario con RMU = $497.00
Tipo: Horas Extraordinarias (60 horas)

Paso 1: Valor hora ordinaria = $497.00 / 240 = $2.0708
Paso 2: Factor extraordinaria (×2.00) = $2.0708 × 2 = $4.1417
Paso 3: Total = 60 × $4.1417 = $248.50 ✓

Verificación rápida: $497.00 × 0.8333% × 60 = $248.50 ✓
```

Este ejemplo confirma que cada hora extraordinaria equivale al **0.83%** del RMU
(factor exacto: 2/240 = 0.008333...).

Fuentes legales:
- LOSEP: Ley Orgánica del Servicio Público (Arts. sobre horas suplementarias y extraordinarias)
- Reglamento General a la LOSEP
- Código del Trabajo del Ecuador (Arts. 47, 49, 55) — referencia complementaria
- Ministerio del Trabajo: trabajo.gob.ec

### Nota sobre Tecnologías

Esta constitución define **principios y restricciones** de alto nivel, no decisiones
tecnológicas detalladas. La selección específica de frameworks, librerías, base de datos
y arquitectura se define en la fase de planificación (`/speckit.plan`), donde se evalúan
opciones técnicas concretas alineadas con los principios aquí establecidos.

## Flujo de Desarrollo

- Cada funcionalidad se implementa siguiendo el flujo SDD: especificación → plan → tareas → implementación
- El código DEBE estar comentado en español para alinearse con el contexto institucional
- Los nombres de variables y funciones pueden ser en inglés, pero los textos de interfaz DEBEN ser en español
- Testing manual obligatorio para todo cálculo de horas extra antes de marcar como completado
- Los commits DEBEN seguir el formato: `tipo: descripción breve en español`

## Governance

- Esta constitución es el documento rector del proyecto y prevalece sobre decisiones ad-hoc
- Toda modificación REQUIERE documentación del cambio, justificación y actualización de versión
- Las fórmulas de cálculo solo se modifican si cambia la legislación ecuatoriana vigente
- El archivo `.specify/memory/constitution.md` es la única fuente de verdad para los principios

**Version**: 1.1.0 | **Ratified**: 2026-08-14 | **Last Amended**: 2026-08-14
