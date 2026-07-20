import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { FeatureFlagsService } from './src/feature-flags/feature-flags.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get(FeatureFlagsService);
  try {
    const res1 = await service.create(
      { key: 'test-key-new', name: 'Test', description: 'Test', isGlobalEnabled: false },
      { id: '123456789012345678901234', email: 'test@example.com' }
    );
    console.log("Success 1:", res1.key);
    
    const res2 = await service.create(
      { key: 'test-key-new', name: 'Test', description: 'Test', isGlobalEnabled: false },
      { id: '123456789012345678901234', email: 'test@example.com' }
    );
    console.log("Success 2:", res2.key);
  } catch (e: any) {
    console.error("Error creating:", e.message);
    console.error(e);
  }
  await app.close();
}
bootstrap();
