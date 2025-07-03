import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'; // ⬅️ เพิ่มบรรทัดนี้

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser()); // ⬅️ ใช้ middleware cookie-parser

  app.enableCors({
    origin: 'http://localhost:3000', // เปลี่ยนตาม frontend จริง
    credentials: true, // ⬅️ สำคัญ: ต้องเปิดใช้ credentials เพื่อส่ง cookie
  });

  await app.listen(3500);
}
bootstrap();
