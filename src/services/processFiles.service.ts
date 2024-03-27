import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import * as xlsx from 'xlsx';

@Injectable()
export class ProcessFileService {
  async fileCSV(path: string): Promise<any[]> {
    let file = [];
    try {
      file = await this.parseCSV(path);
    } catch (error) {
      throw new Error(`Erro ao processar o arquivo CSV: ${error.message}`);
    } finally {
      fs.unlinkSync(path);
    }
    console.log(file[0]);
    return file;
  }

  private parseCSV(path: string): Promise<any[]> {
    let file = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(path)
        .pipe(csv())
        .on('data', (data) => file.push(data))
        .on('end', () => {
          resolve(file);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  async fileXLSX(path: string): Promise<any[]> {
    let file = [];
    try {
      file = await this.parseXLSX(path);
    } catch (error) {
      throw new Error(`Erro ao processar o arquivo XLSX: ${error.message}`);
    } finally {
      fs.unlinkSync(path);
    }
    console.log(file);
    return file;
  }

  parseXLSX(path: string): Promise<any[]> {
    let file = [];
    return new Promise((resolve, reject) => {
      try {
        const workbook = xlsx.readFile(path, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data: any[] = xlsx.utils.sheet_to_json(sheet, { raw: false });

        data.forEach((row) => {
          const nextCycle = row['próximo ciclo'].toString();
          const nextCycleDate = new Date(nextCycle);
          const formattedNextCycle = isNaN(nextCycleDate.getTime()) ? nextCycle : this.formatDateNoHour(nextCycleDate);

          file.push({
            'quantidade cobranças': row['quantidade cobranças'].toString(),
            'cobrada a cada X dias': row['cobrada a cada X dias'].toString(),
            'data início': this.formatDate(new Date(row['data início'])),
            status: row.status,
            'data status': this.formatDate(new Date(row['data status'])),
            'data cancelamento': row['data cancelamento']
              ? this.formatDate(new Date(row['data cancelamento']))
              : '',
            valor: row.valor.toString(),
            'próximo ciclo': formattedNextCycle,
            'ID assinante': row['ID assinante'],
          });
        });

        // Remover o primeiro objeto se o ano for '0NaN'
        if (file.length > 0 && file[0]['próximo ciclo'] === '0NaN') {
          file.shift();
        }

        resolve(file);
      } catch (error) {
        reject(error);
      }
    });
  }



  // Função para formatar data manualmente
  formatDate(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  formatDateNoHour(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString().padStart(4, '0');

    return `${day}/${month}/${year}`;
  }
}
