import { describe, test, expect } from 'vitest';
import {
  calcularDuracionHoras,
  calcularHorasNocturnas,
  calcularValorPago
} from './calculations';

describe('Cálculos Matemáticos de Horas Extras GAD Sucúa (LOSEP)', () => {
  
  describe('Cálculo de Duración de Horas', () => {
    test('Calcula la duración estándar en la misma tarde', () => {
      const horas = calcularDuracionHoras('17:00', '21:00');
      expect(horas).toBe(4.0);
    });

    test('Calcula la duración cruzando la medianoche', () => {
      const horas = calcularDuracionHoras('22:00', '02:00');
      expect(horas).toBe(4.0);
    });
  });

  describe('Cálculo de Horas Nocturnas (Rango 19:00 - 06:00)', () => {
    test('Calcula cero horas nocturnas durante el almuerzo', () => {
      const nocturnas = calcularHorasNocturnas('12:00', '15:00');
      expect(nocturnas).toBe(0.0);
    });

    test('Calcula horas nocturnas parciales en jornada de tarde', () => {
      // 17:00 a 21:00 tiene 2 horas nocturnas (19:00 a 21:00)
      const nocturnas = calcularHorasNocturnas('17:00', '21:00');
      expect(nocturnas).toBe(2.0);
    });

    test('Calcula horas nocturnas completas de madrugada', () => {
      // 23:00 a 02:00 está completamente en rango nocturno (3 horas)
      const nocturnas = calcularHorasNocturnas('23:00', '02:00');
      expect(nocturnas).toBe(3.0);
    });
  });

  describe('Cálculo del Valor de Pago Final', () => {
    test('Verifica el caso de prueba oficial del GAD Sucúa (60 horas extraordinarias)', () => {
      // RMU = 497.00
      // 60 horas extraordinarias diurnas (ej: 10 jornadas de 6 horas los sábados de 08:00 a 14:00)
      // Cada jornada de 6h extraordinaria diurna (factor 2.00)
      const rmu = 497.00;
      const { valorTotal } = calcularValorPago({
        rmu,
        inicio: '08:00',
        fin: '14:00',
        tipoJornada: 'extraordinaria'
      });

      // Valor de una jornada de 6h = 6h * (497 / 240) * 2.0 = 24.85
      // 10 jornadas de estas equivalen a $248.50.
      expect(valorTotal).toBe(24.85); // 1 sola jornada de 6 horas
      expect(valorTotal * 10).toBe(248.50); // Total de 60 horas extraordinarias = $248.50
    });

    test('Verifica cálculo de horas suplementarias con recargo nocturno combinado (LOSEP)', () => {
      // Funcionario con RMU = 480.00 (Valor hora ord = $2.00)
      // Jornada: 17:00 a 21:00 (4 horas suplementarias)
      // 17:00 a 19:00 (2h diurnas suplementarias x1.25 = $2.50 c/u) = $5.00
      // 19:00 a 21:00 (2h nocturnas suplementarias x1.50 = $3.00 c/u) = $6.00
      // Pago esperado = $11.00
      const rmu = 480.00;
      const { valorTotal, horasTotales, horasNocturnas } = calcularValorPago({
        rmu,
        inicio: '17:00',
        fin: '21:00',
        tipoJornada: 'suplementaria'
      });

      expect(horasTotales).toBe(4.0);
      expect(horasNocturnas).toBe(2.0);
      expect(valorTotal).toBe(11.00);
    });
  });

});
