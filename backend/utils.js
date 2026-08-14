/**
 * Valida si una cédula ecuatoriana es correcta.
 * @param {string} cedula - String de 10 dígitos.
 * @returns {boolean} True si es válida, False en caso contrario.
 */
export function validarCedulaEcuatoriana(cedula) {
  if (!cedula || typeof cedula !== 'string' || cedula.length !== 10) {
    return false;
  }

  // Verificar que sean solo dígitos
  if (!/^\d+$/.test(cedula)) {
    return false;
  }

  const provincia = parseInt(cedula.substring(0, 2), 10);
  if (provincia < 1 || (provincia > 24 && provincia !== 30)) {
    return false;
  }

  const tercerDigito = parseInt(cedula.substring(2, 3), 10);
  if (tercerDigito >= 6) {
    return false;
  }

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const verificador = parseInt(cedula.substring(9, 10), 10);
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula.substring(i, i + 1), 10) * coeficientes[i];
    if (valor >= 10) {
      valor -= 9;
    }
    suma += valor;
  }

  const residuo = suma % 10;
  const digitoCalculado = residuo === 0 ? 0 : 10 - residuo;

  return digitoCalculado === verificador;
}

/**
 * Calcula las horas trabajadas entre dos horas (formato 'HH:MM:SS' o similar).
 * @param {string} inicio - Hora inicio 'HH:MM'
 * @param {string} fin - Hora fin 'HH:MM'
 * @returns {number} Cantidad de horas en decimal.
 */
export function calcularDuracionHoras(inicio, fin) {
  const [h1, m1] = inicio.split(':').map(Number);
  const [h2, m2] = fin.split(':').map(Number);

  let mins1 = h1 * 60 + m1;
  let mins2 = h2 * 60 + m2;

  // Si pasa de la medianoche
  if (mins2 < mins1) {
    mins2 += 24 * 60;
  }

  return (mins2 - mins1) / 60;
}

/**
 * Calcula las horas nocturnas (rango 19:00 - 06:00) dentro de un intervalo de tiempo.
 * @param {string} inicio - Hora inicio 'HH:MM'
 * @param {string} fin - Hora fin 'HH:MM'
 * @returns {number} Cantidad de horas nocturnas en decimal.
 */
export function calcularHorasNocturnas(inicio, fin) {
  const [h1, m1] = inicio.split(':').map(Number);
  const [h2, m2] = fin.split(':').map(Number);

  let minsInicio = h1 * 60 + m1;
  let minsFin = h2 * 60 + m2;

  if (minsFin < minsInicio) {
    minsFin += 24 * 60; // Pasa al día siguiente
  }

  // Rango nocturno en minutos desde las 00:00 del primer día
  // Rango 1: 19:00 (1140 min) hasta 24:00 (1440 min)
  // Rango 2: 24:00 (1440 min) hasta 06:00 del día siguiente (1800 min)
  // O en el día de inicio: 00:00 (0 min) hasta 06:00 (360 min)

  let minutosNocturnos = 0;

  for (let m = minsInicio; m < minsFin; m++) {
    const minDelDia = m % (24 * 60);
    // Nocturno si está entre 19:00 (1140) y 24:00 (1440), o entre 00:00 (0) y 06:00 (360)
    if (minDelDia >= 1140 || minDelDia < 360) {
      minutosNocturnos++;
    }
  }

  return minutosNocturnos / 60;
}
