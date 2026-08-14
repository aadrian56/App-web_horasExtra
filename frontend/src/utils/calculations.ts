/**
 * Calcula la duración en horas (en formato decimal) entre dos horas dadas en formato "HH:MM".
 * Soporta el cruce de medianoche sumando 24 horas.
 */
export function calcularDuracionHoras(inicio: string, fin: string): number {
  const [h1, m1] = inicio.split(':').map(Number);
  const [h2, m2] = fin.split(':').map(Number);

  let mins1 = h1 * 60 + m1;
  let mins2 = h2 * 60 + m2;

  if (mins2 < mins1) {
    mins2 += 24 * 60; // Cruce de medianoche
  }

  return (mins2 - mins1) / 60;
}

/**
 * Calcula la cantidad de horas nocturnas (rango 19:00 - 06:00) dentro de un intervalo.
 */
export function calcularHorasNocturnas(inicio: string, fin: string): number {
  const [h1, m1] = inicio.split(':').map(Number);
  const [h2, m2] = fin.split(':').map(Number);

  let minsInicio = h1 * 60 + m1;
  let minsFin = h2 * 60 + m2;

  if (minsFin < minsInicio) {
    minsFin += 24 * 60;
  }

  let minutosNocturnos = 0;
  for (let m = minsInicio; m < minsFin; m++) {
    const minDelDia = m % (24 * 60);
    // Nocturno si está entre 19:00 (1140 min) y 24:00 (1440 min), o 00:00 (0 min) y 06:00 (360 min)
    if (minDelDia >= 1140 || minDelDia < 360) {
      minutosNocturnos++;
    }
  }

  return minutosNocturnos / 60;
}

/**
 * Calcula el valor final a pagar por concepto de horas extra y suplementarias.
 */
export function calcularValorPago({
  rmu,
  inicio,
  fin,
  tipoJornada
}: {
  rmu: number;
  inicio: string;
  fin: string;
  tipoJornada: 'suplementaria' | 'extraordinaria';
}): {
  horasTotales: number;
  horasNocturnas: number;
  valorTotal: number;
} {
  const valorHoraOrdinaria = rmu / 240;
  const horasTotales = calcularDuracionHoras(inicio, fin);
  const horasNocturnas = calcularHorasNocturnas(inicio, fin);
  const horasDiurnas = horasTotales - horasNocturnas;

  // Factores de recargo
  // Suplementaria diurna: x1.25, nocturna: x1.50
  // Extraordinaria diurna: x2.00, nocturna: x2.25
  const factorDiurno = tipoJornada === 'suplementaria' ? 1.25 : 2.00;
  const factorNocturno = tipoJornada === 'suplementaria' ? 1.50 : 2.25;

  const valorDiurno = horasDiurnas * valorHoraOrdinaria * factorDiurno;
  const valorNocturno = horasNocturnas * valorHoraOrdinaria * factorNocturno;
  const valorTotal = parseFloat((valorDiurno + valorNocturno).toFixed(2));

  return {
    horasTotales,
    horasNocturnas,
    valorTotal
  };
}
