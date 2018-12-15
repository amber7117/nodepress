/**
 * App module.
 * @file App 主模块
 * @module app.module
 * @author Surmon <https://github.com/surmon-china>
 */

import * as APP_CONFIG from '@app/app.config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from '@app/app.controller';
import { HttpCacheInterceptor } from '@app/interceptors/cache.interceptor';
import { CacheModule } from '@app/processors/cache/cache.module';
import { CorsMiddleware } from '@app/middlewares/cors.middleware';
import { OriginMiddleware } from '@app/middlewares/origin.middleware';
import { MongooseModule } from '@nestjs/mongoose';

import { GithubModule } from '@app/modules/github/github.module';
import { AuthModule } from '@app/modules/auth/auth.module';
import { AnnouncementModule } from '@app/modules/announcement/announcement.module';

@Module({
  imports: [
    MongooseModule.forRoot(APP_CONFIG.MONGODB.uri, {
      useCreateIndex: true,
      useNewUrlParser: true,
      promiseLibrary: global.Promise,
    }),
    CacheModule,
    GithubModule,
    AuthModule,
    AnnouncementModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware, OriginMiddleware).forRoutes('*');
  }
}
