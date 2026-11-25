import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CustomerInputDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName: string;

  @ApiProperty({ example: 'juan.perez@example.com' })
  @IsEmail()
  @MaxLength(180)
  email: string;

  @ApiProperty({ example: '+573001234567' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[+\d\s()-]{7,25}$/, {
    message: 'phone must be a valid phone number',
  })
  phone: string;
}

export class DeliveryInputDto {
  @ApiProperty({ example: 'Calle 45 # 12-34 Apto 502' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  address: string;

  @ApiProperty({ example: 'Bogotá' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'Cundinamarca' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  department: string;

  @ApiPropertyOptional({ example: '110111' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;
}

export class CreateTransactionDto {
  @ApiProperty({ example: '11111111-1111-4111-8111-111111111111' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 1, minimum: 1, maximum: 50 })
  @IsInt()
  @Min(1)
  @Max(50)
  quantity: number;

  @ApiProperty({ type: CustomerInputDto })
  @ValidateNested()
  @Type(() => CustomerInputDto)
  customer: CustomerInputDto;

  @ApiProperty({ type: DeliveryInputDto })
  @ValidateNested()
  @Type(() => DeliveryInputDto)
  delivery: DeliveryInputDto;
}