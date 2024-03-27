import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricService {
  calculateYearlyMetrics(subscriptions: any[]): {
    year: string;
    mrrForYear: string;
    churnedForYear: string;
    monthlyMetrics: { month: string; mrr: number; churnRate: number }[];
  }[] {
    const yearlyMetricsArray = [];

    const yearlyMetricsMap = new Map<
      string,
      {
        monthMetrics: Map<
          string,
          { mrr: number; churned: number; total: number }
        >;
        totalMRR: number;
        totalChurned: number;
      }
    >();

    // Iterar sobre cada assinatura
    for (const subscription of subscriptions) {
      const yearKey = this.getYearKey(subscription['próximo ciclo']); // Usando 'próximo ciclo' como referência
      const monthYearKey = this.getMonthYearKey(subscription['próximo ciclo']); // Usando 'próximo ciclo' como referência
      const status = subscription.status;
      const valor = parseFloat(subscription.valor.replace(',', '.'));

      // Se ainda não houver entrada para este ano no mapa, crie uma
      if (!yearlyMetricsMap.has(yearKey)) {
        yearlyMetricsMap.set(yearKey, {
          monthMetrics: new Map<
            string,
            { mrr: number; churned: number; total: number }
          >(),
          totalMRR: 0,
          totalChurned: 0,
        });
      }

      const yearMetrics = yearlyMetricsMap.get(yearKey);

      // Se ainda não houver entrada para este mês no mapa de métricas mensais, crie uma
      if (!yearMetrics.monthMetrics.has(monthYearKey)) {
        yearMetrics.monthMetrics.set(monthYearKey, {
          mrr: 0,
          churned: 0,
          total: 0,
        });
      }

      const monthlyMetrics = yearMetrics.monthMetrics.get(monthYearKey);

      // Adicione o valor à MRR se a assinatura estiver ativa
      if (status === 'Ativa' || status === 'Upgrade' || status === 'Atrasada') {
        monthlyMetrics.mrr += valor;
        yearMetrics.totalMRR += valor;
      }

      // Atualize o total de assinaturas para este mês
      monthlyMetrics.total++;

      // Se a assinatura estiver cancelada, aumente o número de churned
      if (status.includes('Cancelada') || status.includes('Trial cancelado')) {
        monthlyMetrics.churned++;
        yearMetrics.totalChurned += monthlyMetrics.churned;
      }
    }

    // Converter o mapa em um array de objetos para retorno
    yearlyMetricsMap.forEach((yearMetrics, year) => {
      const monthlyMetricsArray = Array.from(
        yearMetrics.monthMetrics,
        ([monthYearKey, { mrr, churned, total }]) => ({
          month: monthYearKey, // Aqui usamos o mês e o ano como chave
          mrr: Number(mrr.toFixed(2)),
          churnRate: Number(
            (total !== 0 ? (churned / total) * 100 : 0).toFixed(1),
          ),
          subscribeCanceled: churned,
          total: total,
        }),
      );

      const totalChurned = monthlyMetricsArray.reduce((acc, curr) => acc + curr.churnRate, 0);
      const churnedForYear = Number((totalChurned / 12).toFixed(1));

      // Ordenar os meses dentro de cada ano
      monthlyMetricsArray.sort(
        (a, b) => this.getMonthIndex(a.month) - this.getMonthIndex(b.month),
      );

      yearlyMetricsArray.push({
        year,
        mrrForYear: yearMetrics.totalMRR.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        churnedForYear,
        monthlyMetrics: monthlyMetricsArray,
      });
    });

    // Ordenar os anos
    yearlyMetricsArray.sort((a, b) => parseInt(a.year) - parseInt(b.year));

    return yearlyMetricsArray;
  }

  private getMonthYearKey(dateString: string): string {
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    let [day, month, year] = dateString.split('/');
    if (Number(month) > 12) {
      month = day;
    }
    month = months[Number(month) - 1];
    return `${month}`;
  }

  private getYearKey(dateString: string): string {
    const [, , year] = dateString.split('/');
    return year;
  }

  private getMonthIndex(monthYear: string): number {
    const [month] = monthYear.split(' ');
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return months.indexOf(month);
  }
}
