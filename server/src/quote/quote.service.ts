import { Injectable } from '@nestjs/common';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { createSupabaseClient } from '../utils/supabase';

@Injectable()
export class QuoteService {
  private supabase = createSupabaseClient();

  async create(createQuoteDto: CreateQuoteDto) {
    const { data, error } = await this.supabase
      .from('quotes')
      .insert([createQuoteDto])
      .select();
    if (error) throw error;
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabase.from('quotes').select('*');
    if (error) {
      throw error;
    }
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async update(id: string, updateQuoteDto: UpdateQuoteDto) {
    const { data, error } = await this.supabase
      .from('quotes')
      .update(updateQuoteDto)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  }

  async remove(id: string) {
    const { data, error } = await this.supabase
      .from('quotes')
      .delete()
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  }

  async toggleVote(quoteId: string, userId: string) {
    // ตรวจสอบว่ามี vote นี้อยู่แล้วหรือยัง
    const { data: existingVote, error: voteError } = await this.supabase
      .from('votes')
      .select('*')
      .eq('quote_id', quoteId)
      .eq('user_id', userId)
      .single();
    if (voteError && voteError.code !== 'PGRST116') throw voteError; // PGRST116 = no rows found

    if (existingVote) {
      // ถ้ามี vote แล้ว: ลบ vote และลด vote_count
      await this.supabase.from('votes').delete().eq('id', existingVote.id);
      await this.supabase.rpc('decrement_vote_count', { quote_id: quoteId });
      return { voted: false };
    } else {
      // ถ้ายังไม่มี vote: insert vote และเพิ่ม vote_count
      await this.supabase.from('votes').insert([{ quote_id: quoteId, user_id: userId }]);
      await this.supabase.rpc('increment_vote_count', { quote_id: quoteId });
      return { voted: true };
    }
  }

  async getUserVotes(userId: string) {
    const { data, error } = await this.supabase
      .from('votes')
      .select('quote_id')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }
}
