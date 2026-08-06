import { NestFactory } from '@nestjs/core';
import { GeminiProvider } from './src/ai/gemini.provider';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { envSchema } from './src/config/env.validation';

// Create a minimal wrapper module to load JUST the GeminiProvider (no MongoDB needed!)
@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
  ],
  providers: [GeminiProvider],
})
class TestModule {}

async function runTest() {
  console.log('🚀 Bootstrapping NestJS Minimal Context...');
  const app = await NestFactory.createApplicationContext(TestModule, {
    logger: ['error', 'warn', 'debug', 'log'], // Enable debug to see our Queue logs!
  });

  const gemini = app.get(GeminiProvider);
  
  console.log('\n======================================================');
  console.log('🤖 STARTING QUEUE TEST');
  console.log('Firing 20 requests into the queue INSTANTLY!');
  console.log('You should see them spaced out by ~4.3 seconds each.');
  console.log('======================================================\n');

  // Fire 20 requests at the EXACT same time
  const promises = [];
  for (let i = 1; i <= 20; i++) {
    const promise = gemini.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [{ role: 'user', parts: [{ text: `What is ${i} + ${i}? Answer with just the number.` }]}]
    }, 1).then(res => {
      console.log(`✅ Request ${i} completed! Answer: ${res.text}`);
    }).catch(err => {
      console.log(`❌ Request ${i} failed! ${err.message}`);
    });
    
    promises.push(promise);
  }

  // Monitor the queue length every second
  const interval = setInterval(async () => {
    const limiter = gemini.limiter;
    const reservoir = await limiter.currentReservoir();
    const running = await limiter.running();
    console.log(`\n📊 QUEUE STATUS -> Running: ${running} | Queued: ${limiter.queued()} | Reservoir Remaining: ${reservoir}`);
    
    if (limiter.empty() && running === 0) {
      clearInterval(interval);
    }
  }, 2000);

  await Promise.allSettled(promises);
  console.log('\n🎉 ALL REQUESTS PROCESSED SUCCESSFULLY!');
  
  await app.close();
  process.exit(0);
}

runTest();
