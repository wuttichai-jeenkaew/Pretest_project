import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { LoginService } from './login.service';
import { CreateLoginDto } from './dto/create-login.dto';
import { UpdateLoginDto } from './dto/update-login.dto';
import { Response } from 'express';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post()
  async create(@Body() createLoginDto: CreateLoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.loginService.create(createLoginDto);
    if (result.success && result.data?.session?.access_token) {
      res.cookie('access_token', result.data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 วัน
        sameSite: 'lax',
      });
      return { success: true };
    }
    return { success: false, message: result.message };
  }


}
