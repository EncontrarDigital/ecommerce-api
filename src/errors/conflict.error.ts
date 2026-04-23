import { ServiceError } from './service-error';

export class ConflictError extends ServiceError {
  constructor(
    entityName: string,
    conflictProperty?: string,
    conflictValue?: string,
  ) {
    super();
    if (conflictProperty && conflictValue) {
      this.message = `${entityName} with ${conflictProperty}=${conflictValue} already exists`;
    } else {
      this.message = `${entityName} already exists`;
    }
  }
}
