import { IsString, IsOptional, IsInt, IsEmail } from 'class-validator';

export class UpdateSmtpConfigDto {
  @IsString()
  @IsOptional()
  host?: string;

  @IsInt()
  @IsOptional()
  port?: number;

  @IsString()
  @IsOptional()
  user?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  from?: string;
}