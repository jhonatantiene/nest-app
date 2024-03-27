import { ProcessFileService } from './services/processFiles.service';
import { MetricService } from './services/metrics.service';
import {Controller,Post,UploadedFile,UseInterceptors} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(private readonly Process: ProcessFileService, private readonly Metrics: MetricService) {}

  @Post('fileCSV')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCSV(@UploadedFile() file: Express.Multer.File): Promise<any[]> {
    let pathTemp = 'ArquivoTemporario.csv';
    fs.writeFileSync(pathTemp, file.buffer);
    const responseProcess = await this.Process.fileCSV(pathTemp);
    const calc = this.Metrics.calculateYearlyMetrics(responseProcess)
    return calc;
  }


  @Post('fileXlsx')
  @UseInterceptors(FileInterceptor('file'))
  async uploadXLSX(@UploadedFile() file: Express.Multer.File): Promise<any[]> {
    let pathTemp = 'ArquivoTemporario.csv';
    fs.writeFileSync(pathTemp, file.buffer);
    const responseProcess = await this.Process.fileXLSX(pathTemp);
    const calc = this.Metrics.calculateYearlyMetrics(responseProcess)
    return calc;
  }
}
