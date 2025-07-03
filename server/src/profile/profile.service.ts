import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { createSupabaseClient } from '../utils/supabase';

@Injectable()
export class ProfileService {
  async getProfile(req: Request) {
    try {
      const token = req.cookies?.['access_token'];
      console.log('access_token:', token);
      if (!token) return { user: null, error: 'No access_token in cookies' };
      const supabase = createSupabaseClient();
      const { data, error } = await supabase.auth.getUser(token);
      console.log('supabase.auth.getUser response:', { data, error });
      if (error) return { user: null, error: error.message };
      if (!data || !data.user) {
        return { user: null, error: 'No user found in Supabase response' };
      }
      return { user: data.user };
    } catch (err) {
      return { user: null, error: err.message || String(err) };
    }
  }
}
