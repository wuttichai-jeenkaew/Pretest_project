import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuoteModule } from './quote/quote.module';
import { LoginModule } from './login/login.module';
import { RegisterModule } from './register/register.module';
import { ProfileModule } from './profile/profile.module';
import { LogoutModule } from './logout/logout.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),
    QuoteModule,
    LoginModule,
    RegisterModule,
    ProfileModule,
    LogoutModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
