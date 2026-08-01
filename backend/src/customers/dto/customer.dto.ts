export class CreateCustomerDto {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  address?: string;
  taxId?: string;
}

export class UpdateCustomerDto {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  address?: string;
  taxId?: string;
}
