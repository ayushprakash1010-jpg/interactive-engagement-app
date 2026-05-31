import { INestApplicationContext, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import type { ServerOptions, Server } from 'socket.io';
import { RedisService } from './redis.service';

/**
 * Socket.IO adapter wired to Redis pub/sub so broadcasts fan out across every
 * API instance — the basis for horizontal scaling of the realtime layer.
 */
export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name);
  private adapterConstructor?: ReturnType<typeof createAdapter>;

  constructor(
    app: INestApplicationContext,
    private readonly redis: RedisService,
    private readonly corsOrigin: string,
  ) {
    super(app);
  }

  async connect(): Promise<void> {
    const { pubClient, subClient } = this.redis.getAdapterClients();
    await Promise.all([
      pubClient.status === 'ready' ? Promise.resolve() : pubClient.connect(),
      subClient.status === 'ready' ? Promise.resolve() : subClient.connect(),
    ]);
    this.adapterConstructor = createAdapter(pubClient, subClient);
    this.logger.log('Socket.IO Redis adapter connected');
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server: Server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: this.corsOrigin,
        credentials: true,
      },
      // Graceful degradation: fall back to HTTP long-polling when WS is blocked.
      transports: ['websocket', 'polling'],
    });
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}
