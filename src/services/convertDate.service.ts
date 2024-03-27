import { Injectable } from '@nestjs/common';

@Injectable()
export class ConvertDate {
  static async corrigirFormatoData(data: string): Promise<string> {
    const [dia, mes, ano] = data.split('/');
    return `${mes.padStart(2, '0')}/${dia.padStart(2, '0')}/${ano}`;
  }

  static async corrigirFormatoDatas(datas: string): Promise<string> {
    let datasCorrigidas: string;
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(datas)) {
        datasCorrigidas = await this.corrigirFormatoData(datas);
      } else {
        datasCorrigidas = datas;
      }
    return datasCorrigidas;
  }

  static async getMonthName(dateString: string): Promise<string> {
    const [day, month, year] = dateString.split('/').map(Number);
    // Note: Month is zero-based in JavaScript Date objects
    const date = new Date(year + 2000, month - 1, day);
    return date.toLocaleString('default', { month: 'long' });
  }
}
