import { HttpException } from '@nestjs/common';
import { DomainError } from '../../../shared/errors/domain.error';
import { Result } from '../../../shared/rop/result';

export function unwrapOrThrowHttp<T>(result: Result<T, DomainError>): T {
  if (result.isFail) {
    throw new HttpException(
      {
        statusCode: result.error.httpStatus,
        code: result.error.code,
        message: result.error.message,
        ...(result.error.details ? { details: result.error.details } : {}),
      },
      result.error.httpStatus,
    );
  }
  return result.value;
}