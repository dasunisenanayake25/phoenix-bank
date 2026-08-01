import { ValueTransformer } from 'typeorm';

export const bigintTransformer: ValueTransformer = {
  to: (value?: string | bigint | null) => {
    if (value === undefined || value === null) return value;
    return value.toString();
  },
  from: (value?: string | null) => (value == null ? '0' : value),
};
