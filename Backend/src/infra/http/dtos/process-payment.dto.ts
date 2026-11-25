import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CardDataDto {
  @ApiProperty({
    example: '4242424242424242',
    description: '13 to 19 digit card number (sandbox test card)',
  })
  @IsString()
  @Matches(/^\d{13,19}$/, {
    message: 'card number must contain between 13 and 19 digits',
  })
  number: string;

  @ApiProperty({ example: '123' })
  @IsString()
  @Matches(/^\d{3,4}$/, { message: 'cvc must be 3 or 4 digits' })
  cvc: string;

  @ApiProperty({ example: '08' })
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])$/, {
    message: 'expMonth must be between 01 and 12',
  })
  expMonth: string;

  @ApiProperty({ example: '29' })
  @IsString()
  @Matches(/^\d{2}(\d{2})?$/, {
    message: 'expYear must be 2 or 4 digits (e.g. 29 or 2029)',
  })
  expYear: string;

  @ApiProperty({ example: 'JUAN PEREZ' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  cardHolder: string;
}

export class ProcessPaymentDto {
  @ApiProperty({ example: 1, minimum: 1, maximum: 36 })
  @IsInt()
  @Min(1)
  @Max(36)
  installments: number;

  @ApiProperty({ type: CardDataDto })
  @ValidateNested()
  @Type(() => CardDataDto)
  card: CardDataDto;
}