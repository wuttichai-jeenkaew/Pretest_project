import { Injectable } from '@nestjs/common';
import { CreateLoginDto } from './dto/create-login.dto';
import { UpdateLoginDto } from './dto/update-login.dto';
import { createSupabaseClient } from '../utils/supabase';

@Injectable()
export class LoginService {
  async create(createLoginDto: CreateLoginDto) {
    const supabase = createSupabaseClient();
    const { email, password } = createLoginDto;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, data };
  }


}
