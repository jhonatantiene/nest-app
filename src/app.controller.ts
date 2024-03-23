import { AppService } from './app.service';
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('fileCSV')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCSV(@UploadedFile() file: Express.Multer.File): Promise<any[]> {
    let pathTemp = 'ArquivoTemporario.csv';
    fs.writeFileSync(pathTemp, file.buffer);
    return await this.appService.fileCSV(pathTemp);
  }
  
}
