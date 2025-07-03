import { IsString, IsUUID } from 'class-validator';

export class CreateQuoteDto {
  @IsString()
  text: string;
  created_by_name: string;
  

  @IsUUID()
  created_by: string; // UUID ของผู้สร้าง quote
}
