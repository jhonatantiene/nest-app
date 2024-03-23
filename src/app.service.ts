import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csv from 'csv-parser';

@Injectable()
export class AppService {
  async fileCSV(path: string): Promise<any[]> {
    let file = [];
    try {
      file = await this.parseCSV(path);
    } catch (error) {
      throw new Error(`Erro ao processar o arquivo CSV: ${error.message}`);
    } finally {
      fs.unlinkSync(path);
    }
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
}
