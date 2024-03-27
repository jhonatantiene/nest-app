import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProcessFileService } from './services/processFiles.service';
import { ConvertDate } from './services/convertDate.service';
import { MetricService } from './services/metrics.service';

@Module({
  imports: [],
  controllers: [
    AppController
  ],
  providers: [
    ProcessFileService,
    MetricService,
    ConvertDate
  ],
})
export class AppModule {}
