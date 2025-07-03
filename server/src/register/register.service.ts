import { Injectable } from '@nestjs/common';
import { CreateRegisterDto } from './dto/create-register.dto';
import { createSupabaseClient } from '../utils/supabase';

@Injectable()
export class RegisterService {
  async create(createRegisterDto: CreateRegisterDto) {
    const supabase = createSupabaseClient();
    const { name, email, password } = createRegisterDto;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error || !data.user) {
      // ตรวจสอบ error ว่า email ซ้ำหรือไม่ หรือ user ไม่ถูกสร้าง
      const msg = error?.message || 'ไม่สามารถสมัครสมาชิกได้';
      if (msg.toLowerCase().includes('email') && msg.toLowerCase().includes('already')) {
        return { success: false, message: 'อีเมลนี้ถูกใช้ไปแล้ว' };
      }
      return { success: false, message: msg };
    }
    // เพิ่ม: บันทึก name ลงตาราง profile
    await supabase.from('profiles').insert([{ id: data.user.id, name }]);
    return { success: true, data };
  }
}
