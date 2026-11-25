import { DomainError } from '../../../shared/errors/domain.error';
import { Result } from '../../../shared/rop/result';
export declare function unwrapOrThrowHttp<T>(result: Result<T, DomainError>): T;
