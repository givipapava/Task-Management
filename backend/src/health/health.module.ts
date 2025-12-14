import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { FileSystemHealthIndicator } from './indicators/file-system.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [FileSystemHealthIndicator],
})
export class HealthModule {}
