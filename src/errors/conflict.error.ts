import { ServiceError } from './service-error';

export class ConflictError extends ServiceError {
  constructor(message: string) {
    super(message, 409);
  }
}
