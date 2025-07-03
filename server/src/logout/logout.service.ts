import { Injectable } from '@nestjs/common';
import { createSupabaseClient } from '../utils/supabase';

@Injectable()
export class LogoutService {
  async logout(token: string) {
    const supabase = createSupabaseClient();
    // Supabase JS v2 ไม่ต้องใช้ token ใน signOut ฝั่ง server
    await supabase.auth.signOut();
    return { success: true };
  }
}
