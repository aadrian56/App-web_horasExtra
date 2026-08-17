/**
 * Determina si una fecha (en formato YYYY-MM-DD) es un fin de semana (Sábado/Domingo)
 * o un feriado nacional/local para el Cantón Sucúa, Morona Santiago (años 2025, 2026, 2027).
 */
export function esFeriadoODescanso(fechaStr: string): boolean {
  if (!fechaStr) return false;
  
  const [year, month, day] = fechaStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado
  
  // 1. Fines de semana (Sábado o Domingo)
  const esFinDeSemana = dayOfWeek === 0 || dayOfWeek === 6;
  if (esFinDeSemana) return true;
  
  // 2. Feriados Fijos (Nacionales y Locales)
  const mmDd = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const feriadosFijos = [
    '01-01', // Año Nuevo
    '05-01', // Día del Trabajo
    '05-24', // Batalla de Pichincha
    '08-10', // Primer Grito de Independencia
    '10-09', // Independencia de Guayaquil
    '11-02', // Día de los Difuntos
    '11-03', // Independencia de Cuenca
    '11-10', // Provincialización de Morona Santiago (Local)
    '12-08', // Cantonización de Sucúa (Local)
    '12-25'  // Navidad
  ];
  if (feriadosFijos.includes(mmDd)) return true;
  
  // 3. Feriados Variables (Carnaval y Viernes Santo)
  const feriadosVariables = [
    '2025-03-03', '2025-03-04', '2025-04-18', // 2025
    '2026-02-16', '2026-02-17', '2026-04-03', // 2026
    '2027-02-08', '2027-02-09', '2027-03-26'  // 2027
  ];
  if (feriadosVariables.includes(fechaStr)) return true;
  
  return false;
}
