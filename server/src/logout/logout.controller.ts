import { Controller, Post, Req, Res } from '@nestjs/common';
import { LogoutService } from './logout.service';
import { Request, Response } from 'express';

@Controller('logout')
export class LogoutController {
  constructor(private readonly logoutService: LogoutService) {}

  @Post()
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies['access_token'];
    await this.logoutService.logout(token);
    res.clearCookie('access_token');
    return { success: true };
  }
}
